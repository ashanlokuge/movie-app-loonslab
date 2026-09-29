/** Light/dark theme mode: defaults to the OS preference, then remembers the user's choice. */
import { createContext, useCallback, useContext, useMemo } from 'react';
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { STORAGE_KEYS } from '../config/constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { buildTheme } from '../theme';

const ThemeModeContext = createContext(null);

export function ThemeModeProvider({ children }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  // null = "user hasn't chosen yet" → follow the OS setting.
  const [storedMode, setStoredMode] = useLocalStorage(STORAGE_KEYS.themeMode, null);
  const mode = storedMode || (prefersDark ? 'dark' : 'light');

  const toggleMode = useCallback(
    () => setStoredMode(mode === 'dark' ? 'light' : 'dark'),
    [mode, setStoredMode],
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within a ThemeModeProvider');
  return ctx;
}
