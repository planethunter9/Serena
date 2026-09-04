// Separador "Progresso": histórico do que foi registado na página inicial.

import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { CHAPTERS } from '../data/content';
import { useLang } from '../i18n/i18n';
import { AttackEntry, loadAttacks, loadLessonsDone, loadSeverity, SeverityEntry } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import { Card, ScreenTitle } from './ui';

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { t } = useLang();
  const [entries, setEntries] = useState<SeverityEntry[]>([]);
  const [lessonsDone, setLessonsDone] = useState<string[]>([]);
  const [attacks, setAttacks] = useState<AttackEntry[]>([]);

  useEffect(() => {
    loadSeverity().then(setEntries);
    loadLessonsDone().then(setLessonsDone);
    loadAttacks().then(setAttacks);
  }, []);

  const totalLessons = CHAPTERS.flatMap((c) => c.lessons).length;
  const recent = entries.slice(-14);
  const CHART_HEIGHT = 130;
  const avg = entries.length ? entries.reduce((s, e) => s + e.value, 0) / entries.length : 0;

  // Ataques nos últimos 14 dias.
  const cutoff = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  const attacks14 = attacks.filter((a) => a.date >= cutoff && a.type !== 'behavior').length;

  const stats = [
    { label: t('progress.statLessons'), value: `${lessonsDone.length}/${totalLessons}` },
    { label: t('progress.statDays'), value: `${entries.length}` },
    { label: t('progress.statAvg'), value: `${avg.toFixed(1)}/5` },
    { label: t('progress.statAttacks'), value: `${attacks14}` },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 120 }}>
      <ScreenTitle title={t('progress.title')} />

      <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, gap: 6 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{t('progress.welcomeTitle')}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{t('progress.welcomeSubtitle')}</Text>
      </Card>

      {/* Estatísticas (2 por linha) */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {stats.map((s) => (
          <Card key={s.label} style={{ width: '47%', flexGrow: 1, alignItems: 'center', paddingVertical: spacing.lg, gap: 4 }}>
            <Text style={{ color: colors.primary, fontSize: 22, fontWeight: '800' }}>{s.value}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{s.label}</Text>
          </Card>
        ))}
      </View>

      {/* Gráfico do medo */}
      <Card style={{ gap: 14 }}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>{t('progress.chartTitle')}</Text>
        {recent.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>{t('progress.chartEmpty')}</Text>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: CHART_HEIGHT }}>
            {recent.map((e, idx) => (
              <View key={idx} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                <View style={{ width: '70%', height: Math.max(6, (e.value / 5) * CHART_HEIGHT), backgroundColor: colors.primary, borderRadius: 4 }} />
              </View>
            ))}
          </View>
        )}
      </Card>
    </ScrollView>
  );
}
