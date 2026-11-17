import { expect, test } from '@jest/globals';
import { applyBehavior, freeInfo } from '../lib/safetyState';
import { SAFETY_TEXT_LANGS, safetyText, FEEDING_META } from '../data/safetyText';
import { FEEDING_BEHAVIORS } from '../data/content';
import { SAFETY_BEHAVIORS } from '../data/safety';

test('largar implica fazer; deixar de fazer tira o largar e o registo', () => {
  let r = applyBehavior([], [], 'bag', 'Saco', { dropping: true });
  expect(r.stored[0]).toMatchObject({ doing: true, dropping: true });
  expect(r.dropped.map((d) => d.id)).toEqual(['bag']);
  r = applyBehavior(r.stored, r.dropped, 'bag', 'Saco', { doing: false });
  expect(r.stored[0]).toMatchObject({ doing: false, dropping: false });
  expect(r.dropped).toEqual([]);
});

test('dias sem', () => {
  expect(freeInfo(['2026-11-01', '2026-11-01', '2026-11-02'], '2026-11-02')).toEqual({ count: 2, today: true });
  expect(freeInfo(undefined)).toEqual({ count: 0, today: false });
});

test('textos e ligações de "Alimentar o medo"', () => {
  expect(SAFETY_TEXT_LANGS).toHaveLength(10);
  const ids = new Set(SAFETY_BEHAVIORS.map((b) => b.id));
  for (const f of FEEDING_BEHAVIORS) {
    expect(FEEDING_META[f.id]).toBeDefined();
    for (const r of FEEDING_META[f.id].related) expect(ids.has(r)).toBe(true);
    for (const l of SAFETY_TEXT_LANGS) expect(safetyText(l).examples[f.id]?.length).toBeGreaterThan(5);
  }
});
