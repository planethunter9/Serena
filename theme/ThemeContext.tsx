// Tema global: claro/escuro + personalização (paleta, cor HEX, fonte e cores do
// círculo de pilares). Só o azul (paleta 'blue') e a fonte 'system' são grátis;
// o resto (incluindo as cores do círculo) fica disponível quando `unlocked` for
// verdadeiro (pack de personalização).

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
  ring: 'app:ringColors',
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
  // Cores do círculo de pilares (pago). null = usar as predefinidas do tema.
  ringColors: string[] | null;
  defaultRingColors: string[];
  setRingColor: (index: number, hex: string) => void;
  resetRingColors: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>('light');
  const [paletteId, setPaletteIdState] = useState('blue');
  const [customHex, setCustomHexState] = useState('#2f8aa8');
  const [fontKey, setFontKeyState] = useState('system');
  const [unlocked, setUnlockedState] = useState(false);
  const [ringColors, setRingColorsState] = useState<string[] | null>(null);

  // Carrega as preferências guardadas.
  useEffect(() => {
    (async () => {
      try {
        const pairs = await AsyncStorage.multiGet([
          KEYS.theme, KEYS.palette, KEYS.custom, KEYS.font, KEYS.unlocked, KEYS.ring,
        ]);
        const map = Object.fromEntries(pairs);
        if (map[KEYS.theme] === 'light' || map[KEYS.theme] === 'dark') setThemeNameState(map[KEYS.theme] as ThemeName);
        if (map[KEYS.palette]) setPaletteIdState(map[KEYS.palette]!);
        if (map[KEYS.custom] && normalizeHex(map[KEYS.custom]!)) setCustomHexState(normalizeHex(map[KEYS.custom]!)!);
        if (map[KEYS.font]) setFontKeyState(map[KEYS.font]!);
        if (map[KEYS.unlocked] === '1') setUnlockedState(true);
        if (map[KEYS.ring]) {
          const arr = JSON.parse(map[KEYS.ring]!);
          if (Array.isArray(arr) && arr.length === 3 && arr.every((x) => typeof x === 'string')) setRingColorsState(arr);
        }
      } catch {}
    })();
  }, []);

  const isDark = themeName === 'dark';

  const effPalette = unlocked ? paletteId : 'blue';
  const effFontKey = unlocked ? fontKey : 'system';

  const primaryHex =
    effPalette === 'blue' ? null
    : effPalette === 'custom' ? normalizeHex(customHex)
    : (PRESETS.find((p) => p.id === effPalette)?.primary ?? null);

  const colors = useMemo(() => resolveColors(isDark, primaryHex), [isDark, primaryHex]);
  const fontFamily = FONTS.find((f) => f.key === effFontKey)?.family;

  // Cores predefinidas do círculo (seguem o tema). Cores próprias só se `unlocked`.
  const defaultRingColors = [colors.primary, '#3b82f6', colors.success];
  const effRingColors = unlocked ? ringColors : null;

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
  function setRingColor(index: number, hex: string) {
    const n = normalizeHex(hex);
    if (!n || index < 0 || index > 2) return;
    const base = ringColors ?? [colors.primary, '#3b82f6', colors.success];
    const next = [...base];
    next[index] = n;
    setRingColorsState(next);
    AsyncStorage.setItem(KEYS.ring, JSON.stringify(next)).catch(() => {});
  }
  function resetRingColors() {
    setRingColorsState(null);
    AsyncStorage.removeItem(KEYS.ring).catch(() => {});
  }

  const value: ThemeContextValue = {
    themeName, colors, isDark, setThemeName, toggleTheme,
    paletteId, setPalette, customHex, setCustomHex,
    fontKey, setFontKey, fontFamily, unlocked, setUnlocked,
    ringColors: effRingColors, defaultRingColors, setRingColor, resetRingColors,
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
