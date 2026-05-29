import { mkdir, readFile, writeFile } from 'node:fs/promises';

const apiUrl =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';
const reveApiBaseUrl = 'https://www.mapareve.es/api/external/v1';
const reveApiKey = process.env.REVE_API_KEY || '';
const revePageSize = 100;
const reveMaxPageRequestsPerRun = Math.max(1, Number(process.env.REVE_MAX_PAGES_PER_REFRESH || 2));

const maxAttempts = 5;
const retryDelayMs = 1500;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetryStatus = (status) => status === 429 || status >= 500;

const fetchLatestPayload = async () => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          accept: 'application/json',
          'user-agent': 'gasoliprecios-data-refresh/1.0',
        },
      });

      if (!response.ok) {
        const body = (await response.text()).slice(0, 180).replace(/\s+/g, ' ').trim();
        throw new Error(
          `Fuel data refresh failed: ${response.status} ${response.statusText}${body ? ` | ${body}` : ''}`,
        );
      }

      const payload = await response.json();

      if (payload.ResultadoConsulta !== 'OK' || !Array.isArray(payload.ListaEESSPrecio)) {
        throw new Error('Fuel data refresh returned an unexpected payload');
      }

      return payload;
    } catch (error) {
      lastError = error;
      const message = String(error?.message || 'unknown error');
      const maybeStatus = message.match(/\b(\d{3})\b/)?.[1];
      const statusCode = maybeStatus ? Number(maybeStatus) : undefined;
      const canRetry = attempt < maxAttempts && (statusCode === undefined || shouldRetryStatus(statusCode));

      if (!canRetry) {
        break;
      }

      const waitMs = retryDelayMs * attempt;
      console.warn(`Attempt ${attempt}/${maxAttempts} failed. Retrying in ${waitMs}ms...`);
      await delay(waitMs);
    }
  }

  throw lastError;
};

const readFallbackPayload = async () => {
  const fallbackText = await readFile('public/sampledata.json', 'utf8');
  const fallbackPayload = JSON.parse(fallbackText);
  if (
    fallbackPayload.ResultadoConsulta !== 'OK' ||
    !Array.isArray(fallbackPayload.ListaEESSPrecio)
  ) {
    throw new Error('Fallback sampledata has an unexpected payload');
  }
  return fallbackPayload;
};

const fetchReveLocationsPage = async (page) => {
  const url = new URL(`${reveApiBaseUrl}/locations`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(revePageSize));

  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'x-api-key': reveApiKey,
      'user-agent': 'gasoliprecios-data-refresh/1.0',
    },
  });

  if (!response.ok) {
    const body = (await response.text()).slice(0, 180).replace(/\s+/g, ' ').trim();
    throw new Error(
      `REVE locations request failed: ${response.status} ${response.statusText}${body ? ` | ${body}` : ''}`,
    );
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error('REVE locations request returned an unexpected payload');
  }

  return payload;
};

const mergeReveLocations = (existingLocations = [], incomingLocations = []) => {
  const byId = new Map();

  existingLocations.forEach((location) => {
    if (location && typeof location.id === 'string') byId.set(location.id, location);
  });

  incomingLocations.forEach((location) => {
    if (location && typeof location.id === 'string') byId.set(location.id, location);
  });

  return [...byId.values()].sort((a, b) => String(a.id).localeCompare(String(b.id), 'es'));
};

const fetchRevePayload = async (existingReveData = {}) => {
  const previousLocations = Array.isArray(existingReveData.locations) ? existingReveData.locations : [];

  if (!reveApiKey) {
    console.warn('REVE_API_KEY is not defined. Keeping previous charging-point snapshot.');
    return {
      ...existingReveData,
      source: previousLocations.length ? 'cache-no-key' : 'empty-no-key',
      locations: previousLocations,
      warning: 'missing-api-key',
    };
  }

  let nextPage = Number(existingReveData.nextPage || 1);
  if (!Number.isFinite(nextPage) || nextPage < 1) nextPage = 1;

  const fetchedPages = [];
  let hasMore = true;

  for (let requestIndex = 0; requestIndex < reveMaxPageRequestsPerRun; requestIndex += 1) {
    const pageItems = await fetchReveLocationsPage(nextPage);
    fetchedPages.push(...pageItems);

    if (pageItems.length < revePageSize) {
      hasMore = false;
      nextPage = 1;
      break;
    }

    nextPage += 1;
  }

  const mergedLocations = mergeReveLocations(previousLocations, fetchedPages);

  return {
    source: 'api',
    locations: mergedLocations,
    nextPage,
    warning: '',
    sync: {
      pagesFetched: Math.ceil(fetchedPages.length / revePageSize),
      hasMore,
      pageSize: revePageSize,
      maxPageRequestsPerRun: reveMaxPageRequestsPerRun,
    },
  };
};

let payload;
let usedFallback = false;
const existingPayload = await readExistingPayload();

try {
  payload = await fetchLatestPayload();
} catch (error) {
  console.warn(`Primary source unavailable: ${error.message}`);
  payload = await readFallbackPayload();
  usedFallback = true;
  console.warn('Using fallback data from public/sampledata.json');
}

let revePayload;
try {
  revePayload = await fetchRevePayload(existingPayload?.ReveData);
} catch (error) {
  console.warn(`REVE source unavailable: ${error.message}`);
  const previousReveData = existingPayload?.ReveData;
  const previousLocations = Array.isArray(previousReveData?.locations) ? previousReveData.locations : [];
  revePayload = {
    ...(previousReveData || {}),
    source: previousLocations.length ? 'cache-stale' : 'empty-error',
    warning: 'reve-unavailable',
    locations: previousLocations,
  };
}

await mkdir('public', { recursive: true });
await mkdir('sampledata', { recursive: true });
const nextSnapshot = {
  ...payload,
  ReveData: revePayload,
};

const shouldPersist = !existingPayload || JSON.stringify(existingPayload) !== JSON.stringify(nextSnapshot);

if (shouldPersist) {
  const json = JSON.stringify(nextSnapshot);
  await writeFile('public/sampledata.json', json);
  await writeFile('sampledata/sampledata.json', json);
} else {
  payload = existingPayload;
  console.warn('Incoming payload is unchanged. Keeping existing sampledata snapshot.');
}

const source = usedFallback ? 'fallback cache' : 'official API';
const persisted = shouldPersist ? 'updated' : 'kept';
const reveCount = Array.isArray(revePayload?.locations) ? revePayload.locations.length : 0;
console.log(
  `Fuel data ${persisted} from ${source}: ${payload.Fecha}, ${payload.ListaEESSPrecio.length} stations | REVE points: ${reveCount}`,
);

async function readExistingPayload() {
  try {
    const existing = await readFile('public/sampledata.json', 'utf8');
    return JSON.parse(existing);
  } catch {
    return null;
  }
}
