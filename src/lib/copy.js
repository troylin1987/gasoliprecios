import copy from '../content/copy.json';

export const DEFAULT_LANGUAGE = 'es';
export const LANGUAGE_OPTIONS = Object.entries(copy).map(([id, value]) => ({
  id,
  name: value._meta?.name || id,
  iso3: value._meta?.iso3 || id.toUpperCase(),
  flag: value._meta?.flag || '🌐',
}));
export const LANGUAGES = LANGUAGE_OPTIONS.map((language) => language.id);

export function getInitialLanguage() {
  try {
    const stored = localStorage.getItem('gasoliprecios:language');
    if (LANGUAGES.includes(stored)) return stored;
  } catch {
    // Keep the default when storage is unavailable.
  }
  return DEFAULT_LANGUAGE;
}

export function getCopy(language) {
  return deepMerge(copy[DEFAULT_LANGUAGE], copy[language] || {});
}

export function storeLanguage(language) {
  try {
    localStorage.setItem('gasoliprecios:language', language);
  } catch {
    // Language persistence is a convenience, not a requirement.
  }
}

function deepMerge(base, override) {
  const result = { ...base };
  Object.entries(override).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      result[key] = value;
      return;
    }
    if (value && typeof value === 'object') {
      result[key] = deepMerge(base[key] || {}, value);
      return;
    }
    result[key] = value;
  });
  return result;
}
