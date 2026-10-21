// Rota /personalization → ecrã de Personalização.
import { useRouter } from 'expo-router';
import PersonalizationScreen from '../components/PersonalizationScreen';

export default function PersonalizationRoute() {
  const router = useRouter();
  return <PersonalizationScreen onBack={() => router.back()} />;
}
