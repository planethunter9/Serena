// Ecrã de entrada (gate): decide entre login, onboarding e a app principal.
// A app principal (MainApp) fica nesta rota "/"; os outros ecrãs abrem POR CIMA
// como rotas próprias (settings, profile, etc.), com animação nativa.
// O tutorial de abertura (coach marks) corre dentro do MainApp, por isso
// envolvemo-lo no CoachProvider.

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import AuthScreen from '../components/AuthScreen';
import { CoachProvider } from '../components/CoachMarks';
import MainApp from '../components/MainApp';
import Onboarding from '../components/Onboarding';
import { useData } from '../store/DataContext';
import { useTheme } from '../theme/ThemeContext';

export default function Index() {
  const { colors } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const { data, loading: dataLoading, updateData } = useData();
  const router = useRouter();

  // Se a sessão terminar com ecrãs abertos por cima, fecha-os para mostrar o login.
  useEffect(() => {
    if (!authLoading && !user) {
      try {
        if (router.canDismiss?.()) router.dismissAll();
      } catch {}
    }
  }, [user, authLoading]);

  if (authLoading || (user && dataLoading)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!user) return <AuthScreen />;
  if (!data) return <Onboarding onComplete={updateData} />;
  return (
    <CoachProvider>
      <MainApp />
    </CoachProvider>
  );
}
