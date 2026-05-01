import { CACHE_KEY, CACHE_TTL_MS, CCAA_NAMES, DEV_API_PATH, FUEL_FIELDS, STATIC_DATA_PATH } from './constants';
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
    return normalizePayload(payload, import.meta.env.DEV ? 'vite-proxy' : 'static');
  } catch (error) {
    if (cached) return normalizePayload(cached.payload, 'cache-stale', error);
    const fallback = await fetch(STATIC_DATA_PATH);
    const payload = await fallback.json();
    return normalizePayload(payload, 'sample', error);
  }
}

export function buildLocationTree(stations) {
  const ccaaMap = new Map();
  stations.forEach((station) => {
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
  const stations = rows.map(normalizeStation).filter((station) => station.lat && station.lng);
  return {
    source,
    warning,
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
