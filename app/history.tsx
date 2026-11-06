// Rota /history?kind=… → histórico de sessões (só consulta), opcionalmente filtrado.
import { useLocalSearchParams, useRouter } from 'expo-router';
import HistoryScreen from '../components/HistoryScreen';

export default function HistoryRoute() {
  const router = useRouter();
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  return <HistoryScreen initialKind={kind} onBack={() => router.back()} />;
}
