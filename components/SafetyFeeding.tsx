// Página única com "Alimentar o medo" (informativo) e "Comportamentos de
// segurança", alternados por um segmented control no topo.

import { Ionicons } from '@expo/vector-icons';
import { useA11y } from '../lib/a11y';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { FEEDING_BEHAVIORS } from '../data/content';
import { SAFETY_BEHAVIORS } from '../data/safety';
import { pick, tr2, useLang } from '../i18n/i18n';
import { DroppedBehavior, isoLocal, loadDropped, loadFeeding, loadSafety, loadSafetyFree, SafetyFreeDays, SafetyItem, saveDropped, saveSafety, saveSafetyFree } from '../storage/storage';
import { FEEDING_META, safetyText } from '../data/safetyText';
import { applyBehavior, freeInfo } from '../lib/safetyState';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, CardHeader, Segmented, TopBackBar } from './ui';

// ---------- Comportamentos de segurança ----------
// Três secções: "A largar" (com data de início e "hoje não fiz isto"),
// "Ainda faço" e "Não faço"; no topo, um cartão com o progresso.
type Row = { id: string; label: string; doing: boolean; dropping: boolean; custom: boolean };

function SafetyBody() {
  const { colors } = useTheme();
  const a11y = useA11y();
  const { t, lang } = useLang();
  const sx = safetyText(lang);
  const [stored, setStored] = useState<SafetyItem[]>([]);
  const [droppedLog, setDroppedLog] = useState<DroppedBehavior[]>([]);
  const [free, setFree] = useState<SafetyFreeDays>({});
  const [newText, setNewText] = useState('');
  const [adding, setAdding] = useState(false);

  useFocusEffect(useCallback(() => {
    loadSafety().then(setStored);
    loadDropped().then(setDroppedLog);
    loadSafetyFree().then(setFree);
  }, []));

  const catalogRows: Row[] = SAFETY_BEHAVIORS.map((b) => {
    const s = stored.find((x) => x.id === b.id);
    return { id: b.id, label: pick(b.label, lang), doing: s?.doing ?? false, dropping: s?.dropping ?? false, custom: false };
  });
  const customRows: Row[] = stored
    .filter((s) => s.id.startsWith('custom:'))
    .map((s) => ({ id: s.id, label: s.label, doing: s.doing, dropping: s.dropping, custom: true }));
  const rows = [...catalogRows, ...customRows];

  function change(r: Row, changes: { doing?: boolean; dropping?: boolean }) {
    Haptics.selectionAsync().catch(() => {});
    const res = applyBehavior(stored, droppedLog, r.id, r.label, changes);
    setStored(res.stored);
    saveSafety(res.stored);
    if (res.dropped !== droppedLog) {
      setDroppedLog(res.dropped);
      saveDropped(res.dropped);
    }
  }
  function toggleFreeToday(id: string) {
    const today = isoLocal();
    const list = free[id] ?? [];
    const on = list.includes(today);
    if (!on) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const next = { ...free, [id]: on ? list.filter((d) => d !== today) : [...list, today] };
    setFree(next);
    saveSafetyFree(next);
  }
  function addCustom() {
    const v = newText.trim();
    if (!v) return;
    const next = [...stored, { id: 'custom:' + Date.now(), label: v, doing: true, dropping: false }];
    setStored(next);
    saveSafety(next);
    setNewText('');
    setAdding(false);
  }
  function removeCustom(id: string) {
    const next = stored.filter((x) => x.id !== id);
    setStored(next);
    saveSafety(next);
    const nd = droppedLog.filter((d) => d.id !== id);
    setDroppedLog(nd);
    saveDropped(nd);
  }

  const dropping = rows.filter((r) => r.dropping);
  const doing = rows.filter((r) => r.doing && !r.dropping);
  const notDoing = rows.filter((r) => !r.doing);
  const totalFree = dropping.reduce((n, r) => n + freeInfo(free[r.id]).count, 0);
  const startOf = (id: string) => droppedLog.find((d) => d.id === id)?.date;
  const fmt = (d?: string) => (d ? d.split('-').reverse().join('/') : '');

  const sectionTitle = (title: string, n: number) => (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.sm }}>
      <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>{title}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{n}</Text>
    </View>
  );
  const removeBtn = (r: Row) => r.custom ? (
    <Pressable onPress={() => removeCustom(r.id)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${a11y.delete}: ${r.label}`} style={{ padding: 2 }}>
      <Ionicons name="trash-outline" size={18} color={colors.danger} />
    </Pressable>
  ) : null;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('safety.intro')}</Text>

      {/* Progresso */}
      <Card style={{ gap: spacing.md }}>
        <CardHeader icon="trending-up-outline" title={sx.progress} />
        <View style={{ flexDirection: 'row' }}>
          {([[doing.length, sx.nDoing, colors.text], [dropping.length, sx.nDropping, colors.primary], [totalFree, sx.nFree, colors.success]] as const).map(([n, l, c], i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 2, borderLeftWidth: i ? 1 : 0, borderLeftColor: colors.border }}>
              <Text style={{ color: c, fontSize: 26, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{n}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{l}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* A largar */}
      {sectionTitle(sx.secDropping, dropping.length)}
      {dropping.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{sx.emptyDropping}</Text>
      ) : dropping.map((r) => {
        const fi = freeInfo(free[r.id]);
        return (
          <Card key={r.id} style={{ gap: 10, borderColor: colors.primary }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="flag-outline" size={18} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>{r.label}</Text>
              {removeBtn(r)}
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.lg }}>
              {startOf(r.id) ? <Text style={{ color: colors.textMuted, fontSize: 12 }}>{sx.since} {fmt(startOf(r.id))}</Text> : null}
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{sx.freeDays}: <Text style={{ color: colors.success, fontWeight: '700' }}>{fi.count}</Text></Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable onPress={() => toggleFreeToday(r.id)} accessibilityRole="checkbox" accessibilityState={{ checked: fi.today }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 999, backgroundColor: fi.today ? colors.successSoft : colors.primary }}>
                {!fi.today && <Ionicons name="checkmark" size={16} color="#fff" />}
                <Text style={{ color: fi.today ? colors.success : '#fff', fontSize: 13, fontWeight: '700' }}>{fi.today ? sx.todayDone : sx.todayNot}</Text>
              </Pressable>
              <Pressable onPress={() => change(r, { dropping: false })} hitSlop={6} accessibilityRole="button" style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>{sx.stopDrop}</Text>
              </Pressable>
            </View>
          </Card>
        );
      })}

      {/* Ainda faço */}
      {sectionTitle(sx.secDoing, doing.length)}
      {doing.map((r) => (
        <Card key={r.id} style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{r.label}</Text>
            {removeBtn(r)}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={() => change(r, { dropping: true })} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 }}>
              <Ionicons name="flag-outline" size={15} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{sx.drop}</Text>
            </Pressable>
            <Pressable onPress={() => change(r, { doing: false })} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.cardAlt, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 }}>
              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>{sx.notDoing}</Text>
            </Pressable>
          </View>
        </Card>
      ))}

      {/* Não faço */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: 8 }}>
        <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>{sx.secNot}</Text>
        <Pressable
          onPress={() => setAdding((a) => !a)}
          hitSlop={6}
          accessibilityRole="button"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primarySoft, paddingHorizontal: 12, height: 34, borderRadius: 999 }}
        >
          <Ionicons name={adding ? 'close' : 'add'} size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{tr2(lang, 'Adicionar', 'Add')}</Text>
        </Pressable>
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: -6 }}>{sx.notHint}</Text>
      {adding && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={newText}
            onChangeText={setNewText}
            onSubmitEditing={addCustom}
            autoFocus
            placeholder={t('safety.add')}
            placeholderTextColor={colors.textMuted}
            style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 15 }}
          />
          <Pressable onPress={addCustom} accessibilityRole="button" style={{ paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('common.add')}</Text>
          </Pressable>
        </View>
      )}
      <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
        {notDoing.map((r, i) => (
          <Pressable
            key={r.id}
            onPress={() => change(r, { doing: true })}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: false }}
            accessibilityLabel={r.label}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: spacing.lg, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}
          >
            <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border }} />
            <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{r.label}</Text>
            {removeBtn(r)}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// ---------- Alimentar o medo ----------
function FeedingBody() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const router = useRouter();
  const [working, setWorking] = useState<string[]>([]);

  // Recarrega o estado "a trabalhar nisto" sempre que o ecrã volta a ficar em foco.
  useFocusEffect(useCallback(() => { loadFeeding().then(setWorking); }, []));

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
            onPress={() => router.push({ pathname: '/feedingdet', params: { id: b.id } } as any)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: isWorking ? colors.success : colors.border }}
          >
            <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={(FEEDING_META[b.id]?.icon ?? 'flame-outline') as keyof typeof Ionicons.glyphMap} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{pick(b.label, lang)}</Text>
              <Text numberOfLines={2} style={{ color: colors.textMuted, fontSize: 12, lineHeight: 17 }}>{pick(b.why, lang)}</Text>
            </View>
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
      ? tr2(lang, 'Alimentar o medo', 'Feeding the fear')
      : tr2(lang, 'Comportamentos', 'Behaviours');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('safetyFeeding.title')} onBack={onBack} />
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm }}>
        <Segmented value={tab} onChange={setTab} options={[['feeding', tabLabel('feeding')], ['safety', tabLabel('safety')]]} />
      </View>
      {tab === 'feeding' ? <FeedingBody /> : <SafetyBody />}
    </View>
  );
}
