// Rota /citations — wrapper para o ecrã das fontes/citações.
// Coloca este ficheiro em app/citations.tsx
// (ajusta o caminho do import se os teus ecrãs não estiverem em ../components/)

import { useRouter } from 'expo-router';
import CitationsScreen from '../components/CitationsScreen';

export default function CitationsRoute() {
  const router = useRouter();
  return <CitationsScreen onBack={() => router.back()} />;
}
