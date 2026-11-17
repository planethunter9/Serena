// Ajudantes puros das Estatísticas: períodos, números na língua certa e a
// grelha do mapa de prática.

import { isoLocal } from '../storage/storage';

export type Period = 'week' | 'month' | 'months3';
export const PERIOD_DAYS: Record<Period, number> = { week: 7, month: 30, months3: 90 };

// Os últimos `n` dias (do mais antigo para hoje), em "AAAA-MM-DD".
export function lastDays(n: number, today = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (n - 1 - i));
    return isoLocal(d);
  });
}

// Número com casas decimais e vírgula/ponto conforme a língua (só "en" usa ponto).
export function fmtNum(v: number, digits: number, lang: string): string {
  const s = v.toFixed(digits);
  return lang === 'en' ? s : s.replace('.', ',');
}

export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

// Variação (%) da média de um período face ao anterior. null se faltar dado.
export function changePct(cur: number | null, prev: number | null): number | null {
  if (cur === null || prev === null || prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

// Mapa de prática: `weeks` colunas (segunda → domingo), a última é a semana
// atual. Dias futuros vêm a null.
export function heatmapGrid(counts: Map<string, number>, weeks: number, today = new Date()): ({ date: string; n: number } | null)[][] {
  const dow = (today.getDay() + 6) % 7;
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow);
  const todayIso = isoLocal(today);
  const cols: ({ date: string; n: number } | null)[][] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const col: ({ date: string; n: number } | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = isoLocal(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() - w * 7 + d));
      col.push(iso > todayIso ? null : { date: iso, n: counts.get(iso) ?? 0 });
    }
    cols.push(col);
  }
  return cols;
}

export function countBy(dates: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const d of dates) m.set(d, (m.get(d) ?? 0) + 1);
  return m;
}
