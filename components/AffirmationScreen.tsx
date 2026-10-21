// Ecrã "Afirmação do dia": ativar/desativar e escolher a hora de uma
// notificação diária com uma frase motivadora (escolhida aleatoriamente).

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { AFFIRMATIONS } from '../data/content';
import { useLang } from '../i18n/i18n';
import { syncAffirmationReminder } from '../notifications/affirmation';
import { AffirmationReminder, loadAffirmationReminder, saveAffirmationReminder } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { Card, PrimaryButton, TopBackBar } from './ui';
import { radius, spacing } from '../theme/theme';

const two = (n: number) => (n < 10 ? '0' + n : '' + n);

export default function AffirmationScreen({ onBack }: { onBack: () => void }) {
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

  function Stepper({ value, onUp, onDown }: { value: string; onUp: () => void; onDown: () => void }) {
    return (
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Ionicons name="chevron-up" size={28} color={colors.primary} onPress={onUp} />
        <Text style={{ color: colors.text, fontSize: 44, fontWeight: '800', width: 70, textAlign: 'center' }}>{value}</Text>
        <Ionicons name="chevron-down" size={28} color={colors.primary} onPress={onDown} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={tt('Afirmação do dia', 'Affirmation of the day')} onBack={onBack} />
      <View style={{ padding: spacing.xl, gap: spacing.lg }}>
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
      </View>
    </View>
  );
}
