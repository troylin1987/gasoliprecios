export function About({ data, text }) {
  const municipalityCount = new Set(data.stations.map((station) => station.municipalityId)).size;
  const fuelCount = new Set(data.stations.flatMap((station) => Object.keys(station.prices))).size;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="py-4">
          <p className="text-xs font-black uppercase text-ember">{text.about.eyebrow}</p>
          <h1 className="font-display mt-2 max-w-4xl text-5xl leading-[0.9] tracking-normal text-white sm:text-7xl">
            {text.about.headline}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">{text.about.intro}</p>
          <p className="mt-4 max-w-3xl rounded-lg border border-aqua/25 bg-aqua/10 p-4 text-sm font-bold text-aqua">
            {text.about.update}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label={text.about.stations} value={data.stations.length.toLocaleString('es-ES')} tone="ember" />
          <Stat label={text.about.fuels} value={fuelCount} tone="aqua" />
          <Stat label={text.about.territories} value={municipalityCount.toLocaleString('es-ES')} tone="aqua" />
          <Stat label={text.about.source} value={text.about.sourceValue} tone="ember" />
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <InfoBlock title={text.about.cacheTitle} body={text.about.cacheText} accent="aqua" />
        <InfoBlock title={text.about.privacyTitle} body={text.about.privacyText} accent="ember" />
        <div className="rounded-lg border border-white/10 bg-zinc-950 p-5">
          <h2 className="font-display text-3xl tracking-normal text-white">{text.about.qualityTitle}</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
            {text.about.qualityItems.map((item) => (
              <li className="border-l-2 border-aqua/50 pl-3" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-white/10 bg-gradient-to-r from-ember/[0.12] via-zinc-950 to-aqua/[0.12] p-5">
        <h2 className="font-display text-4xl tracking-normal text-white">{text.about.statsTitle}</h2>
        {text.about.statsSubtitle && <p className="mt-1 text-sm text-zinc-400">{text.about.statsSubtitle}</p>}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <p className="text-sm leading-6 text-zinc-300">
            {text.about.creatorPrefix || text.about.creator}{' '}
            <a
              className="font-bold text-ember underline decoration-ember/40 underline-offset-4"
              href="https://www.mariogijon.es"
              target="_blank"
              rel="noreferrer"
            >
              {text.about.creatorName || text.about.creatorLink}
            </a>
            {text.about.creatorSuffix ? ` ${text.about.creatorSuffix}` : ''}
          </p>
          <p className="text-sm leading-6 text-zinc-300">{text.about.maps}</p>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, tone }) {
  const toneClass = tone === 'aqua' ? 'text-aqua border-aqua/30 bg-aqua/10' : 'text-ember border-ember/30 bg-ember/10';
  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-xs font-black uppercase text-zinc-400">{label}</p>
      <strong className="font-display mt-2 block text-4xl leading-none tracking-normal text-white">{value}</strong>
    </div>
  );
}

function InfoBlock({ title, body, accent }) {
  const accentClass = accent === 'aqua' ? 'border-aqua/30 bg-aqua/10' : 'border-ember/30 bg-ember/10';
  return (
    <div className={`rounded-lg border p-5 ${accentClass}`}>
      <h2 className="font-display text-3xl tracking-normal text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-300">{body}</p>
    </div>
  );
}
