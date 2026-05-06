import { useState } from 'react';
import { Menu, Fuel, X, Moon, Sun } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '../lib/copy';

export function Header({ updatedAt, currentSection, onSectionChange, language, setLanguage, theme, setTheme, text }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (section) => {
    onSectionChange(section);
    setMenuOpen(false);
  };

  const chooseLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className={theme === 'light' ? 'sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-xl' : 'sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl'}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-6">
        <button
          className="group flex min-w-0 items-center gap-2 text-left sm:gap-3"
          onClick={() => goTo('search')}
          aria-label={text.navigation.search}
        >
          <span className={theme === 'light' ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-orange-500/50 bg-gradient-to-br from-orange-200 to-orange-100 text-orange-600 shadow-sm transition group-hover:scale-105 sm:h-11 sm:w-11' : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ember/50 bg-gradient-to-br from-ember/25 to-aqua/10 text-ember shadow-ember transition group-hover:scale-105 sm:h-11 sm:w-11'}>
            <Fuel size={22} aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col items-start justify-center">
            <span className="font-display block truncate text-2xl leading-none tracking-normal sm:text-3xl">
              {text.app.name}
            </span>
            <span className={theme === 'light' ? 'font-display mt-0.5 block truncate text-sm leading-none tracking-normal text-orange-600 sm:text-base' : 'font-display mt-0.5 block truncate text-sm leading-none tracking-normal text-aqua sm:text-base'}>
              {text.app.tagline}
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-2 md:flex" aria-label={text.navigation.primary}>
          <button className={navClass(currentSection === 'search', theme)} onClick={() => goTo('search')}>
            {text.navigation.search}
          </button>
          <button className={navClass(currentSection === 'about', theme)} onClick={() => goTo('about')}>
            {text.navigation.about}
          </button>
          <LanguageSelect language={language} setLanguage={setLanguage} label={text.navigation.language} theme={theme} />
          <button
            className={theme === 'light' ? 'rounded-lg px-3 py-2 text-xs font-bold transition border border-gray-300 bg-white text-gray-700 hover:border-orange-400 hover:text-orange-600' : 'rounded-lg px-3 py-2 text-xs font-bold transition border border-white/10 bg-white/5 text-zinc-200 hover:border-aqua/60 hover:text-aqua'}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className={theme === 'light' ? 'rounded-lg border border-orange-300 bg-orange-50 px-2 py-1 text-right text-[10px] leading-tight text-orange-700 sm:px-3 sm:py-2 sm:text-xs' : 'rounded-lg border border-aqua/25 bg-aqua/10 px-2 py-1 text-right text-[10px] leading-tight text-aqua sm:px-3 sm:py-2 sm:text-xs'}>
            <span className={theme === 'light' ? 'block text-gray-600' : 'block text-zinc-400'}>{text.app.updated}</span>
            <strong>{updatedAt || text.app.loading}</strong>
          </div>
          <button
            className={theme === 'light' ? 'flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 text-gray-700 transition hover:border-orange-400 hover:text-orange-600 md:hidden' : 'flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:border-aqua/60 hover:text-aqua md:hidden'}
            aria-label={menuOpen ? text.navigation.closeMenu : text.navigation.openMenu}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div
        className={[
          theme === 'light' ? 'fixed inset-0 top-[4.15rem] z-40 bg-gray-900/40 backdrop-blur-md transition-opacity duration-200 md:hidden' : 'fixed inset-0 top-[4.15rem] z-40 bg-black/90 backdrop-blur-md transition-opacity duration-200 md:hidden',
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={() => setMenuOpen(false)}
      />
      <div
        className={[
          theme === 'light' ? 'fixed left-3 right-3 top-[4.55rem] z-50 rounded-lg border border-orange-300 bg-white p-3 shadow-lg transition duration-300 md:hidden' : 'fixed left-3 right-3 top-[4.55rem] z-50 rounded-lg border border-aqua/25 bg-black p-3 shadow-glow transition duration-300 md:hidden',
          menuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-5 opacity-0',
        ].join(' ')}
      >
        <div className="grid gap-2">
          <button className={mobileNavClass(currentSection === 'search', theme)} onClick={() => goTo('search')}>
            {text.navigation.search}
          </button>
          <button className={mobileNavClass(currentSection === 'about', theme)} onClick={() => goTo('about')}>
            {text.navigation.about}
          </button>
          <button
            className={theme === 'light' ? 'rounded-lg px-3 py-2 text-left text-sm font-bold transition border border-gray-300 bg-white text-gray-700 hover:border-orange-400 hover:text-orange-600 flex items-center justify-between' : 'rounded-lg px-3 py-2 text-left text-sm font-bold transition border border-white/10 bg-white/[0.03] text-zinc-200 hover:border-aqua/60 flex items-center justify-between'}
            onClick={toggleTheme}
          >
            <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className={theme === 'light' ? 'rounded-lg border border-gray-300 bg-gray-50 p-3' : 'rounded-lg border border-white/10 bg-zinc-950 p-3'}>
            <span className={theme === 'light' ? 'mb-2 block text-xs font-bold text-gray-700' : 'mb-2 block text-xs font-bold text-zinc-400'}>{text.navigation.language}</span>
            <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  className={[
                    'flex items-center justify-between gap-2 rounded-lg border px-2 py-2 text-left transition',
                    language === option.id
                      ? theme === 'light' ? 'border-orange-500 bg-orange-100 text-orange-700' : 'border-ember bg-ember text-black'
                      : theme === 'light' ? 'border-gray-300 bg-white text-gray-700 hover:border-orange-400' : 'border-white/10 bg-white/[0.03] text-zinc-200 hover:border-aqua/60',
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

function navClass(active, theme) {
  return [
    'rounded-lg px-3 py-2 text-xs font-bold transition',
    active
      ? theme === 'light' ? 'bg-orange-500 text-white shadow-md' : 'bg-aqua text-black shadow-glow'
      : theme === 'light' ? 'border border-gray-300 bg-white text-gray-700 hover:border-orange-400 hover:text-orange-600' : 'border border-white/10 bg-white/5 text-zinc-200 hover:border-ember/60 hover:text-ember',
  ].join(' ');
}

function mobileNavClass(active, theme) {
  return [
    'rounded-lg px-3 py-2 text-left text-sm font-bold transition',
    active ? theme === 'light' ? 'bg-orange-100 text-orange-700' : 'bg-ember text-black' : theme === 'light' ? 'border border-gray-300 bg-white text-gray-700' : 'border border-white/10 bg-black text-zinc-200',
  ].join(' ');
}

function LanguageSelect({ language, setLanguage, label, theme }) {
  return (
    <select
      className={theme === 'light' ? 'rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs font-black uppercase text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200' : 'rounded-lg border border-white/10 bg-black px-2 py-2 text-xs font-black uppercase text-zinc-100 outline-none transition focus:border-aqua focus:ring-2 focus:ring-aqua/20'}
      value={language}
      onChange={(event) => setLanguage(event.target.value)}
      aria-label={label}
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <option value={option.id} key={option.id}>
          {option.flag} {option.iso3}
        </option>
      ))}
    </select>
  );
}
