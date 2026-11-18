// Ecrã de Lições (aberto a partir dos Recursos).
// Mostra os capítulos com barra de progresso; tocar numa lição abre o detalhe
// numa rota própria (/lesson) para o deslizar do iOS voltar aqui, não a Recursos.

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CHAPTERS } from '../data/content';
import { pick, useLang } from '../i18n/i18n';
import { practiceText } from '../data/practiceText';
import { loadLessonsDone } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

export default function LessonsScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const router = useRouter();
  const px = practiceText(lang);
  const [done, setDone] = useState<string[]>([]);
  // Capítulos abertos (colapsáveis). null = ainda não escolhido: abre o capítulo atual.
  const [expanded, setExpanded] = useState<string[] | null>(null);

  // Recarrega o estado "concluído" sempre que o ecrã volta a ficar em foco.
  useFocusEffect(useCallback(() => { loadLessonsDone().then(setDone); }, []));

  // Próxima lição por ler (pela ordem dos capítulos).
  const all = CHAPTERS.flatMap((ch, ci) => ch.lessons.map((l, li) => ({ ch, ci, l, li })));
  const nextL = all.find((x) => !done.includes(x.l.id)) ?? null;
  const openIds = expanded ?? (nextL ? [nextL.ch.id] : []);

  function toggleChapter(id: string) {
    setExpanded(openIds.includes(id) ? openIds.filter((x) => x !== id) : [...openIds, id]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('lessons.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl }}>
        {/* Continuar: a próxima lição por ler */}
        {nextL ? (
          <Pressable
            onPress={() => router.push({ pathname: '/lesson', params: { id: nextL.l.id } } as any)}
            accessibilityRole="button"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="play" size={20} color={colors.onPrimary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: colors.onPrimary, opacity: 0.85, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{px.l_continue}</Text>
              <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '700' }}>{pick(nextL.l.title, lang)}</Text>
              <Text style={{ color: colors.onPrimary, opacity: 0.85, fontSize: 12 }}>
                {pick(nextL.ch.title, lang)} · {px.l_lessonOf.replace('{a}', String(nextL.li + 1)).replace('{b}', String(nextL.ch.lessons.length))}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onPrimary} />
          </Pressable>
        ) : (
          <View style={{ backgroundColor: colors.successSoft, borderRadius: radius.lg, padding: spacing.lg, gap: 4 }}>
            <Text style={{ color: colors.success, fontSize: 16, fontWeight: '700' }}>{px.l_allDone}</Text>
            <Text style={{ color: colors.text, fontSize: 14 }}>{px.l_review}</Text>
          </View>
        )}

        {CHAPTERS.map((ch, ci) => {
          const doneCount = ch.lessons.filter((l) => done.includes(l.id)).length;
          const open = openIds.includes(ch.id);
          const chDone = doneCount === ch.lessons.length;
          return (
            <View key={ch.id} style={{ gap: spacing.sm }}>
              {/* Cabeçalho do capítulo — clicável para abrir/fechar */}
              <Pressable onPress={() => toggleChapter(ch.id)} style={{ gap: 4 }}>
                <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {t('lessons.chapter', { n: ci + 1 })}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {chDone && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
                  <Text style={{ color: chDone ? colors.textMuted : colors.text, fontSize: 18, fontWeight: '700', flex: 1 }}>{pick(ch.title, lang)}</Text>
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
                      {isDone && <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: 13 }}>✓</Text>}
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
