import { useRouter } from 'expo-router';
import BreathingScreen from '../components/BreathingScreen';

export default function Route() {
  const router = useRouter();
  return <BreathingScreen onBack={() => router.back()} />;
}
