import { useRouter } from 'expo-router';
import JournalScreen from '../components/JournalScreen';

export default function Route() {
  const router = useRouter();
  return <JournalScreen onBack={() => router.back()} />;
}
