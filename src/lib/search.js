import { distanceKm } from './geo';
import { normalizeText } from './format';

export function searchStations(stations, filters, userLocation) {
  const query = normalizeText(filters.query);
  const hasLocation = userLocation && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng);

  // Filtrado por tipo de estación
  let filtered = stations
    .filter((station) => !filters.ccaaId || station.ccaaId === filters.ccaaId)
    .filter((station) => !filters.provinceId || station.provinceId === filters.provinceId)
    .filter((station) => !filters.municipalityId || station.municipalityId === filters.municipalityId)
    .filter((station) => {
      if (!filters.stationType || filters.stationType === 'all') return true;
      if (filters.stationType === 'fuel') return station.kind === 'fuel';
      if (filters.stationType === 'ev') return station.kind === 'ev';
      return true;
    })
    .filter((station) => !filters.fuel || station.kind !== 'fuel' || station.prices[filters.fuel] !== undefined)
    .filter((station) => !filters.openNow || station.isOpen !== false)
    .filter((station) => !query || station.searchText.includes(query))
    .map((station) => ({
      ...station,
      distance: hasLocation ? distanceKm(userLocation, station) : null,
      selectedPrice: station.kind === 'fuel' ? (filters.fuel ? station.prices[filters.fuel] : bestPrice(station)) : null,
    }));

  // Siempre limitar a 20 resultados del tipo seleccionado
  filtered = filtered.sort((a, b) => compareNullable(a.distance, b.distance)).slice(0, 20);

  if (filters.sortBy === 'price') {
    // Ordenar por precio si hay, si no por distancia
    return filtered.sort((a, b) => compareNullable(a.selectedPrice, b.selectedPrice) || compareNullable(a.distance, b.distance));
  }

  return filtered;
}

function bestPrice(station) {
  const prices = Object.values(station.prices);
  if (!prices.length) return null;
  return Math.min(...prices);
}

function compareNullable(a, b) {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  return a - b;
}
