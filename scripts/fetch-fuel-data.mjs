import { mkdir, readFile, writeFile } from 'node:fs/promises';

const apiUrl =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';

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

let payload;
let usedFallback = false;

try {
  payload = await fetchLatestPayload();
} catch (error) {
  console.warn(`Primary source unavailable: ${error.message}`);
  payload = await readFallbackPayload();
  usedFallback = true;
  console.warn('Using fallback data from public/sampledata.json');
}

const json = JSON.stringify(payload);
await mkdir('public', { recursive: true });
await mkdir('sampledata', { recursive: true });
await writeFile('public/sampledata.json', json);
await writeFile('sampledata/sampledata.json', json);

const source = usedFallback ? 'fallback cache' : 'official API';
console.log(`Fuel data refreshed from ${source}: ${payload.Fecha}, ${payload.ListaEESSPrecio.length} stations`);
