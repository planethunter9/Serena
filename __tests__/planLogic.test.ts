import { expect, test } from '@jest/globals';
import { appliesOn, dayState, isAutoDone, TASK_META } from '../lib/planLogic';

const ctx = { exposure: true, words: false, myth: false, thought: false, memory: false, experiment: false, approach: false, journal: true, focusFree: false };

test('tarefas que se marcam sozinhas', () => {
  expect(isAutoDone('exp_day', ctx)).toBe(true);
  expect(isAutoDone('care_journal', ctx)).toBe(true);
  expect(isAutoDone('cog_thought', ctx)).toBe(false);
  expect(isAutoDone('c123', ctx)).toBe(false);
  expect(isAutoDone('focus', { ...ctx, focusFree: true })).toBe(true);
});

test('dias da semana e estado do dia', () => {
  expect(appliesOn(undefined, 3)).toBe(true);
  expect(appliesOn([0, 2, 4], 1)).toBe(false);
  expect(dayState(3, 3, false)).toBe('full');
  expect(dayState(3, 1, false)).toBe('partial');
  expect(dayState(0, 0, false)).toBe('rest');
  expect(dayState(2, 0, true)).toBe('future');
});

test('todas as rotas das tarefas existem', () => {
  const routes = ['/exercise', '/lessons', '/urgesurf', '/safetyfeeding', '/breathing', '/journal', '/sounds', '/affirmation'];
  for (const m of Object.values(TASK_META)) if (m.route) expect(routes).toContain(m.route.pathname);
});
