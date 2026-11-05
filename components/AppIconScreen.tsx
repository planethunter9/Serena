// Ecrã "Ícone da app": grelha de ícones. 'default' é grátis; as variantes ficam
// atrás do pack de personalização (unlocked). Tocar num bloqueado leva à compra.
// A troca de ícone no ecrã inicial só acontece num build nativo (não no Expo Go).

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { APP_ICONS, AppIconDef, applyAppIcon, loadAppIcon } from '../data/appIcons';
import { pick, tr2, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

export default function AppIconScreen({ onBack }: { onBack: () => void }) {
  const { colors, unlocked } = useTheme();
  const { lang } = useLang();
  const L = (ptStr: string, enStr: string) => tr2(lang, ptStr, enStr);
  const router = useRouter();
  const [selected, setSelected] = useState('default');

  useEffect(() => { loadAppIcon().then(setSelected); }, []);

  async function choose(icon: AppIconDef) {
    const locked = !icon.free && !unlocked;
    if (locked) {
      Alert.alert(
        L('Ícone bloqueado', 'Locked icon'),
        L('Este ícone faz parte do pack de personalização.', 'This icon is part of the personalization pack.'),
        [
          { text: L('Agora não', 'Not now'), style: 'cancel' },
          { text: L('Desbloquear', 'Unlock'), onPress: () => router.push('/personalization' as any) },
        ],
      );
      return;
    }
    const res = await applyAppIcon(icon.id);
    setSelected(icon.id);
    if (!res.ok) {
      Alert.alert(
        L('Guardado', 'Saved'),
        L('O ícone muda quando abrires a app num build nativo (não funciona no Expo Go).', 'The icon changes once you open the app in a native build (it does not work in Expo Go).'),
      );
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={L('Ícone da app', 'App icon')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 120 }}>
        <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
          {L('Escolhe a cor do ícone da Serena no teu ecrã inicial. As variantes fazem parte do pack de personalização.', 'Choose the color of the Serena icon on your home screen. The variants are part of the personalization pack.')}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          {APP_ICONS.map((icon) => {
            const active = selected === icon.id;
            const locked = !icon.free && !unlocked;
            return (
              <Pressable
                key={icon.id}
                onPress={() => choose(icon)}
                accessibilityRole="button"
                accessibilityLabel={pick(icon.label, lang)}
                style={{ width: '30%', alignItems: 'center', gap: 6 }}
              >
                <View style={{ width: '100%', aspectRatio: 1, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 2, borderColor: active ? colors.primary : colors.border }}>
                  <Image source={icon.preview} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  {locked && (
                    <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.38)', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="lock-closed" size={22} color="#fff" />
                    </View>
                  )}
                  {active && (
                    <View style={{ position: 'absolute', right: 4, top: 4, backgroundColor: colors.primary, borderRadius: 999, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="checkmark" size={15} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={{ color: colors.text, fontSize: 12, fontWeight: active ? '700' : '500' }} numberOfLines={1}>
                  {pick(icon.label, lang)}
                </Text>
              </Pressable>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}
