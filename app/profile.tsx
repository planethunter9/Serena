import { useRouter } from 'expo-router';
import ProfileScreen from '../components/ProfileScreen';
import { useData } from '../store/DataContext';

export default function Route() {
  const router = useRouter();
  const { data } = useData();
  return <ProfileScreen onBack={() => router.back()} data={data!} />;
}
