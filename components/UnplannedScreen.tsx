// Exposição não planeada: guia rápido para aproveitar um susto inesperado
// como treino, em vez de fugir. Regista antes/depois (SUDS).

import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { loadUnplanned, saveUnplanned, UnplannedLog } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, PrimaryButton, TopBackBar } from './ui';

function Suds({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {Array.from({ length: 11 }, (_, v) => {
        const active = value === v;
        return (
          <Pressable key={v} onPress={() => onChange(v)} style={{ width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.primary : colors.cardAlt, borderWidth: 2, borderColor: active ? colors.primary : colors.border }}>
            <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700' }}>{v}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function UnplannedScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const [logs, setLogs] = useState<UnplannedLog[]>([]);
  const [before, setBefore] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [stayed, setStayed] = useState(true);
  const [note, setNote] = useState('');

  useEffect(() => {
    loadUnplanned().then(setLogs);
  }, []);

  function save() {
    if (before === null) return;
    const now = new Date();
    const entry: UnplannedLog = { id: 'u' + now.getTime(), date: now.toISOString().slice(0, 10), ts: now.toISOString(), before, after: after ?? before, stayed, note: note.trim() };
    const next = [entry, ...logs];
    setLogs(next); saveUnplanned(next);
    setBefore(null); setAfter(null); setStayed(true); setNote('');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('unplanned.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, gap: 6 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{t('unplanned.guideTitle')}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{t('unplanned.guide')}</Text>
        </Card>

        <Card style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{t('exposure.before')}</Text>
          <Suds value={before} onChange={setBefore} />
        </Card>
        <Card style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{t('exposure.after')}</Text>
          <Suds value={after} onChange={setAfter} />
        </Card>

        <Pressable onPress={() => setStayed((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: stayed ? colors.primary : colors.border, backgroundColor: stayed ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            {stayed && <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>✓</Text>}
          </View>
          <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{t('unplanned.stayed')}</Text>
        </Pressable>

        <TextInput value={note} onChangeText={setNote} placeholder={t('exposure.note')} placeholderTextColor={colors.textMuted} multiline style={{ minHeight: 60, padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15, textAlignVertical: 'top' }} />
        <PrimaryButton label={t('unplanned.save')} onPress={save} disabled={before === null} />

        {logs.length > 0 && (
          <View style={{ gap: 8, marginTop: 4 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{t('unplanned.history')}</Text>
            {logs.map((l) => (
              <Card key={l.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{l.date.split('-').reverse().join('/')}</Text>
                <Text style={{ color: colors.text, fontWeight: '600' }}>{l.before} → {l.after}{l.stayed ? '  ✓' : ''}</Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
