// Ecrã de Idioma: escolher a língua da app (igual às outras definições).

import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LANGS, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

export default function LanguageScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang, setLang } = useLang();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('settings.language')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.sm }}>
        {LANGS.map((o) => {
          const active = lang === o.code;
          return (
            <Pressable key={o.code} onPress={() => setLang(o.code)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: active ? colors.primarySoft : colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{o.label}</Text>
              {o.beta && (
                <View style={{ backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>beta</Text>
                </View>
              )}
              <View style={{ flex: 1 }} />
              {active && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
