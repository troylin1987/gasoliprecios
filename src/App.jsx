import { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { FiltersPanel } from './components/FiltersPanel';
import { ResultsList } from './components/ResultsList';
import { MapView, ViewToggle } from './components/MapView';
import { LoadingScreen, ErrorBanner } from './components/Status';
import { About } from './components/About';
import { CookieNotice } from './components/CookieNotice';
import { loadFuelData } from './lib/data';
import { searchStations } from './lib/search';
import { initAnalytics, trackEvent } from './lib/analytics';
import { getCopy, getInitialLanguage, storeLanguage } from './lib/copy';
import { CACHE_TTL_MS } from './lib/constants';
import { APP_VERSION } from './generated/version';

const initialFilters = {
  query: '',
  ccaaId: '',
  provinceId: '',
  municipalityId: '',
  fuel: '',
  openNow: true,
  sortBy: 'distance',
};

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [userLocation, setUserLocation] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [viewMode, setViewMode] = useState('list');
  const [currentSection, setCurrentSection] = useState('search');
  const [language, setLanguageState] = useState(getInitialLanguage);
  const [analyticsConsent, setAnalyticsConsent] = useState(() => {
    try {
      return localStorage.getItem('gasoliprecios:analytics-consent') || '';
    } catch {
      return '';
    }
  });
  const text = getCopy(language);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    const refreshData = (force = false) => {
      loadFuelData({ force })
        .then((payload) => {
          setData(payload);
          setError(null);
          trackEvent(force ? 'data_auto_refreshed' : 'data_loaded', {
            source: payload.source,
            station_count: payload.stations.length,
          });
        })
        .catch(() => setError(true));
    };

    refreshData();
    const interval = setInterval(() => refreshData(true), CACHE_TTL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (analyticsConsent === 'accepted') initAnalytics();
  }, [analyticsConsent]);

  const setLanguage = (nextLanguage) => {
    setLanguageState(nextLanguage);
    storeLanguage(nextLanguage);
    trackEvent('language_change', { language: nextLanguage });
  };

  useEffect(() => {
    if (!hasSearched) return undefined;
    const timeout = setTimeout(() => {
      trackEvent('search', {
        has_query: Boolean(filters.query),
        ccaa_id: filters.ccaaId || 'all',
        province_id: filters.provinceId || 'all',
        municipality_id: filters.municipalityId || 'all',
        fuel: filters.fuel || 'all',
        open_now: filters.openNow,
        sort_by: filters.sortBy,
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [filters, hasSearched]);

  const results = useMemo(() => {
    if (!data || !hasSearched || !userLocation) return [];
    return searchStations(data.stations, filters, userLocation);
  }, [data, filters, hasSearched, userLocation]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(nextLocation);
        setHasSearched(true);
        setLocationStatus('ready');
        trackEvent('location_allowed');
      },
      () => {
        setLocationStatus('error');
        trackEvent('location_denied');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5 * 60 * 1000 },
    );
  };

  const updateAnalyticsConsent = (value) => {
    try {
      localStorage.setItem('gasoliprecios:analytics-consent', value);
    } catch {
      // Consent still applies for this session.
    }
    setAnalyticsConsent(value);
    if (value === 'accepted') {
      initAnalytics();
      setTimeout(() => trackEvent('analytics_consent_accept'), 0);
    }
  };

  const changeViewMode = (nextViewMode) => {
    setViewMode(nextViewMode);
    trackEvent('view_change', { view_mode: nextViewMode });
  };

  if (error) {
    return (
      <PageShell
        updatedAt={data?.updatedAt}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        language={language}
        setLanguage={setLanguage}
        text={text}
        analyticsConsent={analyticsConsent}
        updateAnalyticsConsent={updateAnalyticsConsent}
      >
        <main className="mx-auto max-w-3xl px-4 py-8">
          <ErrorBanner>{text.status.loadError}</ErrorBanner>
        </main>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        language={language}
        setLanguage={setLanguage}
        text={text}
        analyticsConsent={analyticsConsent}
        updateAnalyticsConsent={updateAnalyticsConsent}
      >
        <LoadingScreen text={text} />
      </PageShell>
    );
  }

  return (
    <PageShell
      updatedAt={data.updatedAt}
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      language={language}
      setLanguage={setLanguage}
      text={text}
      analyticsConsent={analyticsConsent}
      updateAnalyticsConsent={updateAnalyticsConsent}
    >
      {currentSection === 'about' ? (
        <About data={data} text={text} />
      ) : (
        <main className="mx-auto grid max-w-7xl gap-4 py-3 lg:grid-cols-[330px_1fr] lg:px-6">
          <FiltersPanel
            filters={filters}
            setFilters={setFilters}
            locations={data.locations}
            userLocation={userLocation}
            locationStatus={locationStatus}
            requestLocation={requestLocation}
            text={text}
          />
          <section className="mx-4 rounded-lg border border-white/10 bg-[#070b0b]/85 p-3 shadow-glow lg:mx-0">
            {data.warning && (
              <div className="mb-3 rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
                {text.status.apiWarning}
              </div>
            )}

            <div className="mb-3 flex flex-col gap-3 rounded-lg border border-white/10 bg-zinc-950 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold text-aqua">{text.results.title}</p>
                <h2 className="font-display text-3xl leading-none tracking-normal text-white">
                  {hasSearched
                    ? results.length
                      ? `${results.length} ${results.length === 1 ? text.results.oneStation : text.results.stations}`
                      : text.results.emptyTitle
                    : text.results.waitingTitle}
                </h2>
              </div>
              <ViewToggle viewMode={viewMode} setViewMode={changeViewMode} text={text} />
            </div>

            {viewMode === 'list' ? (
              <ResultsList results={results} selectedFuel={filters.fuel} text={text} hasSearched={hasSearched} />
            ) : (
              <MapView results={results} userLocation={userLocation} selectedFuel={filters.fuel} text={text} hasSearched={hasSearched} />
            )}
          </section>
        </main>
      )}
    </PageShell>
  );
}

function PageShell({
  children,
  updatedAt,
  currentSection,
  onSectionChange,
  language,
  setLanguage,
  text,
  analyticsConsent,
  updateAnalyticsConsent,
}) {
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        updatedAt={updatedAt}
        currentSection={currentSection}
        onSectionChange={onSectionChange}
        language={language}
        setLanguage={setLanguage}
        text={text}
      />
      {children}
      <footer className="mt-8 border-t border-white/10 bg-zinc-950 px-4 py-5 text-xs text-zinc-500">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-2xl tracking-normal text-white">
            {text.footer.brand} - {text.footer.version} {APP_VERSION}
          </p>
          <p className="text-right">
            © {year} {text.app.name}. {text.footer.copyright}
            <span className="block text-zinc-600">{text.footer.privacy}</span>
          </p>
        </div>
      </footer>
      {analyticsConsent !== 'accepted' && (
        <CookieNotice
          text={text.consent}
          onAccept={() => updateAnalyticsConsent('accepted')}
        />
      )}
    </div>
  );
}
