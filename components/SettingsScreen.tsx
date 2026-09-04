// Definições: perfil, aspeto, idioma, edição das escolhas e terminar sessão.

import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Lang, useLang } from '../i18n/i18n';
import { OnboardingData, ProfileItem } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

export default function SettingsScreen({
  onBack,
  data,
  onUpdate,
  onOpenPrivacy,
  onOpenChoices,
  onOpenProfile,
}: {
  onBack: () => void;
  data: OnboardingData;
  onUpdate: (data: OnboardingData) => void;
  onOpenPrivacy: () => void;
  onOpenChoices: () => void;
  onOpenProfile: () => void;
}) {
  const { colors, themeName, setThemeName } = useTheme();
  const { t, lang, setLang } = useLang();
  const { user, signOut } = useAuth();


  function confirmLogout() {
    Alert.alert(t('settings.logoutTitle'), t('settings.logoutBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.logout'), style: 'destructive', onPress: () => signOut() },
    ]);
  }

  function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { key: T; label: string }[]; onChange: (v: T) => void }) {
    return (
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {options.map((o) => {
          const active = value === o.key;
          return (
            <Pressable key={o.key} onPress={() => onChange(o.key)} style={{ flex: 1, padding: 14, borderRadius: radius.md, alignItems: 'center', backgroundColor: active ? colors.primary : colors.cardAlt, borderWidth: 2, borderColor: active ? colors.primary : colors.border }}>
              <Text style={{ color: active ? '#ffffff' : colors.text, fontWeight: '600' }}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('settings.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        {user && (
          <Card style={{ gap: 2 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{user.name}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{user.email}</Text>
          </Card>
        )}

        <Card style={{ gap: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{t('settings.appearance')}</Text>
          <Segmented value={themeName} onChange={(v) => setThemeName(v)} options={[{ key: 'light', label: t('settings.light') }, { key: 'dark', label: t('settings.dark') }]} />
        </Card>

        <Card style={{ gap: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{t('settings.language')}</Text>
          <Segmented<Lang> value={lang} onChange={(v) => setLang(v)} options={[{ key: 'pt', label: t('settings.langPt') }, { key: 'en', label: t('settings.langEn') }]} />
        </Card>

        {/* As minhas escolhas (abre ecrã próprio) */}
        <Pressable onPress={onOpenChoices} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text, fontSize: 16, flex: 1 }}>{t('settings.choices')}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 20 }}>›</Text>
        </Pressable>

        <Pressable onPress={onOpenPrivacy} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text, fontSize: 16, flex: 1 }}>{t('settings.privacy')}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 20 }}>›</Text>
        </Pressable>

        <Pressable onPress={confirmLogout} style={{ padding: 16, borderRadius: radius.md, alignItems: 'center', borderWidth: 2, borderColor: colors.danger, marginTop: 4 }}>
          <Text style={{ color: colors.danger, fontWeight: '700' }}>{t('settings.logout')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
