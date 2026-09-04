// Primeiro ecrã de todos: entrar ou criar conta.

import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { APP_NAME } from '../data/content';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import PrivacyScreen from './PrivacyScreen';
import { PrimaryButton } from './ui';

export default function AuthScreen() {
  const { colors } = useTheme();
  const { t } = useLang();
  const { signIn, signUp } = useAuth();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  function errorText(code?: string) {
    switch (code) {
      case 'exists': return t('auth.errExists');
      case 'invalid': return t('auth.errInvalid');
      case 'shortPass': return t('auth.errShortPass');
      case 'empty': return t('auth.errEmpty');
      default: return null;
    }
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

  const inputStyle = {
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
  };

  if (showPolicy) {
    return <PrivacyScreen onBack={() => setShowPolicy(false)} />;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl, paddingTop: insets.top + spacing.xl, gap: spacing.md }}>
        <Text style={{ color: colors.primary, fontSize: 34, fontWeight: '800', textAlign: 'center', marginBottom: spacing.sm }}>{APP_NAME}</Text>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' }}>
          {isSignup ? t('auth.signupTitle') : t('auth.loginTitle')}
        </Text>

        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          {isSignup && (
            <TextInput value={name} onChangeText={setName} placeholder={t('auth.name')} placeholderTextColor={colors.textMuted} style={inputStyle} autoCapitalize="words" />
          )}
          <TextInput value={email} onChangeText={setEmail} placeholder={t('auth.email')} placeholderTextColor={colors.textMuted} style={inputStyle} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />
          <TextInput value={password} onChangeText={setPassword} placeholder={t('auth.password')} placeholderTextColor={colors.textMuted} style={inputStyle} secureTextEntry />
        </View>

        {isSignup && (
          <Pressable onPress={() => setConsent((c) => !c)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.sm }}>
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

        <Pressable onPress={() => { setMode(isSignup ? 'login' : 'signup'); setError(null); }} style={{ padding: spacing.md, alignItems: 'center' }}>
          <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>
            {isSignup ? t('auth.toLogin') : t('auth.toSignup')}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
