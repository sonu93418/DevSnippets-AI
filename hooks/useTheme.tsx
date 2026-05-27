// ============================================================
// useTheme — Scandinavian theme with system/light/dark support
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { buildTheme, type Theme } from '../constants/theme';
import { getPreferences, setPreferences } from '../lib/storage/asyncStorage';
import type { AppPreferences } from '../types';
import React from 'react';

interface ThemeContextType {
  theme: Theme;
  themeMode: AppPreferences['theme'];
  setThemeMode: (mode: AppPreferences['theme']) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<AppPreferences['theme']>('system');

  useEffect(() => {
    getPreferences().then((prefs) => {
      setThemeModeState(prefs.theme);
    });
  }, []);

  const setThemeMode = useCallback(async (mode: AppPreferences['theme']) => {
    setThemeModeState(mode);
    await setPreferences({ theme: mode });
  }, []);

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemScheme === 'dark');

  const theme = buildTheme(isDark);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
