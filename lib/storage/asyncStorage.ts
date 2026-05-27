// ============================================================
// AsyncStorage — App Preferences
// ============================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppPreferences } from '../../types';

const KEYS = {
  PREFERENCES: '@devsnippets/preferences',
  SEARCH_HISTORY: '@devsnippets/search_history',
  LANGUAGE_FILTER: '@devsnippets/language_filter',
} as const;

const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'system',
  aiProvider: 'gemini',
  defaultLanguage: 'javascript',
};

// --- Preferences ---
export async function getPreferences(): Promise<AppPreferences> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function setPreferences(prefs: Partial<AppPreferences>): Promise<void> {
  const current = await getPreferences();
  await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify({ ...current, ...prefs }));
}

// --- Search History ---
export async function getSearchHistory(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SEARCH_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addSearchQuery(query: string): Promise<void> {
  if (!query.trim()) return;
  const history = await getSearchHistory();
  const updated = [query, ...history.filter((h) => h !== query)].slice(0, 10);
  await AsyncStorage.setItem(KEYS.SEARCH_HISTORY, JSON.stringify(updated));
}

export async function clearSearchHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.SEARCH_HISTORY);
}

// --- Language Filter ---
export async function getSavedLanguageFilter(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(KEYS.LANGUAGE_FILTER)) ?? 'all';
  } catch {
    return 'all';
  }
}

export async function saveLanguageFilter(language: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.LANGUAGE_FILTER, language);
}
