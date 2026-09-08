import { useRouter } from 'expo-router';
import PositiveTalkScreen from '../components/PositiveTalkScreen';

export default function Route() {
  const router = useRouter();
  return <PositiveTalkScreen onBack={() => router.back()} />;
}
