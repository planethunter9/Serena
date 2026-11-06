// App principal (rota "/"): barra de topo, separadores e menu Liquid Glass.
// Abrir um ecrã = router.push('/rota') -> animação nativa + gesto de voltar.

import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_NAME } from '../data/content';
import { useLang , tr2 } from '../i18n/i18n';
import { cancelUntrackedReminders, knownNotificationIds } from '../notifications/notifications';
import { loadAffirmationReminder, loadProfile, loadReminders, loadWalkthroughSeen, saveWalkthroughSeen } from '../storage/storage';
import { useCoach } from './CoachMarks';
import { useData } from '../store/DataContext';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import CalendarScreen from './CalendarScreen';
import HomeScreen from './HomeScreen';
import SupportScreen from './SupportScreen';
import ResourcesScreen from './ResourcesScreen';

type TabKey = 'home' | 'support' | 'calendar' | 'resources';

export default function MainApp() {
  const { colors, isDark } = useTheme();
  const iosMajor = Platform.OS === 'ios' ? parseInt(String(Platform.Version), 10) : 0;
  const glassSupported = iosMajor >= 26;
  const { t, lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const { data } = useData();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('home');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Coach marks (tutorial de abertura): percorre os quatro separadores,
  // mudando de ecrã em cada passo e realçando um elemento real de cada um.
  const coach = useCoach();
  useEffect(() => {
    (async () => {
      if (await loadWalkthroughSeen()) return;
      setTimeout(() => {
        coach.start(
          [
            { name: 'pillars', show: () => setTab('home'), text: L('Estes são os teus pilares. Vão-se enchendo à medida que praticas — Prática, Repetição e Aproximação.', 'These are your pillars. They fill up as you practise — Practice, Repetition and Approach.') },
            { name: 'support-now', show: () => setTab('support'), text: L('No separador Apoio tens o que precisas num momento difícil. Começa aqui, em "Agora mesmo", quando estiveres com um gatilho.', 'The Support tab has what you need in a hard moment. Start here, under "Right now", when a trigger hits.') },
            { name: 'calendar-card', show: () => setTab('calendar'), text: L('No Calendário marcas os dias: a vermelho os ataques ou comportamentos, a verde os dias em que fizeste exposição.', 'In the Calendar you mark your days: red for attacks or behaviours, green for days you did exposure.') },
            { name: 'resources-list', show: () => setTab('resources'), text: L('E em Recursos tens tudo o resto — lições, exercícios, planos e os teus registos.', 'And Resources has everything else — lessons, exercises, plans and your logs.') },
          ],
          () => { saveWalkthroughSeen(); setTab('home'); },
        );
      }, 700);
    })();
  }, []);

  // Recarrega a foto de perfil sempre que este ecrã volta a ficar em foco.
  useFocusEffect(
    useCallback(() => {
      loadProfile().then((p) => setPhotoUri(p.photoUri));
    }, [])
  );

  // No arranque: cancela notificações "fantasma" agendadas fora da lista (ex.: a
  // das 22h de uma versão anterior), mesmo que o ecrã de Lembretes nunca seja aberto.
  useEffect(() => {
    (async () => {
      try {
        const list = await loadReminders();
        const aff = await loadAffirmationReminder();
        // Lembretes desligados/eliminados não entram na lista → são cancelados.
        // A afirmação do dia entra (antes era cancelada por engano).
        await cancelUntrackedReminders(knownNotificationIds(Array.isArray(list) ? list : [], aff));
      } catch {
        // best-effort; ignora falhas
      }
    })();
  }, []);

  const TABS: { key: TabKey; labelKey: 'tabs.home' | 'tabs.support' | 'tabs.calendar' | 'tabs.resources'; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'home', labelKey: 'tabs.home', icon: 'home-outline', iconActive: 'home' },
    { key: 'support', labelKey: 'tabs.support', icon: 'medkit-outline', iconActive: 'medkit' },
    { key: 'calendar', labelKey: 'tabs.calendar', icon: 'calendar-outline', iconActive: 'calendar' },
    { key: 'resources', labelKey: 'tabs.resources', icon: 'apps-outline', iconActive: 'apps' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Barra de topo */}
      <View style={{ paddingTop: insets.top }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.sm }}>
          <Text style={{ color: colors.primary, fontSize: 22, fontWeight: '800' }}>{APP_NAME}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Pressable onPress={() => router.push('/profile')} hitSlop={8}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={{ width: 32, height: 32, borderRadius: 16 }} />
              ) : (
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
                  <Ionicons name="person" size={18} color={colors.textMuted} />
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => router.push('/settings')} hitSlop={12} style={{ padding: 6 }}>
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Conteúdo do separador */}
      <View style={{ flex: 1 }}>
        {tab === 'home' && (
          <HomeScreen startDate={data ? data.completedAt : new Date().toISOString()} />
        )}
        {tab === 'support' && (
          <SupportScreen
            onBreathing={() => router.push('/breathing')}
            onBodyScan={() => router.push('/bodyscan')}
            onPositive={() => router.push('/positive')}
            onSounds={(category) => router.push({ pathname: '/sounds', params: { category } })}
            onTrigger={() => router.push('/triggerhelp')}
            onUnplanned={() => router.push('/unplanned')}
            onUrgeSurf={() => router.push('/urgesurf')}
          />
        )}
        {tab === 'calendar' && <CalendarScreen />}
        {tab === 'resources' && (
          <ResourcesScreen
            onOpen={(id) => router.push(('/' + id) as any)}
            onSoon={(title) => router.push({ pathname: '/resource', params: { title } })}
          />
        )}
      </View>

      {/* Menu flutuante em cápsula — Liquid Glass no iOS 26 */}
      <View style={{ position: 'absolute', left: 20, right: 20, bottom: (insets.bottom || 10) + 6, height: 64, borderRadius: 32, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
        {glassSupported ? (
          <GlassView glassEffectStyle="regular" tintColor={isDark ? 'rgba(22,33,42,0.55)' : 'rgba(255,255,255,0.7)'} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(22,33,42,0.88)' : 'rgba(255,255,255,0.88)' }]} />
        )}
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {TABS.map((tb) => {
            const active = tab === tb.key;
            return (
              <Pressable
                key={tb.key}
                onPress={() => setTab(tb.key)}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}
              >
                <Ionicons name={active ? tb.iconActive : tb.icon} size={24} color={active ? colors.primary : colors.textMuted} />
                <Text style={{ color: active ? colors.primary : colors.textMuted, fontWeight: active ? '700' : '500', fontSize: 12 }}>
                  {t(tb.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
