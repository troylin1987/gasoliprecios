export function parseSpanishNumber(value) {
  if (!value || typeof value !== 'string') return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatPrice(value) {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(3).replace('.', ',')} EUR/l`;
}

export function formatDistance(km) {
  if (km === null || km === undefined || !Number.isFinite(km)) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0).replace('.', ',')} km`;
}

export function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function mapsUrl(station) {
  const query = encodeURIComponent(`${station.brand} ${station.address} ${station.locality}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}&destination_place_id=&travelmode=driving&query=${query}`;
}
