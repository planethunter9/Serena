// Lembretes de prática: agenda uma notificação diária à hora escolhida.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { cancelReminder, ensureNotificationPermission, scheduleDailyReminder } from '../notifications/notifications';
import { loadReminder, ReminderConfig, saveReminder } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, PrimaryButton, TopBackBar } from './ui';

function two(n: number) {
  return n < 10 ? '0' + n : '' + n;
}

export default function RemindersScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const [cfg, setCfg] = useState<ReminderConfig>({ enabled: false, hour: 9, minute: 0, notificationId: null });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadReminder().then(setCfg);
  }, []);

  // Um "roda" para a hora e para os minutos (sem bibliotecas externas).
  function bump(field: 'hour' | 'minute', delta: number) {
    setCfg((c) => {
      if (field === 'hour') return { ...c, hour: (c.hour + delta + 24) % 24 };
      return { ...c, minute: (c.minute + delta + 60) % 60 };
    });
  }

  async function apply() {
    setBusy(true);
    // Cancela o lembrete anterior (se houver).
    await cancelReminder(cfg.notificationId);

    if (!cfg.enabled) {
      const next = { ...cfg, notificationId: null };
      await saveReminder(next);
      setCfg(next);
      setBusy(false);
      return;
    }

    const ok = await ensureNotificationPermission();
    if (!ok) {
      setBusy(false);
      Alert.alert(t('reminders.permTitle'), t('reminders.permBody'));
      const next = { ...cfg, enabled: false, notificationId: null };
      await saveReminder(next);
      setCfg(next);
      return;
    }

    const id = await scheduleDailyReminder(cfg.hour, cfg.minute, t('reminders.notifTitle'), t('reminders.notifBody'));
    const next = { ...cfg, notificationId: id };
    await saveReminder(next);
    setCfg(next);
    setBusy(false);
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('reminders.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('reminders.subtitle')}</Text>

        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{t('reminders.enable')}</Text>
          <Switch
            value={cfg.enabled}
            onValueChange={(v) => setCfg((c) => ({ ...c, enabled: v }))}
            trackColor={{ true: colors.primary, false: colors.track }}
          />
        </Card>

        <Card style={{ gap: spacing.md, alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontWeight: '600', alignSelf: 'flex-start' }}>{t('reminders.time')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Stepper value={two(cfg.hour)} onUp={() => bump('hour', 1)} onDown={() => bump('hour', -1)} />
            <Text style={{ color: colors.text, fontSize: 44, fontWeight: '800' }}>:</Text>
            <Stepper value={two(cfg.minute)} onUp={() => bump('minute', 5)} onDown={() => bump('minute', -5)} />
          </View>
        </Card>

        {cfg.enabled && cfg.notificationId && (
          <Text style={{ color: colors.success, fontSize: 14, textAlign: 'center' }}>
            {t('reminders.active', { time: two(cfg.hour) + ':' + two(cfg.minute) })}
          </Text>
        )}

        <PrimaryButton label={t('reminders.save')} onPress={apply} disabled={busy} />
      </ScrollView>
    </View>
  );
}
