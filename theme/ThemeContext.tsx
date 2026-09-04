// Este ficheiro cria o "tema global": qualquer ecrã pode chamar useTheme()
// para saber as cores atuais e para trocar entre claro/escuro.
// A escolha fica guardada no telemóvel, por isso persiste entre sessões.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { darkColors, lightColors, ThemeName } from './theme';

const STORAGE_KEY = 'app:theme';

type ThemeContextValue = {
  themeName: ThemeName;
  colors: typeof lightColors;
  isDark: boolean;
  setThemeName: (name: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Começa sempre em 'light' (claro), como pediste.
  const [themeName, setThemeNameState] = useState<ThemeName>('light');

  // Quando a app abre, lê a preferência que estava guardada.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setThemeNameState(saved);
      }
    });
  }, []);

  function setThemeName(name: ThemeName) {
    setThemeNameState(name);
    AsyncStorage.setItem(STORAGE_KEY, name); // guarda para a próxima vez
  }

  function toggleTheme() {
    setThemeName(themeName === 'light' ? 'dark' : 'light');
  }

  const colors = themeName === 'dark' ? darkColors : lightColors;

  const value: ThemeContextValue = {
    themeName,
    colors,
    isDark: themeName === 'dark',
    setThemeName,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Hook prático: const { colors, themeName, setThemeName } = useTheme();
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme tem de ser usado dentro de <ThemeProvider>');
  }
  return ctx;
}
