// Mostra a Política de Privacidade na língua escolhida na app (texto em data/legal.ts).

import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { getPrivacyPolicy } from '../data/legal';
import { tr2, useLang } from '../i18n/i18n';
import { loadHealthConsent } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

export default function PrivacyScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const doc = getPrivacyPolicy(lang);
  const [summary, ...sections] = doc.sections;
  const [consentAt, setConsentAt] = useState<string | null>(null);
  useEffect(() => { loadHealthConsent().then((c) => setConsentAt(c?.acceptedAt ?? null)); }, []);

  // Parágrafos; as linhas que começam por "•" são mostradas como lista.
  const body = (text: string) =>
    text.split('\n').map((line, i) => {
      const bullet = line.startsWith('• ');
      return bullet ? (
        <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
          <Text style={{ color: colors.primary, fontSize: 14, lineHeight: 22 }}>•</Text>
          <Text style={{ color: colors.text, fontSize: 14, lineHeight: 22, flex: 1 }}>{line.slice(2)}</Text>
        </View>
      ) : (
        <Text key={i} style={{ color: colors.text, fontSize: 14, lineHeight: 22 }}>{line}</Text>
      );
    });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('privacy.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 80 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{doc.updated}</Text>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 23 }}>{doc.intro}</Text>
        </View>

        {summary && (
          <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, gap: 6 }}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>{summary.title}</Text>
            {body(summary.body)}
          </View>
        )}

        {sections.map((s) => (
          <View key={s.title} style={{ gap: 6 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{s.title}</Text>
            {body(s.body)}
          </View>
        ))}

        {consentAt && (
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: spacing.sm }}>
            {tr2(lang, 'Consentimento para dados de saúde dado em', 'Health data consent given on')} {new Date(consentAt).toLocaleDateString()}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
