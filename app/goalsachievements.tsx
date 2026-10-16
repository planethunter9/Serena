// Rota /goalsachievements — wrapper para o ecrã combinado Conquistas + Objetivos.
// Coloca este ficheiro em app/goalsachievements.tsx
// (ajusta o caminho do import se os teus ecrãs não estiverem em ../components/)

import { useRouter } from 'expo-router';
import GoalsAchievements from '../components/GoalsAchievements';

export default function GoalsAchievementsRoute() {
  const router = useRouter();
  return <GoalsAchievements onBack={() => router.back()} />;
}
