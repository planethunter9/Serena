// Cartão "a Serena não substitui um profissional" + botão para as linhas de apoio.
// variant 'full' (consentimento, Sobre) ou 'short' (separador Apoio).

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { disclaimer } from '../data/disclaimer';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

export default function DisclaimerCard({ variant = 'full', onCrisis }: { variant?: 'full' | 'short'; onCrisis?: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const router = useRouter();
  const d = disclaimer(lang);
  const openCrisis = onCrisis ?? (() => router.push('/crisislines'));

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: colors.danger, padding: spacing.lg, gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <Ionicons name={variant === 'full' ? 'medkit-outline' : 'call-outline'} size={20} color={colors.danger} style={{ marginTop: 1 }} />
        <View style={{ flex: 1, gap: 4 }}>
          {variant === 'full' && <Text accessibilityRole="header" style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{d.title}</Text>}
          <Text style={{ color: variant === 'full' ? colors.textMuted : colors.text, fontSize: variant === 'full' ? 13 : 14, lineHeight: variant === 'full' ? 19 : 20 }}>
            {variant === 'full' ? d.body : d.short}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={openCrisis}
        accessibilityRole="button"
        style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.danger, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}
      >
        <Ionicons name="call" size={14} color={colors.onPrimary} />
        <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: 13 }}>{d.crisis}</Text>
      </Pressable>
    </View>
  );
}
