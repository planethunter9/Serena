import { useRouter } from 'expo-router';
import { RainbowScreen } from '../components/ColorTechniques';

export default function Route() {
  const router = useRouter();
  return <RainbowScreen onBack={() => router.back()} />;
}
