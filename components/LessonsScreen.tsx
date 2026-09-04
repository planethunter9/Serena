// Ecrã de Lições (aberto a partir dos Recursos).
// Mostra os capítulos; tocar numa lição abre o seu conteúdo.

import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CHAPTERS } from '../data/content';
import { useLang } from '../i18n/i18n';
import { loadLessonsDone, toggleLessonDone } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, PrimaryButton, TopBackBar } from './ui';

type Lesson = { id: string; title: { pt: string; en: string }; body: { pt: string; en: string } };

export default function LessonsScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [done, setDone] = useState<string[]>([]);
  const [selected, setSelected] = useState<Lesson | null>(null);

  useEffect(() => {
    loadLessonsDone().then(setDone);
  }, []);

  async function onToggle(id: string) {
    setDone(await toggleLessonDone(id));
  }

  // Vista de detalhe de uma lição.
  if (selected) {
    const isDone = done.includes(selected.id);
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBackBar title={selected.title[lang]} onBack={() => setSelected(null)} />
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
          <Text style={{ color: colors.text, fontSize: 16, lineHeight: 26 }}>{selected.body[lang]}</Text>
          <PrimaryButton
            label={isDone ? t('lessons.markUndone') : t('lessons.markDone')}
            onPress={() => onToggle(selected.id)}
          />
        </ScrollView>
      </View>
    );
  }

  // Lista de capítulos e lições.
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('lessons.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl }}>
        {CHAPTERS.map((ch, ci) => (
          <View key={ch.id} style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('lessons.chapter', { n: ci + 1 })}
            </Text>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>{ch.title[lang]}</Text>

            {ch.lessons.map((les) => {
              const isDone = done.includes(les.id);
              return (
                <Pressable
                  key={les.id}
                  onPress={() => setSelected(les)}
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
                  <Text style={{ color: colors.text, fontSize: 16, flex: 1 }}>{les.title[lang]}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 20 }}>›</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
