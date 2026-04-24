import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeTheme } from '../constants/theme';

const STORAGE_KEY = 'themeMode';

// Three preferences the user can pick in Settings. 'system' follows the OS.
const VALID_PREFS = ['system', 'light', 'dark'];

const ThemeContext = createContext(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [preference, setPreferenceState] = useState('system');
  const [hydrated, setHydrated] = useState(false);

  // Hydrate saved preference once on mount.
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && VALID_PREFS.includes(saved)) {
          setPreferenceState(saved);
        }
      } catch {
        // fall through to default
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setPreference = async (pref) => {
    if (!VALID_PREFS.includes(pref)) return;
    setPreferenceState(pref);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, pref);
    } catch {
      // best-effort persistence
    }
  };

  // Resolved mode: either user's explicit choice or the OS scheme when
  // preference is 'system'. Defaults to 'light' if OS scheme is unknown.
  const mode = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo(
    () => ({
      mode,               // 'light' | 'dark' — the effective mode
      preference,         // 'system' | 'light' | 'dark' — the user's choice
      setPreference,
      colors: makeTheme(mode),
      isDark: mode === 'dark',
      hydrated,
    }),
    [mode, preference, hydrated]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
