import { API_URL, CACHE_KEY, CACHE_TTL_MS, CCAA_NAMES, DEV_API_PATH, FUEL_FIELDS, STATIC_DATA_PATH } from './constants';
import { parseSpanishNumber, normalizeText } from './format';
import { isOpenNow } from './hours';

export async function loadFuelData({ force = false } = {}) {
  const cached = readCache();
  if (!force && cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return normalizePayload(cached.payload, 'cache');
  }

  try {
    const response = await fetch(getDataUrl(), { cache: 'no-store' });
    if (!response.ok) throw new Error(`API ${response.status}`);
    const payload = await response.json();
    writeCache(payload);
    return normalizePayload(payload, import.meta.env.DEV ? 'vite-proxy' : 'snapshot');
  } catch (error) {
    if (cached) return normalizePayload(cached.payload, 'cache-stale', error);
    const fallback = await fetch(getFallbackDataUrl(), { cache: 'no-store' });
    const payload = await fallback.json();
    return normalizePayload(payload, import.meta.env.DEV ? 'sample' : 'official-api', error);
  }
}

export function buildLocationTree(stations) {
  const ccaaMap = new Map();
  stations.forEach((station) => {
    if (!station.ccaaId || !station.provinceId || !station.municipalityId) return;

    if (!ccaaMap.has(station.ccaaId)) {
      ccaaMap.set(station.ccaaId, {
        id: station.ccaaId,
        name: CCAA_NAMES[station.ccaaId] || `CCAA ${station.ccaaId}`,
        provinces: new Map(),
      });
    }
    const ccaa = ccaaMap.get(station.ccaaId);
    if (!ccaa.provinces.has(station.provinceId)) {
      ccaa.provinces.set(station.provinceId, {
        id: station.provinceId,
        name: station.province,
        municipalities: new Map(),
      });
    }
    const province = ccaa.provinces.get(station.provinceId);
    if (!province.municipalities.has(station.municipalityId)) {
      province.municipalities.set(station.municipalityId, {
        id: station.municipalityId,
        name: station.municipality,
      });
    }
  });

  return [...ccaaMap.values()]
    .map((ccaa) => ({
      ...ccaa,
      provinces: [...ccaa.provinces.values()]
        .map((province) => ({
          ...province,
          municipalities: [...province.municipalities.values()].sort(byName),
        }))
        .sort(byName),
    }))
    .sort(byName);
}

function normalizePayload(payload, source, warning) {
  const rows = Array.isArray(payload.ListaEESSPrecio) ? payload.ListaEESSPrecio : [];
  const fuelStations = rows.map(normalizeStation).filter((station) => Number.isFinite(station.lat) && Number.isFinite(station.lng));
  const reveRows = Array.isArray(payload?.ReveData?.locations) ? payload.ReveData.locations : [];
  const chargingStations = reveRows
    .map(normalizeChargingStation)
    .filter((station) => Number.isFinite(station.lat) && Number.isFinite(station.lng));
  const stations = [...fuelStations, ...chargingStations];

  return {
    source,
    warning: warning || payload?.ReveData?.warning || null,
    updatedAt: payload.Fecha,
    note: payload.Nota,
    result: payload.ResultadoConsulta,
    stations,
    locations: buildLocationTree(stations),
  };
}

function normalizeStation(row) {
  const prices = Object.fromEntries(
    FUEL_FIELDS.map((field) => [field, parseSpanishNumber(row[field])]).filter(([, price]) => price !== null),
  );
  const searchText = normalizeText(
    [
      row['Rótulo'],
      row['Dirección'],
      row['Localidad'],
      row['Municipio'],
      row['Provincia'],
      row['C.P.'],
    ].join(' '),
  );

  return {
    id: row.IDEESS,
    kind: 'fuel',
    brand: row['Rótulo'] || 'Sin rotulo',
    address: row['Dirección'] || '',
    postalCode: row['C.P.'] || '',
    schedule: row.Horario || '',
    lat: parseSpanishNumber(row.Latitud),
    lng: parseSpanishNumber(row['Longitud (WGS84)']),
    margin: row.Margen,
    locality: row.Localidad || '',
    municipality: row.Municipio || '',
    province: row.Provincia || '',
    ccaaId: row.IDCCAA,
    provinceId: row.IDProvincia,
    municipalityId: row.IDMunicipio,
    saleType: row['Tipo Venta'],
    remission: row['Remisión'],
    prices,
    fuels: Object.keys(prices),
    isOpen: isOpenNow(row.Horario),
    searchText,
    raw: row,
  };
}

function normalizeChargingStation(row) {
  const coordinates = row?.coordinates || {};
  const lat = parsePointNumber(coordinates.latitude);
  const lng = parsePointNumber(coordinates.longitude);
  const evses = ensureArray(row?.evses);
  const connectors = evses.flatMap((evse) => ensureArray(evse?.connectors));
  const connectorTypes = [...new Set(connectors.map((connector) => connector?.standard).filter(Boolean))];
  const maxPowerKw = connectors
    .map((connector) => normalizeWattsToKw(connector?.max_electric_power))
    .filter((value) => Number.isFinite(value))
    .reduce((max, value) => Math.max(max, value), null);
  const opening = parseOpeningTimes(row?.opening_times);

  const searchText = normalizeText(
    [
      row?.name,
      row?.cpo_name,
      row?.address,
      row?.city,
      row?.region,
      row?.postal_code,
      connectorTypes.join(' '),
    ].join(' '),
  );

  return {
    id: `ev-${row?.id || normalizeText([row?.name, row?.address, row?.city].join('-'))}`,
    kind: 'ev',
    brand: row?.name || row?.cpo_name || 'Punto de recarga',
    address: row?.address || '',
    postalCode: row?.postal_code || '',
    schedule: opening.label,
    lat,
    lng,
    margin: '',
    locality: row?.city || '',
    municipality: row?.city || '',
    province: row?.region || '',
    ccaaId: normalizeIneCode(row?.state),
    provinceId: normalizeIneCode(row?.region),
    municipalityId: normalizeIneCode(row?.city_code),
    saleType: '',
    remission: '',
    prices: {},
    fuels: [],
    isOpen: opening.isOpen,
    operator: row?.cpo_name || '',
    connectors: connectorTypes,
    connectorCount: connectors.length,
    maxPowerKw,
    chargePoints: evses.length,
    searchText,
    raw: row,
  };
}

function parsePointNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeWattsToKw(value) {
  const watts = Number(value);
  if (!Number.isFinite(watts) || watts <= 0) return null;
  return watts / 1000;
}

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
}

function parseOpeningTimes(openingTimes) {
  if (!openingTimes || typeof openingTimes !== 'object') {
    return { label: '', isOpen: null };
  }

  if (openingTimes.twentyfourseven === true) {
    return { label: '24/7', isOpen: true };
  }

  const regularHours = ensureArray(openingTimes.regular_hours);
  if (!regularHours.length) {
    return { label: '', isOpen: null };
  }

  const now = new Date();
  const weekday = ((now.getDay() + 6) % 7) + 1;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const isOpen = regularHours.some((item) => {
    if (Number(item?.weekday) !== weekday) return false;
    const start = parseHourToMinutes(item?.period_begin);
    const end = parseHourToMinutes(item?.period_end);
    if (start === null || end === null) return false;
    if (start <= end) return nowMinutes >= start && nowMinutes <= end;
    return nowMinutes >= start || nowMinutes <= end;
  });

  return { label: 'Horario variable', isOpen };
}

function parseHourToMinutes(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function normalizeIneCode(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
}

function writeCache(payload) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ cachedAt: Date.now(), payload }));
  } catch {
    // LocalStorage can be unavailable or full; the app still works with in-memory data.
  }
}

function byName(a, b) {
  return a.name.localeCompare(b.name, 'es');
}

function getDataUrl() {
  return import.meta.env.DEV ? DEV_API_PATH : STATIC_DATA_PATH;
}

function getFallbackDataUrl() {
  return import.meta.env.DEV ? STATIC_DATA_PATH : API_URL;
}
