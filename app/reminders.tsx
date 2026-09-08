import { useRouter } from 'expo-router';
import RemindersScreen from '../components/RemindersScreen';

export default function Route() {
  const router = useRouter();
  return <RemindersScreen onBack={() => router.back()} />;
}
