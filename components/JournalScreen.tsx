// Diário: escrever entradas e ver em que dias escreveste. Há perguntas
// opcionais para inspirar; a escolhida fica guardada com a entrada.

import { Ionicons } from '@expo/vector-icons';
import { useA11y } from '../lib/a11y';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { journalText } from '../data/journalPrompts';
import { useLang } from '../i18n/i18n';
import { isoLocal, JournalEntry, loadJournal, saveJournal } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { HistoryButton } from './HistoryButton';
import { Card, TopBackBar } from './ui';

// Formata "AAAA-MM-DD" para "DD/MM".
function shortDate(iso: string) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export default function JournalScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const a11y = useA11y();
  const { t, lang } = useLang();
  const jx = journalText(lang);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState('');
  const [prompt, setPrompt] = useState<string | null>(null);

  useEffect(() => {
    loadJournal().then(setEntries);
  }, []);

  function persist(next: JournalEntry[]) {
    setEntries(next);
    saveJournal(next);
  }
  function add() {
    const v = text.trim();
    if (!v) return;
    const now = new Date();
    const entry: JournalEntry = { id: 'j' + now.getTime(), date: isoLocal(now), ts: now.toISOString(), text: v, ...(prompt ? { prompt } : {}) };
    persist([entry, ...entries]); // mais recente primeiro
    setText('');
    setPrompt(null);
  }
  function remove(id: string) {
    persist(entries.filter((e) => e.id !== id));
  }

  const todayIso = isoLocal(new Date());
  const todays = entries.filter((e) => e.date === todayIso);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TopBackBar title={t('journal.title')} onBack={onBack} right={<HistoryButton kind="journal" />} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('journal.subtitle')}</Text>

        {/* Perguntas opcionais para inspirar */}
        <View style={{ gap: 6 }}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{jx.ideaTitle}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{jx.ideaHint}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }} style={{ marginHorizontal: -spacing.xl }}>
            <View style={{ width: spacing.xl - 8 }} />
            {jx.prompts.map((p) => {
              const on = prompt === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPrompt(on ? null : p)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  style={{ maxWidth: 220, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.lg, borderWidth: 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primary : colors.card }}
                >
                  <Text style={{ color: on ? '#fff' : colors.text, fontSize: 14, lineHeight: 19 }}>{p}</Text>
                </Pressable>
              );
            })}
            <View style={{ width: spacing.xl - 8 }} />
          </ScrollView>
        </View>

        {/* Escrever nova entrada */}
        <Card style={{ gap: spacing.sm }}>
          {prompt && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
              <Text style={{ flex: 1, color: colors.text, fontSize: 16, fontWeight: '700', lineHeight: 22 }}>{prompt}</Text>
              <Pressable onPress={() => setPrompt(null)} hitSlop={8} accessibilityRole="button" accessibilityLabel={jx.clear}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
          )}
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={prompt ? jx.freePh : t('journal.placeholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            style={{ minHeight: 90, padding: 14, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 16, textAlignVertical: 'top' }}
          />
          <Pressable onPress={add} style={{ padding: 14, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('journal.save')}</Text>
          </Pressable>
        </Card>

        {entries.length === 0 && <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('journal.empty')}</Text>}

        {/* Entradas de hoje (as anteriores ficam no histórico, no relógio) */}
        {todays.map((e) => (
          <Card key={e.id} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{shortDate(e.date)}</Text>
              <Pressable onPress={() => remove(e.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={a11y.delete} style={{ padding: 2 }}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </View>
            {e.prompt ? <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>{e.prompt}</Text> : null}
            <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{e.text}</Text>
          </Card>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
