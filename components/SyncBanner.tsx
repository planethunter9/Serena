// Aviso "sem ligação": aparece quando a cópia na cloud não consegue ser
// atualizada (sem rede, servidor em baixo, projeto pausado…). Os dados estão
// sempre guardados no telemóvel; o aviso só explica que ainda não foram
// enviados e deixa tentar de novo. A app volta a tentar sozinha.

import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { Lang, useLang } from '../i18n/i18n';
import { getSyncStatus, retrySyncNow, subscribeSyncStatus, SyncStatus } from '../lib/sync';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

type T = { title: string; body: string; retry: string; done: string; hide: string };
const TXT: Record<Lang, T> = {
  pt: { title: 'Sem ligação', body: 'As tuas alterações estão guardadas no telemóvel e serão enviadas quando houver rede.', retry: 'Tentar agora', done: 'Sincronizado', hide: 'Esconder aviso' },
  'pt-BR': { title: 'Sem conexão', body: 'Suas alterações estão salvas no celular e serão enviadas quando houver internet.', retry: 'Tentar agora', done: 'Sincronizado', hide: 'Ocultar aviso' },
  en: { title: 'No connection', body: 'Your changes are saved on this phone and will be uploaded when you are back online.', retry: 'Try now', done: 'Synced', hide: 'Hide notice' },
  es: { title: 'Sin conexión', body: 'Tus cambios están guardados en el móvil y se enviarán cuando vuelva la conexión.', retry: 'Reintentar', done: 'Sincronizado', hide: 'Ocultar aviso' },
  fr: { title: 'Pas de connexion', body: 'Tes modifications sont enregistrées sur le téléphone et seront envoyées dès que le réseau revient.', retry: 'Réessayer', done: 'Synchronisé', hide: "Masquer l'avis" },
  de: { title: 'Keine Verbindung', body: 'Deine Änderungen sind auf dem Handy gespeichert und werden gesendet, sobald du wieder online bist.', retry: 'Erneut versuchen', done: 'Synchronisiert', hide: 'Hinweis ausblenden' },
  it: { title: 'Nessuna connessione', body: 'Le tue modifiche sono salvate sul telefono e verranno inviate quando tornerà la rete.', retry: 'Riprova', done: 'Sincronizzato', hide: 'Nascondi avviso' },
  nl: { title: 'Geen verbinding', body: 'Je wijzigingen staan op je telefoon en worden verstuurd zodra je weer online bent.', retry: 'Opnieuw proberen', done: 'Gesynchroniseerd', hide: 'Melding verbergen' },
  pl: { title: 'Brak połączenia', body: 'Zmiany są zapisane na telefonie i zostaną wysłane, gdy wróci internet.', retry: 'Spróbuj teraz', done: 'Zsynchronizowano', hide: 'Ukryj komunikat' },
  ru: { title: 'Нет соединения', body: 'Изменения сохранены на телефоне и будут отправлены, когда появится интернет.', retry: 'Повторить', done: 'Синхронизировано', hide: 'Скрыть уведомление' },
};

export default function SyncBanner() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const x = TXT[lang] ?? TXT.en;

  const [status, setStatus] = useState<SyncStatus>(getSyncStatus());
  const [busy, setBusy] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => subscribeSyncStatus((s) => {
    setStatus((prev) => {
      // Mostra "Sincronizado" por uns segundos quando a ligação volta.
      if (prev === 'offline' && s === 'ok') {
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 2500);
      }
      return s;
    });
    if (s === 'offline') setHidden(false); // nova falha volta a mostrar o aviso
  }), []);

  if (!user) return null;
  const offline = status === 'offline' && !hidden;
  if (!offline && !justSynced) return null;

  // No ecrã inicial há a barra de separadores flutuante: o aviso fica por cima dela.
  const onHome = pathname === '/';
  const bottom = onHome ? (insets.bottom || 10) + 6 + 64 + 10 : (insets.bottom || 10) + 10;

  async function retry() {
    setBusy(true);
    await retrySyncNow();
    setBusy(false);
  }

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: spacing.lg, right: spacing.lg, bottom }}>
      <View
        accessibilityLiveRegion="polite"
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: justSynced && !offline ? colors.success : colors.border, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}
      >
        <Ionicons name={justSynced && !offline ? 'cloud-done-outline' : 'cloud-offline-outline'} size={22} color={justSynced && !offline ? colors.success : colors.textMuted} />
        {justSynced && !offline ? (
          <Text style={{ color: colors.success, fontWeight: '700', flex: 1 }}>{x.done}</Text>
        ) : (
          <>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{x.title}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 16 }}>{x.body}</Text>
            </View>
            <Pressable onPress={retry} disabled={busy} accessibilityRole="button" hitSlop={6} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.primarySoft }}>
              {busy ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>{x.retry}</Text>}
            </Pressable>
            <Pressable onPress={() => setHidden(true)} accessibilityRole="button" accessibilityLabel={x.hide} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
