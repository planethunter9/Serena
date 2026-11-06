// Botão (ícone de relógio) que abre o histórico de sessões, só para consulta.
// Opcionalmente já filtrado por um tipo de exercício (ver HistoryScreen).

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { tr2, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';

export function HistoryButton({ kind }: { kind?: string }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/history', params: kind ? { kind } : {} } as any)}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={tr2(lang, 'Ver histórico de sessões', 'View session history')}
      style={{ padding: 4 }}
    >
      <Ionicons name="time-outline" size={24} color={colors.primary} />
    </Pressable>
  );
}
