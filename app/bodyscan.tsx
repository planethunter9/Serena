import { useRouter } from 'expo-router';
import BodyScanScreen from '../components/BodyScanScreen';

export default function Route() {
  const router = useRouter();
  return <BodyScanScreen onBack={() => router.back()} />;
}
