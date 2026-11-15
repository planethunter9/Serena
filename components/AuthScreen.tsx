// Primeiro ecrã de todos: entrar, criar conta ou recuperar a palavra-passe.

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { APP_NAME } from '../data/content';
import { Lang, useLang , tr2 } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import PrivacyScreen from './PrivacyScreen';
import SuccessModal from './SuccessModal';
import { PrimaryButton } from './ui';

type Mode = 'login' | 'signup' | 'reset';

// Confirmação depois de repor a palavra-passe (modal), nas 10 línguas.
const RESET_DONE: Record<Lang, { title: string; body: string; button: string }> = {
  pt: { title: 'Palavra-passe reposta', body: 'A tua palavra-passe foi alterada. Já podes iniciar sessão com a nova.', button: 'Iniciar sessão' },
  'pt-BR': { title: 'Senha redefinida', body: 'Sua senha foi alterada. Agora você já pode entrar com a nova.', button: 'Entrar' },
  en: { title: 'Password reset', body: 'Your password has been changed. You can now sign in with the new one.', button: 'Sign in' },
  es: { title: 'Contraseña restablecida', body: 'Tu contraseña se ha cambiado. Ya puedes iniciar sesión con la nueva.', button: 'Iniciar sesión' },
  fr: { title: 'Mot de passe réinitialisé', body: 'Ton mot de passe a été modifié. Tu peux maintenant te connecter avec le nouveau.', button: 'Se connecter' },
  de: { title: 'Passwort zurückgesetzt', body: 'Dein Passwort wurde geändert. Du kannst dich jetzt mit dem neuen anmelden.', button: 'Anmelden' },
  it: { title: 'Password reimpostata', body: 'La tua password è stata cambiata. Ora puoi accedere con quella nuova.', button: 'Accedi' },
  nl: { title: 'Wachtwoord opnieuw ingesteld', body: 'Je wachtwoord is gewijzigd. Je kunt nu inloggen met het nieuwe.', button: 'Inloggen' },
  pl: { title: 'Hasło zresetowane', body: 'Hasło zostało zmienione. Możesz teraz zalogować się nowym hasłem.', button: 'Zaloguj się' },
  ru: { title: 'Пароль сброшен', body: 'Пароль изменён. Теперь можно войти с новым паролем.', button: 'Войти' },
};

// Força da palavra-passe: -1 vazia, 0 fraca, 1 média, 2 forte.
// Conta critérios (comprimento, dígitos, maiúsculas+minúsculas, símbolos).
function pwScore(pw: string): number {
  if (!pw) return -1;
  if (pw.length < 6) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s <= 1 ? 0 : s <= 3 ? 1 : 2;
}

function PasswordMeter({ pw }: { pw: string }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const lvl = pwScore(pw);
  if (lvl < 0) return null;
  const labels = [L('Fraca', 'Weak'), L('Média', 'Medium'), L('Forte', 'Strong')];
  const barColors = [colors.danger, '#f59e0b', colors.success];
  const c = barColors[lvl];
  return (
    <View style={{ gap: 6, marginTop: 2 }} accessible accessibilityRole="text" accessibilityLabel={`${L('Força da palavra-passe', 'Password strength')}: ${labels[lvl]}`}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i <= lvl ? c : colors.border }} />
        ))}
      </View>
      <Text style={{ color: c, fontSize: 12, fontWeight: '600' }}>{labels[lvl]}</Text>
    </View>
  );
}

export default function AuthScreen() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const { signIn, signUp, resetPassword, confirmReset, socialSignIn } = useAuth();
  const insets = useSafeAreaInsets();
  const L = (pt: string, en: string) => tr2(lang, pt, en);

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);
  const rd = RESET_DONE[lang] ?? RESET_DONE.en;

  const isSignup = mode === 'signup';
  const isReset = mode === 'reset';

  function errorText(codeKey?: string) {
    switch (codeKey) {
      case 'exists': return t('auth.errExists');
      case 'invalid': return t('auth.errInvalid');
      case 'shortPass': return t('auth.errShortPass');
      case 'empty': return t('auth.errEmpty');
      default: return null;
    }
  }

  function goMode(m: Mode) {
    setMode(m); setError(null); setInfo(null); setResetSent(false); setCode(''); setNewPass('');
  }

  async function submit() {
    setError(null);
    setInfo(null);
    if (isSignup && !consent) {
      setError(t('auth.mustConsent'));
      return;
    }
    setBusy(true);
    const res = isSignup ? await signUp(email, name, password) : await signIn(email, password);
    setBusy(false);
    if (res.ok) return; // o gate no index troca de ecrã automaticamente
    if (res.needsConfirm) { setInfo(t('auth.checkEmail')); return; }
    setError(res.message ?? errorText(res.error) ?? t('auth.errInvalid'));
  }

  async function requestReset() {
    setError(null); setInfo(null);
    if (!email.trim()) { setError(L('Escreve o teu email primeiro.', 'Enter your email first.')); return; }
    setBusy(true);
    const res = await resetPassword(email);
    setBusy(false);
    if (res.ok) { setResetSent(true); setInfo(L('Enviámos um código para o teu email.', 'We sent a code to your email.')); }
    else setError(res.message ?? errorText(res.error) ?? L('Não foi possível enviar.', 'Could not send.'));
  }

  async function doConfirmReset() {
    setError(null); setInfo(null);
    setBusy(true);
    const res = await confirmReset(email, code, newPass);
    setBusy(false);
    // A sessão temporária é terminada: mostra a confirmação e volta ao início de sessão.
    if (res.ok) { setResetDone(true); return; }
    setError(res.message ?? errorText(res.error) ?? L('Código inválido ou expirado.', 'Invalid or expired code.'));
  }

  async function social(provider: 'google' | 'apple') {
    setError(null); setInfo(null); setBusy(true);
    const res = await socialSignIn(provider);
    setBusy(false);
    if (res.ok) return;
    if (res.message || res.error) setError(res.message ?? errorText(res.error) ?? L('Não foi possível entrar.', 'Could not sign in.'));
  }

  const inputStyle = {
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
  };

  // Medidor de força da palavra-passe (só aparece com texto escrito).
  if (showPolicy) {
    return <PrivacyScreen onBack={() => setShowPolicy(false)} />;
  }

  const title = isReset ? L('Repor palavra-passe', 'Reset password') : isSignup ? t('auth.signupTitle') : t('auth.loginTitle');

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl, paddingTop: insets.top + spacing.xl, gap: spacing.md }}>
        <Text style={{ color: colors.primary, fontSize: 34, fontWeight: '800', textAlign: 'center', marginBottom: spacing.sm }}>{APP_NAME}</Text>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' }}>{title}</Text>

        {/* ---------- RECUPERAR PALAVRA-PASSE ---------- */}
        {isReset ? (
          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            <TextInput value={email} onChangeText={setEmail} editable={!resetSent} placeholder={t('auth.email')} placeholderTextColor={colors.textMuted} style={[inputStyle, resetSent && { opacity: 0.6 }]} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />

            {resetSent && (
              <>
                <TextInput value={code} onChangeText={setCode} placeholder={L('Código do email', 'Code from email')} placeholderTextColor={colors.textMuted} style={inputStyle} keyboardType="number-pad" autoCapitalize="none" />
                <TextInput value={newPass} onChangeText={setNewPass} placeholder={L('Nova palavra-passe', 'New password')} placeholderTextColor={colors.textMuted} style={inputStyle} secureTextEntry />
                <PasswordMeter pw={newPass} />
              </>
            )}

            {error && <Text style={{ color: colors.danger, fontSize: 14, textAlign: 'center' }}>{error}</Text>}
            {info && <Text style={{ color: colors.primary, fontSize: 14, textAlign: 'center' }}>{info}</Text>}

            <View style={{ marginTop: spacing.sm }}>
              {resetSent
                ? <PrimaryButton label={L('Repor palavra-passe', 'Reset password')} onPress={doConfirmReset} disabled={busy} />
                : <PrimaryButton label={L('Enviar código', 'Send code')} onPress={requestReset} disabled={busy} />}
            </View>
            {resetSent && (
              <Pressable onPress={requestReset} disabled={busy} style={{ alignItems: 'center', paddingVertical: 6 }}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{L('Reenviar código', 'Resend code')}</Text>
              </Pressable>
            )}
            <Pressable onPress={() => goMode('login')} style={{ padding: spacing.md, alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>{L('Voltar ao início de sessão', 'Back to sign in')}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* ---------- ENTRAR / CRIAR CONTA ---------- */}
            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              {isSignup && (
                <TextInput value={name} onChangeText={setName} placeholder={t('auth.name')} placeholderTextColor={colors.textMuted} style={inputStyle} autoCapitalize="words" />
              )}
              <TextInput value={email} onChangeText={setEmail} placeholder={t('auth.email')} placeholderTextColor={colors.textMuted} style={inputStyle} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />
              <TextInput value={password} onChangeText={setPassword} placeholder={t('auth.password')} placeholderTextColor={colors.textMuted} style={inputStyle} secureTextEntry />
              {isSignup && <PasswordMeter pw={password} />}
            </View>

            {!isSignup && (
              <Pressable onPress={() => goMode('reset')} style={{ alignSelf: 'flex-end', paddingVertical: 4 }}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{L('Esqueci-me da palavra-passe', 'Forgot password?')}</Text>
              </Pressable>
            )}

            {isSignup && (
              <Pressable onPress={() => setConsent((c) => !c)} accessibilityRole="checkbox" accessibilityState={{ checked: consent }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.sm }}>
                <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: consent ? colors.primary : colors.border, backgroundColor: consent ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {consent && <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>✓</Text>}
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 13, flex: 1 }}>
                  {t('auth.consentPrefix')}{' '}
                  <Text onPress={() => setShowPolicy(true)} style={{ color: colors.primary, fontWeight: '600' }}>{t('auth.consentLink')}</Text>
                </Text>
              </Pressable>
            )}

            {error && <Text style={{ color: colors.danger, fontSize: 14, textAlign: 'center' }}>{error}</Text>}
            {info && <Text style={{ color: colors.primary, fontSize: 14, textAlign: 'center' }}>{info}</Text>}

            <View style={{ marginTop: spacing.sm }}>
              <PrimaryButton label={isSignup ? t('auth.signupCta') : t('auth.loginCta')} onPress={submit} disabled={busy} />
            </View>

            {/* Separador */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.sm }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{L('ou', 'or')}</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            </View>

            {/* Google / Apple */}
            <View style={{ gap: spacing.sm }}>
              <Pressable onPress={() => social('google')} disabled={busy} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border }}>
                <Ionicons name="logo-google" size={20} color={colors.text} />
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{L('Continuar com Google', 'Continue with Google')}</Text>
              </Pressable>
              {Platform.OS === 'ios' && (
                <Pressable onPress={() => social('apple')} disabled={busy} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: radius.md, backgroundColor: '#000' }}>
                  <Ionicons name="logo-apple" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{L('Continuar com Apple', 'Continue with Apple')}</Text>
                </Pressable>
              )}
              <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 2 }}>
                {L('Ao continuar, aceitas a política de privacidade.', 'By continuing, you accept the privacy policy.')}
              </Text>
            </View>

            <Pressable onPress={() => goMode(isSignup ? 'login' : 'signup')} style={{ padding: spacing.md, alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>
                {isSignup ? t('auth.toLogin') : t('auth.toSignup')}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <SuccessModal
        visible={resetDone}
        title={rd.title}
        body={rd.body}
        button={rd.button}
        icon="lock-open-outline"
        onClose={() => { setResetDone(false); setPassword(''); goMode('login'); }}
      />
    </KeyboardAvoidingView>
  );
}
