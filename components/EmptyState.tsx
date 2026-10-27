// Estado vazio reutilizável: ícone + título + subtítulo + ação opcional.
// Usado em ecrãs com listas que podem estar vazias, para um visual consistente.

import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';

export default function EmptyState({
  icon = 'sparkles-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
  compact = false,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}) {
  const { colors } = useTheme();
  const size = compact ? 44 : 64;
  return (
    <View style={{ alignItems: 'center', gap: compact ? 8 : 12, paddingVertical: compact ? spacing.md : spacing.xl, paddingHorizontal: spacing.lg }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={compact ? 22 : 30} color={colors.primary} />
      </View>
      <Text style={{ color: colors.text, fontSize: compact ? 15 : 17, fontWeight: '700', textAlign: 'center' }}>{title}</Text>
      {!!subtitle && (
        <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, textAlign: 'center' }}>{subtitle}</Text>
      )}
      {!!actionLabel && !!onAction && (
        <Pressable
          onPress={onAction}
          style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999 }}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
