// Separador "Hoje": cartão de destaque com a próxima lição + capítulos/lições.

import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CHAPTERS } from '../data/content';
import { useLang } from '../i18n/i18n';
import { loadLessonsDone, toggleLessonDone } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, ScreenTitle } from './ui';

export default function TodayScreen() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    loadLessonsDone().then(setDone);
  }, []);

  const allLessons = CHAPTERS.flatMap((c) => c.lessons);
  const totalLessons = allLessons.length;
  const pct = totalLessons ? Math.round((done.length / totalLessons) * 100) : 0;
  const nextLesson = allLessons.find((l) => !done.includes(l.id));

  async function onToggle(id: string) {
    setDone(await toggleLessonDone(id));
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl }}>
      <ScreenTitle title={t('today.title')} />

      {/* Cartão de destaque do dia */}
      <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, gap: spacing.md }}>
        {nextLesson ? (
          <>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('today.upNext')}</Text>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>{nextLesson.title[lang]}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{t('today.heroSubtitle')}</Text>
            <Pressable
              onPress={() => onToggle(nextLesson.id)}
              style={{ backgroundColor: colors.primary, padding: 16, borderRadius: radius.lg, alignItems: 'center', marginTop: 4 }}
            >
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>{t('today.completeLesson')}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>{t('today.allDoneTitle')}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{t('today.allDoneSubtitle')}</Text>
          </>
        )}
      </Card>

      {/* Progresso global */}
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{t('today.yourProgress')}</Text>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{pct}%</Text>
        </View>
        <View style={{ height: 10, borderRadius: 6, backgroundColor: colors.track, overflow: 'hidden' }}>
          <View style={{ width: `${pct}%`, height: '100%', backgroundColor: colors.primary }} />
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
          {t('today.progressCount', { done: done.length, total: totalLessons })}
        </Text>
      </Card>

      {/* Capítulos e lições */}
      {CHAPTERS.map((ch, i) => (
        <View key={ch.id} style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t('today.chapter', { n: i + 1 })}
          </Text>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>{ch.title[lang]}</Text>

          {ch.lessons.map((les) => {
            const isDone = done.includes(les.id);
            return (
              <Pressable
                key={les.id}
                onPress={() => onToggle(les.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border }}
              >
                <View
                  style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: isDone ? colors.success : 'transparent',
                    borderWidth: 2, borderColor: isDone ? colors.success : colors.border,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {isDone && <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 13 }}>✓</Text>}
                </View>
                <Text style={{ color: isDone ? colors.textMuted : colors.text, fontSize: 16, flex: 1, textDecorationLine: isDone ? 'line-through' : 'none' }}>
                  {les.title[lang]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
