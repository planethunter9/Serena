// Rota /homeblocks — Definições › Ecrã inicial.
import { useRouter } from 'expo-router';
import HomeBlocksScreen from '../components/HomeBlocksScreen';

export default function HomeBlocksRoute() {
  const router = useRouter();
  return <HomeBlocksScreen onBack={() => router.back()} />;
}
