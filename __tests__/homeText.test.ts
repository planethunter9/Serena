import { expect, test } from '@jest/globals';
import { HOME_TEXT_LANGS, homeText } from '../data/homeText';

test('textos do plano, próximo degrau e sugestões nas 10 línguas', () => {
  expect(HOME_TEXT_LANGS).toHaveLength(10);
  const keys = Object.keys(homeText('pt')).sort();
  for (const l of HOME_TEXT_LANGS) {
    const x = homeText(l) as Record<string, string>;
    expect(Object.keys(x).sort()).toEqual(keys);
    for (const k of keys) expect(x[k].trim().length).toBeGreaterThan(0);
    expect(x.p_exposureOn).toContain('{step}');
  }
});
