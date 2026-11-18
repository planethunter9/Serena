// Botão "i" de informação: em vez de muito texto no ecrã, o texto explicativo
// só aparece quando se toca no "i".
// - iOS: balão nativo (SwiftUI Popover, com seta), via @expo/ui.
// - Android: dica nativa (Material 3 RichTooltip), via @expo/ui.
// - Sem o módulo nativo (web, Expo Go antigo): uma janela simples, por cima.

import { Ionicons } from '@expo/vector-icons';
import { requireOptionalNativeModule } from 'expo';
import { useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { tr2, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

const HAS_NATIVE = Platform.OS !== 'web' && !!requireOptionalNativeModule('ExpoUI');
/* eslint-disable @typescript-eslint/no-require-imports */
const SUI: any = HAS_NATIVE && Platform.OS === 'ios' ? require('@expo/ui/swift-ui') : null;
const SUIM: any = HAS_NATIVE && Platform.OS === 'ios' ? require('@expo/ui/swift-ui/modifiers') : null;
const JC: any = HAS_NATIVE && Platform.OS === 'android' ? require('@expo/ui/jetpack-compose') : null;
const INFO_ICON = Platform.OS === 'android' ? require('../assets/icons/info.xml') : null;
/* eslint-enable @typescript-eslint/no-require-imports */

export default function InfoButton({ text, title, size = 20 }: { text: string; title?: string; size?: number }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const tipRef = useRef<any>(null);
  const label = tr2(lang, 'Mais informação', 'More information');

  // iOS: balão nativo com seta.
  if (SUI && SUIM) {
    const { Host, Popover, Button, Text: SText, VStack } = SUI;
    return (
      <Host matchContents>
        <Popover isPresented={open} onIsPresentedChange={setOpen} arrowEdge="top">
          <Popover.Trigger>
            <Button systemImage="info.circle" onPress={() => setOpen(true)} modifiers={[SUIM.labelStyle('iconOnly'), SUIM.foregroundStyle(colors.primary)]} />
          </Popover.Trigger>
          <Popover.Content>
            <VStack alignment="leading" spacing={6} modifiers={[SUIM.padding({ all: 16 }), SUIM.frame({ maxWidth: 320 }), SUIM.fixedSize({ horizontal: false, vertical: true })]}>
              {title ? <SText modifiers={[SUIM.font({ weight: 'bold', size: 15 })]}>{title}</SText> : null}
              <SText modifiers={[SUIM.font({ size: 15 })]}>{text}</SText>
            </VStack>
          </Popover.Content>
        </Popover>
      </Host>
    );
  }

  // Android: dica nativa (fica aberta até tocar fora).
  if (JC) {
    const { Host, TooltipBox, IconButton, Icon, Text: CText } = JC;
    return (
      <Host matchContents>
        <TooltipBox ref={tipRef} isPersistent>
          <TooltipBox.RichTooltip>
            {title ? <TooltipBox.RichTooltip.Title><CText>{title}</CText></TooltipBox.RichTooltip.Title> : null}
            <TooltipBox.RichTooltip.Text><CText>{text}</CText></TooltipBox.RichTooltip.Text>
          </TooltipBox.RichTooltip>
          <IconButton onClick={() => tipRef.current?.show()}>
            <Icon source={INFO_ICON} tint={colors.primary} size={size + 2} contentDescription={label} />
          </IconButton>
        </TooltipBox>
      </Host>
    );
  }

  // Alternativa (web / sem módulo nativo).
  return (
    <>
      <Pressable onPress={() => setOpen(true)} hitSlop={10} accessibilityRole="button" accessibilityLabel={label} style={{ padding: 2 }}>
        <Ionicons name="information-circle-outline" size={size + 2} color={colors.primary} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: spacing.xl }} accessibilityRole="button" accessibilityLabel={tr2(lang, 'Fechar', 'Close')}>
          <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, gap: 8, maxHeight: '75%' }}>
            {title ? <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{title}</Text> : null}
            <ScrollView><Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{text}</Text></ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
