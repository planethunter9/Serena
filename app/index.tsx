// Ecrã de entrada (gate): decide entre login, consentimento (dados de saúde),
// onboarding e a app principal.
// A app principal (MainApp) fica nesta rota "/"; os outros ecrãs abrem POR CIMA
// como rotas próprias (settings, profile, etc.), com animação nativa.
// O tutorial de abertura (coach marks) corre dentro do MainApp, por isso
// envolvemo-lo no CoachProvider.

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import AuthScreen from '../components/AuthScreen';
import ConsentScreen from '../components/ConsentScreen';
import { CoachProvider } from '../components/CoachMarks';
import MainApp from '../components/MainApp';
import Onboarding from '../components/Onboarding';
import { CONSENT_VERSION, loadHealthConsent } from '../storage/storage';
import { useData } from '../store/DataContext';
import { useTheme } from '../theme/ThemeContext';

export default function Index() {
  const { colors } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const { data, loading: dataLoading, updateData } = useData();
  const router = useRouter();
  // Consentimento para dados de saúde do utilizador atual: null = a verificar.
  const [consent, setConsent] = useState<{ userId: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    loadHealthConsent().then((c) => {
      if (active) setConsent({ userId: user.id, ok: !!c && c.version >= CONSENT_VERSION });
    });
    return () => { active = false; };
  }, [user]);
  const consentReady = !!user && consent?.userId === user.id;

  // Se a sessão terminar com ecrãs abertos por cima, fecha-os para mostrar o login.
  useEffect(() => {
    if (!authLoading && !user) {
      try {
        if (router.canDismiss?.()) router.dismissAll();
      } catch {}
    }
  }, [user, authLoading, router]);

  if (authLoading || (user && (dataLoading || !consentReady))) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!user) return <AuthScreen />;
  if (!consent?.ok) return <ConsentScreen onAccepted={() => setConsent({ userId: user.id, ok: true })} />;
  if (!data) return <Onboarding onComplete={updateData} />;
  return (
    <CoachProvider>
      <MainApp />
    </CoachProvider>
  );
}
