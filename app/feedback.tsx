// Rota /feedback → caixa de sugestões.
import { useRouter } from 'expo-router';
import FeedbackScreen from '../components/FeedbackScreen';

export default function FeedbackRoute() {
  const router = useRouter();
  return <FeedbackScreen onBack={() => router.back()} />;
}
