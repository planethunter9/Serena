// Paletas de cores, fontes e "tokens" de espaçamento usados em toda a app.
// Tema base (GRÁTIS): azul pastel (#cee5ed) com azul-petróleo nos destaques.
// As restantes paletas, a cor personalizada (HEX) e as fontes fazem parte do
// pack de personalização (pago).

export type ThemeName = 'light' | 'dark';

export const lightColors = {
  background: '#cee5ed',
  card: '#ffffff',
  cardAlt: '#eaf3f7',
  primary: '#2f8aa8',
  primarySoft: '#e3f0f5',
  text: '#123039',
  textMuted: '#5a7580',
  border: '#c2dbe4',
  success: '#2fae66',
  successSoft: '#e6f6ec',
  danger: '#e5484d',
  track: '#dbe9ee',
  // Cores dos gráficos por nível (baixo → alto). Fixas por tema (não dependem
  // da cor principal), para a leitura verde/amarelo/vermelho funcionar sempre.
  chartLow: '#2fae66',
  chartMid: '#e0922f',
  chartHigh: '#e5484d',
};

export const darkColors: typeof lightColors = {
  background: '#0e1519',
  card: '#16212a',
  cardAlt: '#1b2831',
  primary: '#63c1de',
  primarySoft: '#14323d',
  text: '#eaf3f7',
  textMuted: '#93a7b0',
  border: '#243440',
  success: '#4cc985',
  successSoft: '#12281d',
  danger: '#ff6b6f',
  track: '#243440',
  // Versões mais claras/suaves para contraste no escuro.
  chartLow: '#4cc985',
  chartMid: '#f0a94e',
  chartHigh: '#ff6b6f',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 18, xl: 26 };

// Escala tipográfica única, para manter tamanhos consistentes entre ecrãs.
// caption = legendas · body = texto · subtitle = subtítulos · title = títulos
// de secção · screen = título de ecrã · display = número grande (estatísticas).
export const fontSizes = { caption: 12, small: 13, body: 15, subtitle: 16, title: 18, screen: 22, display: 24, hero: 30 };

// --- Paletas prontas (pagas). 'blue' é a grátis e usa as cores base acima. ---
export type Palette = { id: string; name: { pt: string; en: string }; primary: string };

export const PRESETS: Palette[] = [
  { id: 'lavender', name: { pt: 'Lavanda', en: 'Lavender' }, primary: '#7a5cc9' },
  { id: 'sage', name: { pt: 'Verde-sálvia', en: 'Sage' }, primary: '#4f9d7f' },
  { id: 'sunset', name: { pt: 'Pôr do sol', en: 'Sunset' }, primary: '#d9734e' },
  { id: 'rose', name: { pt: 'Rosa suave', en: 'Soft rose' }, primary: '#c65b86' },
  { id: 'slate', name: { pt: 'Ardósia', en: 'Slate' }, primary: '#5b7186' },
  { id: 'ocean', name: { pt: 'Oceano', en: 'Ocean' }, primary: '#2a9d9d' },
];

// --- Fontes (20 mais comuns). 'system' é a grátis. As restantes precisam dos
// pacotes @expo-google-fonts carregados no app/_layout.tsx. ---
export const FONTS: { key: string; label: string; family?: string }[] = [
  { key: 'system', label: 'Padrão do sistema' },
  { key: 'roboto', label: 'Roboto', family: 'Roboto_400Regular' },
  { key: 'opensans', label: 'Open Sans', family: 'OpenSans_400Regular' },
  { key: 'lato', label: 'Lato', family: 'Lato_400Regular' },
  { key: 'montserrat', label: 'Montserrat', family: 'Montserrat_400Regular' },
  { key: 'poppins', label: 'Poppins', family: 'Poppins_400Regular' },
  { key: 'raleway', label: 'Raleway', family: 'Raleway_400Regular' },
  { key: 'nunito', label: 'Nunito', family: 'Nunito_400Regular' },
  { key: 'inter', label: 'Inter', family: 'Inter_400Regular' },
  { key: 'worksans', label: 'Work Sans', family: 'WorkSans_400Regular' },
  { key: 'merriweather', label: 'Merriweather', family: 'Merriweather_400Regular' },
  { key: 'playfair', label: 'Playfair Display', family: 'PlayfairDisplay_400Regular' },
  { key: 'oswald', label: 'Oswald', family: 'Oswald_400Regular' },
  { key: 'sourcesans', label: 'Source Sans 3', family: 'SourceSans3_400Regular' },
  { key: 'ptsans', label: 'PT Sans', family: 'PTSans_400Regular' },
  { key: 'rubik', label: 'Rubik', family: 'Rubik_400Regular' },
  { key: 'quicksand', label: 'Quicksand', family: 'Quicksand_400Regular' },
  { key: 'mulish', label: 'Mulish', family: 'Mulish_400Regular' },
  { key: 'karla', label: 'Karla', family: 'Karla_400Regular' },
  { key: 'dmsans', label: 'DM Sans', family: 'DMSans_400Regular' },
  { key: 'lora', label: 'Lora', family: 'Lora_400Regular' },
];

// --- Utilitários de cor (derivar um tema a partir de uma cor principal) ---
export function normalizeHex(s: string): string | null {
  const h = s.trim().replace(/^#/, '');
  return /^[0-9a-fA-F]{6}$/.test(h) ? '#' + h.toLowerCase() : null;
}
function toRgb(h: string) { const x = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)); }
function toHex(rgb: number[]) { return '#' + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function mix(a: string, b: string, t: number) { const A = toRgb(a), B = toRgb(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); }

// Deriva o conjunto completo de cores a partir de uma cor principal.
export function deriveColors(primary: string, isDark: boolean): typeof lightColors {
  if (isDark) {
    return {
      ...darkColors,
      primary: mix(primary, '#ffffff', 0.22),
      primarySoft: mix(primary, '#0e1519', 0.72),
    };
  }
  return {
    ...lightColors,
    primary,
    primarySoft: mix(primary, '#ffffff', 0.86),
    background: mix(primary, '#ffffff', 0.80),
    cardAlt: mix(primary, '#ffffff', 0.90),
    border: mix(primary, '#ffffff', 0.72),
    track: mix(primary, '#ffffff', 0.82),
  };
}

// Resolve as cores a usar, consoante a paleta/cor escolhida.
export function resolveColors(isDark: boolean, primaryHex: string | null): typeof lightColors {
  if (!primaryHex) return isDark ? darkColors : lightColors; // azul grátis (base)
  return deriveColors(primaryHex, isDark);
}
