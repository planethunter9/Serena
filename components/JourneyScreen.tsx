// Ecrã "Jornada": mostra o progresso geral e os capítulos com as lições.
// Tocar numa lição marca-a como concluída (e volta a desmarcar se tocares outra vez).

import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CHAPTERS, PHOBIA } from '../data/content';
import { loadLessonsDone, OnboardingData, toggleLessonDone } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

export default function JourneyScreen({ data }: { data: OnboardingData }) {
  const { colors } = useTheme();
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    loadLessonsDone().then(setDone);
  }, []);

  const totalLessons = CHAPTERS.reduce((n, c) => n + c.lessons.length, 0);
  const pct = totalLessons ? Math.round((done.length / totalLessons) * 100) : 0;

  async function onToggle(id: string) {
    setDone(await toggleLessonDone(id));
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
      <View>
        <Text style={{ color: colors.textMuted, fontSize: 15 }}>A tua jornada</Text>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800' }}>
          Supera a tua {PHOBIA.name}
        </Text>
      </View>

      {/* Cartão de progresso global */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>Progresso</Text>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{pct}%</Text>
        </View>
        <View style={{ height: 10, borderRadius: 6, backgroundColor: colors.track, overflow: 'hidden' }}>
          <View style={{ width: `${pct}%`, height: '100%', backgroundColor: colors.primary }} />
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>
          {done.length} de {totalLessons} lições concluídas
        </Text>
      </View>

      {/* Capítulos e lições */}
      {CHAPTERS.map((ch, i) => (
        <View key={ch.id} style={{ gap: spacing.sm }}>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 12,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Capítulo {i + 1}
          </Text>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>
            {ch.title}
          </Text>

          {ch.lessons.map((les) => {
            const isDone = done.includes(les.id);
            return (
              <Pressable
                key={les.id}
                onPress={() => onToggle(les.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: colors.card,
                  borderRadius: radius.md,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: isDone ? colors.success : 'transparent',
                    borderWidth: 2,
                    borderColor: isDone ? colors.success : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isDone && (
                    <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 13 }}>✓</Text>
                  )}
                </View>
                <Text
                  style={{
                    color: isDone ? colors.textMuted : colors.text,
                    fontSize: 16,
                    flex: 1,
                    textDecorationLine: isDone ? 'line-through' : 'none',
                  }}
                >
                  {les.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
