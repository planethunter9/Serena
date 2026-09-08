import { useRouter } from 'expo-router';
import GoalsScreen from '../components/GoalsScreen';

export default function Route() {
  const router = useRouter();
  return <GoalsScreen onBack={() => router.back()} />;
}
