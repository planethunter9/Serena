// Separador "Apoio": ferramentas para os momentos de aflição —
// estou com um gatilho, exposição não planeada, técnicas e sons.
// Uma só página, tudo a um toque: "Agora mesmo" em destaque (gatilho grande,
// impulso e exposição não planeada lado a lado), a linha para as linhas de
// apoio, as técnicas numa grelha em dois grupos (corpo / mente) e os sons.

import InfoButton from './InfoButton';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { groundText } from '../data/groundText';
import { tr2, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { CoachTarget } from './CoachMarks';
import { disclaimer } from '../data/disclaimer';
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


// Mosaico (grelha de 2 colunas): ícone, nome e uma linha curta.
function Tile({ title, desc, icon, onPress }: { title: string; desc: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={desc}
      style={{ flexBasis: '46%', flexGrow: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: 8 }}
    >
      <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={21} color={colors.primary} />
      </View>
      <Text numberOfLines={2} style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{title}</Text>
      <Text numberOfLines={3} style={{ color: colors.textMuted, fontSize: 12, lineHeight: 16 }}>{desc}</Text>
    </PressableScale>
  );
}

function SubLabel({ label }: { label: string }) {
  const { colors } = useTheme();
  return <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 2 }}>{label}</Text>;
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
  const router = useRouter();
  const gx = groundText(lang);
  const dx = disclaimer(lang);
  const anchorNote = L(
    'Usa isto como âncora para atravessar um momento difícil e não ficares horas em sofrimento — não para evitar, nem como prova de que "não vomitaste por causa disto".',
    'Use this as an anchor to get through a hard moment and not spend hours in distress — not to avoid, nor as proof that "you didn\'t vomit because of it".',
  );

  type T = { key: string; title: string; desc: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void };
  const body: T[] = [
    { key: 'breathing', title: t('tech.breathing'), desc: t('tech.breathingDesc'), icon: 'ellipse-outline', onPress: onBreathing },
    { key: 'bodyscan', title: t('tech.bodyscan'), desc: t('tech.bodyscanDesc'), icon: 'body-outline', onPress: onBodyScan },
  ];
  const mind: T[] = [
    { key: 'rainbow', title: gx.rb_title, desc: gx.rb_desc, icon: 'color-palette-outline', onPress: () => router.push('/rainbow' as any) },
    { key: 'balloons', title: gx.bl_title, desc: gx.bl_desc, icon: 'balloon-outline', onPress: () => router.push('/balloons' as any) },
    { key: 'recite', title: gx.rc_title, desc: gx.rc_desc, icon: 'musical-notes-outline', onPress: () => router.push('/recite' as any) },
    { key: 'positive', title: t('tech.positive'), desc: t('tech.positiveDesc'), icon: 'chatbubble-ellipses-outline', onPress: onPositive },
  ];
  const grid = (list: T[]) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {list.map(({ key, ...tl }) => <Tile key={key} {...tl} />)}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }}>
      <ScreenTitle title={t('support.title')} />

      {/* Agora mesmo: o gatilho em destaque, as outras duas lado a lado */}
      <SectionHeader label={L('Agora mesmo', 'Right now')} />
      <CoachTarget name="support-now" style={{ gap: spacing.sm }}>
        <PressableScale
          onPress={onTrigger}
          accessibilityRole="button"
          accessibilityLabel={t('home.triggerTitle')}
          accessibilityHint={t('home.triggerDesc')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg }}
        >
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="flash" size={24} color={colors.onPrimary} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: colors.onPrimary, fontSize: 18, fontWeight: '700' }}>{t('home.triggerTitle')}</Text>
            <Text style={{ color: colors.onPrimary, opacity: 0.9, fontSize: 13 }}>{t('home.triggerDesc')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.onPrimary} />
        </PressableScale>
        {grid([
          { key: 'urge', title: t('support.urgesurf'), desc: t('support.urgesurfDesc'), icon: 'water-outline', onPress: onUrgeSurf },
          { key: 'unplanned', title: t('home.unplannedTitle'), desc: t('home.unplannedDesc'), icon: 'footsteps-outline', onPress: onUnplanned },
        ])}
      </CoachTarget>

      {/* Linhas de apoio: uma linha só, sempre à vista */}
      <Pressable
        onPress={() => router.push('/crisislines')}
        accessibilityRole="button"
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: colors.danger, paddingVertical: 12, paddingHorizontal: spacing.md }}
      >
        <Ionicons name="call-outline" size={18} color={colors.danger} />
        <Text style={{ flex: 1, color: colors.text, fontSize: 14 }}>
          {gx.crisisQ} <Text style={{ color: colors.danger, fontWeight: '700' }}>{dx.crisis}</Text>
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>

      {/* Técnicas, em dois grupos */}
      <SectionHeader label={t('home.techniquesTitle')} info={anchorNote} />
      <CoachTarget name="support-techniques" style={{ gap: spacing.sm }}>
        <SubLabel label={gx.grp_body} />
        {grid(body)}
        <SubLabel label={gx.grp_mind} />
        {grid(mind)}
      </CoachTarget>

      {/* Sons */}
      <SectionHeader label={t('home.soundsTitle')} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {[
          { key: 'calm' as const, label: t('home.soundsCalm'), icon: 'leaf-outline' as const },
          { key: 'sleep' as const, label: t('home.soundsSleep'), icon: 'moon-outline' as const },
        ].map((x) => (
          <PressableScale key={x.key} onPress={() => onSounds(x.key)} style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Ionicons name={x.icon} size={22} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '600' }}>{x.label}</Text>
          </PressableScale>
        ))}
      </View>
    </ScrollView>
  );
}
