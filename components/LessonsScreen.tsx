// Ecrã de Lições (aberto a partir dos Recursos).
// Mostra os capítulos com barra de progresso; tocar numa lição abre o detalhe
// numa rota própria (/lesson) para o deslizar do iOS voltar aqui, não a Recursos.

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CHAPTERS } from '../data/content';
import { pick, useLang } from '../i18n/i18n';
import { loadLessonsDone } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

export default function LessonsScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const router = useRouter();
  const [done, setDone] = useState<string[]>([]);
  // Capítulos abertos (colapsáveis). Começa com o 1.º aberto para não ficar vazio.
  const [expanded, setExpanded] = useState<string[]>(CHAPTERS.length ? [CHAPTERS[0].id] : []);

  // Recarrega o estado "concluído" sempre que o ecrã volta a ficar em foco.
  useFocusEffect(useCallback(() => { loadLessonsDone().then(setDone); }, []));

  function toggleChapter(id: string) {
    setExpanded((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('lessons.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl }}>
        {CHAPTERS.map((ch, ci) => {
          const doneCount = ch.lessons.filter((l) => done.includes(l.id)).length;
          const open = expanded.includes(ch.id);
          return (
            <View key={ch.id} style={{ gap: spacing.sm }}>
              {/* Cabeçalho do capítulo — clicável para abrir/fechar */}
              <Pressable onPress={() => toggleChapter(ch.id)} style={{ gap: 4 }}>
                <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {t('lessons.chapter', { n: ci + 1 })}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', flex: 1 }}>{pick(ch.title, lang)}</Text>
                  <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={22} color={colors.textMuted} />
                </View>
              </Pressable>

              {/* Barra de progresso (segmentos: verde = lição concluída) — sempre visível */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', gap: 4, flex: 1 }}>
                  {ch.lessons.map((l) => (
                    <View
                      key={l.id}
                      style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: done.includes(l.id) ? colors.success : colors.cardAlt }}
                    />
                  ))}
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{doneCount}/{ch.lessons.length}</Text>
              </View>

              {open && ch.lessons.map((les) => {
                const isDone = done.includes(les.id);
                return (
                  <Pressable
                    key={les.id}
                    onPress={() => router.push({ pathname: '/lesson', params: { id: les.id } } as any)}
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
                      {isDone && <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>✓</Text>}
                    </View>
                    <Text style={{ color: colors.text, fontSize: 16, flex: 1 }}>{pick(les.title, lang)}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 20 }}>›</Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
