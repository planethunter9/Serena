// Rota /appicon → ecrã de escolha do ícone da app.
import { useRouter } from 'expo-router';
import AppIconScreen from '../components/AppIconScreen';

export default function AppIconRoute() {
  const router = useRouter();
  return <AppIconScreen onBack={() => router.back()} />;
}
