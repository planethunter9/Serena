// Página única com "Alimentar o medo" (informativo) e "Comportamentos de
// segurança", alternados por um segmented control no topo.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { FEEDING_BEHAVIORS } from '../data/content';
import { SAFETY_BEHAVIORS } from '../data/safety';
import { useLang } from '../i18n/i18n';
import { DroppedBehavior, isoLocal, loadDropped, loadFeeding, loadSafety, SafetyItem, saveDropped, saveFeeding, saveSafety } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

// ---------- Comportamentos de segurança ----------
function SafetyBody() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [stored, setStored] = useState<SafetyItem[]>([]);
  const [droppedLog, setDroppedLog] = useState<DroppedBehavior[]>([]);
  const [newText, setNewText] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadSafety().then(setStored);
    loadDropped().then(setDroppedLog);
  }, []);

  // Regista (ou remove) a data em que um comportamento passou a "a largar".
  function logDrop(id: string, label: string, isDropping: boolean) {
    const next = isDropping
      ? (droppedLog.some((d) => d.id === id) ? droppedLog : [...droppedLog, { id, label, date: isoLocal() }])
      : droppedLog.filter((d) => d.id !== id);
    setDroppedLog(next);
    saveDropped(next);
  }

  function persist(next: SafetyItem[]) {
    setStored(next);
    saveSafety(next);
  }

  const catalogRows = SAFETY_BEHAVIORS.map((b) => {
    const s = stored.find((x) => x.id === b.id);
    return { id: b.id, label: b.label[lang], doing: s?.doing ?? false, dropping: s?.dropping ?? false, custom: false };
  });
  const customRows = stored
    .filter((s) => s.id.startsWith('custom:'))
    .map((s) => ({ id: s.id, label: s.label, doing: s.doing, dropping: s.dropping, custom: true }));
  const rows = [...catalogRows, ...customRows];

  function upsert(id: string, label: string, changes: Partial<SafetyItem>) {
    const existing = stored.find((x) => x.id === id);
    const next = existing
      ? stored.map((x) => (x.id === id ? { ...x, ...changes } : x))
      : [...stored, { id, label, doing: false, dropping: false, ...changes }];
    persist(next);
  }
  function toggleDoing(id: string, label: string, doing: boolean) {
    upsert(id, label, { doing: !doing, dropping: false });
    logDrop(id, label, false); // deixar de "fazer" tira o estado de largar
  }
  function toggleDropping(id: string, label: string, dropping: boolean) {
    upsert(id, label, { dropping: !dropping });
    logDrop(id, label, !dropping);
  }
  function addCustom() {
    const v = newText.trim();
    if (!v) return;
    persist([...stored, { id: 'custom:' + Date.now(), label: v, doing: true, dropping: false }]);
    setNewText('');
    setAdding(false);
  }
  function removeCustom(id: string) {
    persist(stored.filter((x) => x.id !== id));
    const next = droppedLog.filter((d) => d.id !== id);
    setDroppedLog(next);
    saveDropped(next);
  }

  const doingCount = rows.filter((r) => r.doing).length;
  const dropCount = rows.filter((r) => r.dropping).length;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }}>
      <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('safety.intro')}</Text>

      {/* Resumo + botão "+" para adicionar (em vez de o input ficar no fundo) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ flex: 1, color: colors.text, fontSize: 13, fontWeight: '600' }}>{t('safety.summary', { doing: doingCount, dropping: dropCount })}</Text>
        <Pressable
          onPress={() => setAdding((a) => !a)}
          hitSlop={6}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primarySoft, paddingHorizontal: 12, height: 36, borderRadius: 999 }}
        >
          <Ionicons name={adding ? 'close' : 'add'} size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{lang === 'pt' ? 'Adicionar' : 'Add'}</Text>
        </Pressable>
      </View>

      {adding && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={newText}
            onChangeText={setNewText}
            onSubmitEditing={addCustom}
            autoFocus
            placeholder={t('safety.add')}
            placeholderTextColor={colors.textMuted}
            style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15 }}
          />
          <Pressable onPress={addCustom} style={{ paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('common.add')}</Text>
          </Pressable>
        </View>
      )}

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
    </ScrollView>
  );
}

// ---------- Alimentar o medo ----------
function FeedingBody() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [working, setWorking] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadFeeding().then(setWorking);
  }, []);

  function toggleWorking(id: string) {
    const next = working.includes(id) ? working.filter((x) => x !== id) : [...working, id];
    setWorking(next);
    saveFeeding(next);
  }

  const selected = FEEDING_BEHAVIORS.find((b) => b.id === selectedId) ?? null;

  if (selected) {
    const isWorking = working.includes(selected.id);
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }}>
        <Pressable onPress={() => setSelectedId(null)} hitSlop={8}>
          <Text style={{ color: colors.textMuted }}>‹ {t('common.back')}</Text>
        </Pressable>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{selected.label[lang]}</Text>
        <Card style={{ gap: 8 }}>
          <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 14 }}>{t('feeding.why')}</Text>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{selected.why[lang]}</Text>
        </Card>
        <Card style={{ gap: 8, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{t('feeding.alternative')}</Text>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{selected.alternative[lang]}</Text>
        </Card>
        <Pressable
          onPress={() => toggleWorking(selected.id)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: radius.md, borderWidth: 2, borderColor: isWorking ? colors.success : colors.primary, backgroundColor: isWorking ? colors.successSoft : 'transparent' }}
        >
          <Ionicons name={isWorking ? 'checkmark-circle' : 'add-circle-outline'} size={20} color={isWorking ? colors.success : colors.primary} />
          <Text style={{ color: isWorking ? colors.success : colors.primary, fontWeight: '700' }}>
            {isWorking ? t('feeding.working') : t('feeding.work')}
          </Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }}>
      <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, gap: 6 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{t('feeding.introTitle')}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{t('feeding.intro')}</Text>
      </Card>

      {working.length > 0 && (
        <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{t('feeding.count', { n: working.length })}</Text>
      )}

      {FEEDING_BEHAVIORS.map((b) => {
        const isWorking = working.includes(b.id);
        return (
          <Pressable
            key={b.id}
            onPress={() => setSelectedId(b.id)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: isWorking ? colors.success : colors.border }}
          >
            <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="flame-outline" size={20} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{b.label[lang]}</Text>
            {isWorking && <Ionicons name="checkmark-circle" size={18} color={colors.success} />}
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default function SafetyFeeding({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [tab, setTab] = useState<'feeding' | 'safety'>('feeding');
  const tabLabel = (v: 'feeding' | 'safety') =>
    v === 'feeding'
      ? (lang === 'pt' ? 'Alimentar o medo' : 'Feeding the fear')
      : (lang === 'pt' ? 'Comportamentos' : 'Behaviours');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('safetyFeeding.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm }}>
        <View style={{ flexDirection: 'row', backgroundColor: colors.cardAlt, borderRadius: 999, padding: 4 }}>
          {(['feeding', 'safety'] as const).map((v) => {
            const active = tab === v;
            return (
              <Pressable key={v} onPress={() => setTab(v)} style={{ flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center', backgroundColor: active ? colors.card : 'transparent' }}>
                <Text numberOfLines={1} style={{ color: active ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 14 }}>
                  {tabLabel(v)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {tab === 'feeding' ? <FeedingBody /> : <SafetyBody />}
    </View>
  );
}
