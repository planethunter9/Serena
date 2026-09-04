// Paletas de cores e "tokens" de espaçamento usados em toda a app.
// Tema base: azul pastel (#cee5ed) com um azul-petróleo para os destaques.
// Se quiseres mudar o visual, mexe só aqui.

export type ThemeName = 'light' | 'dark';

export const lightColors = {
  background: '#cee5ed', // azul pastel pedido
  card: '#ffffff',
  cardAlt: '#eaf3f7',
  primary: '#2f8aa8', // azul-petróleo, com bom contraste para texto branco
  primarySoft: '#e3f0f5', // preenchimento suave dentro de cartões brancos
  text: '#123039',
  textMuted: '#5a7580',
  border: '#c2dbe4',
  success: '#2fae66',
  successSoft: '#e6f6ec',
  danger: '#e5484d',
  track: '#dbe9ee', // fundo das barras de progresso
};

// A paleta escura tem de ter EXATAMENTE as mesmas chaves que a clara.
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
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 18, xl: 26 };
