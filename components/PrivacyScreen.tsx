// Mostra a Política de Privacidade (texto em data/legal.ts).

import { ScrollView, Text, View } from 'react-native';
import { PRIVACY_POLICY } from '../data/legal';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import { TopBackBar } from './ui';

export default function PrivacyScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('privacy.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <Text style={{ color: colors.text, fontSize: 14, lineHeight: 22 }}>{PRIVACY_POLICY[lang]}</Text>
      </ScrollView>
    </View>
  );
}
