// Ecrã "Sobre a Serena": descrição da app + as fontes/referências do conteúdo.
// Acedido a partir das Definições.

import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { pick, useLang } from '../i18n/i18n';
import { tr2 } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { SOURCES } from './CitationsScreen';
import { Card, TopBackBar } from './ui';

export default function AboutScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const open = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={L('Sobre a Serena', 'About Serena')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 40 }}>
        {/* Descrição */}
        <Card style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>{L('Sobre a Serena', 'About Serena')}</Text>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 20 }}>
            {L(
              'A Serena é um apoio psicoeducativo para quem vive com emetofobia (o medo de vomitar). Ajuda-te a compreender a fobia e a praticar técnicas baseadas na terapia cognitivo-comportamental (CBT) e na exposição com prevenção de resposta (ERP).\n\nNão substitui o acompanhamento de um profissional de saúde nem é um tratamento médico. Em caso de crise, usa as linhas de apoio em Recursos.',
              'Serena is psychoeducational support for people living with emetophobia (the fear of vomiting). It helps you understand the phobia and practise techniques based on cognitive behavioural therapy (CBT) and exposure and response prevention (ERP).\n\nIt does not replace care from a health professional and is not medical treatment. In a crisis, use the support lines in Resources.',
            )}
          </Text>
        </Card>

        {/* Fontes */}
        <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.sm }}>
          {L('Fontes', 'Sources')}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
          {L('O conteúdo baseia-se em fontes clínicas fidedignas. Toca numa fonte para a abrir.',
             'The content is based on reliable clinical sources. Tap a source to open it.')}
        </Text>

        {SOURCES.map((s, i) => (
          <Pressable
            key={i}
            onPress={() => open(s.url)}
            style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: 4 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', flex: 1, lineHeight: 20 }}>{s.title}</Text>
              <Ionicons name="open-outline" size={18} color={colors.primary} style={{ marginTop: 2 }} />
            </View>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{s.publisher}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>{pick(s.desc, lang)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
