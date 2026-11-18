// Modal de confirmação (ex.: "Palavra-passe reposta"): ícone com "pop",
// título, texto e um botão. Fecha pelo botão (ou pelo gesto de voltar no Android).

import { Ionicons } from '@expo/vector-icons';
import { Modal, Text, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion, ZoomIn } from 'react-native-reanimated';
import { tapHaptic } from '../lib/motion';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { PrimaryButton } from './ui';

const backdropIn = FadeIn.duration(200).reduceMotion(ReduceMotion.System);
const cardIn = ZoomIn.springify().damping(16).stiffness(200).reduceMotion(ReduceMotion.System);
const iconIn = ZoomIn.delay(150).springify().damping(10).stiffness(220).reduceMotion(ReduceMotion.System);

export default function SuccessModal({
  visible, title, body, button, onClose, icon = 'checkmark',
}: {
  visible: boolean; title: string; body: string; button: string; onClose: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useTheme();
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose} onShow={tapHaptic}>
      <Animated.View entering={backdropIn} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
        <Animated.View
          entering={cardIn}
          accessibilityViewIsModal
          style={{ width: '100%', maxWidth: 420, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 12 }}
        >
          <Animated.View entering={iconIn} style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={icon} size={36} color={colors.onPrimary} />
          </Animated.View>
          <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' }}>{title}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center' }}>{body}</Text>
          <View style={{ alignSelf: 'stretch', marginTop: spacing.sm }}>
            <PrimaryButton label={button} onPress={onClose} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
