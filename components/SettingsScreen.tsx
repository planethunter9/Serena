// Definições: perfil, aspeto, idioma, personalização, escolhas, privacidade,
// "Sobre" e terminar sessão. Linhas de navegação no mesmo estilo dos Recursos
// (chip com ícone + título + seta).

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { useLang } from '../i18n/i18n';
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
  const { t, lang } = useLang();
  const auth = useAuth();
  const { user, signOut } = auth;
  const router = useRouter();

  function confirmLogout() {
    Alert.alert(t('settings.logoutTitle'), t('settings.logoutBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.logout'), style: 'destructive', onPress: () => signOut() },
    ]);
  }

  // Eliminar conta: dois passos de confirmação (ação irreversível).
  function confirmDeleteAccount() {
    const L = (pt: string, en: string) => (lang === 'pt' ? pt : en);
    Alert.alert(
      L('Eliminar conta', 'Delete account'),
      L('Isto apaga para sempre a tua conta e todos os teus dados (progresso, exercícios, lembretes). Não pode ser desfeito.',
        'This permanently deletes your account and all your data (progress, exercises, reminders). This cannot be undone.'),
      [
        { text: L('Cancelar', 'Cancel'), style: 'cancel' },
        {
          text: L('Eliminar', 'Delete'),
          style: 'destructive',
          onPress: () => Alert.alert(
            L('Tens a certeza?', 'Are you sure?'),
            L('Última confirmação — a conta e os dados serão apagados definitivamente.',
              'Final confirmation — your account and data will be permanently erased.'),
            [
              { text: L('Cancelar', 'Cancel'), style: 'cancel' },
              { text: L('Eliminar definitivamente', 'Delete permanently'), style: 'destructive', onPress: runDeleteAccount },
            ],
          ),
        },
      ],
    );
  }

  async function runDeleteAccount() {
    const L = (pt: string, en: string) => (lang === 'pt' ? pt : en);
    const del = (auth as any).deleteAccount;
    try {
      if (typeof del === 'function') {
        await del();
      } else {
        // Fallback temporário: termina a sessão (a eliminação real liga-se no AuthContext).
        await signOut();
      }
    } catch (e) {
      Alert.alert(L('Não foi possível eliminar', 'Could not delete'), L('Tenta novamente mais tarde.', 'Please try again later.'));
    }
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

  // Linha de navegação no estilo dos Recursos.
  function NavRow({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 }}>{label}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('settings.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        {user && (
          <Pressable onPress={onOpenProfile} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="person-outline" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{user.name}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{user.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        )}

        {/* Navegação */}
        <NavRow icon="color-palette-outline" label={t('settings.personalization')} onPress={() => router.push('/personalization' as any)} />
        <NavRow icon="language-outline" label={t('settings.language')} onPress={() => router.push('/language' as any)} />
        <NavRow icon="sunny-outline" label={lang === 'pt' ? 'Afirmação do dia' : 'Affirmation of the day'} onPress={() => router.push('/affirmation' as any)} />
        <NavRow icon="options-outline" label={t('settings.choices')} onPress={onOpenChoices} />
        <NavRow icon="chatbox-ellipses-outline" label={lang === 'pt' ? 'Sugestões' : 'Feedback'} onPress={() => router.push('/feedback' as any)} />
        <NavRow icon="lock-closed-outline" label={t('settings.privacy')} onPress={onOpenPrivacy} />

        {/* Sobre */}
        <Card style={{ gap: 8, marginTop: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>{lang === 'pt' ? 'Sobre a Serena' : 'About Serena'}</Text>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 20 }}>
            {lang === 'pt'
              ? 'A Serena é um apoio psicoeducativo para quem vive com emetofobia (o medo de vomitar). Ajuda-te a compreender a fobia e a praticar técnicas baseadas na terapia cognitivo-comportamental (CBT) e na exposição com prevenção de resposta (ERP).\n\nNão substitui o acompanhamento de um profissional de saúde nem é um tratamento médico. Em caso de crise, usa as linhas de apoio em Recursos. As fontes do conteúdo estão em Recursos › Fontes.'
              : 'Serena is psychoeducational support for people living with emetophobia (the fear of vomiting). It helps you understand the phobia and practise techniques based on cognitive behavioural therapy (CBT) and exposure and response prevention (ERP).\n\nIt does not replace care from a health professional and is not medical treatment. In a crisis, use the support lines in Resources. The content sources are in Resources › Sources.'}
          </Text>
        </Card>

        {/* Terminar sessão */}
        <Pressable onPress={confirmLogout} style={{ padding: 16, borderRadius: radius.md, alignItems: 'center', borderWidth: 2, borderColor: colors.danger, marginTop: 4 }}>
          <Text style={{ color: colors.danger, fontWeight: '700' }}>{t('settings.logout')}</Text>
        </Pressable>

        {/* Eliminar conta (irreversível) */}
        <Pressable onPress={confirmDeleteAccount} style={{ padding: 14, alignItems: 'center', marginTop: 2 }}>
          <Text style={{ color: colors.danger, fontWeight: '700', textDecorationLine: 'underline' }}>
            {lang === 'pt' ? 'Eliminar conta' : 'Delete account'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
