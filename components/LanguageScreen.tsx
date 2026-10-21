// Ecrã de Idioma: escolher a língua da app (igual às outras definições).

import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Lang, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

export default function LanguageScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang, setLang } = useLang();

  const options: { key: Lang; label: string }[] = [
    { key: 'pt', label: t('settings.langPt') },
    { key: 'en', label: t('settings.langEn') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('settings.language')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.sm }}>
        {options.map((o) => {
          const active = lang === o.key;
          return (
            <Pressable key={o.key} onPress={() => setLang(o.key)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: active ? colors.primarySoft : colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 }}>{o.label}</Text>
              {active && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
