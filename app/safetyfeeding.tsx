// Rota /safetyfeeding — wrapper para o ecrã combinado Segurança + Alimentar o medo.
// Coloca este ficheiro em app/safetyfeeding.tsx
// (ajusta o caminho do import se os teus ecrãs não estiverem em ../components/)

import { useRouter } from 'expo-router';
import SafetyFeeding from '../components/SafetyFeeding';

export default function SafetyFeedingRoute() {
  const router = useRouter();
  return <SafetyFeeding onBack={() => router.back()} />;
}
