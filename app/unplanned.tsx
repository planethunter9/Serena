import { useRouter } from 'expo-router';
import UnplannedScreen from '../components/UnplannedScreen';

export default function Route() {
  const router = useRouter();
  return <UnplannedScreen onBack={() => router.back()} />;
}
