import { useRouter } from 'expo-router';
import TriggerHelpScreen from '../components/TriggerHelpScreen';
import { useData } from '../store/DataContext';

export default function Route() {
  const router = useRouter();
  const { data } = useData();
  return <TriggerHelpScreen onBack={() => router.back()} data={data!} />;
}
