/**
 * ThemeProvider — React context around the theme controller.
 *
 * Exposes the current theme state and setters. Reads system preferences on
 * mount and persists overrides to localStorage.
 */

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  initialThemeState,
  applyThemeState,
  setMode,
  watchSystemPreferences,
  type ThemeMode,
  type GlassMode,
  type MotionMode,
  type ContrastMode,
  type ThemeState,
} from '../tokens';

const ThemeContext = createContext<{
  state: ThemeState;
  setTheme: (v: ThemeMode) => void;
  setGlass: (v: GlassMode) => void;
  setMotion: (v: MotionMode) => void;
  setContrast: (v: ContrastMode) => void;
  toggleTheme: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ThemeState>(initialThemeState);

  // Apply CSS variables + data attributes on mount and whenever state changes.
  useEffect(() => {
    applyThemeState(state);
    import('../tokens/css').then(({ applyCssVariables }) => {
      const themeName: 'midnight' | 'daybreak' =
        state.theme === 'dark' ? 'midnight' : 'daybreak';
      applyCssVariables({
        ...state,
        theme: themeName,
      });
    });
  }, [state]);

  // Watch system preferences for non-overridden modes.
  useEffect(() => {
    return watchSystemPreferences((next: ThemeState) => {
      setState(() => next);
    });
  }, []);

  const setTheme = useCallback((v: ThemeMode) => {
    setMode('theme', v);
    setState((prev) => ({ ...prev, theme: v }));
  }, []);

  const setGlass = useCallback((v: GlassMode) => {
    setMode('glass', v);
    setState((prev) => ({ ...prev, glass: v }));
  }, []);

  const setMotion = useCallback((v: MotionMode) => {
    setMode('motion', v);
    setState((prev) => ({ ...prev, motion: v }));
  }, []);

  const setContrast = useCallback((v: ContrastMode) => {
    setMode('contrast', v);
    setState((prev) => ({ ...prev, contrast: v }));
  }, []);

  const toggleTheme = useCallback(() => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [state.theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        state,
        setTheme,
        setGlass,
        setMotion,
        setContrast,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
