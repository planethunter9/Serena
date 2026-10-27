// Rota /plans → "Os meus planos" (dias difíceis + prevenção de recaída).
import { useRouter } from 'expo-router';
import PlansScreen from '../components/PlansScreen';

export default function PlansRoute() {
  const router = useRouter();
  return <PlansScreen onBack={() => router.back()} />;
}
