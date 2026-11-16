  // Ecrã "Personalização": aspeto (claro/escuro), paleta de cores, cor
// personalizada (HEX), tipo de letra e cores do círculo dos pilares.
// Na 1.0 é tudo grátis (PERSONALIZATION_FREE em ThemeContext); o "pack" pago
// fica preparado para quando houver compras reais.

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { pick, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { deriveColors, FONTS, lightColors, normalizeHex, PRESETS, radius, spacing } from '../theme/theme';
import { Card, CardHeader, Segmented, TopBackBar } from './ui';

type L = { pt: string; en: string };

// Swatches sugeridas para a cor personalizada.
const SWATCHES = ['#2f8aa8', '#7a5cc9', '#4f9d7f', '#d9734e', '#c65b86', '#5b7186', '#2a9d9d', '#e0a500', '#3b6fe0', '#9c3b6b'];

// Mostra um pequeno retângulo com as cores de uma paleta.
function PaletteSwatch({ primary, selected, color }: { primary: string | null; selected: boolean; color: typeof lightColors }) {
  const preview = primary ? deriveColors(primary, false) : lightColors;
  return (
    <View style={{
      width: 56, height: 56, borderRadius: radius.md, overflow: 'hidden',
      borderWidth: selected ? 3 : 1, borderColor: selected ? color.primary : color.border,
      backgroundColor: preview.background,
    }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', padding: 6, gap: 4 }}>
        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: preview.primary }} />
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: preview.primarySoft }} />
      </View>
    </View>
  );
}

function Lock() {
  const { colors } = useTheme();
  return <Ionicons name="lock-closed" size={13} color={colors.textMuted} accessibilityLabel="locked" />;
}

export default function PersonalizationScreen({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const { colors, unlocked } = theme;
  const { lang } = useLang();
  const tt = (o: L) => pick(o, lang);

  const [hexInput, setHexInput] = useState(theme.customHex.replace('#', ''));

  // Modo do círculo (grátis) e cores do círculo (pago).

  const ringCols = theme.ringColors ?? theme.defaultRingColors;
  const PILLAR_NAMES = [tt({ pt: 'Prática', en: 'Practice' }), tt({ pt: 'Repetição', en: 'Repetition' }), tt({ pt: 'Aproximação', en: 'Approach' })];
  function pickRingColor(i: number, hx: string) { if (!requireUnlock()) return; theme.setRingColor(i, hx); }

  // Pede desbloqueio quando se toca numa opção paga sem acesso.
  function requireUnlock(): boolean {
    if (unlocked) return true;
    Alert.alert(
      tt({ pt: 'Pack de personalização', en: 'Personalization pack' }),
      tt({
        pt: 'As cores e os tipos de letra extra fazem parte de uma compra única. Queres desbloquear?',
        en: 'Extra colors and fonts are part of a one-time purchase. Unlock?',
      }),
      [
        { text: tt({ pt: 'Agora não', en: 'Not now' }), style: 'cancel' },
      ],
    );
    return false;
  }

  function pickPalette(id: string) {
    if (id !== 'blue' && !requireUnlock()) return;
    theme.setPalette(id);
  }
  function pickFont(key: string) {
    if (key !== 'system' && !requireUnlock()) return;
    theme.setFontKey(key);
  }
  function applyHex(raw: string) {
    if (!requireUnlock()) return;
    const n = normalizeHex(raw);
    if (!n) {
      Alert.alert(tt({ pt: 'Código inválido', en: 'Invalid code' }), tt({ pt: 'Usa o formato #RRGGBB (ex.: #2f8aa8).', en: 'Use the #RRGGBB format (e.g. #2f8aa8).' }));
      return;
    }
    theme.setCustomHex(n);
    theme.setPalette('custom');
  }


  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={tt({ pt: 'Personalização', en: 'Personalization' })} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.md, gap: spacing.lg, paddingBottom: 60 }}>

        {/* Pack de personalização (só quando houver compras reais; na 1.0 é grátis) */}
        {!unlocked && (
          <Card style={{ gap: 10, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="color-palette-outline" size={18} color={colors.primary} />
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{tt({ pt: 'Deixa a Serena com a tua cara', en: 'Make Serena yours' })}</Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 14, lineHeight: 21 }}>
              {tt({
                pt: 'Desbloqueia todas as paletas, a cor à tua escolha e 20 tipos de letra — numa compra única, para sempre.',
                en: 'Unlock every palette, your own color and 20 fonts — one purchase, forever.',
              })}
            </Text>
          </Card>
        )}

        {/* Aspeto: claro / escuro */}
        <Card style={{ gap: spacing.md }}>
          <CardHeader icon="contrast-outline" title={tt({ pt: 'Aspeto', en: 'Appearance' })} />
          <Segmented
            value={theme.themeName}
            onChange={(m) => theme.setThemeName(m)}
            options={[['light', tt({ pt: 'Claro', en: 'Light' })], ['dark', tt({ pt: 'Escuro', en: 'Dark' })]]}
          />
        </Card>

        {/* Paletas + cor personalizada */}
        <Card style={{ gap: spacing.md }}>
          <CardHeader icon="color-palette-outline" title={tt({ pt: 'Paleta de cores', en: 'Color palette' })} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {/* Azul (predefinido) */}
            <Pressable onPress={() => pickPalette('blue')} accessibilityRole="button" accessibilityState={{ selected: theme.paletteId === 'blue' }} style={{ alignItems: 'center', gap: 4, width: 64 }}>
              <PaletteSwatch primary={null} selected={theme.paletteId === 'blue'} color={colors} />
              <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }} numberOfLines={1}>{tt({ pt: 'Azul', en: 'Blue' })}</Text>
            </Pressable>
            {PRESETS.map((p) => (
              <Pressable key={p.id} onPress={() => pickPalette(p.id)} accessibilityRole="button" accessibilityState={{ selected: theme.paletteId === p.id }} style={{ alignItems: 'center', gap: 4, width: 64 }}>
                <View>
                  <PaletteSwatch primary={p.primary} selected={theme.paletteId === p.id} color={colors} />
                  {!unlocked && (
                    <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: colors.card, borderRadius: 9, padding: 2, borderWidth: 1, borderColor: colors.border }}>
                      <Lock />
                    </View>
                  )}
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }} numberOfLines={1}>{tt(p.name)}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <CardHeader icon="brush-outline" title={tt({ pt: 'Cor personalizada', en: 'Custom color' })} right={!unlocked ? <Lock /> : undefined} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SWATCHES.map((hx) => {
              const sel = theme.paletteId === 'custom' && normalizeHex(theme.customHex) === hx;
              return (
                <Pressable key={hx} onPress={() => { setHexInput(hx.replace('#', '')); applyHex(hx); }} accessibilityRole="button" accessibilityLabel={hx} accessibilityState={{ selected: sel }} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: hx, borderWidth: sel ? 3 : 1, borderColor: sel ? colors.text : colors.border }} />
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, backgroundColor: colors.cardAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 }}>
              <Text style={{ color: colors.textMuted }}>#</Text>
              <TextInput
                value={hexInput}
                onChangeText={(v) => setHexInput(v.replace('#', '').slice(0, 6))}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={6}
                placeholder="2f8aa8"
                placeholderTextColor={colors.textMuted}
                style={{ flex: 1, color: colors.text, paddingVertical: 10, letterSpacing: 1 }}
              />
              {normalizeHex(hexInput) && (
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#' + hexInput, borderWidth: 1, borderColor: colors.border }} />
              )}
            </View>
            <Pressable onPress={() => applyHex(hexInput)} accessibilityRole="button" style={{ backgroundColor: colors.primarySoft, borderRadius: radius.md, paddingVertical: 11, paddingHorizontal: 16 }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{tt({ pt: 'Aplicar', en: 'Apply' })}</Text>
            </Pressable>
          </View>
        </Card>

        {/* Cores do círculo dos pilares */}
        <Card style={{ gap: spacing.md }}>
          <CardHeader icon="ellipse-outline" title={tt({ pt: 'Cores do círculo', en: 'Circle colors' })} right={!unlocked ? <Lock /> : undefined} />
          {PILLAR_NAMES.map((pname, i) => (
            <View key={i} style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: ringCols[i] }} />
                <Text style={{ color: colors.text, fontSize: 14 }}>{pname}</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SWATCHES.map((hx) => {
                  const sel = normalizeHex(ringCols[i]) === hx;
                  return (
                    <Pressable key={hx} onPress={() => pickRingColor(i, hx)} accessibilityRole="button" accessibilityLabel={`${pname} ${hx}`} accessibilityState={{ selected: sel }} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: hx, borderWidth: sel ? 3 : 1, borderColor: sel ? colors.text : colors.border }} />
                  );
                })}
              </View>
            </View>
          ))}
          {theme.ringColors && (
            <Pressable onPress={theme.resetRingColors} hitSlop={6} style={{ alignSelf: 'flex-start' }}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{tt({ pt: 'Repor cores predefinidas', en: 'Reset default colors' })}</Text>
            </Pressable>
          )}
        </Card>

        {/* Tipos de letra */}
        <Card style={{ gap: spacing.sm }}>
          <CardHeader icon="text-outline" title={tt({ pt: 'Tipo de letra', en: 'Font' })} />
          <View>
            {FONTS.map((f, i) => {
              const active = theme.fontKey === f.key;
              const locked = f.key !== 'system' && !unlocked;
              return (
                <Pressable key={f.key} onPress={() => pickFont(f.key)} accessibilityRole="radio" accessibilityState={{ selected: active }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
                  <Text style={{ color: active ? colors.primary : colors.text, fontSize: 16, flex: 1, fontFamily: f.family }}>{f.label}</Text>
                  {locked && <Lock />}
                  {active && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </Pressable>
              );
            })}
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18 }}>
            {tt({
              pt: 'Nota: alguns tipos de letra só têm o peso normal, por isso os títulos podem parecer menos "bold". A fonte do sistema mantém os pesos certos.',
              en: 'Note: some fonts ship regular weight only, so headings may look less bold. The system font keeps exact weights.',
            })}
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
