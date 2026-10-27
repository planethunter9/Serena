// Página única "Lembretes" + "Afirmação do dia", alternadas por um segmented
// control no topo. Cada lembrete ativo agenda uma notificação diária; a
// afirmação do dia agenda uma notificação com uma frase motivadora.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { AFFIRMATIONS } from '../data/content';
import { useLang } from '../i18n/i18n';
import { syncAffirmationReminder } from '../notifications/affirmation';
import { cancelReminder, cancelUntrackedReminders, ensureNotificationPermission, scheduleDailyReminder } from '../notifications/notifications';
import { AffirmationReminder, loadAffirmationReminder, loadReminders, Reminder, saveAffirmationReminder, saveReminders } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import EmptyState from './EmptyState';
import { Card, PrimaryButton, TopBackBar } from './ui';

function two(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return v < 10 ? '0' + v : '' + v;
}

function Stepper({ value, onUp, onDown }: { value: string; onUp: () => void; onDown: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <Pressable onPress={onUp} hitSlop={8} style={{ padding: 6 }}>
        <Ionicons name="chevron-up" size={28} color={colors.primary} />
      </Pressable>
      <Text style={{ color: colors.text, fontSize: 44, fontWeight: '800', width: 70, textAlign: 'center' }}>{value}</Text>
      <Pressable onPress={onDown} hitSlop={8} style={{ padding: 6 }}>
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
      try { await cancelUntrackedReminders(clean.map((r) => r.notificationId)); } catch {}
    })();
  }, []);

  function persist(list: Reminder[]) {
    setReminders(list);
    saveReminders(list);
  }

  async function scheduleOne(r: Reminder): Promise<Reminder> {
    await cancelReminder(r.notificationId);
    if (!r.enabled) return { ...r, notificationId: null };
    const ok = await ensureNotificationPermission();
    if (!ok) {
      Alert.alert(t('reminders.permTitle'), t('reminders.permBody'));
      return { ...r, enabled: false, notificationId: null };
    }
    const id = await scheduleDailyReminder(r.hour, r.minute, t('reminders.notifTitle'), String(r.label ?? '').trim() || t('reminders.notifBody'));
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

  async function removeEditing() {
    if (!editing) return;
    await cancelReminder(editing.notificationId);
    persist(reminders.filter((x) => x.id !== editing.id));
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
        <Pressable onPress={() => setEditing(null)} hitSlop={8}>
          <Text style={{ color: colors.textMuted, fontSize: 16 }}>‹ {t('common.back')}</Text>
        </Pressable>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>{isNew ? t('reminders.newTitle') : t('reminders.editTitle')}</Text>

        <Card style={{ gap: spacing.md, alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontWeight: '600', alignSelf: 'flex-start' }}>{t('reminders.time')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Stepper value={two(editing.hour)} onUp={() => bump('hour', 1)} onDown={() => bump('hour', -1)} />
            <Text style={{ color: colors.text, fontSize: 44, fontWeight: '800' }}>:</Text>
            <Stepper value={two(editing.minute)} onUp={() => bump('minute', 5)} onDown={() => bump('minute', -5)} />
          </View>
        </Card>

        <Card style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{t('reminders.labelField')}</Text>
          <TextInput
            value={String(editing.label ?? '')}
            onChangeText={(v) => setEditing((c) => (c ? { ...c, label: v } : c))}
            placeholder={t('reminders.labelPlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={{ padding: 14, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15 }}
          />
        </Card>

        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{t('reminders.enabled')}</Text>
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
          subtitle={lang === 'pt' ? 'Cria um lembrete para praticares à hora que escolheres.' : 'Create a reminder to practise at the time you choose.'}
        />
      )}

      {reminders.map((r) => (
        <Pressable
          key={r.id}
          onPress={() => openEdit(r)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: r.enabled ? colors.text : colors.textMuted, fontSize: 30, fontWeight: '800' }}>{two(r.hour)}:{two(r.minute)}</Text>
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
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed', marginTop: 4 }}
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
  const tt = (pt: string, en: string) => (lang === 'pt' ? pt : en);

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
        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{tt('Ativar', 'Enable')}</Text>
        <Switch
          value={state.enabled}
          onValueChange={(v) => setState((c) => (c ? { ...c, enabled: v } : c))}
          trackColor={{ true: colors.primary, false: colors.track }}
        />
      </Card>

      {state.enabled && (
        <Card style={{ gap: spacing.md, alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontWeight: '600', alignSelf: 'flex-start' }}>{tt('Hora', 'Time')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Stepper value={two(state.hour)} onUp={() => bump('hour', 1)} onDown={() => bump('hour', -1)} />
            <Text style={{ color: colors.text, fontSize: 44, fontWeight: '800' }}>:</Text>
            <Stepper value={two(state.minute)} onUp={() => bump('minute', 5)} onDown={() => bump('minute', -5)} />
          </View>
        </Card>
      )}

      {/* Pré-visualização */}
      <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg }}>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4 }}>{tt('Exemplo', 'Example')}</Text>
        <Text style={{ color: colors.text, fontSize: 16, fontStyle: 'italic' }}>“{sample[lang]}”</Text>
      </View>

      <PrimaryButton label={tt('Guardar', 'Save')} onPress={save} disabled={busy} />
    </ScrollView>
  );
}

export default function RemindersScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [tab, setTab] = useState<'reminders' | 'affirmation'>('reminders');
  const tabLabel = (v: 'reminders' | 'affirmation') =>
    v === 'reminders'
      ? (lang === 'pt' ? 'Lembretes' : 'Reminders')
      : (lang === 'pt' ? 'Afirmação do dia' : 'Affirmation');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={lang === 'pt' ? 'Lembretes' : 'Reminders'} onBack={onBack} />
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm }}>
        <View style={{ flexDirection: 'row', backgroundColor: colors.cardAlt, borderRadius: 999, padding: 4 }}>
          {(['reminders', 'affirmation'] as const).map((v) => {
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
      {tab === 'reminders' ? <RemindersBody /> : <AffirmationBody />}
    </View>
  );
}
