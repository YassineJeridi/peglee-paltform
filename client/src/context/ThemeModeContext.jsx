import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const ThemeModeContext = createContext(null);
const STORAGE_KEY = 'bac-info-theme-mode';

function getInitialMode() {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  // Le design system est pensé "verre sombre" par défaut (§1) : on ne
  // retombe sur la préférence système que si l'utilisateur n'a jamais choisi.
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    // Exposé en attribut DOM pour le CSS hors-thème MUI (scrollbar, FullCalendar,
    // dégradé du titre iridescent) qui ne peut pas lire le thème JS directement.
    document.documentElement.setAttribute('data-theme-mode', mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error("useThemeMode doit être utilisé à l'intérieur d'un <ThemeModeProvider>.");
  }
  return ctx;
}
