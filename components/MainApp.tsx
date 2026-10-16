// App principal (rota "/"): barra de topo, separadores e menu Liquid Glass.
// Abrir um ecrã = router.push('/rota') -> animação nativa + gesto de voltar.

import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_NAME } from '../data/content';
import { useLang } from '../i18n/i18n';
import { loadProfile } from '../storage/storage';
import { useData } from '../store/DataContext';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import CalendarScreen from './CalendarScreen';
import HomeScreen from './HomeScreen';
import ResourcesScreen from './ResourcesScreen';

type TabKey = 'home' | 'calendar' | 'resources';

export default function MainApp() {
  const { colors, isDark } = useTheme();
  const iosMajor = Platform.OS === 'ios' ? parseInt(String(Platform.Version), 10) : 0;
  const glassSupported = iosMajor >= 26;
  const { t } = useLang();
  const { data } = useData();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('home');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Recarrega a foto de perfil sempre que este ecrã volta a ficar em foco.
  useFocusEffect(
    useCallback(() => {
      loadProfile().then((p) => setPhotoUri(p.photoUri));
    }, [])
  );

  const TABS: { key: TabKey; labelKey: 'tabs.home' | 'tabs.calendar' | 'tabs.resources'; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'home', labelKey: 'tabs.home', icon: 'home-outline', iconActive: 'home' },
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
          <HomeScreen
            onBreathing={() => router.push('/breathing')}
            onBodyScan={() => router.push('/bodyscan')}
            onPositive={() => router.push('/positive')}
            onSounds={(category) => router.push({ pathname: '/sounds', params: { category } })}
            onTrigger={() => router.push('/triggerhelp')}
            onUnplanned={() => router.push('/unplanned')}
            startDate={data ? data.completedAt : new Date().toISOString()}
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
