import { useRouter } from 'expo-router';
import ReciteScreen from '../components/ReciteScreen';

export default function Route() {
  const router = useRouter();
  return <ReciteScreen onBack={() => router.back()} />;
}
