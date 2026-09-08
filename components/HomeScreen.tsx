// Página inicial: círculo de progresso (dias sem ataques/comportamentos),
// check-in honesto, intensidade do medo, técnicas e sons.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { addAttack, addSeverity, loadStreakStart, saveStreakStart } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, ScreenTitle } from './ui';

export default function HomeScreen({
  onBreathing,
  onBodyScan,
  onPositive,
  onSounds,
  startDate,
}: {
  onBreathing: () => void;
  onBodyScan: () => void;
  onPositive: () => void;
  onSounds: () => void;
  startDate: string;
}) {
  const { colors } = useTheme();
  const { t } = useLang();
  const [streakStart, setStreakStart] = useState<string | null>(null);
  const [fear, setFear] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Ao abrir: carrega o início da contagem; se não existir, usa a data de início do percurso.
  useEffect(() => {
    loadStreakStart().then((v) => {
      if (v) {
        setStreakStart(v);
      } else {
        setStreakStart(startDate);
        saveStreakStart(startDate);
      }
    });
  }, []);

  const streakDays = streakStart
    ? Math.max(0, Math.floor((Date.now() - new Date(streakStart).getTime()) / 86400000))
    : 0;
  const dayNumber = streakDays + 1; // conta a partir do Dia 1 (hoje)

  // Registar um ataque/comportamento -> reinicia o contador (com confirmação).
  function relapse(kind: 'anxiety' | 'panic' | 'behavior') {
    Alert.alert(t('home.resetTitle'), t('home.resetBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('home.reset'),
        style: 'destructive',
        onPress: async () => {
          await addAttack(kind);
          const iso = new Date().toISOString();
          await saveStreakStart(iso);
          setStreakStart(iso);
          setFeedback(null);
        },
      },
    ]);
  }

  function noneToday() {
    setFeedback(t('home.keptStreak'));
  }

  async function logFear(v: number) {
    setFear(v);
    await addSeverity(v);
  }

  const techniques = [
    { key: 'breathing', title: t('tech.breathing'), desc: t('tech.breathingDesc'), icon: 'ellipse-outline' as const, onPress: onBreathing },
    { key: 'bodyscan', title: t('tech.bodyscan'), desc: t('tech.bodyscanDesc'), icon: 'body-outline' as const, onPress: onBodyScan },
    { key: 'positive', title: t('tech.positive'), desc: t('tech.positiveDesc'), icon: 'chatbubble-ellipses-outline' as const, onPress: onPositive },
  ];

  // Botão do check-in.
  function CheckinButton({ label, onPress, positive }: { label: string; onPress: () => void; positive?: boolean }) {
    return (
      <Pressable
        onPress={onPress}
        style={{
          flex: 1,
          paddingVertical: 16,
          borderRadius: radius.md,
          alignItems: 'center',
          backgroundColor: positive ? colors.primarySoft : colors.cardAlt,
          borderWidth: 2,
          borderColor: positive ? colors.primary : colors.border,
        }}
      >
        <Text style={{ color: positive ? colors.primary : colors.text, fontWeight: '700' }}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 120 }}>
      {/* Círculo de progresso */}
      <View style={{ alignItems: 'center', gap: 8, marginBottom: spacing.sm }}>
        <View style={{ width: 170, height: 170, borderRadius: 85, borderWidth: 10, borderColor: colors.primary, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.primary, fontSize: 54, fontWeight: '800' }}>{dayNumber}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingHorizontal: 10 }}>{t(dayNumber === 1 ? 'home.journeyDay' : 'home.journeyDays')}</Text>
        </View>
        {dayNumber >= 30 && (
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('home.journeyMonthsCaption', { n: Math.floor(dayNumber / 30) })}</Text>
        )}
      </View>

      <View>
        <ScreenTitle title={t('home.greeting')} />
        <Text style={{ color: colors.textMuted, fontSize: 15, marginTop: 4 }}>{t('home.subtitle')}</Text>
      </View>

      {/* Check-in honesto */}
      <Card style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>{t('home.checkinTitle')}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('home.checkinHint')}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 4 }}>
          <CheckinButton label={t('home.anxiety')} onPress={() => relapse('anxiety')} />
          <CheckinButton label={t('home.panic')} onPress={() => relapse('panic')} />
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <CheckinButton label={t('home.behavior')} onPress={() => relapse('behavior')} />
          <CheckinButton label={t("home.none")} onPress={noneToday} />
        </View>
        {feedback && <Text style={{ color: colors.success, fontSize: 13, marginTop: 2 }}>{feedback}</Text>}
      </Card>

      {/* Intensidade do medo */}
      <Card style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>{t('home.fearTitle')}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('home.fearHint')}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          {[0, 1, 2, 3, 4, 5].map((v) => {
            const active = fear === v;
            return (
              <Pressable
                key={v}
                onPress={() => logFear(v)}
                style={{ flex: 1, aspectRatio: 1, borderRadius: radius.md, backgroundColor: active ? colors.primary : colors.cardAlt, borderWidth: 2, borderColor: active ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: active ? '#ffffff' : colors.text, fontSize: 18, fontWeight: '700' }}>{v}</Text>
              </Pressable>
            );
          })}
        </View>
        {fear !== null && <Text style={{ color: colors.success, fontSize: 13, marginTop: 2 }}>{t('home.logged')}</Text>}
      </Card>

      {/* Técnicas */}
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 }}>{t('home.techniquesTitle')}</Text>
      {techniques.map((tech) => (
        <Pressable
          key={tech.key}
          onPress={tech.onPress}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}
        >
          <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={tech.icon} size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{tech.title}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{tech.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      ))}

      {/* Sons */}
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 }}>{t('home.soundsTitle')}</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {[
          { key: 'calm' as const, label: t('home.soundsCalm'), icon: 'leaf-outline' as const },
          { key: 'sleep' as const, label: t('home.soundsSleep'), icon: 'moon-outline' as const },
        ].map((s) => (
          <Pressable
            key={s.key}
            onPress={() => onSounds(s.key)}
            style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 8 }}
          >
            <Ionicons name={s.icon} size={26} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '600' }}>{s.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
