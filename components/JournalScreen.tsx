// Diário: a data de hoje por extenso, "Como estás hoje?" (humor 1–5), a
// pergunta do dia (opcional, dá para trocar ou escrever livremente), etiquetas
// rápidas e as entradas de hoje. As anteriores ficam no histórico (relógio).

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { JOURNAL_TAGS, JournalTag, journalText, MOOD_EMOJI, promptIndexFor } from '../data/journalPrompts';
import { useLang } from '../i18n/i18n';
import { useA11y } from '../lib/a11y';
import { isoLocal, JournalEntry, loadJournal, saveJournal } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { HistoryButton } from './HistoryButton';
import { Card, PrimaryButton, TopBackBar } from './ui';

// "Terça-feira, 17 de novembro" na língua da app.
function longDate(d: Date, lang: string) {
  const tag = lang === 'pt' ? 'pt-PT' : lang;
  try {
    const s = d.toLocaleDateString(tag, { weekday: 'long', day: 'numeric', month: 'long' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  } catch {
    return isoLocal(d).split('-').reverse().join('/');
  }
}

export default function JournalScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const a11y = useA11y();
  const { t, lang } = useLang();
  const jx = journalText(lang);
  const today = new Date();
  const todayIso = isoLocal(today);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [tags, setTags] = useState<JournalTag[]>([]);
  const [shift, setShift] = useState(0);       // "Outra pergunta" avança a partir da do dia
  const [free, setFree] = useState(false);     // escrever sem pergunta

  useEffect(() => {
    loadJournal().then((list) => setEntries(Array.isArray(list) ? list : []));
  }, []);

  const n = jx.prompts.length;
  const prompt = free ? null : jx.prompts[(promptIndexFor(today, n) + shift) % n];

  function persist(next: JournalEntry[]) {
    setEntries(next);
    saveJournal(next);
  }
  function add() {
    const v = text.trim();
    if (!v && mood === null) return;
    const now = new Date();
    const entry: JournalEntry = {
      id: 'j' + now.getTime(), date: isoLocal(now), ts: now.toISOString(), text: v,
      ...(prompt && v ? { prompt } : {}),
      ...(mood !== null ? { mood } : {}),
      ...(tags.length ? { tags } : {}),
    };
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    persist([entry, ...entries]); // mais recente primeiro
    setText('');
    setMood(null);
    setTags([]);
  }
  function remove(id: string) {
    persist(entries.filter((e) => e.id !== id));
  }
  function toggleTag(tg: JournalTag) {
    setTags((prev) => (prev.includes(tg) ? prev.filter((x) => x !== tg) : [...prev, tg]));
  }

  const todays = entries.filter((e) => e.date === todayIso);
  const time = (ts: string) => new Date(ts).toTimeString().slice(0, 5);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TopBackBar title={t('journal.title')} onBack={onBack} right={<HistoryButton kind="journal" />} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.sm, gap: spacing.md, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
        {/* Data de hoje */}
        <View style={{ gap: 2 }}>
          <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>{longDate(today, lang)}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('journal.subtitle')}</Text>
        </View>

        {/* Como estás hoje? */}
        <Card style={{ gap: spacing.md }}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{jx.moodQ}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {MOOD_EMOJI.map((em, i) => {
              const v = i + 1;
              const on = mood === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => { Haptics.selectionAsync().catch(() => {}); setMood(on ? null : v); }}
                  accessibilityRole="radio"
                  accessibilityLabel={jx.moods[i]}
                  accessibilityState={{ selected: on }}
                  style={{ alignItems: 'center', gap: 4, width: 60 }}
                >
                  <View style={{ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.primarySoft : colors.cardAlt, borderWidth: 2, borderColor: on ? colors.primary : 'transparent', opacity: mood === null || on ? 1 : 0.5 }}>
                    <Text style={{ fontSize: 26 }}>{em}</Text>
                  </View>
                  <Text numberOfLines={2} style={{ color: on ? colors.primary : colors.textMuted, fontSize: 11, fontWeight: on ? '700' : '500', textAlign: 'center' }}>{jx.moods[i]}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Pergunta do dia + escrever */}
        <Card style={{ gap: spacing.md }}>
          {prompt ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{jx.promptOfDay}</Text>
              </View>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', lineHeight: 27 }}>{prompt}</Text>
              <View style={{ flexDirection: 'row', gap: spacing.lg }}>
                <Pressable onPress={() => setShift((s) => s + 1)} hitSlop={8} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="refresh" size={15} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{jx.otherQ}</Text>
                </Pressable>
                <Pressable onPress={() => setFree(true)} hitSlop={8} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="create-outline" size={15} color={colors.textMuted} />
                  <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '700' }}>{jx.freeWrite}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>{jx.freeWrite}</Text>
              <Pressable onPress={() => setFree(false)} hitSlop={8} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="sparkles-outline" size={15} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{jx.usePrompt}</Text>
              </Pressable>
            </View>
          )}
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={prompt ? jx.freePh : t('journal.placeholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            style={{ minHeight: 110, padding: 14, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 16, lineHeight: 22, textAlignVertical: 'top' }}
          />

          {/* Etiquetas rápidas */}
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{jx.tagsQ}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {JOURNAL_TAGS.map((tg) => {
              const on = tags.includes(tg);
              return (
                <Pressable
                  key={tg}
                  onPress={() => toggleTag(tg)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primary : 'transparent' }}
                >
                  <Text style={{ color: on ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>{jx.tags[tg]}</Text>
                </Pressable>
              );
            })}
          </View>

          <PrimaryButton label={t('journal.save')} onPress={add} disabled={!text.trim() && mood === null} />
        </Card>

        {/* Hoje */}
        {todays.map((e) => (
            <Card key={e.id} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {e.mood ? <Text style={{ fontSize: 18 }} accessibilityLabel={jx.moods[e.mood - 1]}>{MOOD_EMOJI[e.mood - 1]}</Text> : null}
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700', flex: 1 }}>{time(e.ts)}</Text>
                <Pressable onPress={() => remove(e.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={a11y.delete} style={{ padding: 2 }}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              </View>
              {e.prompt ? <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>{e.prompt}</Text> : null}
              {e.text ? <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{e.text}</Text> : null}
              {e.tags?.length ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {e.tags.map((tg) => (
                    <View key={tg} style={{ backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                      <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>{jx.tags[tg as JournalTag] ?? tg}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </Card>
          ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
