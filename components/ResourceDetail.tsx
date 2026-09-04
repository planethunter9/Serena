// Ecrã de detalhe de um recurso. Por agora mostra "Em breve".
// Quando construirmos um recurso a sério (ex.: o Diário), é aqui que entra.

import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

export default function ResourceDetail({ title, onBack }: { title: string; onBack: () => void }) {
  const { colors } = useTheme();
  const { t } = useLang();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={title} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <Card style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.primarySoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="hourglass-outline" size={30} color={colors.primary} />
          </View>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{t('resource.soonTitle')}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 15, lineHeight: 21, textAlign: 'center' }}>
            {t('resource.soonBody')}
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
