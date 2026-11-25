// Ecrã "Sobre a Serena": descrição da app + as fontes/referências do conteúdo.
// Acedido a partir das Definições.

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { pick, useLang , tr2 } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import { SOURCES } from './CitationsScreen';
import DisclaimerCard from './DisclaimerCard';
import { Card, TopBackBar } from './ui';

export default function AboutScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const open = (url: string) => Linking.openURL(url).catch(() => {});
  const [showSources, setShowSources] = useState(false);

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
              'A Serena é um apoio psicoeducativo para quem vive com emetofobia (o medo de vomitar). Ajuda-te a compreender a fobia e a praticar técnicas baseadas na terapia cognitivo-comportamental (CBT) e na exposição com prevenção de resposta (ERP).',
              'Serena is psychoeducational support for people living with emetophobia (the fear of vomiting). It helps you understand the phobia and practise techniques based on cognitive behavioural therapy (CBT) and exposure and response prevention (ERP).',
            )}
          </Text>
        </Card>

        <DisclaimerCard />

        {/* Fontes: fechadas por defeito (abrem ao tocar) */}
        <Card style={{ gap: 0, padding: 0, overflow: 'hidden' }}>
          <Pressable
            onPress={() => setShowSources((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showSources }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.lg }}
          >
            <Ionicons name="library-outline" size={18} color={colors.primary} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{L('Fontes', 'Sources')} ({SOURCES.length})</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
                {L('O conteúdo baseia-se em fontes clínicas fidedignas. Toca numa fonte para a abrir.',
                   'The content is based on reliable clinical sources. Tap a source to open it.')}
              </Text>
            </View>
            <Ionicons name={showSources ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
          </Pressable>
          {showSources && SOURCES.map((s, i) => (
            <Pressable
              key={i}
              onPress={() => open(s.url)}
              accessibilityRole="link"
              style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, gap: 2 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', flex: 1, lineHeight: 19 }}>{s.title}</Text>
                <Ionicons name="open-outline" size={16} color={colors.primary} style={{ marginTop: 2 }} />
              </View>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>{s.publisher}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 17 }}>{pick(s.desc, lang)}</Text>
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}
