import { useRouter } from 'expo-router';
import SettingsScreen from '../components/SettingsScreen';
import { useData } from '../store/DataContext';

export default function Route() {
  const router = useRouter();
  const { data, updateData } = useData();
  return (
    <SettingsScreen
      onBack={() => router.back()}
      data={data!}
      onUpdate={updateData}
      onOpenPrivacy={() => router.push('/privacy')}
      onOpenChoices={() => router.push('/choices')}
      onOpenProfile={() => router.push('/profile')}
    />
  );
}
