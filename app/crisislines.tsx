// Rota /crisislines — wrapper para o ecrã das linhas de apoio.
// Coloca este ficheiro em app/crisislines.tsx
import { useRouter } from 'expo-router';
import CrisisLinesScreen from '../components/CrisisLinesScreen';

export default function CrisisLinesRoute() {
  const router = useRouter();
  return <CrisisLinesScreen onBack={() => router.back()} />;
}
