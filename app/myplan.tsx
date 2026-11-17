// Rota /myplan → "Ver o meu plano" (plano para dias difíceis em modo de leitura).
import { useRouter } from 'expo-router';
import MyPlanScreen from '../components/MyPlanScreen';

export default function MyPlanRoute() {
  const router = useRouter();
  return <MyPlanScreen onBack={() => router.back()} />;
}
