import { expect, test } from '@jest/globals';
import { PHRASES_LANGS, phrasesText } from '../data/phrasesText';

test('frases positivas têm texto nas 10 línguas', () => {
  expect(PHRASES_LANGS).toHaveLength(10);
  const keys = Object.keys(phrasesText('pt')).sort();
  for (const l of PHRASES_LANGS) {
    const x = phrasesText(l) as Record<string, string>;
    expect(Object.keys(x).sort()).toEqual(keys);
    for (const k of keys) expect(x[k].trim().length).toBeGreaterThan(0);
  }
});
