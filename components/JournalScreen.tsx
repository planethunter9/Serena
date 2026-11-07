// Diário: escrever entradas e ver em que dias escreveste.

import { Ionicons } from '@expo/vector-icons';
import { useA11y } from '../lib/a11y';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { JournalEntry, loadJournal, saveJournal } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

// Formata "AAAA-MM-DD" para "DD/MM".
function shortDate(iso: string) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export default function JournalScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const a11y = useA11y();
  const { t } = useLang();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState('');

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
    const entry: JournalEntry = { id: 'j' + now.getTime(), date: now.toISOString().slice(0, 10), ts: now.toISOString(), text: v };
    persist([entry, ...entries]); // mais recente primeiro
    setText('');
  }
  function remove(id: string) {
    persist(entries.filter((e) => e.id !== id));
  }

  // Dias distintos em que escreveu.
  const days = Array.from(new Set(entries.map((e) => e.date)));

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TopBackBar title={t('journal.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('journal.subtitle')}</Text>

        {/* Resumo dos dias com registo */}
        <Card style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{t('journal.daysWritten', { n: days.length })}</Text>
          {days.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {days.slice(0, 14).map((d) => (
                <View key={d} style={{ backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
                  <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>{shortDate(d)}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Escrever nova entrada */}
        <Card style={{ gap: spacing.sm }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('journal.placeholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            style={{ minHeight: 90, padding: 14, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 16, textAlignVertical: 'top' }}
          />
          <Pressable onPress={add} style={{ padding: 14, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('journal.save')}</Text>
          </Pressable>
        </Card>

        {entries.length === 0 && <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('journal.empty')}</Text>}

        {/* Entradas anteriores */}
        {entries.map((e) => (
          <Card key={e.id} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{shortDate(e.date)}</Text>
              <Pressable onPress={() => remove(e.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={a11y.delete} style={{ padding: 2 }}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </View>
            <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{e.text}</Text>
          </Card>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
