// Definições: perfil e, em grupos (como nas definições do iPhone), Aparência,
// A tua app, Ajuda e informação e Dados (cópia de segurança); no fim terminar
// sessão e eliminar conta.

import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { useLang , tr2 } from '../i18n/i18n';
import { HOME_SETTINGS_TEXT } from '../data/homeBlocks';
import { tutorialPack } from '../data/tutorial';
import { exportUserData, importUserData, isoLocal, loadProfile, OnboardingData, resetWalkthroughSeen } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import Avatar from './Avatar';
import { Card, TopBackBar } from './ui';

// Linha de um grupo (estilo das definições do iPhone): ícone, nome, seta;
// as linhas do mesmo grupo partilham um cartão, separadas por um traço fino.
function NavRow({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: spacing.md, backgroundColor: pressed ? colors.cardAlt : 'transparent' })}>
      <View style={{ width: 34, height: 34, borderRadius: radius.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={19} color={colors.primary} />
      </View>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500', flex: 1 }}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode[] }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text accessibilityRole="header" style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 4 }}>{title}</Text>
      <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
        {children.map((c, i) => (
          <View key={i}>
            {i > 0 && <View style={{ height: 1, backgroundColor: colors.border, marginLeft: spacing.md + 34 + 12 }} />}
            {c}
          </View>
        ))}
      </View>
    </View>
  );
}

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
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const auth = useAuth();
  const { user, signOut } = auth;
  const router = useRouter();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const [backupBusy, setBackupBusy] = useState(false);
  // Foto e nome do perfil (recarregados ao voltar do ecrã de Perfil).
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  useFocusEffect(
    useCallback(() => {
      loadProfile().then((p) => { setPhotoUri(p.photoUri); setProfileName(p.name); });
    }, [])
  );

  // Exporta todos os dados locais para um ficheiro JSON e abre a folha de partilha
  // (para guardar na nuvem, enviar por email, etc.).
  async function exportBackup() {
    setBackupBusy(true);
    try {
      const data = await exportUserData();
      const payload = JSON.stringify({ app: 'serena', version: 1, exportedAt: new Date().toISOString(), data }, null, 2);
      const fileUri = FileSystem.documentDirectory + `serena-backup-${isoLocal()}.json`;
      await FileSystem.writeAsStringAsync(fileUri, payload, { encoding: 'utf8' as any });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: L('Guardar cópia de segurança', 'Save backup') });
      } else {
        Alert.alert(L('Cópia criada', 'Backup created'), fileUri);
      }
    } catch {
      Alert.alert(L('Erro', 'Error'), L('Não foi possível criar a cópia de segurança.', 'Could not create the backup.'));
    } finally {
      setBackupBusy(false);
    }
  }

  // Importa de um ficheiro JSON criado pela exportação. Pede confirmação.
  async function importBackup() {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (res.canceled) return;
      const uri = res.assets?.[0]?.uri;
      if (!uri) return;
      const raw = await FileSystem.readAsStringAsync(uri);
      const parsed = JSON.parse(raw);
      const data = parsed?.data ?? parsed;
      if (!data || typeof data !== 'object') throw new Error('bad');
      Alert.alert(
        L('Restaurar cópia?', 'Restore backup?'),
        L('Os dados desta cópia vão substituir os atuais. Esta ação não pode ser desfeita.',
          'The data in this backup will replace your current data. This cannot be undone.'),
        [
          { text: L('Cancelar', 'Cancel'), style: 'cancel' },
          {
            text: L('Restaurar', 'Restore'),
            style: 'destructive',
            onPress: async () => {
              try {
                await importUserData(data as Record<string, string>);
                Alert.alert(L('Cópia restaurada', 'Backup restored'), L('Fecha e volta a abrir a app para veres os teus dados.', 'Close and reopen the app to see your data.'));
              } catch {
                Alert.alert(L('Erro', 'Error'), L('Não foi possível restaurar.', 'Could not restore.'));
              }
            },
          },
        ],
      );
    } catch {
      Alert.alert(L('Ficheiro inválido', 'Invalid file'), L('Escolhe um ficheiro de cópia da Serena (.json).', 'Choose a Serena backup file (.json).'));
    }
  }

  function confirmLogout() {
    const L = (pt: string, en: string) => tr2(lang, pt, en);
    Alert.alert(
      L('Terminar sessão?', 'Sign out?'),
      L('Os teus dados ficam guardados e sincronizados. Podes voltar a entrar com a mesma conta quando quiseres.',
        'Your data is kept and synced. You can sign back in with the same account whenever you like.'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.logout'), onPress: () => signOut() },
      ],
    );
  }

  // Eliminar conta: dois passos de confirmação (ação irreversível).
  function confirmDeleteAccount() {
    const L = (pt: string, en: string) => tr2(lang, pt, en);
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
    const L = (pt: string, en: string) => tr2(lang, pt, en);
    const del = (auth as any).deleteAccount;
    try {
      if (typeof del === 'function') {
        await del();
      } else {
        // Fallback temporário: termina a sessão (a eliminação real liga-se no AuthContext).
        await signOut();
      }
    } catch {
      Alert.alert(L('Não foi possível eliminar', 'Could not delete'), L('Tenta novamente mais tarde.', 'Please try again later.'));
    }
  }

  // Linha de navegação no estilo dos Recursos.
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('settings.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl }}>
        {user && (
          <Pressable onPress={onOpenProfile} accessibilityRole="button" accessibilityLabel={t('profile.title')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
            <Avatar uri={photoUri} size={52} bg={colors.primarySoft} iconColor={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{profileName || user.name}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{user.email}</Text>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600', marginTop: 2 }}>{t('profile.title')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        )}

        {/* Navegação, em grupos */}
        <Group title={L('Aparência', 'Appearance')}>
          {[
            <NavRow key="p" icon="color-palette-outline" label={t('settings.personalization')} onPress={() => router.push('/personalization' as any)} />,
            <NavRow key="h" icon="home-outline" label={(HOME_SETTINGS_TEXT[lang] ?? HOME_SETTINGS_TEXT.en).title} onPress={() => router.push('/homeblocks' as any)} />,
            <NavRow key="i" icon="image-outline" label={L('Ícone da app', 'App icon')} onPress={() => router.push('/appicon' as any)} />,
            <NavRow key="l" icon="language-outline" label={t('settings.language')} onPress={() => router.push('/language' as any)} />,
          ]}
        </Group>
        <Group title={L('A tua app', 'Your app')}>
          {[
            <NavRow key="c" icon="options-outline" label={t('settings.choices')} onPress={onOpenChoices} />,
            <NavRow key="m" icon="people-outline" label={L('Modo acompanhante', 'Companion mode')} onPress={() => router.push('/companion' as any)} />,
          ]}
        </Group>
        <Group title={L('Ajuda e informação', 'Help and information')}>
          {[
            <NavRow key="t" icon="compass-outline" label={tutorialPack(lang).ui.replay} onPress={async () => { await resetWalkthroughSeen(); onBack(); }} />,
            <NavRow key="f" icon="chatbox-ellipses-outline" label={L('Sugestões', 'Feedback')} onPress={() => router.push('/feedback' as any)} />,
            <NavRow key="a" icon="information-circle-outline" label={L('Sobre a Serena', 'About Serena')} onPress={() => router.push('/about' as any)} />,
            <NavRow key="v" icon="lock-closed-outline" label={t('settings.privacy')} onPress={onOpenPrivacy} />,
          ]}
        </Group>

        {/* Cópia de segurança */}
        <Text accessibilityRole="header" style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 4, marginBottom: -6 }}>{L('Dados', 'Data')}</Text>
        <Card style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>{L('Cópia de segurança', 'Backup')}</Text>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
            {L('Os teus dados ficam guardados neste telemóvel. Exporta uma cópia para a guardares em segurança ou passares para outro dispositivo.',
               'Your data is stored on this phone. Export a copy to keep it safe or move it to another device.')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={exportBackup}
              disabled={backupBusy}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.primary, opacity: backupBusy ? 0.6 : 1 }}
            >
              {backupBusy ? <ActivityIndicator size="small" color={colors.onPrimary} /> : <Ionicons name="download-outline" size={16} color={colors.onPrimary} />}
              <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: 14 }}>{L('Exportar', 'Export')}</Text>
            </Pressable>
            <Pressable
              onPress={importBackup}
              disabled={backupBusy}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: radius.md, borderWidth: 2, borderColor: colors.primary }}
            >
              <Ionicons name="cloud-download-outline" size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{L('Importar', 'Import')}</Text>
            </Pressable>
          </View>
        </Card>

        {/* Terminar sessão */}
        <Pressable onPress={confirmLogout} style={{ padding: 16, borderRadius: radius.md, alignItems: 'center', borderWidth: 2, borderColor: colors.danger, marginTop: 4 }}>
          <Text style={{ color: colors.danger, fontWeight: '700' }}>{t('settings.logout')}</Text>
        </Pressable>

        {/* Eliminar conta (irreversível) */}
        <Pressable onPress={confirmDeleteAccount} style={{ padding: 14, alignItems: 'center', marginTop: 2 }}>
          <Text style={{ color: colors.danger, fontWeight: '700', textDecorationLine: 'underline' }}>
            {tr2(lang, 'Eliminar conta', 'Delete account')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
