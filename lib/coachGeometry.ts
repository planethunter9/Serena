// Geometria do tutorial (coach marks): sem dependências, para se poder testar.

export type Rect = { x: number; y: number; w: number; h: number };

// Recorta o retângulo à zona visível e limita a altura (listas compridas),
// para sobrar espaço para o balão. Devolve null se quase nada estiver visível.
export function clampRect(r: Rect, screenW: number, screenH: number, topInset = 0): Rect | null {
  const top = Math.max(r.y, topInset);
  const bottom = Math.min(r.y + r.h, screenH);
  const left = Math.max(r.x, 0);
  const right = Math.min(r.x + r.w, screenW);
  if (bottom - top < 36 || right - left < 36) return null;
  const maxH = screenH * 0.45;
  return { x: left, y: top, w: right - left, h: Math.min(bottom - top, maxH) };
}
