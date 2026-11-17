// "Ver o meu plano": o plano para dias difíceis em modo de leitura, com letra
// grande e sem formulários — para abrir a meio de um momento difícil.
// As pessoas de confiança têm botões para ligar ou enviar mensagem.

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { plansText } from '../data/plansText';
import { tr2, useLang } from '../i18n/i18n';
import { HardDayPlan, loadHardDayPlan } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { PeopleList } from './PeopleList';
import { Card, PrimaryButton, TopBackBar } from './ui';

export default function MyPlanScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const px = plansText(lang);
  const tt = (pt: string, en: string) => tr2(lang, pt, en);
  const router = useRouter();
  const [plan, setPlan] = useState<HardDayPlan | null>(null);

  useEffect(() => { loadHardDayPlan().then(setPlan); }, []);

  if (!plan) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  type Sec = { icon: keyof typeof Ionicons.glyphMap; title: string; text: string };
  const all: Sec[] = [
    { icon: 'chatbox-ellipses-outline', title: tt('Frases para me lembrar', 'Things to remind myself'), text: plan.reminders },
    { icon: 'heart-outline', title: tt('O que me costuma ajudar', 'What usually helps me'), text: plan.helps },
    { icon: 'alert-circle-outline', title: tt('Como sei que estou num dia difícil', "How I know it's a hard day"), text: plan.signs },
  ];
  const sections = all.filter((x) => x.text.trim());
  const people = plan.people ?? [];
  const empty = sections.length === 0 && people.length === 0 && !plan.contacts.trim();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={px.title} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.sm, gap: spacing.md, paddingBottom: 80 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg }}>
          <Ionicons name="leaf-outline" size={22} color={colors.primary} />
          <Text style={{ flex: 1, color: colors.text, fontSize: 17, fontWeight: '600', lineHeight: 24 }}>{px.breathe}</Text>
        </View>

        {empty ? (
          <Card style={{ gap: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: 16, lineHeight: 23 }}>{px.emptyPlan}</Text>
            <PrimaryButton label={px.edit} onPress={() => router.replace('/plans')} />
          </Card>
        ) : (
          <>
            {sections.map((s) => (
              <Card key={s.title} style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name={s.icon} size={20} color={colors.primary} />
                  <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '700', flex: 1 }}>{s.title}</Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 20, lineHeight: 30 }}>{s.text.trim()}</Text>
              </Card>
            ))}
            {(people.length > 0 || plan.contacts.trim()) && (
              <Card style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="people-outline" size={20} color={colors.primary} />
                  <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '700', flex: 1 }}>{tt('Quem posso contactar', 'Who I can reach out to')}</Text>
                </View>
                <PeopleList people={people} big />
                {plan.contacts.trim() ? <Text style={{ color: colors.text, fontSize: 17, lineHeight: 25 }}>{plan.contacts.trim()}</Text> : null}
              </Card>
            )}
          </>
        )}

        <Pressable onPress={() => router.push('/crisislines')} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}>
          <Ionicons name="call-outline" size={18} color={colors.danger} />
          <Text style={{ color: colors.text, fontWeight: '700' }}>{px.crisis}</Text>
        </Pressable>
        {!empty && (
          <Pressable onPress={() => router.replace('/plans')} accessibilityRole="button" style={{ alignItems: 'center', padding: 12 }}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>{px.edit}</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
