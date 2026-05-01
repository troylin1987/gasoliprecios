import { ExternalLink, MapPin, Clock, Fuel } from 'lucide-react';
import { formatDistance, formatPrice, mapsUrl } from '../lib/format';
import { trackEvent } from '../lib/analytics';

export function ResultsList({ results, selectedFuel, text, hasSearched }) {
  if (!hasSearched) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-lg border border-aqua/20 bg-[#0b0d0d] p-6 text-center">
        <div>
          <p className="text-base font-bold text-white">{text.results.waitingTitle}</p>
          <p className="mt-2 text-sm text-zinc-400">{text.results.waitingHelp}</p>
        </div>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-lg border border-white/10 bg-zinc-950 p-6 text-center">
        <div>
          <p className="text-base font-bold text-white">{text.results.emptyTitle}</p>
          <p className="mt-2 text-sm text-zinc-400">{text.results.emptyHelp}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[70vh] overflow-y-auto rounded-lg border border-white/10 bg-[#0b0d0d] p-2 sm:p-3">
      <div className="space-y-2.5">
        {results.map((station, index) => (
          <StationCard station={station} key={station.id} index={index} selectedFuel={selectedFuel} text={text} />
        ))}
      </div>
    </div>
  );
}

function StationCard({ station, index, selectedFuel, text }) {
  const priceEntries = Object.entries(station.prices)
    .filter(([field]) => !selectedFuel || field === selectedFuel)
    .slice(0, selectedFuel ? 1 : 5);
  const hasDistance = Number.isFinite(station.distance);

  return (
    <a
      className="group block rounded-lg border border-white/10 bg-black/70 p-3 transition duration-200 hover:-translate-y-0.5 hover:border-ember/60 hover:shadow-ember sm:p-4"
      href={mapsUrl(station)}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent('open_maps', { station_id: station.id, station_brand: station.brand })}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-ember to-aqua text-xs font-black text-black">
              {index + 1}
            </span>
            <h2 className="text-base font-black text-white sm:text-lg">{station.brand}</h2>
          </div>
          <p className="mt-2 flex gap-2 text-xs text-zinc-300 sm:text-sm">
            <MapPin size={15} className="mt-0.5 shrink-0 text-aqua" />
            <span>
              <span className="font-bold text-aqua">{text.results.location}: </span>
              {station.address}
              <span className="block text-zinc-500">{station.municipality || station.locality}</span>
            </span>
          </p>
        </div>
        <div className="text-right">
          {hasDistance && (
            <span className="block text-sm font-black text-aqua">{formatDistance(station.distance)}</span>
          )}
          <span className={station.isOpen ? 'text-xs font-bold text-emerald-300' : 'text-xs font-bold text-red-300'}>
            {station.isOpen ? text.results.open : text.results.closed}
          </span>
        </div>
      </div>

      <p className="mt-2 flex gap-2 text-xs text-zinc-400">
        <Clock size={15} className="shrink-0 text-ember" />
        <span>
          <span className="font-bold text-ember">{text.results.schedule}: </span>
          {station.schedule}
        </span>
      </p>

      <p className="mt-2 flex items-center gap-2 text-xs font-bold text-zinc-300">
        <Fuel size={14} className="text-aqua" />
        {text.results.availableFuel}
      </p>

      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {priceEntries.map(([field, price]) => (
          <div key={field} className="rounded-md border border-aqua/15 bg-gradient-to-br from-aqua/[0.08] to-ember/[0.06] px-3 py-2">
            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
              <Fuel size={12} /> {text.fuels[field] || field.replace('Precio ', '')}
            </span>
            <strong className="text-sm text-white sm:text-base">{formatPrice(price)}</strong>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 text-xs font-black text-ember transition group-hover:text-orange-300 sm:text-sm">
        {text.results.directions} <ExternalLink size={15} />
      </div>
    </a>
  );
}
