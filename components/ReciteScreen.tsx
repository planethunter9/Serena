// Recitar (sugestão da psicóloga): dizer devagar algo que se sabe de cor dá à
// mente um ritmo previsível. A pessoa escreve os seus textos (poema curto,
// refrão, lengalenga) ou usa uma sugestão neutra que não precisa de escrita
// (contagem decrescente de 7 em 7, tabuada, meses ao contrário, uma palavra por
// letra). Sem textos religiosos nem letras de terceiros incluídas na app.
// A recitar: uma linha de cada vez, em letra grande; "Seguinte" (ou toque no
// texto) ou "Automático" (uma linha a cada 4 s). No fim recomeça (volta 2, 3…).

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import { groundText } from '../data/groundText';
import { useLang } from '../i18n/i18n';
import { useA11y } from '../lib/a11y';
import { builtinLines, splitLines } from '../lib/recite';
import { loadRecitations, Recitation, saveRecitations } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import KeepAwake from './KeepAwake';
import { Card, CardHeader, PrimaryButton, TopBackBar } from './ui';

const AUTO_MS = 4000;
type Item = { key: string; title: string; lines: string[]; icon: keyof typeof Ionicons.glyphMap };
export default function ReciteScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const a11y = useA11y();
  const x = groundText(lang);
  const [mine, setMine] = useState<Recitation[]>([]);
  const [editing, setEditing] = useState<Recitation | null>(null);
  const [run, setRun] = useState<Item | null>(null);
  const [pos, setPos] = useState(0); // linha atual, a contar desde o início (inclui voltas)
  const [auto, setAuto] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { loadRecitations().then(setMine); }, []);

  const total = run?.lines.length ?? 1;
  useEffect(() => {
    if (!run || !auto || done) return;
    const id = setInterval(() => setPos((p) => p + 1), AUTO_MS);
    return () => clearInterval(id);
  }, [run, auto, done]);

  const builtins: Item[] = ([
    ['count', x.b_count, 'trending-down-outline'],
    ['table', x.b_table, 'grid-outline'],
    ['months', x.b_months, 'calendar-outline'],
    ['alpha', x.b_alpha, 'text-outline'],
  ] as const).map(([b, title, icon]) => ({ key: b, title, icon, lines: builtinLines(b, lang, x.rc_wordWith) }));

  function persist(next: Recitation[]) { setMine(next); saveRecitations(next); }
  function saveEdit() {
    if (!editing || !splitLines(editing.text).length) return;
    const item = { ...editing, title: editing.title.trim() || splitLines(editing.text)[0].slice(0, 40) };
    persist(mine.some((m) => m.id === item.id) ? mine.map((m) => (m.id === item.id ? item : m)) : [...mine, item]);
    setEditing(null);
  }
  function start(it: Item) {
    Haptics.selectionAsync().catch(() => {});
    setRun(it); setPos(0); setAuto(false); setDone(false);
  }
  function advance() {
    Haptics.selectionAsync().catch(() => {});
    setPos((p) => p + 1);
  }

  // ---------- A recitar ----------
  if (run) {
    const idx = pos % total;
    const round = Math.floor(pos / total) + 1;
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBackBar title={run.title} onBack={() => setRun(null)} />
        {done ? (
          <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'center', gap: spacing.lg }}>
            <Card style={{ gap: spacing.md, alignItems: 'center', paddingVertical: spacing.xl }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="checkmark" size={28} color={colors.success} />
              </View>
              <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{x.rc_doneTitle}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center' }}>{x.doneBody}</Text>
            </Card>
            <PrimaryButton label={x.again} onPress={() => start(run)} />
            <Pressable onPress={() => setRun(null)} accessibilityRole="button" style={{ alignItems: 'center', padding: 12 }}>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>{x.back}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ flex: 1, padding: spacing.xl, gap: spacing.lg }}>
            <KeepAwake />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700', flex: 1 }}>{x.rc_round.replace('{n}', String(round))}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{idx + 1} / {total}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {run.lines.map((_, k) => (
                <View key={k} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: k <= idx ? colors.primary : colors.track }} />
              ))}
            </View>
            <Pressable onPress={advance} accessibilityRole="button" accessibilityHint={x.rc_next} style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
              {idx > 0 && (
                <Text numberOfLines={2} style={{ color: colors.textMuted, fontSize: 17, textAlign: 'center', opacity: 0.6 }}>{run.lines[idx - 1]}</Text>
              )}
              <Animated.Text
                key={pos}
                entering={FadeIn.duration(350).reduceMotion(ReduceMotion.System)}
                accessibilityLiveRegion="polite"
                style={{ color: colors.text, fontSize: 30, lineHeight: 40, fontWeight: '700', textAlign: 'center' }}
              >
                {run.lines[idx]}
              </Animated.Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>{x.rc_say}</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Pressable
                onPress={() => setAuto((a) => !a)}
                accessibilityRole="switch"
                accessibilityState={{ checked: auto }}
                style={{ flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, borderWidth: 1, borderColor: auto ? colors.primary : colors.border, backgroundColor: auto ? colors.primarySoft : 'transparent' }}
              >
                <Ionicons name={auto ? 'pause' : 'play'} size={16} color={auto ? colors.primary : colors.text} />
                <Text style={{ color: auto ? colors.primary : colors.text, fontSize: 15, fontWeight: '600' }}>{auto ? x.rc_pause : x.rc_auto}</Text>
              </Pressable>
              <View style={{ flex: 1.4 }}>
                <PrimaryButton label={x.rc_next} onPress={advance} />
              </View>
            </View>
            <Pressable onPress={() => setDone(true)} accessibilityRole="button" style={{ alignItems: 'center', padding: 8 }}>
              <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>{x.finish}</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  // ---------- Lista ----------
  const row = (it: Item, extra?: React.ReactNode) => (
    <View key={it.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
      <Pressable onPress={() => start(it)} accessibilityRole="button" style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={it.icon} size={19} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text numberOfLines={1} style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{it.title}</Text>
          <Text numberOfLines={1} style={{ color: colors.textMuted, fontSize: 12 }}>{it.lines.slice(0, 3).join(' · ')}</Text>
        </View>
      </Pressable>
      {extra}
      <Ionicons name="play-circle" size={26} color={colors.primary} />
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TopBackBar title={x.rc_title} onBack={onBack} info={x.rc_intro} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.sm, gap: spacing.md, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
        <Card style={{ gap: spacing.xs }}>
          <CardHeader icon="create-outline" title={x.rc_mine} />
          {mine.length === 0 && !editing && <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, marginBottom: 4 }}>{x.rc_none}</Text>}
          {mine.map((m) =>
            row(
              { key: m.id, title: m.title, icon: 'document-text-outline', lines: splitLines(m.text) },
              <Pressable onPress={() => setEditing(m)} hitSlop={8} accessibilityRole="button" accessibilityLabel={a11y.edit} style={{ padding: 2 }}>
                <Ionicons name="pencil-outline" size={18} color={colors.textMuted} />
              </Pressable>,
            ),
          )}
          {editing ? (
            <View style={{ gap: spacing.sm, paddingTop: spacing.sm }}>
              <TextInput
                value={editing.title}
                onChangeText={(v) => setEditing({ ...editing, title: v })}
                placeholder={x.rc_titlePh}
                placeholderTextColor={colors.textMuted}
                style={{ padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 15 }}
              />
              <TextInput
                value={editing.text}
                onChangeText={(v) => setEditing({ ...editing, text: v })}
                placeholder={x.rc_textPh}
                placeholderTextColor={colors.textMuted}
                multiline
                style={{ minHeight: 120, padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 15, lineHeight: 22, textAlignVertical: 'top' }}
              />
              <PrimaryButton label={x.rc_save} onPress={saveEdit} disabled={!splitLines(editing.text).length} />
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xl }}>
                <Pressable onPress={() => setEditing(null)} accessibilityRole="button" hitSlop={8}>
                  <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '700' }}>{x.rc_cancel}</Text>
                </Pressable>
                {mine.some((m) => m.id === editing.id) && (
                  <Pressable onPress={() => { persist(mine.filter((m) => m.id !== editing.id)); setEditing(null); }} accessibilityRole="button" hitSlop={8}>
                    <Text style={{ color: colors.danger, fontSize: 14, fontWeight: '700' }}>{x.rc_delete}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setEditing({ id: 'r' + Date.now(), title: '', text: '' })}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 10 }}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>{x.rc_add}</Text>
            </Pressable>
          )}
        </Card>

        <Card style={{ gap: spacing.xs }}>
          <CardHeader icon="sparkles-outline" title={x.rc_builtin} />
          {builtins.map((b) => row(b))}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
