// Rota /urgesurf — wrapper para o ecrã "Surfar o impulso".
// Coloca este ficheiro em app/urgesurf.tsx
import { useRouter } from 'expo-router';
import UrgeSurfScreen from '../components/UrgeSurfScreen';

export default function UrgeSurfRoute() {
  const router = useRouter();
  return <UrgeSurfScreen onBack={() => router.back()} />;
}
