// Rota /report — "Resumo para a consulta" (PDF).
import { useRouter } from 'expo-router';
import ReportScreen from '../components/ReportScreen';

export default function ReportRoute() {
  const router = useRouter();
  return <ReportScreen onBack={() => router.back()} />;
}
