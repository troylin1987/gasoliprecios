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

await mkdir('public', { recursive: true });
await mkdir('sampledata', { recursive: true });
const existingPayload = await readExistingPayload();
const shouldPersist = !existingPayload || isNewerPayload(payload, existingPayload);

if (shouldPersist) {
  const json = JSON.stringify(payload);
  await writeFile('public/sampledata.json', json);
  await writeFile('sampledata/sampledata.json', json);
} else {
  payload = existingPayload;
  console.warn('Incoming payload is not newer. Keeping existing sampledata snapshot.');
}

const source = usedFallback ? 'fallback cache' : 'official API';
const persisted = shouldPersist ? 'updated' : 'kept';
console.log(`Fuel data ${persisted} from ${source}: ${payload.Fecha}, ${payload.ListaEESSPrecio.length} stations`);

async function readExistingPayload() {
  try {
    const existing = await readFile('public/sampledata.json', 'utf8');
    return JSON.parse(existing);
  } catch {
    return null;
  }
}

function isNewerPayload(nextPayload, currentPayload) {
  const nextDate = parseSpanishDateTime(nextPayload?.Fecha);
  const currentDate = parseSpanishDateTime(currentPayload?.Fecha);

  if (!nextDate) return false;
  if (!currentDate) return true;
  return nextDate.getTime() > currentDate.getTime();
}

function parseSpanishDateTime(value) {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;

  const [, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr = '0'] = match;
  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const second = Number(secondStr);

  const date = new Date(year, month - 1, day, hour, minute, second);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== second
  ) {
    return null;
  }

  return date;
}
