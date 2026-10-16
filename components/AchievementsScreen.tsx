// Conquistas: automáticas (pelo progresso) e manuais (marcadas por ti).

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ACHIEVEMENTS, AchStats } from '../data/achievements';
import { CHAPTERS } from '../data/content';
import { useLang } from '../i18n/i18n';
import { loadExposureDays, loadGoals, loadJournal, loadLessonsDone, loadManualAchievements, loadSeverity, loadStreakStart, saveManualAchievements } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { ScreenTitle, TopBackBar } from './ui';

export default function AchievementsScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [stats, setStats] = useState<AchStats | null>(null);
  const [manual, setManual] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const [streakStart, lessons, journal, goals, severity, man, expDays] = await Promise.all([
        loadStreakStart(),
        loadLessonsDone(),
        loadJournal(),
        loadGoals(),
        loadSeverity(),
        loadManualAchievements(),
        loadExposureDays(),
      ]);

      // dias seguidos de exposição (terminados hoje ou ontem)
      const expSet = new Set(expDays);
      const ymd = (d: Date) => d.toISOString().slice(0, 10);
      const d0 = new Date();
      if (!expSet.has(ymd(d0))) d0.setDate(d0.getDate() - 1);
      let exposureStreak = 0;
      while (expSet.has(ymd(d0))) { exposureStreak++; d0.setDate(d0.getDate() - 1); }
      const streakDays = streakStart ? Math.max(0, Math.floor((Date.now() - new Date(streakStart).getTime()) / 86400000)) : 0;
      const journalDays = new Set(journal.map((e) => e.date)).size;
      setStats({
        streakDays,
        lessonsDone: lessons.length,
        lessonsTotal: CHAPTERS.flatMap((c) => c.lessons).length,
        journalDays,
        goalsCreated: goals.length,
        goalsDone: goals.filter((g) => g.done).length,
        fearDays: severity.length,
        exposureDays: expDays.length,
        exposureStreak,
      });
      setManual(man);
    })();
  }, []);

  function isUnlocked(a: (typeof ACHIEVEMENTS)[number]) {
    if (a.manual) return manual.includes(a.id);
    return stats ? a.check(stats).unlocked : false;
  }
  function toggleManual(id: string) {
    const next = manual.includes(id) ? manual.filter((x) => x !== id) : [...manual, id];
    setManual(next);
    saveManualAchievements(next);
  }

  const unlockedCount = ACHIEVEMENTS.filter(isUnlocked).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('ach.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>
          {t('ach.count', { have: unlockedCount, total: ACHIEVEMENTS.length })}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {ACHIEVEMENTS.map((a) => {
            const unlocked = isUnlocked(a);
            const res = !a.manual && stats ? a.check(stats) : { unlocked, have: undefined as number | undefined, need: undefined as number | undefined };
            return (
              <Pressable
                key={a.id}
                onPress={a.manual ? () => toggleManual(a.id) : undefined}
                style={{
                  width: '47%',
                  flexGrow: 1,
                  backgroundColor: colors.card,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                  borderWidth: 1,
                  borderColor: unlocked ? colors.primary : colors.border,
                  alignItems: 'center',
                  gap: 8,
                  opacity: unlocked ? 1 : 0.7,
                }}
              >
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: unlocked ? colors.primarySoft : colors.cardAlt, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={unlocked ? a.icon : 'lock-closed'} size={26} color={unlocked ? colors.primary : colors.textMuted} />
                </View>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', textAlign: 'center' }}>{a.title[lang]}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{a.desc[lang]}</Text>

                {unlocked ? (
                  <View style={{ backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>{t('ach.unlocked')}</Text>
                  </View>
                ) : a.manual ? (
                  <View style={{ backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>{t('ach.mark')}</Text>
                  </View>
                ) : res.need ? (
                  <View style={{ backgroundColor: colors.cardAlt, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}>{Math.min(res.have ?? 0, res.need)}/{res.need}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
