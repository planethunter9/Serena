// Rota /relapse → ecrã do plano de prevenção de recaída.
import { useRouter } from 'expo-router';
import RelapsePlanScreen from '../components/RelapsePlanScreen';

export default function RelapseRoute() {
  const router = useRouter();
  return <RelapsePlanScreen onBack={() => router.back()} />;
}
