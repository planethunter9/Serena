import { ErrorBoundaryProps, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SettingsScreen from '../components/SettingsScreen';
import { useData } from '../store/DataContext';
import { useTheme } from '../theme/ThemeContext';

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

// Se o ecrã das Definições rebentar ao abrir, mostra o erro em vez de "não
// acontecer nada" (ajuda a diagnosticar no telemóvel) e deixa voltar ou tentar de novo.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24, gap: 12 }}>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Ups — as Definições não abriram</Text>
      <Text selectable style={{ color: colors.danger, fontSize: 13 }}>{error?.message ?? String(error)}</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
        <Pressable onPress={retry} style={{ padding: 12, borderRadius: 12, backgroundColor: colors.primarySoft }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Tentar de novo</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={{ padding: 12, borderRadius: 12, backgroundColor: colors.card }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>Voltar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
