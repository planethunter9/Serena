// Botão "i" de informação: em vez de muito texto no ecrã, o texto explicativo
// só aparece quando se toca no "i".
// - iOS e Android: abre o aviso nativo do sistema (Alert), com título e texto.
// - Web: uma janela simples por cima (o Alert do browser não serve aqui).
// O ícone é desenhado pela app (sempre visível); só a janela é nativa.

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { tr2, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

export default function InfoButton({ text, title, size = 20 }: { text: string; title?: string; size?: number }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const label = tr2(lang, 'Mais informação', 'More information');

  function show() {
    if (Platform.OS === 'web') setOpen(true);
    else Alert.alert(title ?? '', text, [{ text: 'OK' }]);
  }

  return (
    <>
      <Pressable onPress={show} hitSlop={12} accessibilityRole="button" accessibilityLabel={label} style={{ padding: 2 }}>
        <Ionicons name="information-circle-outline" size={size + 2} color={colors.primary} />
      </Pressable>
      {Platform.OS === 'web' && (
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: spacing.xl }} accessibilityRole="button" accessibilityLabel={tr2(lang, 'Fechar', 'Close')}>
            <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, gap: 8, maxHeight: '75%' }}>
              {title ? <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{title}</Text> : null}
              <ScrollView><Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{text}</Text></ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}
