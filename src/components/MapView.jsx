import { useEffect, useMemo } from 'react';
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Fuel, Navigation } from 'lucide-react';
import { formatDistance, formatPrice, mapsUrl } from '../lib/format';
import { trackEvent } from '../lib/analytics';

const stationIcon = new L.DivIcon({
  className: 'gas-marker',
  html: '<span></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export function MapView({ results, userLocation, selectedFuel, text }) {
  const center = userLocation || results[0] || { lat: 40.4168, lng: -3.7038 };
  const bounds = useMemo(() => {
    const points = results.map((station) => [station.lat, station.lng]);
    if (userLocation) points.push([userLocation.lat, userLocation.lng]);
    return points;
  }, [results, userLocation]);

  return (
    <div className="h-[72vh] overflow-hidden rounded-lg border border-white/10 bg-[#0b0d0d]">
      <MapContainer center={[center.lat, center.lng]} zoom={userLocation ? 12 : 6} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} />
        {userLocation && (
          <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={9} pathOptions={{ color: '#12d8c0', fillColor: '#12d8c0', fillOpacity: 0.85 }}>
            <Popup>
              <strong>{text.view.yourLocation}</strong>
            </Popup>
          </CircleMarker>
        )}
        {results.map((station) => (
          <Marker position={[station.lat, station.lng]} icon={stationIcon} key={station.id}>
            <Popup>
              <div className="min-w-60 space-y-1">
                <strong className="font-display text-2xl tracking-normal">{station.brand}</strong>
                <p>
                  <b>{text.results.location}:</b> {station.address}
                  <br />
                  {station.municipality || station.locality}
                </p>
                <p>
                  <b>{text.results.schedule}:</b> {station.schedule}
                </p>
                {Number.isFinite(station.distance) && (
                  <p>
                    <b>{text.results.distance}:</b> {formatDistance(station.distance)}
                  </p>
                )}
                <div className="my-2">
                  <p>
                    <b>{text.results.availableFuel}:</b>
                  </p>
                  {Object.entries(station.prices)
                    .filter(([field]) => !selectedFuel || field === selectedFuel)
                    .slice(0, selectedFuel ? 1 : 4)
                    .map(([field, price]) => (
                      <p key={field}>
                        {text.fuels[field]}: <strong>{formatPrice(price)}</strong>
                      </p>
                    ))}
                </div>
                <a
                  href={mapsUrl(station)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('open_maps_from_map', { station_id: station.id })}
                >
                  {text.view.openMaps}
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export function ViewToggle({ viewMode, setViewMode, text }) {
  return (
    <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-black p-1">
      <button className={toggleClass(viewMode === 'list')} onClick={() => setViewMode('list')}>
        <Fuel size={15} /> {text.view.list}
      </button>
      <button className={toggleClass(viewMode === 'map')} onClick={() => setViewMode('map')}>
        <Navigation size={15} /> {text.view.map}
      </button>
    </div>
  );
}

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [34, 34], maxZoom: 14 });
    }
  }, [bounds, map]);
  return null;
}

function toggleClass(active) {
  return [
    'flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs font-black transition',
    active ? 'bg-ember text-black' : 'text-zinc-400 hover:text-white',
  ].join(' ');
}
