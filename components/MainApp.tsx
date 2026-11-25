// App principal (rota "/"): barra de topo, separadores e menu Liquid Glass.
// Abrir um ecrã = router.push('/rota') -> animação nativa + gesto de voltar.

import { Ionicons } from '@expo/vector-icons';
import { useA11y } from '../lib/a11y';
import { GlassView } from 'expo-glass-effect';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_NAME } from '../data/content';
import { useLang } from '../i18n/i18n';
import * as Notifications from 'expo-notifications';
import { cancelUntrackedReminders, knownNotificationIds } from '../notifications/notifications';
import { routeForNotification } from '../notifications/routes';
import { useQuickActions } from '../lib/quickActions';
import Animated from 'react-native-reanimated';
import { enterFade, PressableScale, tapHaptic } from '../lib/motion';
import { loadAffirmationReminder, loadReminders, loadWalkthroughSeen, saveWalkthroughSeen } from '../storage/storage';
import { CoachTarget, useCoach } from './CoachMarks';
import { TUTORIAL_NO_TARGET, TUTORIAL_ORDER, TutorialStepId, tutorialPack } from '../data/tutorial';
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
  const a11y = useA11y();
  const iosMajor = Platform.OS === 'ios' ? parseInt(String(Platform.Version), 10) : 0;
  const glassSupported = iosMajor >= 26;
  const { t, lang } = useLang();
  const { data } = useData();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('home');

  function openSettings() {
    router.push('/settings');
  }

  const settingsButton = (
    <Pressable onPress={openSettings} accessibilityRole="button" accessibilityLabel={a11y.settings} hitSlop={{ top: 0, bottom: 14, left: 8, right: 8 }} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="settings-outline" size={24} color={colors.text} />
    </Pressable>
  );

  // Atalhos no ícone da app (pressão longa): gatilho, respirar, linhas de apoio.
  useQuickActions(lang);

  // Coach marks (tutorial de abertura): boas-vindas, depois percorre os quatro
  // separadores (mudando de ecrã em cada passo e realçando um elemento real) e
  // termina com uma mensagem. Corre quando ainda não foi visto — no primeiro
  // arranque ou depois de "Ver o tutorial outra vez" nas Definições.
  const coach = useCoach();
  const coachRef = useRef(coach);
  const langRef = useRef(lang);
  useEffect(() => { coachRef.current = coach; langRef.current = lang; });
  const coachStarting = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      let cancelled = false;
      const startTutorial = () => {
        timer = null;
        const pack = tutorialPack(langRef.current);
        const home = () => setTab('home');
        const show: Record<TutorialStepId, () => void> = {
          welcome: home, pillars: home, 'home-plan': home, 'home-severity': home, 'header-actions': home,
          'support-now': () => setTab('support'), 'support-techniques': () => setTab('support'),
          'calendar-card': () => setTab('calendar'), 'resources-list': () => setTab('resources'),
          tabbar: home, end: home,
        };
        coachRef.current.start(
          TUTORIAL_ORDER.map((id) => ({
            name: TUTORIAL_NO_TARGET.includes(id) ? undefined : id,
            title: pack.steps[id].title,
            text: pack.steps[id].text,
            show: show[id],
          })),
          async () => { setTab('home'); await saveWalkthroughSeen(); coachStarting.current = false; },
        );
      };
      (async () => {
        if (coachStarting.current || coachRef.current.active) return;
        if (await loadWalkthroughSeen()) return;
        if (cancelled || coachStarting.current) return;
        coachStarting.current = true;
        timer = setTimeout(startTutorial, 700);
      })();
      // Se o ecrã perder o foco antes de o tutorial arrancar, fica para a próxima.
      return () => { cancelled = true; if (timer) { clearTimeout(timer); coachStarting.current = false; } };
    }, [])
  );

  // Tocar numa notificação abre o ecrã correspondente (lembrete → Exercícios,
  // afirmação do dia → frases positivas). Funciona também com a app fechada.
  const lastResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!lastResponse || lastResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const req = lastResponse.notification.request;
    const route = routeForNotification(req.identifier, req.content.data as Record<string, unknown>);
    // Limpa a resposta para não voltar a abrir o ecrã ao voltar ao início.
    try { Notifications.clearLastNotificationResponse(); } catch {}
    if (route) router.push(route as any);
  }, [lastResponse, router]);

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
      {/* Barra de topo: "Serena" à esquerda e Definições (com o Perfil lá dentro) à direita */}
      <View style={{ paddingTop: insets.top }}>
        {/* Desce 15 pt: no iPhone 17 Pro (Expo Go) o canto superior direito logo
            abaixo da barra de estado não recebe toques. hitSlop para baixo como margem. */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: spacing.xl, paddingRight: spacing.xl - 10, paddingTop: 15, height: 75 }}>
          <Text style={{ color: colors.primary, fontSize: 22, fontWeight: '800' }}>{APP_NAME}</Text>
          <CoachTarget name="header-actions">{settingsButton}</CoachTarget>
        </View>
      </View>

      {/* Conteúdo do separador (fade suave ao trocar) */}
      <Animated.View key={tab} entering={enterFade} style={{ flex: 1 }}>
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
      </Animated.View>

      {/* Menu flutuante em cápsula — Liquid Glass no iOS 26 */}
      <CoachTarget name="tabbar" style={{ position: 'absolute', left: 20, right: 20, bottom: (insets.bottom || 10) + 6, height: 64 }}>
      <View style={{ flex: 1, borderRadius: 32, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
        {glassSupported ? (
          <GlassView glassEffectStyle="regular" tintColor={isDark ? 'rgba(22,33,42,0.55)' : 'rgba(255,255,255,0.7)'} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(22,33,42,0.88)' : 'rgba(255,255,255,0.88)' }]} />
        )}
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {TABS.map((tb) => {
            const active = tab === tb.key;
            return (
              <PressableScale
                key={tb.key}
                scaleTo={0.9}
                onPress={() => { if (tb.key !== tab) tapHaptic(); setTab(tb.key); }}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t(tb.labelKey)}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}
              >
                <Ionicons name={active ? tb.iconActive : tb.icon} size={24} color={active ? colors.primary : colors.textMuted} />
                <Text style={{ color: active ? colors.primary : colors.textMuted, fontWeight: active ? '700' : '500', fontSize: 12 }}>
                  {t(tb.labelKey)}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </View>
      </CoachTarget>
    </View>
  );
}
