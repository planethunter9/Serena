// Textos novos de Objetivos e Planos: completos nas 10 línguas.
import { expect, test } from '@jest/globals';
import { GOALS_TEXT_LANGS, goalsText } from '../data/goalsText';
import { PLANS_TEXT_LANGS, plansText } from '../data/plansText';
import { SAFETY_TEXT_LANGS, safetyText } from '../data/safetyText';

const check = (langs: string[], get: (l: any) => Record<string, unknown>) => {
  expect(langs).toHaveLength(10);
  const keys = Object.keys(get('pt')).sort();
  for (const l of langs) {
    const x = get(l);
    expect(Object.keys(x).sort()).toEqual(keys);
    for (const v of Object.values(x)) if (typeof v === 'string') expect(v.trim().length).toBeGreaterThan(0);
  }
};

test('objetivos', () => check(GOALS_TEXT_LANGS, goalsText));
test('planos', () => check(PLANS_TEXT_LANGS, plansText));
test('segurança', () => check(SAFETY_TEXT_LANGS, safetyText));
