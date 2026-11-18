// Estatísticas das conquistas e lista das desbloqueadas — usado no ecrã das
// Conquistas e no aviso "Conquista desbloqueada".

import { ACHIEVEMENTS, AchStats } from '../data/achievements';
import { CHAPTERS } from '../data/content';
import {
  isoLocal,
  loadExposureDays,
  loadGoals,
  loadJournal,
  loadLessonsDone,
  loadManualAchievements,
  loadSeverity,
  loadStreakStart,
} from '../storage/storage';

export async function loadAchStats(): Promise<{ stats: AchStats; manual: string[] }> {
  const [streakStart, lessons, journal, goals, severity, manual, expDays] = await Promise.all([
    loadStreakStart(), loadLessonsDone(), loadJournal(), loadGoals(), loadSeverity(), loadManualAchievements(), loadExposureDays(),
  ]);
  const arr = <T,>(x: T[] | null | undefined): T[] => (Array.isArray(x) ? x : []);
  const expSet = new Set(arr(expDays));
  const d0 = new Date();
  if (!expSet.has(isoLocal(d0))) d0.setDate(d0.getDate() - 1);
  let exposureStreak = 0;
  while (expSet.has(isoLocal(d0))) { exposureStreak++; d0.setDate(d0.getDate() - 1); }
  const streakDays = streakStart ? Math.max(0, Math.floor((Date.now() - new Date(streakStart).getTime()) / 86400000)) : 0;
  return {
    stats: {
      streakDays,
      lessonsDone: arr(lessons).length,
      lessonsTotal: CHAPTERS.flatMap((c) => c.lessons).length,
      journalDays: new Set(arr(journal).map((e) => e.date)).size,
      goalsCreated: arr(goals).length,
      goalsDone: arr(goals).filter((g) => g.done).length,
      fearDays: arr(severity).length,
      exposureDays: arr(expDays).length,
      exposureStreak,
    },
    manual: arr(manual),
  };
}

export function unlockedIds(stats: AchStats, manual: string[]): string[] {
  return ACHIEVEMENTS.filter((a) => (a.manual ? manual.includes(a.id) : a.check(stats).unlocked)).map((a) => a.id);
}

// Conquistas novas = desbloqueadas agora e ainda não vistas.
export const newlyUnlocked = (unlocked: string[], seen: string[]) => unlocked.filter((id) => !seen.includes(id));
