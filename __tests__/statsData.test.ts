import { expect, test } from '@jest/globals';
import { changePct, countBy, fmtNum, heatmapGrid, lastDays } from '../lib/statsData';
import { STATS_TEXT_LANGS, statsText } from '../data/statsText';

test('últimos dias e números', () => {
  const d = lastDays(7, new Date(2026, 10, 17));
  expect(d).toHaveLength(7);
  expect(d[0]).toBe('2026-11-11');
  expect(d[6]).toBe('2026-11-17');
  expect(fmtNum(2, 1, 'pt')).toBe('2,0');
  expect(fmtNum(2, 1, 'en')).toBe('2.0');
  expect(changePct(2, 4)).toBe(-50);
  expect(changePct(2, null)).toBeNull();
});

test('mapa de prática: 13 colunas de 7, futuro a null', () => {
  const g = heatmapGrid(countBy(['2026-11-17', '2026-11-17', '2026-11-16']), 13, new Date(2026, 10, 17)); // terça
  expect(g).toHaveLength(13);
  const last = g[12];
  expect(last[0]).toEqual({ date: '2026-11-16', n: 1 });
  expect(last[1]).toEqual({ date: '2026-11-17', n: 2 });
  expect(last[2]).toBeNull();
});

test('textos das estatísticas nas 10 línguas', () => {
  expect(STATS_TEXT_LANGS).toHaveLength(10);
  const keys = Object.keys(statsText('pt')).sort();
  for (const l of STATS_TEXT_LANGS) {
    const x = statsText(l) as Record<string, string>;
    expect(Object.keys(x).sort()).toEqual(keys);
    for (const k of keys) expect(x[k].trim().length).toBeGreaterThan(0);
  }
});
