import { useRouter } from 'expo-router';
import { BalloonsScreen } from '../components/ColorTechniques';

export default function Route() {
  const router = useRouter();
  return <BalloonsScreen onBack={() => router.back()} />;
}
