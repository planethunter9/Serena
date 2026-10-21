// Tema global: claro/escuro + personalização (paleta, cor HEX e fonte).
// Só o azul (paleta 'blue') e a fonte 'system' são grátis; o resto fica
// disponível quando `unlocked` for verdadeiro (pack de personalização).

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  darkColors,
  FONTS,
  lightColors,
  normalizeHex,
  PRESETS,
  resolveColors,
  ThemeName,
} from './theme';

const KEYS = {
  theme: 'app:theme',
  palette: 'app:paletteId',
  custom: 'app:customHex',
  font: 'app:font',
  unlocked: 'app:unlocked',
};

type ThemeContextValue = {
  themeName: ThemeName;
  colors: typeof lightColors;
  isDark: boolean;
  setThemeName: (n: ThemeName) => void;
  toggleTheme: () => void;
  // Personalização
  paletteId: string; // 'blue' | id de PRESETS | 'custom'
  setPalette: (id: string) => void;
  customHex: string; // #rrggbb (usado quando paletteId === 'custom')
  setCustomHex: (hex: string) => void;
  fontKey: string;
  setFontKey: (k: string) => void;
  fontFamily?: string; // família resolvida (undefined = sistema)
  unlocked: boolean;
  setUnlocked: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>('light');
  const [paletteId, setPaletteIdState] = useState('blue');
  const [customHex, setCustomHexState] = useState('#2f8aa8');
  const [fontKey, setFontKeyState] = useState('system');
  const [unlocked, setUnlockedState] = useState(false);

  // Carrega as preferências guardadas.
  useEffect(() => {
    (async () => {
      try {
        const pairs = await AsyncStorage.multiGet([
          KEYS.theme, KEYS.palette, KEYS.custom, KEYS.font, KEYS.unlocked,
        ]);
        const map = Object.fromEntries(pairs);
        if (map[KEYS.theme] === 'light' || map[KEYS.theme] === 'dark') setThemeNameState(map[KEYS.theme] as ThemeName);
        if (map[KEYS.palette]) setPaletteIdState(map[KEYS.palette]!);
        if (map[KEYS.custom] && normalizeHex(map[KEYS.custom]!)) setCustomHexState(normalizeHex(map[KEYS.custom]!)!);
        if (map[KEYS.font]) setFontKeyState(map[KEYS.font]!);
        if (map[KEYS.unlocked] === '1') setUnlockedState(true);
      } catch {}
    })();
  }, []);

  const isDark = themeName === 'dark';

  // Se não estiver desbloqueado, força o grátis (azul + fonte do sistema),
  // mesmo que haja algo guardado de um período em que esteve desbloqueado.
  const effPalette = unlocked ? paletteId : 'blue';
  const effFontKey = unlocked ? fontKey : 'system';

  const primaryHex =
    effPalette === 'blue' ? null
    : effPalette === 'custom' ? normalizeHex(customHex)
    : (PRESETS.find((p) => p.id === effPalette)?.primary ?? null);

  const colors = useMemo(() => resolveColors(isDark, primaryHex), [isDark, primaryHex]);
  const fontFamily = FONTS.find((f) => f.key === effFontKey)?.family;

  function setThemeName(n: ThemeName) { setThemeNameState(n); AsyncStorage.setItem(KEYS.theme, n).catch(() => {}); }
  function toggleTheme() { setThemeName(isDark ? 'light' : 'dark'); }
  function setPalette(id: string) { setPaletteIdState(id); AsyncStorage.setItem(KEYS.palette, id).catch(() => {}); }
  function setCustomHex(hex: string) {
    const n = normalizeHex(hex) ?? hex;
    setCustomHexState(n);
    if (normalizeHex(n)) AsyncStorage.setItem(KEYS.custom, n).catch(() => {});
  }
  function setFontKey(k: string) { setFontKeyState(k); AsyncStorage.setItem(KEYS.font, k).catch(() => {}); }
  function setUnlocked(v: boolean) { setUnlockedState(v); AsyncStorage.setItem(KEYS.unlocked, v ? '1' : '0').catch(() => {}); }

  const value: ThemeContextValue = {
    themeName, colors, isDark, setThemeName, toggleTheme,
    paletteId, setPalette, customHex, setCustomHex,
    fontKey, setFontKey, fontFamily, unlocked, setUnlocked,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
  return ctx;
}

// Reexporta para quem importava daqui.
export { darkColors, lightColors };
