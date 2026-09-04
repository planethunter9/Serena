// App principal: barra de topo (engrenagem), menu inferior (Início, Progresso,
// Recursos) e os ecrãs que abrem "por cima" (definições, técnicas, lições, etc.).

import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_NAME } from '../data/content';
import { useLang } from '../i18n/i18n';
import { loadProfile, OnboardingData } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import AchievementsScreen from './AchievementsScreen';
import BodyScanScreen from './BodyScanScreen';
import BreathingScreen from './BreathingScreen';
import CalendarScreen from './CalendarScreen';
import ChoicesScreen from './ChoicesScreen';
import ExercisesScreen from './ExercisesScreen';
import FearProfileScreen from './FearProfileScreen';
import GamesScreen from './GamesScreen';
import GoalsScreen from './GoalsScreen';
import HomeScreen from './HomeScreen';
import JournalScreen from './JournalScreen';
import LessonsScreen from './LessonsScreen';
import PositiveTalkScreen from './PositiveTalkScreen';
import ProfileScreen from './ProfileScreen';
import PrivacyScreen from './PrivacyScreen';
import ProgressScreen from './ProgressScreen';
import RemindersScreen from './RemindersScreen';
import ResourceDetail from './ResourceDetail';
import ResourcesScreen from './ResourcesScreen';
import SafetyScreen from './SafetyScreen';
import SettingsScreen from './SettingsScreen';
import SoundsScreen from './SoundsScreen';
import UnplannedScreen from './UnplannedScreen';
import { SwipeBack } from './ui';

type TabKey = 'home' | 'progress' | 'calendar' | 'resources';
type Overlay =
  | { type: 'none' }
  | { type: 'settings' }
  | { type: 'resource'; title: string }
  | { type: 'lessons' }
  | { type: 'breathing' }
  | { type: 'bodyscan' }
  | { type: 'positive' }
  | { type: 'sounds'; category: 'calm' | 'sleep' }
  | { type: 'reminders' }
  | { type: 'goals' }
  | { type: 'journal' }
  | { type: 'achievements' }
  | { type: 'privacy' }
  | { type: 'choices' }
  | { type: 'exercises' }
  | { type: 'games' }
  | { type: 'unplanned' }
  | { type: 'fearprofile' }
  | { type: 'safety' }
  | { type: 'profile' };

export default function MainApp({ data, onUpdate }: { data: OnboardingData; onUpdate: (data: OnboardingData) => void }) {
  const { colors, isDark } = useTheme();
  const iosMajor = Platform.OS === 'ios' ? parseInt(String(Platform.Version), 10) : 0;
  const glassSupported = iosMajor >= 26;
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('home');
  const [overlay, setOverlay] = useState<Overlay>({ type: 'none' });
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const close = () => setOverlay({ type: 'none' });

  // Recarrega a foto de perfil sempre que se fecha um overlay.
  useEffect(() => {
    if (overlay.type === 'none') loadProfile().then((p) => setPhotoUri(p.photoUri));
  }, [overlay.type]);

  const TABS: { key: TabKey; labelKey: 'tabs.home' | 'tabs.progress' | 'tabs.calendar' | 'tabs.resources'; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'home', labelKey: 'tabs.home', icon: 'home-outline', iconActive: 'home' },
    { key: 'progress', labelKey: 'tabs.progress', icon: 'stats-chart-outline', iconActive: 'stats-chart' },
    { key: 'calendar', labelKey: 'tabs.calendar', icon: 'calendar-outline', iconActive: 'calendar' },
    { key: 'resources', labelKey: 'tabs.resources', icon: 'apps-outline', iconActive: 'apps' },
  ];

  // Ecrãs "por cima" (com gesto de voltar deslizando da margem esquerda).
  if (overlay.type === 'settings') return <SwipeBack onBack={close}><SettingsScreen onBack={close} data={data} onUpdate={onUpdate} onOpenPrivacy={() => setOverlay({ type: 'privacy' })} onOpenChoices={() => setOverlay({ type: 'choices' })} onOpenProfile={() => setOverlay({ type: 'profile' })} /></SwipeBack>;
  if (overlay.type === 'resource') return <SwipeBack onBack={close}><ResourceDetail title={overlay.title} onBack={close} /></SwipeBack>;
  if (overlay.type === 'lessons') return <SwipeBack onBack={close}><LessonsScreen onBack={close} /></SwipeBack>;
  if (overlay.type === 'reminders') return <SwipeBack onBack={close}><RemindersScreen onBack={close} /></SwipeBack>;
  if (overlay.type === 'goals') return <SwipeBack onBack={close}><GoalsScreen onBack={close} /></SwipeBack>;
  if (overlay.type === 'journal') return <SwipeBack onBack={close}><JournalScreen onBack={close} /></SwipeBack>;
  if (overlay.type === 'achievements') return <SwipeBack onBack={close}><AchievementsScreen onBack={close} /></SwipeBack>;
  if (overlay.type === 'privacy') return <SwipeBack onBack={close}><PrivacyScreen onBack={close} /></SwipeBack>;
  if (overlay.type === 'choices') return <SwipeBack onBack={close}><ChoicesScreen onBack={close} data={data} onUpdate={onUpdate} /></SwipeBack>;
  if (overlay.type === 'exercises') return <SwipeBack onBack={close}><ExercisesScreen onBack={close} /></SwipeBack>;
  if (overlay.type === 'games') return <SwipeBack onBack={close}><GamesScreen onBack={close} /></SwipeBack>;
  if (overlay.type === 'unplanned') return <SwipeBack onBack={close}><UnplannedScreen onBack={close} /></SwipeBack>;
  if (overlay.type === 'fearprofile') return <SwipeBack onBack={close}><FearProfileScreen onBack={close} data={data} /></SwipeBack>;
  if (overlay.type === 'safety') return <SwipeBack onBack={close}><SafetyScreen onBack={close} /></SwipeBack>;
  if (overlay.type === 'profile') return <SwipeBack onBack={close}><ProfileScreen onBack={close} data={data} /></SwipeBack>;
  if (overlay.type === 'breathing') return <SwipeBack onBack={close}><BreathingScreen onBack={close} /></SwipeBack>;
  if (overlay.type === 'bodyscan') return <SwipeBack onBack={close}><BodyScanScreen onBack={close} /></SwipeBack>;
  if (overlay.type === 'positive') return <SwipeBack onBack={close}><PositiveTalkScreen onBack={close} /></SwipeBack>;
  if (overlay.type === 'sounds') return <SwipeBack onBack={close}><SoundsScreen onBack={close} category={overlay.category} /></SwipeBack>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Barra de topo */}
      <View style={{ paddingTop: insets.top }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.sm }}>
          <Text style={{ color: colors.primary, fontSize: 22, fontWeight: '800' }}>{APP_NAME}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Pressable onPress={() => setOverlay({ type: 'profile' })} hitSlop={8}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={{ width: 32, height: 32, borderRadius: 16 }} />
              ) : (
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
                  <Ionicons name="person" size={18} color={colors.textMuted} />
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => setOverlay({ type: 'settings' })} hitSlop={12} style={{ padding: 6 }}>
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Conteúdo do separador */}
      <View style={{ flex: 1 }}>
        {tab === 'home' && (
          <HomeScreen
            onBreathing={() => setOverlay({ type: 'breathing' })}
            onBodyScan={() => setOverlay({ type: 'bodyscan' })}
            onPositive={() => setOverlay({ type: 'positive' })}
            onSounds={(category) => setOverlay({ type: 'sounds', category })}
            startDate={data.completedAt}
          />
        )}
        {tab === 'progress' && <ProgressScreen />}
        {tab === 'calendar' && <CalendarScreen />}
        {tab === 'resources' && (
          <ResourcesScreen
            onOpen={(id) => setOverlay({ type: id as any })}
            onSoon={(title) => setOverlay({ type: 'resource', title })}
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
              <Pressable key={tb.key} onPress={() => setTab(tb.key)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
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
