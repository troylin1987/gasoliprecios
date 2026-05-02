import { LocateFixed, Search } from 'lucide-react';
import { FUEL_FIELDS } from '../lib/constants';

export function FiltersPanel({
  filters,
  setFilters,
  locations,
  locationStatus,
  requestLocation,
  text,
}) {
  const selectedCcaa = locations.find((item) => item.id === filters.ccaaId);
  const provinces = selectedCcaa?.provinces || [];
  const selectedProvince = provinces.find((item) => item.id === filters.provinceId);
  const municipalities = selectedProvince?.municipalities || [];

  const update = (patch) => setFilters((current) => ({ ...current, ...patch }));

  const searchButtonLabel = locationStatus === 'loading' ? text.filters.loadingLocation : text.filters.searchButton;

  return (
    <aside className="rounded-none border-y border-white/10 bg-[#0b0f0f]/95 p-3 shadow-glow lg:sticky lg:top-[4.75rem] lg:rounded-lg lg:border">
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase text-ember">{text.filters.eyebrow}</p>
        <h1 className="font-display text-3xl leading-none tracking-normal text-white">{text.filters.title}</h1>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 flex items-center gap-2 text-xs font-bold text-zinc-200">
            <Search size={14} className="text-aqua" /> {text.filters.queryLabel}
          </span>
          <input
            className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-aqua focus:ring-2 focus:ring-aqua/20"
            value={filters.query}
            onChange={(event) => update({ query: event.target.value })}
            placeholder={text.filters.queryPlaceholder}
          />
        </label>

        <Select
          label={text.filters.ccaa}
          value={filters.ccaaId}
          onChange={(value) => update({ ccaaId: value, provinceId: '', municipalityId: '' })}
          options={locations}
          allLabel={text.filters.all}
        />
        <Select
          label={text.filters.province}
          value={filters.provinceId}
          onChange={(value) => update({ provinceId: value, municipalityId: '' })}
          options={provinces}
          disabled={!filters.ccaaId}
          allLabel={text.filters.all}
        />
        <Select
          label={text.filters.municipality}
          value={filters.municipalityId}
          onChange={(value) => update({ municipalityId: value })}
          options={municipalities}
          disabled={!filters.provinceId}
          allLabel={text.filters.all}
        />

        <Select
          label={text.filters.fuel}
          value={filters.fuel}
          onChange={(value) => update({ fuel: value })}
          options={FUEL_FIELDS.map((field) => ({ id: field, name: text.fuels[field] }))}
          allLabel={text.filters.allFuel}
        />

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/10 bg-gradient-to-r from-white/[0.06] to-aqua/[0.08] px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-aqua/50">
          <span>{text.filters.openNow}</span>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-600 bg-black text-aqua focus:ring-aqua"
            checked={filters.openNow}
            onChange={(event) => update({ openNow: event.target.checked })}
          />
        </label>

        <div>
          <span className="mb-1 block text-xs font-bold uppercase text-zinc-200">{text.filters.sort}</span>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black p-1">
            <button className={segmented(filters.sortBy === 'distance')} onClick={() => update({ sortBy: 'distance' })}>
              {text.filters.byDistance}
            </button>
            <button className={segmented(filters.sortBy === 'price')} onClick={() => update({ sortBy: 'price' })}>
              {text.filters.byPrice}
            </button>
          </div>
        </div>

        <button
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-ember to-aqua px-4 py-3 text-sm font-black text-black shadow-2xl shadow-ember/20 transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-ember/30 disabled:cursor-wait disabled:opacity-70"
          onClick={requestLocation}
          disabled={locationStatus === 'loading'}
        >
          <LocateFixed size={18} />
          {searchButtonLabel}
        </button>

        {locationStatus === 'error' && (
          <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {text.filters.locationError}
          </p>
        )}
      </div>
    </aside>
  );
}

function Select({ label, value, onChange, options, disabled, allLabel }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-zinc-200">{label}</span>
      <select
        className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none transition focus:border-aqua focus:ring-2 focus:ring-aqua/20 disabled:cursor-not-allowed disabled:opacity-40"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option value={option.id} key={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function segmented(active) {
  return [
    'rounded-md px-2 py-1.5 text-xs font-black transition',
    active ? 'bg-aqua text-black shadow-glow' : 'text-zinc-400 hover:text-white',
  ].join(' ');
}
