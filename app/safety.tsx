import { useRouter } from 'expo-router';
import SafetyScreen from '../components/SafetyScreen';

export default function Route() {
  const router = useRouter();
  return <SafetyScreen onBack={() => router.back()} />;
}
