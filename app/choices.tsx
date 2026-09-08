import { useRouter } from 'expo-router';
import ChoicesScreen from '../components/ChoicesScreen';
import { useData } from '../store/DataContext';

export default function Route() {
  const router = useRouter();
  const { data, updateData } = useData();
  return <ChoicesScreen onBack={() => router.back()} data={data!} onUpdate={updateData} />;
}
