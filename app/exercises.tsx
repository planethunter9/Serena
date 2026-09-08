import { useRouter } from 'expo-router';
import ExercisesScreen from '../components/ExercisesScreen';

export default function Route() {
  const router = useRouter();
  return <ExercisesScreen onBack={() => router.back()} />;
}
