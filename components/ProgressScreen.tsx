// Separador "Progresso": resumo "Num relance" + seletor Progresso/Atividade
// com gráfico (intensidade do medo vs. registos por dia).

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CHAPTERS } from '../data/content';
import { useLang } from '../i18n/i18n';
import {
  AttackEntry,
  ExposureSession,
  JournalEntry,
  loadAttacks,
  loadExposureSessions,
  loadJournal,
  loadLessonsDone,
  loadSeverity,
  loadStreakStart,
  SeverityEntry,
} from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, ScreenTitle } from './ui';

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { t } = useLang();
  const [entries, setEntries] = useState<SeverityEntry[]>([]);
  const [lessonsDone, setLessonsDone] = useState<string[]>([]);
  const [attacks, setAttacks] = useState<AttackEntry[]>([]);
  const [exposures, setExposures] = useState<ExposureSession[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [view, setView] = useState<'progress' | 'activity'>('progress');

  useEffect(() => {
    loadSeverity().then(setEntries);
    loadLessonsDone().then(setLessonsDone);
    loadAttacks().then(setAttacks);
    loadExposureSessions().then(setExposures);
    loadJournal().then(setJournal);
    loadStreakStart().then((s) => setStreakDays(s ? Math.max(0, Math.floor((Date.now() - new Date(s).getTime()) / 86400000)) : 0));
  }, []);

  const totalLessons = CHAPTERS.flatMap((c) => c.lessons).length;
  const CHART_HEIGHT = 130;

  // --- Num relance ---
  const glance = [
    { icon: 'book-outline' as const, label: t('progress.glLessons'), value: `${lessonsDone.length}/${totalLessons}` },
    { icon: 'trending-up-outline' as const, label: t('progress.glExposures'), value: `${exposures.length}` },
    { icon: 'create-outline' as const, label: t('progress.glJournal'), value: `${new Set(journal.map((j) => j.date)).size}` },
    { icon: 'flame-outline' as const, label: t('progress.glStreak'), value: `${streakDays}` },
  ];

  // --- Gráfico: intensidade do medo (últimos registos) ---
  const recentFear = entries.slice(-14);
  const avg = entries.length ? entries.reduce((s, e) => s + e.value, 0) / entries.length : 0;

  // --- Gráfico: atividade por dia (últimos 14 dias) ---
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  const activityByDay = days.map((d) => {
    const ex = exposures.filter((e) => e.date === d).length;
    const jn = journal.filter((j) => j.date === d).length;
    const sv = entries.filter((e) => e.date === d).length;
    return ex + jn + sv;
  });
  const maxActivity = Math.max(1, ...activityByDay);

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 120 }}>
      <ScreenTitle title={t('progress.title')} />

      {/* Num relance */}
      <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>{t('progress.glance')}</Text>
      <View style={{ gap: spacing.sm }}>
        {glance.map((g) => (
          <Card key={g.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={g.icon} size={20} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{g.label}</Text>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{g.value}</Text>
          </Card>
        ))}
      </View>

      {/* Seletor Progresso / Atividade */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.cardAlt, borderRadius: 999, padding: 4 }}>
        {(['progress', 'activity'] as const).map((v) => {
          const active = view === v;
          return (
            <Pressable key={v} onPress={() => setView(v)} style={{ flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center', backgroundColor: active ? colors.card : 'transparent' }}>
              <Text style={{ color: active ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 14 }}>
                {v === 'progress' ? t('progress.tabProgress') : t('progress.tabActivity')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Gráfico */}
      <Card style={{ gap: 14 }}>
        {view === 'progress' ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{t('progress.chartTitle')}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('progress.statAvg')} {avg.toFixed(1)}/5</Text>
            </View>
            {recentFear.length === 0 ? (
              <Text style={{ color: colors.textMuted }}>{t('progress.chartEmpty')}</Text>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: CHART_HEIGHT }}>
                {recentFear.map((e, idx) => (
                  <View key={idx} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <View style={{ width: '70%', height: Math.max(6, (e.value / 5) * CHART_HEIGHT), backgroundColor: colors.primary, borderRadius: 4 }} />
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{t('progress.activityTitle')}</Text>
            {activityByDay.every((n) => n === 0) ? (
              <Text style={{ color: colors.textMuted }}>{t('progress.activityEmpty')}</Text>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: CHART_HEIGHT }}>
                {activityByDay.map((n, idx) => (
                  <View key={idx} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <View style={{ width: '70%', height: Math.max(4, (n / maxActivity) * CHART_HEIGHT), backgroundColor: colors.success, borderRadius: 4 }} />
                  </View>
                ))}
              </View>
            )}
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t('progress.activityHint')}</Text>
          </>
        )}
      </Card>
    </ScrollView>
  );
}
