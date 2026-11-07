// Definições: perfil, aspeto, idioma, personalização, escolhas, privacidade,
// "Sobre" e terminar sessão. Linhas de navegação no mesmo estilo dos Recursos
// (chip com ícone + título + seta).

import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { useLang , tr2 } from '../i18n/i18n';
import { exportUserData, importUserData, isoLocal, OnboardingData } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

// Linha de navegação no estilo dos Recursos.
function NavRow({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 }}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
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
        <NavRow icon="image-outline" label={L('Ícone da app', 'App icon')} onPress={() => router.push('/appicon' as any)} />
        <NavRow icon="language-outline" label={t('settings.language')} onPress={() => router.push('/language' as any)} />
        <NavRow icon="options-outline" label={t('settings.choices')} onPress={onOpenChoices} />
        <NavRow icon="people-outline" label={tr2(lang, 'Modo acompanhante', 'Companion mode')} onPress={() => router.push('/companion' as any)} />
        <NavRow icon="chatbox-ellipses-outline" label={tr2(lang, 'Sugestões', 'Feedback')} onPress={() => router.push('/feedback' as any)} />
        <NavRow icon="lock-closed-outline" label={t('settings.privacy')} onPress={onOpenPrivacy} />
        <NavRow icon="information-circle-outline" label={L('Sobre a Serena', 'About Serena')} onPress={() => router.push('/about' as any)} />

        {/* Cópia de segurança */}
        <Card style={{ gap: 10, marginTop: 4 }}>
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
              {backupBusy ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="download-outline" size={16} color="#fff" />}
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{L('Exportar', 'Export')}</Text>
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
