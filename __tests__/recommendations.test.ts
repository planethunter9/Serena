import { expect, test } from '@jest/globals';
import { recommend, RecInput } from '../lib/recommendations';
import { REC_TEXT_LANGS, recText } from '../data/recText';

const base: RecInput = {
  today: '2026-11-18', severity: null, subtypes: [], lastExposure: null, step: { id: 's1', label: 'Dizer a palavra' },
  hasCustomSteps: true, templateSubtype: null, nextLesson: { id: 'l1', title: 'A ciência do medo' }, lessonsDone: 0, forLesson: null,
  pendingExperiment: null, doingCount: 0, droppingCount: 0, droppingNotFreeToday: null, lastThought: null, lastJournal: '2026-11-18',
  mythPlayed: true, wordsPlayed: true,
};

test('sem exposições: a exposição vem primeiro, depois a lição', () => {
  const r = recommend(base);
  expect(r.map((x) => x.id)).toEqual(['exposure', 'lesson']);
  expect(r[0].reasonKey).toBe('r_expNever');
  expect(r[0].route.params).toMatchObject({ step: 's1' });
});

test('dia muito difícil: acalmar primeiro', () => {
  const r = recommend({ ...base, severity: 5 });
  expect(r.map((x) => x.id)).toEqual(['trigger', 'breathe', 'urge']);
});

test('exposição recente não é recomendada; subtipos trazem sugestões próprias', () => {
  const r = recommend({ ...base, lastExposure: '2026-11-18', subtypes: ['family', 'illness'], lessonsDone: 10 });
  expect(r.map((x) => x.id)).toEqual(['kids', 'experiment', 'lesson']);
});

test('no máximo uma lição', () => {
  const r = recommend({ ...base, lastExposure: '2026-11-18', forLesson: { id: 'l30', title: 'Gravidez' } });
  expect(r.filter((x) => x.id === 'lesson' || x.id === 'lessonFor')).toHaveLength(1);
});

test('textos nas 10 línguas', () => {
  expect(REC_TEXT_LANGS).toHaveLength(10);
  const keys = Object.keys(recText('pt')).sort();
  for (const l of REC_TEXT_LANGS) {
    const t = recText(l) as Record<string, string>;
    expect(Object.keys(t).sort()).toEqual(keys);
    for (const k of keys) expect(t[k].trim().length).toBeGreaterThan(0);
  }
});
