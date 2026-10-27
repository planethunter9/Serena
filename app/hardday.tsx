// Rota /hardday → plano para dias difíceis.
import { useRouter } from 'expo-router';
import HardDayPlanScreen from '../components/HardDayPlanScreen';

export default function HardDayRoute() {
  const router = useRouter();
  return <HardDayPlanScreen onBack={() => router.back()} />;
}
