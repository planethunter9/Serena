// Rota /companion → modo acompanhante.
import { useRouter } from 'expo-router';
import CompanionScreen from '../components/CompanionScreen';

export default function CompanionRoute() {
  const router = useRouter();
  return <CompanionScreen onBack={() => router.back()} />;
}
