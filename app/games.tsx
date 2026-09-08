import { useRouter } from 'expo-router';
import GamesScreen from '../components/GamesScreen';

export default function Route() {
  const router = useRouter();
  return <GamesScreen onBack={() => router.back()} />;
}
