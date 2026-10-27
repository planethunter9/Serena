// Plano para dias difíceis (prevenção de recaída): a pessoa prepara, com a
// cabeça fria, o que fazer num dia mau — sinais, o que ajuda, frases e contactos.
// Fica guardado e à mão para quando mais precisa.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { HardDayPlan, loadHardDayPlan, saveHardDayPlan } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

type Field = keyof HardDayPlan;

export default function HardDayPlanScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (pt: string, en: string) => (lang === 'pt' ? pt : en);

  const [plan, setPlan] = useState<HardDayPlan | null>(null);

  useEffect(() => {
    loadHardDayPlan().then(setPlan);
  }, []);

  function update(field: Field, value: string) {
    setPlan((p) => {
      const next = { ...(p as HardDayPlan), [field]: value };
      saveHardDayPlan(next);
      return next;
    });
  }

  if (!plan) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  const fields: { key: Field; icon: keyof typeof Ionicons.glyphMap; label: string; hint: string; ph: string }[] = [
    {
      key: 'signs', icon: 'alert-circle-outline',
      label: tt('Como sei que estou num dia difícil', 'How I know it\'s a hard day'),
      hint: tt('Os sinais que costumo notar.', 'The signs I usually notice.'),
      ph: tt('Ex.: ando a verificar mais, evito comer, fico muito na cabeça…', 'E.g. I check more, I avoid eating, I get stuck in my head…'),
    },
    {
      key: 'helps', icon: 'heart-outline',
      label: tt('O que me costuma ajudar', 'What usually helps me'),
      hint: tt('Coisas concretas que já sei que funcionam.', 'Concrete things I already know work.'),
      ph: tt('Ex.: respiração, sair a andar, falar com alguém, surfar o impulso…', 'E.g. breathing, going for a walk, talking to someone, urge surfing…'),
    },
    {
      key: 'reminders', icon: 'chatbox-ellipses-outline',
      label: tt('Frases para me lembrar', 'Things to remind myself'),
      hint: tt('O que queres que o teu "eu calmo" diga ao teu "eu em pânico".', 'What your calm self wants to tell your panicking self.'),
      ph: tt('Ex.: isto é só adrenalina e passa; um dia mau não apaga o meu caminho…', 'E.g. this is just adrenaline and it passes; a bad day doesn\'t erase my progress…'),
    },
    {
      key: 'contacts', icon: 'people-outline',
      label: tt('Quem posso contactar', 'Who I can reach out to'),
      hint: tt('Pessoas de confiança para os momentos mais difíceis.', 'People I trust for the hardest moments.'),
      ph: tt('Ex.: nome e como contactar…', 'E.g. name and how to reach them…'),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={tt('Plano para dias difíceis', 'Plan for hard days')} onBack={onBack} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 60 }}>
          <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
            {tt('Prepara isto agora, com calma. Num dia mau é difícil pensar — ter o plano escrito e à mão faz toda a diferença. Guarda-se sozinho.',
                'Prepare this now, calmly. On a bad day it\'s hard to think — having the plan written and ready makes all the difference. It saves itself.')}
          </Text>

          {fields.map((f) => (
            <Card key={f.key} style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name={f.icon} size={18} color={colors.primary} />
                <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{f.label}</Text>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{f.hint}</Text>
              <TextInput
                value={plan[f.key]}
                onChangeText={(v) => update(f.key, v)}
                multiline
                placeholder={f.ph}
                placeholderTextColor={colors.textMuted}
                style={{ minHeight: 70, padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15, textAlignVertical: 'top' }}
              />
            </Card>
          ))}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 }}>
            <Ionicons name="call-outline" size={16} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 12, flex: 1 }}>
              {tt('Em crise, usa as linhas de apoio em Recursos.', 'In a crisis, use the support lines in Resources.')}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
