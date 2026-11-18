import { expect, test } from '@jest/globals';
import { newlyUnlocked, unlockedIds } from '../lib/achievementStats';
import { PRACTICE_TEXT_LANGS, practiceText } from '../data/practiceText';

const stats = { streakDays: 0, lessonsDone: 1, lessonsTotal: 47, journalDays: 0, goalsCreated: 0, goalsDone: 0, fearDays: 0, exposureDays: 0, exposureStreak: 0 };

test('conquistas desbloqueadas e novas', () => {
  const u = unlockedIds(stats, []);
  expect(u).toContain('start');
  expect(newlyUnlocked(u, ['start'])).not.toContain('start');
  expect(newlyUnlocked(['a', 'b'], ['a'])).toEqual(['b']);
});

test('textos do aviso de conquista nas 10 línguas', () => {
  for (const l of PRACTICE_TEXT_LANGS) {
    const x = practiceText(l);
    for (const k of ['ach_congrats', 'ach_unlocked', 'ach_continue', 'ach_seeAll'] as const) expect(x[k].length).toBeGreaterThan(0);
  }
});
