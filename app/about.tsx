// Rota /about → ecrã "Sobre a Serena" (descrição + fontes).
import { useRouter } from 'expo-router';
import AboutScreen from '../components/AboutScreen';

export default function AboutRoute() {
  const router = useRouter();
  return <AboutScreen onBack={() => router.back()} />;
}
