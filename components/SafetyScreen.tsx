// Comportamentos de segurança: marca os que fazes e os que estás a trabalhar
// para largar. Podes acrescentar os teus.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SAFETY_BEHAVIORS } from '../data/safety';
import { pick, useLang } from '../i18n/i18n';
import { loadSafety, SafetyItem, saveSafety } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

export default function SafetyScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [stored, setStored] = useState<SafetyItem[]>([]);
  const [newText, setNewText] = useState('');

  useEffect(() => {
    loadSafety().then(setStored);
  }, []);

  function persist(next: SafetyItem[]) {
    setStored(next);
    saveSafety(next);
  }

  // Lista a mostrar: catálogo + itens personalizados guardados.
  const catalogRows = SAFETY_BEHAVIORS.map((b) => {
    const s = stored.find((x) => x.id === b.id);
    return { id: b.id, label: pick(b.label, lang), doing: s?.doing ?? false, dropping: s?.dropping ?? false, custom: false };
  });
  const customRows = stored
    .filter((s) => s.id.startsWith('custom:'))
    .map((s) => ({ id: s.id, label: s.label, doing: s.doing, dropping: s.dropping, custom: true }));
  const rows = [...catalogRows, ...customRows];

  function upsert(id: string, label: string, changes: Partial<SafetyItem>) {
    const existing = stored.find((x) => x.id === id);
    let next: SafetyItem[];
    if (existing) {
      next = stored.map((x) => (x.id === id ? { ...x, ...changes } : x));
    } else {
      next = [...stored, { id, label, doing: false, dropping: false, ...changes }];
    }
    persist(next);
  }

  function toggleDoing(id: string, label: string, doing: boolean) {
    // se deixar de fazer, também deixa de estar "a largar"
    upsert(id, label, { doing: !doing, dropping: !doing ? false : false });
  }
  function toggleDropping(id: string, label: string, dropping: boolean) {
    upsert(id, label, { dropping: !dropping });
  }
  function addCustom() {
    const v = newText.trim();
    if (!v) return;
    persist([...stored, { id: 'custom:' + Date.now(), label: v, doing: true, dropping: false }]);
    setNewText('');
  }
  function removeCustom(id: string) {
    persist(stored.filter((x) => x.id !== id));
  }

  const doingCount = rows.filter((r) => r.doing).length;
  const dropCount = rows.filter((r) => r.dropping).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('resources.safety')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('safety.intro')}</Text>
        <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{t('safety.summary', { doing: doingCount, dropping: dropCount })}</Text>

        {rows.map((r) => (
          <Card key={r.id} style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable onPress={() => toggleDoing(r.id, r.label, r.doing)} hitSlop={6}>
                <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: r.doing ? colors.primary : colors.border, backgroundColor: r.doing ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {r.doing && <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>✓</Text>}
                </View>
              </Pressable>
              <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{r.label}</Text>
              {r.custom && (
                <Pressable onPress={() => removeCustom(r.id)} hitSlop={6} style={{ padding: 2 }}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              )}
            </View>
            {r.doing && (
              <Pressable onPress={() => toggleDropping(r.id, r.label, r.dropping)} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: r.dropping ? colors.successSoft : colors.cardAlt, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
                <Ionicons name={r.dropping ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={r.dropping ? colors.success : colors.textMuted} />
                <Text style={{ color: r.dropping ? colors.success : colors.textMuted, fontSize: 12, fontWeight: '600' }}>{t('safety.dropping')}</Text>
              </Pressable>
            )}
          </Card>
        ))}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <TextInput value={newText} onChangeText={setNewText} onSubmitEditing={addCustom} placeholder={t('safety.add')} placeholderTextColor={colors.textMuted} style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15 }} />
          <Pressable onPress={addCustom} style={{ paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('common.add')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
