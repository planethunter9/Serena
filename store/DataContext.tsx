// Store partilhado dos dados do onboarding, para as rotas os acederem sem props.
// (Equivalente ao useStore() da app dos Gastos.)

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { loadOnboarding, OnboardingData, saveOnboarding } from '../storage/storage';

type DataContextValue = {
  data: OnboardingData | null;
  loading: boolean;
  updateData: (d: OnboardingData) => Promise<void>;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  // Recarrega o onboarding do utilizador sempre que o utilizador muda.
  useEffect(() => {
    let active = true;
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadOnboarding().then((d) => {
      if (active) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [user]);

  async function updateData(d: OnboardingData) {
    await saveOnboarding(d);
    setData(d);
  }

  return <DataContext.Provider value={{ data, loading, updateData }}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData tem de ser usado dentro de <DataProvider>');
  return ctx;
}
