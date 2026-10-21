// Separador "Apoio": ferramentas para os momentos de aflição —
// estou com um gatilho, exposição não planeada, técnicas e sons.

import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { ScreenTitle } from './ui';

export default function SupportScreen({
  onBreathing,
  onBodyScan,
  onPositive,
  onSounds,
  onTrigger,
  onUnplanned,
  onUrgeSurf,
}: {
  onBreathing: () => void;
  onBodyScan: () => void;
  onPositive: () => void;
  onSounds: (category: 'calm' | 'sleep') => void;
  onTrigger: () => void;
  onUnplanned: () => void;
  onUrgeSurf: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useLang();

  const techniques = [
    { key: 'breathing', title: t('tech.breathing'), desc: t('tech.breathingDesc'), icon: 'ellipse-outline' as const, onPress: onBreathing },
    { key: 'bodyscan', title: t('tech.bodyscan'), desc: t('tech.bodyscanDesc'), icon: 'body-outline' as const, onPress: onBodyScan },
    { key: 'positive', title: t('tech.positive'), desc: t('tech.positiveDesc'), icon: 'chatbubble-ellipses-outline' as const, onPress: onPositive },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }}>
      <ScreenTitle title={t('support.title')} />

      {/* Estou com um gatilho */}
      <Pressable onPress={onTrigger} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.primarySoft }}>
        <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="flash-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t('home.triggerTitle')}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('home.triggerDesc')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      </Pressable>

      {/* Surfar o impulso */}
      <Pressable onPress={onUrgeSurf} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="water-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t('support.urgesurf')}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('support.urgesurfDesc')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>

      {/* Exposição não planeada */}
      <Pressable onPress={onUnplanned} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="footsteps-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t('home.unplannedTitle')}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('home.unplannedDesc')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>

      {/* Técnicas */}
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 }}>{t('home.techniquesTitle')}</Text>
      {techniques.map((tech) => (
        <Pressable key={tech.key} onPress={tech.onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={tech.icon} size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{tech.title}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{tech.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      ))}

      {/* Sons */}
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 }}>{t('home.soundsTitle')}</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {[
          { key: 'calm' as const, label: t('home.soundsCalm'), icon: 'leaf-outline' as const },
          { key: 'sleep' as const, label: t('home.soundsSleep'), icon: 'moon-outline' as const },
        ].map((s) => (
          <Pressable key={s.key} onPress={() => onSounds(s.key)} style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 8 }}>
            <Ionicons name={s.icon} size={26} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '600' }}>{s.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
