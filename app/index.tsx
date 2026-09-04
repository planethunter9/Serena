// Ponto de entrada. Decide o que mostrar, por esta ordem:
//  1. sem sessão iniciada        -> ecrã de login/registo
//  2. com sessão, sem onboarding -> perguntas iniciais
//  3. com sessão e onboarding    -> a app principal

import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import AuthScreen from '../components/AuthScreen';
import MainApp from '../components/MainApp';
import Onboarding from '../components/Onboarding';
import { loadOnboarding, OnboardingData, saveOnboarding } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';

export default function Index() {
  const { colors } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [obLoading, setObLoading] = useState(true);
  const [data, setData] = useState<OnboardingData | null>(null);

  // Sempre que muda o utilizador, recarrega o onboarding DELE.
  useEffect(() => {
    if (!user) {
      setData(null);
      setObLoading(false);
      return;
    }
    setObLoading(true);
    loadOnboarding().then((d) => {
      setData(d);
      setObLoading(false);
    });
  }, [user]);

  function Spinner() {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (authLoading) return <Spinner />;
  if (!user) return <AuthScreen />;
  if (obLoading) return <Spinner />;
  if (!data) {
    return (
      <Onboarding
        onComplete={async (d) => {
          await saveOnboarding(d);
          setData(d);
        }}
      />
    );
  }
  return (
    <MainApp
      data={data}
      onUpdate={async (d) => {
        await saveOnboarding(d);
        setData(d);
      }}
    />
  );
}
