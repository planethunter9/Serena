import { expect, test } from '@jest/globals';
import { PRACTICE_TEXT_LANGS, practiceText } from '../data/practiceText';

test('textos dos exercícios melhorados nas 10 línguas', () => {
  expect(PRACTICE_TEXT_LANGS).toHaveLength(10);
  const keys = Object.keys(practiceText('pt')).sort();
  for (const l of PRACTICE_TEXT_LANGS) {
    const x = practiceText(l) as Record<string, string>;
    expect(Object.keys(x).sort()).toEqual(keys);
    for (const k of keys) expect(x[k].trim().length).toBeGreaterThan(0);
    expect(x.l_lessonOf).toContain('{a}');
    expect(x.l_lessonOf).toContain('{b}');
  }
});
