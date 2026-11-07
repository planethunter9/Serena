// Linhas de apoio: contactos de crise e apoio emocional (Portugal) + direção
// para apoio internacional. Toca para ligar.

import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { pick, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

type L = { pt: string; en: string };
type Line = { name: string; number: string; dial: string; desc: L };

const LINES: Line[] = [
  { name: '112', number: '112', dial: '112', desc: { pt: 'Emergência (24h). Para perigo imediato.', en: 'Emergency (24h). For immediate danger.' } },
  { name: '1411 — Linha Nacional de Prevenção do Suicídio e Apoio Psicológico', number: '1411', dial: '1411', desc: { pt: 'Apoio psicológico e prevenção do suicídio, 24h/dia, todos os dias (SNS 24).', en: 'Psychological support and suicide prevention, 24h a day, every day (SNS 24).' } },
  { name: 'SNS 24', number: '808 24 24 24', dial: '808242424', desc: { pt: 'Aconselhamento de saúde e psicológico, 24h/dia.', en: 'Health and psychological counselling, 24h a day.' } },
  { name: 'SOS Voz Amiga', number: '213 544 545', dial: '213544545', desc: { pt: 'Apoio emocional por telefone (também 912 802 669 / 963 524 660).', en: 'Emotional support by phone (also 912 802 669 / 963 524 660).' } },
];

export default function CrisisLinesScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const tt = (o: L) => pick(o, lang);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('resources.crisislines')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 40 }}>
        <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
          {tt({
            pt: 'Se estás em sofrimento intenso ou em crise, não tens de passar por isto sem ninguém. Fala com alguém agora — tocar num contacto liga diretamente.',
            en: 'If you are in intense distress or crisis, you do not have to go through this alone. Talk to someone now — tapping a contact calls directly.',
          })}
        </Text>

        {LINES.map((l) => (
          <Pressable key={l.name} onPress={() => Linking.openURL(`tel:${l.dial}`).catch(() => {})} style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', flex: 1 }}>{l.name}</Text>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
            </View>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>{l.number}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>{tt(l.desc)}</Text>
          </Pressable>
        ))}

        {/* Internacional */}
        <Pressable onPress={() => Linking.openURL('https://findahelpline.com').catch(() => {})} style={{ backgroundColor: colors.cardAlt, borderRadius: radius.lg, padding: spacing.lg, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', flex: 1 }}>{tt({ pt: 'Fora de Portugal', en: 'Outside Portugal' })}</Text>
            <Ionicons name="open-outline" size={18} color={colors.primary} />
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
            {tt({ pt: 'Encontra uma linha de apoio no teu país em findahelpline.com. Em emergência, liga 112 (na Europa).', en: 'Find a helpline in your country at findahelpline.com. In an emergency, call 112 (in Europe).' })}
          </Text>
        </Pressable>

        <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
          {tt({ pt: 'Esta app não é um serviço de emergência. Em perigo imediato, liga 112.', en: 'This app is not an emergency service. In immediate danger, call 112.' })}
        </Text>
      </ScrollView>
    </View>
  );
}
