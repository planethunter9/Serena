// Detalhe de uma lição — ecrã próprio (rota /lesson?id=…), para o deslizar do iOS
// voltar à lista de Lições e não aos Recursos.
// Apresentação "mais leve" do mesmo texto (ver lib/lessonFormat):
// cabeçalho com o capítulo, ícone, tempo de leitura e progresso; introdução em
// letra maior; 1.ª frase de cada parágrafo a negrito; listas; citações em
// itálico; o último parágrafo num cartão "A reter"; no fim, "Próxima lição".

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CHAPTERS } from '../data/content';
import { practiceText } from '../data/practiceText';
import { pick, useLang } from '../i18n/i18n';
import { formatLesson, readMinutes, splitQuotes } from '../lib/lessonFormat';
import { loadLessonsDone, toggleLessonDone } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

const CHAPTER_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'flag-outline', 'repeat-outline', 'scale-outline', 'school-outline', 'construct-outline',
  'trending-up-outline', 'trophy-outline', 'list-outline', 'heart-outline', 'library-outline',
];

export default function LessonDetailScreen() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const px = practiceText(lang);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ci = CHAPTERS.findIndex((c) => c.lessons.some((l) => l.id === id));
  const chapter = ci >= 0 ? CHAPTERS[ci] : null;
  const li = chapter ? chapter.lessons.findIndex((l) => l.id === id) : -1;
  const lesson = chapter ? chapter.lessons[li] : null;
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => { loadLessonsDone().then(setDone); }, []);

  if (!lesson || !chapter) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBackBar title="" onBack={() => router.back()} />
      </View>
    );
  }

  const isDone = done.includes(lesson.id);
  async function onToggle() { setDone(await toggleLessonDone(lesson!.id)); }

  // Próxima lição (no mesmo capítulo ou no seguinte).
  const all = CHAPTERS.flatMap((c) => c.lessons);
  const next = all[all.findIndex((l) => l.id === lesson.id) + 1] ?? null;
  async function goNext() {
    if (!isDone) setDone(await toggleLessonDone(lesson!.id)); // ler até ao fim conta como lida
    if (next) router.replace({ pathname: '/lesson', params: { id: next.id } } as any);
    else router.back();
  }

  const body = pick(lesson.body, lang);
  const blocks = formatLesson(body);
  const icon = CHAPTER_ICONS[ci] ?? 'book-outline';

  // Texto com as citações em itálico.
  const rich = (s: string, color: string) =>
    splitQuotes(s).map((seg, k) => (
      <Text key={k} style={seg.quote ? { fontStyle: 'italic', color: colors.primary } : { color }}>{seg.text}</Text>
    ));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={pick(chapter.title, lang)} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.sm, gap: spacing.lg, paddingBottom: spacing.xxl }}>
        {/* Cabeçalho */}
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={icon} size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {t('lessons.chapter', { n: ci + 1 })} · {px.l_lessonOf.replace('{a}', String(li + 1)).replace('{b}', String(chapter.lessons.length))}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{px.l_readMin.replace('{n}', String(readMinutes(body)))}</Text>
              </View>
            </View>
          </View>
          <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 26, fontWeight: '700', lineHeight: 32 }}>{pick(lesson.title, lang)}</Text>
          {/* Progresso no capítulo */}
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {chapter.lessons.map((l, k) => (
              <View key={l.id} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: k === li ? colors.primary : done.includes(l.id) ? colors.success : colors.track }} />
            ))}
          </View>
        </View>

        {/* Corpo */}
        {blocks.map((b, k) => {
          if (b.type === 'lead') {
            return (
              <Text key={k} style={{ fontSize: 18, lineHeight: 28 }}>{rich(b.text, colors.text)}</Text>
            );
          }
          if (b.type === 'para') {
            return (
              <Text key={k} style={{ fontSize: 16, lineHeight: 26 }}>
                {b.head ? <Text style={{ color: colors.text, fontWeight: '700' }}>{b.head} </Text> : null}
                {rich(b.rest, colors.text)}
              </Text>
            );
          }
          if (b.type === 'bullets') {
            return (
              <View key={k} style={{ gap: 10 }}>
                {b.intro ? <Text style={{ fontSize: 16, lineHeight: 26 }}>{rich(b.intro, colors.text)}</Text> : null}
                <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, gap: 12 }}>
                  {b.items.map((it, j) => {
                    const colon = it.indexOf(':');
                    const hasHead = colon > 0 && colon < 60;
                    return (
                      <View key={j} style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                          <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>{j + 1}</Text>
                        </View>
                        <Text style={{ flex: 1, fontSize: 15, lineHeight: 23, color: colors.text }}>
                          {hasHead ? <Text style={{ fontWeight: '700' }}>{it.slice(0, colon + 1)}</Text> : null}
                          {hasHead ? it.slice(colon + 1) : it}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          }
          // A reter
          return (
            <View key={k} style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, gap: 8, borderLeftWidth: 4, borderLeftColor: colors.primary }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="bulb-outline" size={18} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{px.l_takeaway}</Text>
              </View>
              <Text style={{ fontSize: 16, lineHeight: 25 }}>{rich(b.text, colors.text)}</Text>
            </View>
          );
        })}

        {/* Fim: marcar como lida + próxima */}
        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          <Pressable
            onPress={onToggle}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isDone }}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: isDone ? colors.success : colors.border, backgroundColor: isDone ? colors.successSoft : colors.card }}
          >
            <Ionicons name={isDone ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={isDone ? colors.success : colors.textMuted} />
            <Text style={{ color: isDone ? colors.success : colors.text, fontSize: 15, fontWeight: '700' }}>{isDone ? t('lessons.markUndone') : t('lessons.markDone')}</Text>
          </Pressable>
          <Pressable
            onPress={goNext}
            accessibilityRole="button"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: '#fff', opacity: 0.85, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{next ? px.l_nextLesson : px.l_allDone}</Text>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{next ? pick(next.title, lang) : px.l_backToList}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
