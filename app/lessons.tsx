import { useRouter } from 'expo-router';
import LessonsScreen from '../components/LessonsScreen';

export default function Route() {
  const router = useRouter();
  return <LessonsScreen onBack={() => router.back()} />;
}
