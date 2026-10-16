// Guia de sensações: aprender a distinguir sensações comuns e inofensivas das do
// prodromo do vómito. É APRENDIZAGEM, não reassurance nem vigilância.

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SENSATION_GROUPS } from '../data/content';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

type L = { pt: string; en: string };

export default function SensationsGuide() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => o[lang];
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: 40 }}>
      <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
        {tt({
          pt: 'O corpo produz muitas sensações normais ao longo do dia. A fobia tende a lê-las como "vou vomitar". Aqui podes conhecê-las, com curiosidade em vez de alarme — não para ficares a vigiar, mas para deixares de as interpretar como ameaça.',
          en: 'The body produces many normal sensations throughout the day. The phobia tends to read them as "I\'m going to vomit". Here you can get to know them, with curiosity instead of alarm — not to keep monitoring them, but to stop reading them as a threat.',
        })}
      </Text>

      {/* Contraste: o que precede mesmo o vómito */}
      <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '700' }}>
            {tt({ pt: 'O que precede mesmo o vómito', en: 'What actually precedes vomiting' })}
          </Text>
        </View>
        <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19 }}>
          {tt({
            pt: 'É um conjunto de sinais ao mesmo tempo, a crescer: náusea forte e persistente, salivação a mais, suor frio, pele pálida, por vezes ânsia/engasgo. Uma sensação isolada e passageira (um "nó" na garganta, uma onda de calor, um gorgolejo) não é este quadro.',
            en: 'It is a cluster of signs at once, building: strong, persistent nausea, excess saliva, cold sweat, pale skin, sometimes retching. A single, passing sensation (a "lump" in the throat, a wave of heat, a gurgle) is not this picture.',
          })}
        </Text>
      </View>

      {SENSATION_GROUPS.map((group, gi) => (
        <View key={gi} style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>
            {tt(group.area)}
          </Text>
          <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
            {group.items.map((item, ii) => {
              const key = `${gi}:${ii}`;
              const isOpen = open === key;
              return (
                <View key={key} style={{ borderTopWidth: ii === 0 ? 0 : 1, borderTopColor: colors.border }}>
                  <Pressable onPress={() => setOpen(isOpen ? null : key)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.lg }}>
                    <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>{tt(item.label)}</Text>
                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                  </Pressable>
                  {isOpen && (
                    <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, marginTop: -4 }}>
                      <Text style={{ color: colors.text, fontSize: 14, lineHeight: 21 }}>{tt(item.body)}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ))}

      <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 4 }}>
        {tt({
          pt: 'Isto é para aprenderes a distinguir, não para vigiar o corpo. Não é um diagnóstico nem substitui um médico se algo te preocupar a sério.',
          en: 'This is to help you tell sensations apart, not to monitor your body. It is not a diagnosis or a substitute for a doctor if something genuinely worries you.',
        })}
      </Text>
    </ScrollView>
  );
}
