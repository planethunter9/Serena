// Consentimento explícito para o tratamento de dados de saúde (RGPD, art. 9.º).
// Aparece depois de entrar na conta e antes do questionário inicial (e uma vez a
// quem já tinha conta). Inclui o aviso "não substitui um profissional". Sem as três caixas, não se pode usar a app — a pessoa
// pode sair da conta ou eliminá-la.

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { Lang, useLang } from '../i18n/i18n';
import { CONSENT_VERSION, saveHealthConsent } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { disclaimer } from '../data/disclaimer';
import DisclaimerCard from './DisclaimerCard';
import PrivacyScreen from './PrivacyScreen';
import Animated from 'react-native-reanimated';
import { enterItem, FadeInItem, PressableScale, tapHaptic } from '../lib/motion';
import { checkPop, PrimaryButton } from './ui';

type Txt = {
  title: string; intro: string; points: string[];
  policy: string; readPolicy: string; health: string; accept: string; decline: string;
  declineTitle: string; declineBody: string; signOut: string; deleteAcc: string; cancel: string;
  deleteConfirm: string; checked: string; unchecked: string;
};

const TXT: Record<Lang, Txt> = {
  pt: {
    title: 'Antes de começares',
    intro: 'A Serena vai guardar o que registares — sessões de exercícios, níveis de desconforto, sintomas, diário. Isto são dados de saúde, por isso precisamos do teu consentimento explícito.',
    points: [
      'Usamos estes dados só para a app funcionar e para guardar o teu progresso.',
      'Ficam no teu telemóvel e numa cópia de segurança associada à tua conta.',
      'Não há publicidade nem partilha com terceiros.',
      'Podes exportar ou apagar tudo quando quiseres (Definições).',
    ],
    policy: 'Li e aceito a Política de Privacidade.',
    readPolicy: 'Ler a política',
    health: 'Dou o meu consentimento explícito para a Serena tratar os dados de saúde que eu registar, para me prestar o serviço. Posso retirá-lo a qualquer momento eliminando a conta.',
    accept: 'Aceitar e continuar',
    decline: 'Não aceito',
    declineTitle: 'Sem consentimento não é possível usar a app',
    declineBody: 'A Serena precisa de guardar o que registas para funcionar. Podes sair da conta ou eliminá-la.',
    signOut: 'Sair da conta', deleteAcc: 'Eliminar conta', cancel: 'Voltar',
    deleteConfirm: 'A conta e todos os dados serão apagados de forma definitiva.',
    checked: 'marcado', unchecked: 'não marcado',
  },
  'pt-BR': {
    title: 'Antes de começar',
    intro: 'O Serena vai guardar o que você registrar — sessões de exercícios, níveis de desconforto, sintomas, diário. Isso são dados de saúde, por isso precisamos do seu consentimento explícito.',
    points: [
      'Usamos esses dados só para o app funcionar e para guardar seu progresso.',
      'Eles ficam no seu celular e em uma cópia de segurança associada à sua conta.',
      'Não há anúncios nem compartilhamento com terceiros.',
      'Você pode exportar ou apagar tudo quando quiser (Configurações).',
    ],
    policy: 'Li e aceito a Política de Privacidade.',
    readPolicy: 'Ler a política',
    health: 'Dou meu consentimento explícito para o Serena tratar os dados de saúde que eu registrar, para me prestar o serviço. Posso retirá-lo a qualquer momento excluindo a conta.',
    accept: 'Aceitar e continuar',
    decline: 'Não aceito',
    declineTitle: 'Sem consentimento não é possível usar o app',
    declineBody: 'O Serena precisa guardar o que você registra para funcionar. Você pode sair da conta ou apagá-la.',
    signOut: 'Sair da conta', deleteAcc: 'Apagar conta', cancel: 'Voltar',
    deleteConfirm: 'A conta e todos os dados serão apagados definitivamente.',
    checked: 'marcado', unchecked: 'não marcado',
  },
  en: {
    title: 'Before you start',
    intro: 'Serena will store what you log — exercise sessions, discomfort levels, symptoms, journal. This is health data, so we need your explicit consent.',
    points: [
      'We only use this data to run the app and keep your progress.',
      'It is stored on your phone and in a backup linked to your account.',
      'No ads and no sharing with third parties.',
      'You can export or delete everything at any time (Settings).',
    ],
    policy: 'I have read and accept the Privacy Policy.',
    readPolicy: 'Read the policy',
    health: 'I give my explicit consent for Serena to process the health data I log, in order to provide the service. I can withdraw it at any time by deleting my account.',
    accept: 'Accept and continue',
    decline: "I don't accept",
    declineTitle: 'The app cannot be used without consent',
    declineBody: 'Serena needs to store what you log in order to work. You can sign out or delete your account.',
    signOut: 'Sign out', deleteAcc: 'Delete account', cancel: 'Back',
    deleteConfirm: 'Your account and all data will be permanently deleted.',
    checked: 'checked', unchecked: 'not checked',
  },
  es: {
    title: 'Antes de empezar',
    intro: 'Serena guardará lo que registres: sesiones de ejercicios, niveles de malestar, síntomas, diario. Son datos de salud, así que necesitamos tu consentimiento explícito.',
    points: [
      'Solo usamos estos datos para que la app funcione y guardar tu progreso.',
      'Se guardan en tu móvil y en una copia de seguridad vinculada a tu cuenta.',
      'Sin publicidad ni cesión a terceros.',
      'Puedes exportar o borrar todo cuando quieras (Ajustes).',
    ],
    policy: 'He leído y acepto la Política de privacidad.',
    readPolicy: 'Leer la política',
    health: 'Doy mi consentimiento explícito para que Serena trate los datos de salud que registre, para prestarme el servicio. Puedo retirarlo en cualquier momento eliminando la cuenta.',
    accept: 'Aceptar y continuar',
    decline: 'No acepto',
    declineTitle: 'Sin consentimiento no se puede usar la app',
    declineBody: 'Serena necesita guardar lo que registras para funcionar. Puedes cerrar sesión o eliminar la cuenta.',
    signOut: 'Cerrar sesión', deleteAcc: 'Eliminar cuenta', cancel: 'Volver',
    deleteConfirm: 'La cuenta y todos los datos se borrarán de forma definitiva.',
    checked: 'marcado', unchecked: 'sin marcar',
  },
  fr: {
    title: 'Avant de commencer',
    intro: 'Serena va conserver ce que tu enregistres : séances d\'exercices, niveaux de malaise, symptômes, journal. Ce sont des données de santé, nous avons donc besoin de ton consentement explicite.',
    points: [
      'Nous utilisons ces données uniquement pour faire fonctionner l\'app et garder tes progrès.',
      'Elles sont stockées sur ton téléphone et dans une sauvegarde liée à ton compte.',
      'Pas de publicité ni de partage avec des tiers.',
      'Tu peux tout exporter ou supprimer à tout moment (Réglages).',
    ],
    policy: 'J\'ai lu et j\'accepte la Politique de confidentialité.',
    readPolicy: 'Lire la politique',
    health: 'Je donne mon consentement explicite pour que Serena traite les données de santé que j\'enregistre, afin de me fournir le service. Je peux le retirer à tout moment en supprimant mon compte.',
    accept: 'Accepter et continuer',
    decline: 'Je refuse',
    declineTitle: 'L\'app ne peut pas être utilisée sans consentement',
    declineBody: 'Serena doit conserver ce que tu enregistres pour fonctionner. Tu peux te déconnecter ou supprimer ton compte.',
    signOut: 'Se déconnecter', deleteAcc: 'Supprimer le compte', cancel: 'Retour',
    deleteConfirm: 'Le compte et toutes les données seront supprimés définitivement.',
    checked: 'coché', unchecked: 'non coché',
  },
  de: {
    title: 'Bevor du startest',
    intro: 'Serena speichert, was du einträgst – Übungssitzungen, Unbehagen-Werte, Symptome, Tagebuch. Das sind Gesundheitsdaten, deshalb brauchen wir deine ausdrückliche Einwilligung.',
    points: [
      'Wir nutzen diese Daten nur, damit die App funktioniert und dein Fortschritt erhalten bleibt.',
      'Sie liegen auf deinem Handy und in einer Sicherung, die mit deinem Konto verknüpft ist.',
      'Keine Werbung, keine Weitergabe an Dritte.',
      'Du kannst jederzeit alles exportieren oder löschen (Einstellungen).',
    ],
    policy: 'Ich habe die Datenschutzerklärung gelesen und akzeptiere sie.',
    readPolicy: 'Erklärung lesen',
    health: 'Ich willige ausdrücklich ein, dass Serena die von mir eingetragenen Gesundheitsdaten verarbeitet, um mir den Dienst bereitzustellen. Ich kann die Einwilligung jederzeit widerrufen, indem ich mein Konto lösche.',
    accept: 'Akzeptieren und weiter',
    decline: 'Ich lehne ab',
    declineTitle: 'Ohne Einwilligung kann die App nicht genutzt werden',
    declineBody: 'Serena muss speichern, was du einträgst, um zu funktionieren. Du kannst dich abmelden oder dein Konto löschen.',
    signOut: 'Abmelden', deleteAcc: 'Konto löschen', cancel: 'Zurück',
    deleteConfirm: 'Dein Konto und alle Daten werden endgültig gelöscht.',
    checked: 'ausgewählt', unchecked: 'nicht ausgewählt',
  },
  it: {
    title: 'Prima di iniziare',
    intro: 'Serena conserverà ciò che registri: sessioni di esercizi, livelli di disagio, sintomi, diario. Sono dati sulla salute, quindi ci serve il tuo consenso esplicito.',
    points: [
      'Usiamo questi dati solo per far funzionare l\'app e conservare i tuoi progressi.',
      'Restano sul tuo telefono e in un backup collegato al tuo account.',
      'Niente pubblicità né condivisione con terzi.',
      'Puoi esportare o cancellare tutto quando vuoi (Impostazioni).',
    ],
    policy: 'Ho letto e accetto l\'Informativa sulla privacy.',
    readPolicy: 'Leggi l\'informativa',
    health: 'Do il mio consenso esplicito affinché Serena tratti i dati sulla salute che registro, per fornirmi il servizio. Posso revocarlo in qualsiasi momento eliminando l\'account.',
    accept: 'Accetta e continua',
    decline: 'Non accetto',
    declineTitle: 'Senza consenso non è possibile usare l\'app',
    declineBody: 'Serena deve conservare ciò che registri per funzionare. Puoi uscire dall\'account o eliminarlo.',
    signOut: 'Esci', deleteAcc: 'Elimina account', cancel: 'Indietro',
    deleteConfirm: 'L\'account e tutti i dati saranno eliminati definitivamente.',
    checked: 'selezionato', unchecked: 'non selezionato',
  },
  nl: {
    title: 'Voordat je begint',
    intro: 'Serena bewaart wat je bijhoudt: oefensessies, ongemakscores, symptomen, dagboek. Dit zijn gezondheidsgegevens, dus we hebben je uitdrukkelijke toestemming nodig.',
    points: [
      'We gebruiken deze gegevens alleen om de app te laten werken en je voortgang te bewaren.',
      'Ze staan op je telefoon en in een back-up die aan je account gekoppeld is.',
      'Geen advertenties en niets gedeeld met derden.',
      'Je kunt alles altijd exporteren of verwijderen (Instellingen).',
    ],
    policy: 'Ik heb het Privacybeleid gelezen en ga ermee akkoord.',
    readPolicy: 'Beleid lezen',
    health: 'Ik geef uitdrukkelijk toestemming dat Serena de gezondheidsgegevens die ik invoer verwerkt om mij de dienst te leveren. Ik kan dit altijd intrekken door mijn account te verwijderen.',
    accept: 'Akkoord en verder',
    decline: 'Ik ga niet akkoord',
    declineTitle: 'Zonder toestemming kan de app niet gebruikt worden',
    declineBody: 'Serena moet bewaren wat je bijhoudt om te kunnen werken. Je kunt uitloggen of je account verwijderen.',
    signOut: 'Uitloggen', deleteAcc: 'Account verwijderen', cancel: 'Terug',
    deleteConfirm: 'Je account en alle gegevens worden definitief verwijderd.',
    checked: 'aangevinkt', unchecked: 'niet aangevinkt',
  },
  pl: {
    title: 'Zanim zaczniesz',
    intro: 'Serena będzie przechowywać to, co zapisujesz: sesje ćwiczeń, poziomy dyskomfortu, objawy, dziennik. To dane o zdrowiu, dlatego potrzebujemy Twojej wyraźnej zgody.',
    points: [
      'Używamy tych danych tylko do działania aplikacji i zachowania Twoich postępów.',
      'Są przechowywane na Twoim telefonie i w kopii zapasowej powiązanej z kontem.',
      'Bez reklam i bez udostępniania podmiotom trzecim.',
      'W każdej chwili możesz wszystko wyeksportować lub usunąć (Ustawienia).',
    ],
    policy: 'Przeczytałem(-am) i akceptuję Politykę prywatności.',
    readPolicy: 'Przeczytaj politykę',
    health: 'Wyrażam wyraźną zgodę na przetwarzanie przez Serenę danych o zdrowiu, które zapisuję, w celu świadczenia usługi. Mogę ją w każdej chwili wycofać, usuwając konto.',
    accept: 'Akceptuję i kontynuuję',
    decline: 'Nie akceptuję',
    declineTitle: 'Bez zgody nie można korzystać z aplikacji',
    declineBody: 'Serena musi przechowywać to, co zapisujesz, aby działać. Możesz się wylogować lub usunąć konto.',
    signOut: 'Wyloguj', deleteAcc: 'Usuń konto', cancel: 'Wróć',
    deleteConfirm: 'Konto i wszystkie dane zostaną trwale usunięte.',
    checked: 'zaznaczone', unchecked: 'niezaznaczone',
  },
  ru: {
    title: 'Прежде чем начать',
    intro: 'Serena будет хранить то, что вы записываете: сеансы упражнений, уровни дискомфорта, симптомы, дневник. Это данные о здоровье, поэтому нам нужно ваше явное согласие.',
    points: [
      'Мы используем эти данные только для работы приложения и сохранения вашего прогресса.',
      'Они хранятся на вашем телефоне и в резервной копии, связанной с аккаунтом.',
      'Никакой рекламы и передачи третьим лицам.',
      'Вы можете в любой момент всё экспортировать или удалить (Настройки).',
    ],
    policy: 'Я прочитал(а) и принимаю Политику конфиденциальности.',
    readPolicy: 'Прочитать политику',
    health: 'Я даю явное согласие на обработку Serena данных о здоровье, которые я записываю, для предоставления сервиса. Я могу отозвать его в любой момент, удалив аккаунт.',
    accept: 'Принять и продолжить',
    decline: 'Не принимаю',
    declineTitle: 'Без согласия приложением пользоваться нельзя',
    declineBody: 'Serena нужно хранить ваши записи, чтобы работать. Вы можете выйти из аккаунта или удалить его.',
    signOut: 'Выйти', deleteAcc: 'Удалить аккаунт', cancel: 'Назад',
    deleteConfirm: 'Аккаунт и все данные будут удалены навсегда.',
    checked: 'отмечено', unchecked: 'не отмечено',
  },
};

function Check({ checked, label, onToggle, stateLabel }: { checked: boolean; label: string; onToggle: () => void; stateLabel: string }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={() => { tapHaptic(); onToggle(); }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      accessibilityValue={{ text: stateLabel }}
      style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: spacing.md, borderRadius: radius.md, borderWidth: 2, borderColor: checked ? colors.primary : colors.border, backgroundColor: checked ? colors.primarySoft : colors.card }}
    >
      <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: checked ? colors.primary : colors.border, backgroundColor: checked ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
        {checked && (
          <Animated.View entering={checkPop}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </Animated.View>
        )}
      </View>
      <Text style={{ color: colors.text, fontSize: 15, lineHeight: 21, flex: 1 }}>{label}</Text>
    </PressableScale>
  );
}

export default function ConsentScreen({ onAccepted }: { onAccepted: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const { signOut, deleteAccount } = useAuth();
  const insets = useSafeAreaInsets();
  const x = TXT[lang] ?? TXT.en;

  const [policyOk, setPolicyOk] = useState(false);
  const [healthOk, setHealthOk] = useState(false);
  const [ackOk, setAckOk] = useState(false);
  const d = disclaimer(lang);
  const [showPolicy, setShowPolicy] = useState(false);
  const [busy, setBusy] = useState(false);

  if (showPolicy) return <PrivacyScreen onBack={() => setShowPolicy(false)} />;

  async function accept() {
    setBusy(true);
    await saveHealthConsent({ version: CONSENT_VERSION, acceptedAt: new Date().toISOString() });
    setBusy(false);
    onAccepted();
  }

  function decline() {
    Alert.alert(x.declineTitle, x.declineBody, [
      { text: x.cancel, style: 'cancel' },
      { text: x.signOut, onPress: () => { signOut(); } },
      {
        text: x.deleteAcc, style: 'destructive', onPress: () =>
          Alert.alert(x.deleteAcc, x.deleteConfirm, [
            { text: x.cancel, style: 'cancel' },
            { text: x.deleteAcc, style: 'destructive', onPress: () => { deleteAccount().catch(() => signOut()); } },
          ]),
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl, gap: spacing.lg }}>
        <Animated.View entering={enterItem(0)} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="shield-checkmark-outline" size={28} color={colors.primary} />
        </Animated.View>
        <Animated.Text entering={enterItem(1)} accessibilityRole="header" style={{ color: colors.text, fontSize: 26, fontWeight: '700' }}>{x.title}</Animated.Text>
        <Animated.Text entering={enterItem(2)} style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{x.intro}</Animated.Text>

        <Animated.View entering={enterItem(3)} style={{ gap: 8, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg }}>
          {x.points.map((p) => (
            <View key={p} style={{ flexDirection: 'row', gap: 10 }}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} style={{ marginTop: 2 }} />
              <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20, flex: 1 }}>{p}</Text>
            </View>
          ))}
        </Animated.View>

        <FadeInItem index={4}><DisclaimerCard /></FadeInItem>

        <Animated.View entering={enterItem(5)} style={{ gap: spacing.sm }}>
          <Check checked={policyOk} label={x.policy} onToggle={() => setPolicyOk((v) => !v)} stateLabel={policyOk ? x.checked : x.unchecked} />
          <Pressable onPress={() => setShowPolicy(true)} accessibilityRole="link" hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 }}>
            <Ionicons name="document-text-outline" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14, textDecorationLine: 'underline' }}>{x.readPolicy}</Text>
          </Pressable>
          <Check checked={healthOk} label={x.health} onToggle={() => setHealthOk((v) => !v)} stateLabel={healthOk ? x.checked : x.unchecked} />
          <Check checked={ackOk} label={d.ack} onToggle={() => setAckOk((v) => !v)} stateLabel={ackOk ? x.checked : x.unchecked} />
        </Animated.View>

        <PrimaryButton label={x.accept} onPress={accept} disabled={!policyOk || !healthOk || !ackOk || busy} />
        <Pressable onPress={decline} accessibilityRole="button" style={{ alignItems: 'center', padding: 12 }}>
          <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: 15 }}>{x.decline}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
