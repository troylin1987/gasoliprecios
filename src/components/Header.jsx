import { useState } from 'react';
import { Menu, Fuel, X } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '../lib/copy';

export function Header({ updatedAt, currentSection, onSectionChange, language, setLanguage, text }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (section) => {
    onSectionChange(section);
    setMenuOpen(false);
  };

  const chooseLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-6">
        <button
          className="group flex min-w-0 items-center gap-2 text-left sm:gap-3"
          onClick={() => goTo('search')}
          aria-label={text.navigation.search}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ember/50 bg-gradient-to-br from-ember/25 to-aqua/10 text-ember shadow-ember transition group-hover:scale-105 sm:h-11 sm:w-11">
            <Fuel size={22} aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col items-start justify-center">
            <span className="font-display block truncate text-2xl leading-none tracking-normal text-white sm:text-3xl">
              {text.app.name}
            </span>
            <span className="font-display mt-0.5 block truncate text-sm leading-none tracking-normal text-aqua sm:text-base">
              {text.app.tagline}
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-2 md:flex" aria-label={text.navigation.primary}>
          <button className={navClass(currentSection === 'search')} onClick={() => goTo('search')}>
            {text.navigation.search}
          </button>
          <button className={navClass(currentSection === 'about')} onClick={() => goTo('about')}>
            {text.navigation.about}
          </button>
          <LanguageSelect language={language} setLanguage={setLanguage} />
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="rounded-lg border border-aqua/25 bg-aqua/10 px-2 py-1 text-right text-[10px] leading-tight text-aqua sm:px-3 sm:py-2 sm:text-xs">
            <span className="block text-zinc-400">{text.app.updated}</span>
            <strong>{updatedAt || text.app.loading}</strong>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:border-aqua/60 hover:text-aqua md:hidden"
            aria-label={menuOpen ? text.navigation.closeMenu : text.navigation.openMenu}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div
        className={[
          'fixed inset-0 top-[4.15rem] z-40 bg-black/90 backdrop-blur-md transition-opacity duration-200 md:hidden',
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={() => setMenuOpen(false)}
      />
      <div
        className={[
          'fixed left-3 right-3 top-[4.55rem] z-50 rounded-lg border border-aqua/25 bg-black p-3 shadow-glow transition duration-300 md:hidden',
          menuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-5 opacity-0',
        ].join(' ')}
      >
        <div className="grid gap-2">
          <button className={mobileNavClass(currentSection === 'search')} onClick={() => goTo('search')}>
            {text.navigation.search}
          </button>
          <button className={mobileNavClass(currentSection === 'about')} onClick={() => goTo('about')}>
            {text.navigation.about}
          </button>
          <div className="rounded-lg border border-white/10 bg-zinc-950 p-3">
            <span className="mb-2 block text-xs font-bold text-zinc-400">{text.navigation.language}</span>
            <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  className={[
                    'flex items-center justify-between gap-2 rounded-lg border px-2 py-2 text-left transition',
                    language === option.id
                      ? 'border-ember bg-ember text-black'
                      : 'border-white/10 bg-white/[0.03] text-zinc-200 hover:border-aqua/60',
                  ].join(' ')}
                  key={option.id}
                  onClick={() => chooseLanguage(option.id)}
                >
                  <span className="text-base">{option.flag}</span>
                  <span className="font-display text-lg leading-none tracking-normal">{option.iso3}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function navClass(active) {
  return [
    'rounded-lg px-3 py-2 text-xs font-bold transition',
    active
      ? 'bg-aqua text-black shadow-glow'
      : 'border border-white/10 bg-white/5 text-zinc-200 hover:border-ember/60 hover:text-ember',
  ].join(' ');
}

function mobileNavClass(active) {
  return [
    'rounded-lg px-3 py-2 text-left text-sm font-bold transition',
    active ? 'bg-ember text-black' : 'border border-white/10 bg-black text-zinc-200',
  ].join(' ');
}

function LanguageSelect({ language, setLanguage }) {
  return (
    <select
      className="rounded-lg border border-white/10 bg-black px-2 py-2 text-xs font-black uppercase text-zinc-100 outline-none transition focus:border-aqua focus:ring-2 focus:ring-aqua/20"
      value={language}
      onChange={(event) => setLanguage(event.target.value)}
      aria-label="Language"
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <option value={option.id} key={option.id}>
          {option.flag} {option.iso3}
        </option>
      ))}
    </select>
  );
}
