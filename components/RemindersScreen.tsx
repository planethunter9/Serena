// Página única "Lembretes" + "Afirmação do dia", alternadas por um segmented
// control no topo. Cada lembrete ativo agenda uma notificação diária; a
// afirmação do dia agenda uma notificação com uma frase motivadora.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { AFFIRMATIONS } from '../data/content';
import { pick, useLang , tr2 } from '../i18n/i18n';
import { syncAffirmationReminder } from '../notifications/affirmation';
import { cancelReminderFully, cancelUntrackedReminders, ensureNotificationPermission, knownNotificationIds, reminderNotifId, scheduleDailyReminder } from '../notifications/notifications';
import { AffirmationReminder, loadAffirmationReminder, loadReminders, Reminder, saveAffirmationReminder, saveReminders } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import EmptyState from './EmptyState';
import { Card, CardHeader, PrimaryButton, Segmented, TopBackBar } from './ui';

function two(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return v < 10 ? '0' + v : '' + v;
}

function Stepper({ value, onUp, onDown }: { value: string; onUp: () => void; onDown: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <Pressable onPress={onUp} hitSlop={8} accessibilityRole="button" accessibilityLabel="+" style={{ padding: 6 }}>
        <Ionicons name="chevron-up" size={28} color={colors.primary} />
      </Pressable>
      <Text style={{ color: colors.text, fontSize: 40, fontWeight: '600', width: 70, textAlign: 'center', fontVariant: ['tabular-nums'] }}>{value}</Text>
      <Pressable onPress={onDown} hitSlop={8} accessibilityRole="button" accessibilityLabel="−" style={{ padding: 6 }}>
        <Ionicons name="chevron-down" size={28} color={colors.primary} />
      </Pressable>
    </View>
  );
}

// ---------- Lembretes ----------
function RemindersBody() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editing, setEditing] = useState<Reminder | null>(null); // rascunho (novo ou existente)
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await loadReminders();
      // Sanitiza a lista guardada (protege o render contra dados mal-formados
      // de versões antigas) e grava a versão limpa.
      const clean: Reminder[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
        id: typeof r?.id === 'string' ? r.id : 'r' + Date.now() + Math.random().toString(36).slice(2, 6),
        hour: Number.isFinite(r?.hour) ? r.hour : 9,
        minute: Number.isFinite(r?.minute) ? r.minute : 0,
        label: typeof r?.label === 'string' ? r.label : '',
        enabled: !!r?.enabled,
        notificationId: typeof r?.notificationId === 'string' ? r.notificationId : null,
      }));
      setReminders(clean);
      saveReminders(clean);
      // Cancela notificações "fantasma" que não estão na lista (ex.: a das 22h antiga).
      try {
        const aff = await loadAffirmationReminder();
        await cancelUntrackedReminders(knownNotificationIds(clean, aff));
      } catch {}
    })();
  }, []);

  // Grava localmente (a sincronização com a cloud é automática).
  async function persist(list: Reminder[]) {
    setReminders(list);
    await saveReminders(list);
  }

  async function scheduleOne(r: Reminder): Promise<Reminder> {
    await cancelReminderFully(r.id, r.notificationId);
    if (!r.enabled) return { ...r, notificationId: null };
    const ok = await ensureNotificationPermission();
    if (!ok) {
      Alert.alert(t('reminders.permTitle'), t('reminders.permBody'));
      return { ...r, enabled: false, notificationId: null };
    }
    const id = await scheduleDailyReminder(r.hour, r.minute, t('reminders.notifTitle'), String(r.label ?? '').trim() || t('reminders.notifBody'), reminderNotifId(r.id));
    return { ...r, notificationId: id };
  }

  async function toggle(r: Reminder) {
    setBusy(true);
    const updated = await scheduleOne({ ...r, enabled: !r.enabled });
    persist(reminders.map((x) => (x.id === r.id ? updated : x)));
    setBusy(false);
  }

  function openNew() {
    setIsNew(true);
    setEditing({ id: 'r' + Date.now(), hour: 9, minute: 0, label: '', enabled: true, notificationId: null });
  }
  function openEdit(r: Reminder) {
    setIsNew(false);
    setEditing({ ...r });
  }

  async function saveEditor() {
    if (!editing) return;
    setBusy(true);
    const updated = await scheduleOne(editing);
    const list = isNew ? [...reminders, updated] : reminders.map((x) => (x.id === updated.id ? updated : x));
    persist(list);
    setBusy(false);
    setEditing(null);
  }

  async function removeReminder(r: Reminder) {
    // Guarda primeiro a lista sem o lembrete (para nunca "voltar"), depois cancela.
    await persist(reminders.filter((x) => x.id !== r.id));
    await cancelReminderFully(r.id, r.notificationId);
  }

  async function removeEditing() {
    if (!editing) return;
    await removeReminder(editing);
    setEditing(null);
  }

  function bump(field: 'hour' | 'minute', delta: number) {
    setEditing((c) => {
      if (!c) return c;
      if (field === 'hour') return { ...c, hour: (c.hour + delta + 24) % 24 };
      return { ...c, minute: (c.minute + delta + 60) % 60 };
    });
  }

  // -------- Editor (novo / editar), inline --------
  if (editing) {
    return (
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 120 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{isNew ? t('reminders.newTitle') : t('reminders.editTitle')}</Text>

        <Card style={{ gap: spacing.md, alignItems: 'center' }}>
          <View style={{ alignSelf: 'stretch' }}><CardHeader icon="time-outline" title={t('reminders.time')} /></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Stepper value={two(editing.hour)} onUp={() => bump('hour', 1)} onDown={() => bump('hour', -1)} />
            <Text style={{ color: colors.textMuted, fontSize: 40, fontWeight: '600' }}>:</Text>
            <Stepper value={two(editing.minute)} onUp={() => bump('minute', 5)} onDown={() => bump('minute', -5)} />
          </View>
        </Card>

        <Card style={{ gap: 8 }}>
          <CardHeader icon="create-outline" title={t('reminders.labelField')} />
          <TextInput
            value={String(editing.label ?? '')}
            onChangeText={(v) => setEditing((c) => (c ? { ...c, label: v } : c))}
            placeholder={t('reminders.labelPlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={{ padding: 14, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 15 }}
          />
        </Card>

        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}><CardHeader icon="notifications-outline" title={t('reminders.enabled')} /></View>
          <Switch
            value={editing.enabled}
            onValueChange={(v) => setEditing((c) => (c ? { ...c, enabled: v } : c))}
            trackColor={{ true: colors.primary, false: colors.track }}
          />
        </Card>

        <PrimaryButton label={t('reminders.save')} onPress={saveEditor} disabled={busy} />

        {!isNew && (
          <Pressable onPress={removeEditing} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14 }}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={{ color: colors.danger, fontWeight: '700' }}>{t('reminders.delete')}</Text>
          </Pressable>
        )}
      </ScrollView>
    );
  }

  // -------- Lista --------
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }}>
      <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('reminders.subtitle')}</Text>

      {reminders.length === 0 && (
        <EmptyState
          icon="notifications-outline"
          title={t('reminders.none')}
          subtitle={tr2(lang, 'Cria um lembrete para praticares à hora que escolheres.', 'Create a reminder to practise at the time you choose.')}
        />
      )}

      {reminders.map((r) => (
        <Pressable
          key={r.id}
          onPress={() => openEdit(r)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: r.enabled ? colors.primarySoft : colors.cardAlt, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={r.enabled ? 'notifications-outline' : 'notifications-off-outline'} size={20} color={r.enabled ? colors.primary : colors.textMuted} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: r.enabled ? colors.text : colors.textMuted, fontSize: 26, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{two(r.hour)}:{two(r.minute)}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{String(r.label ?? '').trim() || t('reminders.everyDay')}</Text>
          </View>
          <Switch
            value={r.enabled}
            onValueChange={() => toggle(r)}
            disabled={busy}
            trackColor={{ true: colors.primary, false: colors.track }}
          />
        </Pressable>
      ))}

      <Pressable
        onPress={openNew}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: radius.lg, backgroundColor: colors.primarySoft, marginTop: 4 }}
      >
        <Ionicons name="add" size={20} color={colors.primary} />
        <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('reminders.addNew')}</Text>
      </Pressable>
    </ScrollView>
  );
}

// ---------- Afirmação do dia ----------
function AffirmationBody() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (pt: string, en: string) => tr2(lang, pt, en);

  const [state, setState] = useState<AffirmationReminder | null>(null);
  const [busy, setBusy] = useState(false);
  const [sample] = useState(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);

  useEffect(() => {
    loadAffirmationReminder().then(setState);
  }, []);

  if (!state) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  function bump(field: 'hour' | 'minute', delta: number) {
    setState((c) => {
      if (!c) return c;
      if (field === 'hour') return { ...c, hour: (c.hour + delta + 24) % 24 };
      return { ...c, minute: (c.minute + delta + 60) % 60 };
    });
  }

  async function save() {
    if (!state) return;
    setBusy(true);
    await saveAffirmationReminder(state);
    await syncAffirmationReminder(lang); // agenda/cancela e grava o notificationId
    const fresh = await loadAffirmationReminder();
    setState(fresh);
    setBusy(false);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 120 }}>
      <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
        {tt('Recebe todos os dias uma frase motivadora à hora que escolheres. A frase vai variando.',
            'Get a motivating phrase every day at the time you choose. The phrase varies.')}
      </Text>

      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}><CardHeader icon="sunny-outline" title={tt('Ativar', 'Enable')} /></View>
        <Switch
          value={state.enabled}
          onValueChange={(v) => setState((c) => (c ? { ...c, enabled: v } : c))}
          trackColor={{ true: colors.primary, false: colors.track }}
        />
      </Card>

      {state.enabled && (
        <Card style={{ gap: spacing.md, alignItems: 'center' }}>
          <View style={{ alignSelf: 'stretch' }}><CardHeader icon="time-outline" title={tt('Hora', 'Time')} /></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Stepper value={two(state.hour)} onUp={() => bump('hour', 1)} onDown={() => bump('hour', -1)} />
            <Text style={{ color: colors.textMuted, fontSize: 40, fontWeight: '600' }}>:</Text>
            <Stepper value={two(state.minute)} onUp={() => bump('minute', 5)} onDown={() => bump('minute', -5)} />
          </View>
        </Card>
      )}

      {/* Pré-visualização */}
      <Card style={{ gap: spacing.sm }}>
        <CardHeader icon="chatbubble-ellipses-outline" title={tt('Exemplo', 'Example')} />
        <Text style={{ color: colors.text, fontSize: 16, lineHeight: 23, fontStyle: 'italic' }}>“{pick(sample, lang)}”</Text>
      </Card>

      <PrimaryButton label={tt('Guardar', 'Save')} onPress={save} disabled={busy} />
    </ScrollView>
  );
}

export default function RemindersScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const [tab, setTab] = useState<'reminders' | 'affirmation'>('reminders');
  const tabLabel = (v: 'reminders' | 'affirmation') =>
    v === 'reminders'
      ? (tr2(lang, 'Lembretes', 'Reminders'))
      : (tr2(lang, 'Afirmação do dia', 'Affirmation'));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={tr2(lang, 'Lembretes', 'Reminders')} onBack={onBack} />
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm }}>
        <Segmented value={tab} onChange={setTab} options={[['reminders', tabLabel('reminders')], ['affirmation', tabLabel('affirmation')]]} />
      </View>
      {tab === 'reminders' ? <RemindersBody /> : <AffirmationBody />}
    </View>
  );
}
