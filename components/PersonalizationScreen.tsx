  // Ecrã "Personalização": escolher paleta de cores, cor personalizada (HEX) e
// tipo de letra. Só o azul e a fonte do sistema são grátis; o resto fica atrás
// de uma paywall (o pack de personalização). Enquanto não há compras reais,
// o botão "Desbloquear" ativa o estado localmente para teste.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { deriveColors, FONTS, lightColors, normalizeHex, PRESETS, radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

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

export default function PersonalizationScreen({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const { colors, unlocked } = theme;
  const { lang } = useLang();
  const tt = (o: L) => o[lang];

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
        { text: tt({ pt: 'Desbloquear (teste)', en: 'Unlock (test)' }), onPress: () => theme.setUnlocked(true) },
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

  const Lock = () => <Ionicons name="lock-closed" size={13} color={colors.textMuted} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={tt({ pt: 'Personalização', en: 'Personalization' })} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 60 }}>

        {/* Paywall / estado */}
        {!unlocked ? (
          <Card style={{ gap: 10, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{tt({ pt: 'Deixa a Serena com a tua cara', en: 'Make Serena yours' })}</Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 14, lineHeight: 21 }}>
              {tt({
                pt: 'Desbloqueia todas as paletas, a cor à tua escolha e 20 tipos de letra — numa compra única, para sempre.',
                en: 'Unlock every palette, your own color and 20 fonts — one purchase, forever.',
              })}
            </Text>
            <Pressable onPress={() => theme.setUnlocked(true)} style={{ backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', marginTop: 4 }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{tt({ pt: 'Desbloquear (teste)', en: 'Unlock (test)' })}</Text>
            </Pressable>
            <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
              {tt({ pt: 'Botão temporário — será ligado à compra na App Store/Play.', en: 'Temporary button — will be wired to the App Store/Play purchase.' })}
            </Text>
          </Card>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={{ color: colors.textMuted, fontSize: 13, flex: 1 }}>{tt({ pt: 'Personalização desbloqueada.', en: 'Personalization unlocked.' })}</Text>
            <Pressable onPress={() => theme.setUnlocked(false)} hitSlop={6}>
              <Text style={{ color: colors.textMuted, fontSize: 12, textDecorationLine: 'underline' }}>{tt({ pt: 'repor', en: 'reset' })}</Text>
            </Pressable>
          </View>
        )}

        {/* Modo claro/escuro */}
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>{tt({ pt: 'Aspeto', en: 'Appearance' })}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {([['light', { pt: 'Claro', en: 'Light' }, 'sunny-outline'], ['dark', { pt: 'Escuro', en: 'Dark' }, 'moon-outline']] as const).map(([mode, label, icon]) => {
            const active = theme.themeName === mode;
            return (
              <Pressable key={mode} onPress={() => theme.setThemeName(mode)} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 12, borderRadius: radius.md, backgroundColor: active ? colors.primary : colors.card, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}>
                <Ionicons name={icon as any} size={18} color={active ? '#fff' : colors.text} />
                <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700' }}>{tt(label)}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Paletas */}
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 4 }}>{tt({ pt: 'Paleta de cores', en: 'Color palette' })}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          {/* Azul grátis */}
          <Pressable onPress={() => pickPalette('blue')} style={{ alignItems: 'center', gap: 4, width: 72 }}>
            <PaletteSwatch primary={null} selected={theme.paletteId === 'blue'} color={colors} />
            <Text style={{ color: colors.text, fontSize: 11, textAlign: 'center' }} numberOfLines={1}>{tt({ pt: 'Azul', en: 'Blue' })}</Text>
          </Pressable>
          {/* Paletas pagas */}
          {PRESETS.map((p) => (
            <Pressable key={p.id} onPress={() => pickPalette(p.id)} style={{ alignItems: 'center', gap: 4, width: 72 }}>
              <View>
                <PaletteSwatch primary={p.primary} selected={theme.paletteId === p.id} color={colors} />
                {!unlocked && (
                  <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: colors.card, borderRadius: 9, padding: 2, borderWidth: 1, borderColor: colors.border }}>
                    <Lock />
                  </View>
                )}
              </View>
              <Text style={{ color: colors.text, fontSize: 11, textAlign: 'center' }} numberOfLines={1}>{tt(p.name)}</Text>
            </Pressable>
          ))}
        </View>

        {/* Cor personalizada */}
        <Card style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{tt({ pt: 'Cor personalizada', en: 'Custom color' })}</Text>
            {!unlocked && <Lock />}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SWATCHES.map((hx) => (
              <Pressable key={hx} onPress={() => { setHexInput(hx.replace('#', '')); applyHex(hx); }} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: hx, borderWidth: theme.paletteId === 'custom' && normalizeHex(theme.customHex) === hx ? 3 : 1, borderColor: theme.paletteId === 'custom' && normalizeHex(theme.customHex) === hx ? colors.text : colors.border }} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, backgroundColor: colors.cardAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 }}>
              <Text style={{ color: colors.textMuted, fontWeight: '700' }}>#</Text>
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
            <Pressable onPress={() => applyHex(hexInput)} style={{ backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 11, paddingHorizontal: 16 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{tt({ pt: 'Aplicar', en: 'Apply' })}</Text>
            </Pressable>
          </View>
        </Card>

        {/* Cores do círculo (pago) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>{tt({ pt: 'Cores do círculo', en: 'Circle colors' })}</Text>
          {!unlocked && <Lock />}
        </View>
        <Card style={{ gap: 14 }}>
          {PILLAR_NAMES.map((pname, i) => (
            <View key={i} style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: ringCols[i] }} />
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{pname}</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SWATCHES.map((hx) => {
                  const sel = normalizeHex(ringCols[i]) === hx;
                  return (
                    <Pressable key={hx} onPress={() => pickRingColor(i, hx)} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: hx, borderWidth: sel ? 3 : 1, borderColor: sel ? colors.text : colors.border }} />
                  );
                })}
              </View>
            </View>
          ))}
          {theme.ringColors && (
            <Pressable onPress={theme.resetRingColors} hitSlop={6} style={{ alignSelf: 'flex-start' }}>
              <Text style={{ color: colors.textMuted, fontSize: 12, textDecorationLine: 'underline' }}>{tt({ pt: 'repor cores predefinidas', en: 'reset default colors' })}</Text>
            </Pressable>
          )}
        </Card>

        {/* Tipos de letra */}
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 4 }}>{tt({ pt: 'Tipo de letra', en: 'Font' })}</Text>
        <View style={{ gap: spacing.sm }}>
          {FONTS.map((f) => {
            const active = theme.fontKey === f.key;
            const locked = f.key !== 'system' && !unlocked;
            return (
              <Pressable key={f.key} onPress={() => pickFont(f.key)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: active ? colors.primarySoft : colors.card, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}>
                <Text style={{ color: colors.text, fontSize: 16, flex: 1, fontFamily: f.family }}>{f.label}</Text>
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
      </ScrollView>
    </View>
  );
}
