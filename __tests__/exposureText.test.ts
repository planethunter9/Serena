// Sessão de exposição: textos completos nas 10 línguas.
import { expect, test } from '@jest/globals';
import { EXPOSURE_TEXT_LANGS, exposureText, PROB_STEPS } from '../data/exposureText';

test('textos da exposição nas 10 línguas', () => {
  expect(EXPOSURE_TEXT_LANGS).toHaveLength(10);
  const keys = Object.keys(exposureText('pt')).sort();
  for (const l of EXPOSURE_TEXT_LANGS) {
    const x = exposureText(l) as Record<string, string>;
    expect(Object.keys(x).sort()).toEqual(keys);
    for (const k of keys) expect(x[k].trim().length).toBeGreaterThan(0);
  }
});

test('escala de probabilidade de 0 a 100', () => {
  expect(PROB_STEPS[0]).toBe(0);
  expect(PROB_STEPS[PROB_STEPS.length - 1]).toBe(100);
});
