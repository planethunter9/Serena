// Rota /language → ecrã de Idioma.
import { useRouter } from 'expo-router';
import LanguageScreen from '../components/LanguageScreen';

export default function LanguageRoute() {
  const router = useRouter();
  return <LanguageScreen onBack={() => router.back()} />;
}
