// Tutorial de abertura: textos completos nas 10 línguas e realce dentro do ecrã.
import { expect, test } from '@jest/globals';
import { clampRect } from '../components/CoachMarks';
import { TUTORIAL_ORDER, tutorialPack } from '../data/tutorial';
import { LANGS } from '../i18n/i18n';

test('todos os passos têm título e texto em todas as línguas', () => {
  for (const { code } of LANGS) {
    const pack = tutorialPack(code);
    for (const id of TUTORIAL_ORDER) {
      expect(pack.steps[id].title.length).toBeGreaterThan(0);
      expect(pack.steps[id].text.length).toBeGreaterThan(0);
    }
    for (const v of Object.values(pack.ui)) expect(v.length).toBeGreaterThan(0);
  }
});

test('o realce fica dentro do ecrã e não ocupa mais de 45% da altura', () => {
  const r = clampRect({ x: 20, y: 300, w: 350, h: 2000 }, 390, 844, 47)!;
  expect(r.y).toBe(300);
  expect(r.h).toBeLessThanOrEqual(844 * 0.45);
  expect(clampRect({ x: 20, y: 10, w: 350, h: 100 }, 390, 844, 47)!.y).toBe(47);
});

test('alvo fora do ecrã → sem realce (balão ao centro)', () => {
  expect(clampRect({ x: 20, y: 900, w: 350, h: 100 }, 390, 844)).toBeNull();
});
