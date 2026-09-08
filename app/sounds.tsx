import { useLocalSearchParams, useRouter } from 'expo-router';
import SoundsScreen from '../components/SoundsScreen';

export default function Route() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: 'calm' | 'sleep' }>();
  return <SoundsScreen onBack={() => router.back()} category={category === 'sleep' ? 'sleep' : 'calm'} />;
}
