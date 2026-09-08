import { useLocalSearchParams, useRouter } from 'expo-router';
import ResourceDetail from '../components/ResourceDetail';

export default function Route() {
  const router = useRouter();
  const { title } = useLocalSearchParams<{ title: string }>();
  return <ResourceDetail onBack={() => router.back()} title={String(title ?? '')} />;
}
