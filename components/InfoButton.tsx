// Botão "i" de informação: em vez de muito texto no ecrã, o texto explicativo
// só aparece quando se toca no "i", num balão (tooltip) junto ao ícone, com
// uma pequena seta — não num aviso. Toca em qualquer sítio para fechar.
// Igual em iOS, Android e web.

import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tr2, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius } from '../theme/theme';

const BUBBLE_MAX_W = 300;
const MARGIN = 12;   // distância mínima às bordas do ecrã
const ARROW = 8;

export default function InfoButton({ text, title, size = 20 }: { text: string; title?: string; size?: number }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const ref = useRef<any>(null); // Pressable nativo (measureInWindow)
  const [anchor, setAnchor] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const label = tr2(lang, 'Mais informação', 'More information');

  function show() {
    ref.current?.measureInWindow((x: number, y: number, w: number, h: number) => setAnchor({ x, y, w, h }));
  }
  const close = () => setAnchor(null);

  // Posição do balão: por baixo do "i" (ou por cima, se não houver espaço).
  let bubble = null;
  if (anchor) {
    const bw = Math.min(BUBBLE_MAX_W, W - MARGIN * 2);
    const cx = anchor.x + anchor.w / 2;
    const left = Math.min(Math.max(cx - bw / 2, MARGIN), W - MARGIN - bw);
    const below = anchor.y + anchor.h + ARROW + 4;
    const spaceBelow = H - below - insets.bottom - MARGIN;
    const placeBelow = spaceBelow > 160 || anchor.y < H / 2;
    const arrowLeft = Math.min(Math.max(cx - left - ARROW, 14), bw - 14 - ARROW * 2);
    const maxH = placeBelow ? Math.max(120, spaceBelow) : Math.max(120, anchor.y - ARROW - 4 - insets.top - MARGIN);
    bubble = (
      <Animated.View
        entering={FadeIn.duration(140).reduceMotion(ReduceMotion.System)}
        style={{
          position: 'absolute', left, width: bw,
          ...(placeBelow ? { top: below } : { bottom: H - anchor.y + ARROW + 4 }),
        }}
      >
        {placeBelow && (
          <View style={{ marginLeft: arrowLeft, width: 0, height: 0, borderLeftWidth: ARROW, borderRightWidth: ARROW, borderBottomWidth: ARROW, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: colors.text }} />
        )}
        <View accessibilityLiveRegion="polite" style={{ backgroundColor: colors.text, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, maxHeight: maxH, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}>
          <ScrollView bounces={false}>
            {title ? <Text style={{ color: colors.background, fontSize: 14, fontWeight: '700', marginBottom: 4 }}>{title}</Text> : null}
            <Text style={{ color: colors.background, fontSize: 14, lineHeight: 20 }}>{text}</Text>
          </ScrollView>
        </View>
        {!placeBelow && (
          <View style={{ marginLeft: arrowLeft, width: 0, height: 0, borderLeftWidth: ARROW, borderRightWidth: ARROW, borderTopWidth: ARROW, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.text }} />
        )}
      </Animated.View>
    );
  }

  return (
    <>
      <Pressable ref={ref} onPress={show} hitSlop={12} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ expanded: !!anchor }} style={{ padding: 2 }}>
        <Ionicons name={anchor ? 'information-circle' : 'information-circle-outline'} size={size + 2} color={colors.primary} />
      </Pressable>
      <Modal visible={!!anchor} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
        <Pressable onPress={close} style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel={tr2(lang, 'Fechar', 'Close')}>
          {bubble}
        </Pressable>
      </Modal>
    </>
  );
}
