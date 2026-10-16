import { useRouter } from 'expo-router';
import FeedingScreen from '../components/FeedingScreen';

export default function Route() {
  const router = useRouter();
  return <FeedingScreen onBack={() => router.back()} />;
}
