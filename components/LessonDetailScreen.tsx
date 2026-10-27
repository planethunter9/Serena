// Detalhe de uma lição — ecrã próprio (rota /lesson?id=…), para o deslizar do iOS
// voltar à lista de Lições e não aos Recursos.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { CHAPTERS } from '../data/content';
import { useLang } from '../i18n/i18n';
import { loadLessonsDone, toggleLessonDone } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import { PrimaryButton, TopBackBar } from './ui';

export default function LessonDetailScreen() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = CHAPTERS.flatMap((c) => c.lessons).find((l) => l.id === id) ?? null;
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => { loadLessonsDone().then(setDone); }, []);

  if (!lesson) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBackBar title="" onBack={() => router.back()} />
      </View>
    );
  }

  const isDone = done.includes(lesson.id);
  async function onToggle() { setDone(await toggleLessonDone(lesson!.id)); }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={lesson.title[lang]} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <Text style={{ color: colors.text, fontSize: 16, lineHeight: 26 }}>{lesson.body[lang]}</Text>
        <PrimaryButton label={isDone ? t('lessons.markUndone') : t('lessons.markDone')} onPress={onToggle} />
      </ScrollView>
    </View>
  );
}
