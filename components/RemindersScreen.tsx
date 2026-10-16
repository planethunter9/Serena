// Lembretes de prática, estilo "Alarmes" do iOS: vários lembretes à escolha,
// cada um com a sua hora, nome opcional e interruptor. Cada um ativo agenda
// uma notificação diária.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { cancelReminder, ensureNotificationPermission, scheduleDailyReminder } from '../notifications/notifications';
import { loadReminders, Reminder, saveReminders } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, PrimaryButton, TopBackBar } from './ui';

function two(n: number) {
  return n < 10 ? '0' + n : '' + n;
}

export default function RemindersScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editing, setEditing] = useState<Reminder | null>(null); // rascunho (novo ou existente)
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadReminders().then(setReminders);
  }, []);

  function persist(list: Reminder[]) {
    setReminders(list);
    saveReminders(list);
  }

  // Cancela a notificação anterior e, se estiver ativo, agenda a nova.
  async function scheduleOne(r: Reminder): Promise<Reminder> {
    await cancelReminder(r.notificationId);
    if (!r.enabled) return { ...r, notificationId: null };
    const ok = await ensureNotificationPermission();
    if (!ok) {
      Alert.alert(t('reminders.permTitle'), t('reminders.permBody'));
      return { ...r, enabled: false, notificationId: null };
    }
    const id = await scheduleDailyReminder(r.hour, r.minute, t('reminders.notifTitle'), r.label.trim() || t('reminders.notifBody'));
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


  
  function Stepper({ value, onUp, onDown }: { value: string; onUp: () => void; onDown: () => void }) {
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

  // -------- Editor (novo / editar) --------
  if (editing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBackBar title={isNew ? t('reminders.newTitle') : t('reminders.editTitle')} onBack={() => setEditing(null)} />
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
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
              value={editing.label}
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
      </View>
    );
  }

  // -------- Lista --------
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('reminders.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('reminders.subtitle')}</Text>

        {reminders.length === 0 && (
          <Text style={{ color: colors.textMuted, fontSize: 14, marginVertical: spacing.sm }}>{t('reminders.none')}</Text>
        )}

        {reminders.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => openEdit(r)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: r.enabled ? colors.text : colors.textMuted, fontSize: 30, fontWeight: '800' }}>{two(r.hour)}:{two(r.minute)}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{r.label.trim() || t('reminders.everyDay')}</Text>
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
    </View>
  );
}
