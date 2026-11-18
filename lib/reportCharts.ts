// Gráficos do PDF em SVG (o expo-print desenha SVG dentro do HTML).
// Funções puras: recebem os valores e devolvem o <svg> como texto.

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export type Line = { color: string; values: (number | null)[]; label?: string };

export function lineChartSvg(opts: {
  lines: Line[];
  yMax: number;
  yTicks: number[];
  xLabels: [string, string];       // primeira e última data
  tickSuffix?: string;
  width?: number;
  height?: number;
}): string {
  const W = opts.width ?? 640, H = opts.height ?? 190;
  const L = 36, R = 12, T = 12, B = 26;
  const n = Math.max(...opts.lines.map((l) => l.values.length), 1);
  const x = (i: number) => L + (n <= 1 ? (W - L - R) / 2 : (i / (n - 1)) * (W - L - R));
  const y = (v: number) => T + (1 - v / opts.yMax) * (H - T - B);
  const grid = opts.yTicks.map((v) =>
    `<line x1="${L}" y1="${y(v)}" x2="${W - R}" y2="${y(v)}" stroke="#e3eaee" stroke-width="1"/>` +
    `<text x="${L - 6}" y="${y(v) + 3.5}" font-size="10" fill="#5d6b78" text-anchor="end">${v}${opts.tickSuffix ?? ''}</text>`).join('');
  const series = opts.lines.map((l) => {
    const pts = l.values.map((v, i) => (v == null ? null : [x(i), y(v)] as const)).filter(Boolean) as (readonly [number, number])[];
    const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    const dots = pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="#fff" stroke="${l.color}" stroke-width="2"/>`).join('');
    return (pts.length > 1 ? `<path d="${path}" fill="none" stroke="${l.color}" stroke-width="2.2" stroke-linejoin="round"/>` : '') + dots;
  }).join('');
  const xl = `<text x="${L}" y="${H - 6}" font-size="10" fill="#5d6b78">${esc(opts.xLabels[0])}</text>` +
    `<text x="${W - R}" y="${H - 6}" font-size="10" fill="#5d6b78" text-anchor="end">${esc(opts.xLabels[1])}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px">${grid}${series}${xl}</svg>`;
}

export function legendHtml(items: { color: string; label: string }[]): string {
  return `<div class="legend">${items.map((i) => `<span><i style="background:${i.color}"></i>${esc(i.label)}</span>`).join('')}</div>`;
}
