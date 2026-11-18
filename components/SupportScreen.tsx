// Separador "Apoio": ferramentas para os momentos de aflição —
// estou com um gatilho, exposição não planeada, técnicas e sons.
// Agrupado por secções; nada colapsável (tem de estar tudo a um toque).

import InfoButton from './InfoButton';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { tr2, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { CoachTarget } from './CoachMarks';
import DisclaimerCard from './DisclaimerCard';
import { PressableScale } from '../lib/motion';
import { ScreenTitle } from './ui';

function SectionHeader({ label, info }: { label: string; info?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm, minHeight: 24 }}>
      <Text accessibilityRole="header" style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      {info ? <InfoButton text={info} title={label} size={17} /> : null}
    </View>
  );
}


function Row({ title, desc, icon, onPress, highlight }: { title: string; desc: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; highlight?: boolean }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={desc}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: highlight ? colors.primarySoft : colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: highlight ? colors.primarySoft : colors.border }}
    >
      <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: highlight ? colors.card : colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={highlight ? colors.primary : colors.textMuted} />
    </PressableScale>
  );
}

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
  const { t, lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const anchorNote = L(
    'Usa isto como âncora para atravessar um momento difícil e não ficares horas em sofrimento — não para evitar, nem como prova de que "não vomitaste por causa disto".',
    'Use this as an anchor to get through a hard moment and not spend hours in distress — not to avoid, nor as proof that "you didn\'t vomit because of it".',
  );

  const techniques = [
    { key: 'breathing', title: t('tech.breathing'), desc: t('tech.breathingDesc'), icon: 'ellipse-outline' as const, onPress: onBreathing },
    { key: 'bodyscan', title: t('tech.bodyscan'), desc: t('tech.bodyscanDesc'), icon: 'body-outline' as const, onPress: onBodyScan },
    { key: 'positive', title: t('tech.positive'), desc: t('tech.positiveDesc'), icon: 'chatbubble-ellipses-outline' as const, onPress: onPositive },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }}>
      <ScreenTitle title={t('support.title')} />

      {/* Agora mesmo — acessos urgentes */}
      <SectionHeader label={L('Agora mesmo', 'Right now')} />
      <CoachTarget name="support-now">
        <Row title={t('home.triggerTitle')} desc={t('home.triggerDesc')} icon="flash-outline" onPress={onTrigger} highlight />
      </CoachTarget>
      <Row title={t('support.urgesurf')} desc={t('support.urgesurfDesc')} icon="water-outline" onPress={onUrgeSurf} />
      <Row title={t('home.unplannedTitle')} desc={t('home.unplannedDesc')} icon="footsteps-outline" onPress={onUnplanned} />
      <DisclaimerCard variant="short" />

      {/* Técnicas */}
      <SectionHeader label={t('home.techniquesTitle')} info={anchorNote} />
      <CoachTarget name="support-techniques" style={{ gap: spacing.md }}>
      {techniques.map((tech) => (
        <PressableScale key={tech.key} onPress={tech.onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={tech.icon} size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{tech.title}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{tech.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </PressableScale>
      ))}
      </CoachTarget>

      {/* Sons */}
      <SectionHeader label={t('home.soundsTitle')} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {[
          { key: 'calm' as const, label: t('home.soundsCalm'), icon: 'leaf-outline' as const },
          { key: 'sleep' as const, label: t('home.soundsSleep'), icon: 'moon-outline' as const },
        ].map((s) => (
          <PressableScale key={s.key} onPress={() => onSounds(s.key)} style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 8 }}>
            <Ionicons name={s.icon} size={26} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '600' }}>{s.label}</Text>
          </PressableScale>
        ))}
      </View>
    </ScrollView>
  );
}
