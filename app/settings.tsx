import { ErrorBoundaryProps, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SettingsScreen from '../components/SettingsScreen';
import { useData } from '../store/DataContext';
import { useLang } from '../i18n/i18n';
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

// Se o ecrã das Definições falhar ao abrir, mostra o erro em vez de "não
// acontecer nada" e deixa voltar ou tentar de novo.
const ERR: Record<string, { title: string; retry: string; back: string }> = {
  pt: { title: 'Não foi possível abrir as Definições', retry: 'Tentar de novo', back: 'Voltar' },
  'pt-BR': { title: 'Não foi possível abrir as Configurações', retry: 'Tentar de novo', back: 'Voltar' },
  en: { title: 'Settings could not be opened', retry: 'Try again', back: 'Back' },
  es: { title: 'No se han podido abrir los Ajustes', retry: 'Reintentar', back: 'Volver' },
  fr: { title: "Impossible d'ouvrir les Réglages", retry: 'Réessayer', back: 'Retour' },
  de: { title: 'Die Einstellungen konnten nicht geöffnet werden', retry: 'Erneut versuchen', back: 'Zurück' },
  it: { title: 'Impossibile aprire le Impostazioni', retry: 'Riprova', back: 'Indietro' },
  nl: { title: 'Instellingen konden niet worden geopend', retry: 'Opnieuw proberen', back: 'Terug' },
  pl: { title: 'Nie udało się otworzyć Ustawień', retry: 'Spróbuj ponownie', back: 'Wróć' },
  ru: { title: 'Не удалось открыть настройки', retry: 'Повторить', back: 'Назад' },
};

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { lang } = useLang();
  const x = ERR[lang] ?? ERR.en;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24, gap: 12 }}>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{x.title}</Text>
      <Text selectable style={{ color: colors.textMuted, fontSize: 13 }}>{error?.message ?? String(error)}</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
        <Pressable onPress={retry} style={{ padding: 12, borderRadius: 12, backgroundColor: colors.primarySoft }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{x.retry}</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={{ padding: 12, borderRadius: 12, backgroundColor: colors.card }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{x.back}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
