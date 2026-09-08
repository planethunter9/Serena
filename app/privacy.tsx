import { useRouter } from 'expo-router';
import PrivacyScreen from '../components/PrivacyScreen';

export default function Route() {
  const router = useRouter();
  return <PrivacyScreen onBack={() => router.back()} />;
}
