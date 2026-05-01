import { mkdir, writeFile } from 'node:fs/promises';

const apiUrl =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';

const response = await fetch(apiUrl, {
  headers: {
    accept: 'application/json',
    'user-agent': 'gasoliprecios-data-refresh/1.0',
  },
});

if (!response.ok) {
  throw new Error(`Fuel data refresh failed: ${response.status} ${response.statusText}`);
}

const payload = await response.json();

if (payload.ResultadoConsulta !== 'OK' || !Array.isArray(payload.ListaEESSPrecio)) {
  throw new Error('Fuel data refresh returned an unexpected payload');
}

const json = JSON.stringify(payload);
await mkdir('public', { recursive: true });
await mkdir('sampledata', { recursive: true });
await writeFile('public/sampledata.json', json);
await writeFile('sampledata/sampledata.json', json);

console.log(`Fuel data refreshed: ${payload.Fecha}, ${payload.ListaEESSPrecio.length} stations`);
