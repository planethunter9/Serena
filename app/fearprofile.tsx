import { useRouter } from 'expo-router';
import FearProfileScreen from '../components/FearProfileScreen';
import { useData } from '../store/DataContext';

export default function Route() {
  const router = useRouter();
  const { data } = useData();
  return <FearProfileScreen onBack={() => router.back()} data={data!} />;
}
