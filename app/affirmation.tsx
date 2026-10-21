// Rota /affirmation → ecrã da afirmação do dia.
import { useRouter } from 'expo-router';
import AffirmationScreen from '../components/AffirmationScreen';

export default function AffirmationRoute() {
  const router = useRouter();
  return <AffirmationScreen onBack={() => router.back()} />;
}
