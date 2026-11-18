// Exercícios: lista (hub) de todos os exercícios, por grupos.
// Cada exercício tem o seu ficheiro em components/exercises/.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { isoLocal, loadSeverity } from '../storage/storage';
import { ForYouExercises } from './ForYou';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useLang, tr2 } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

function HubGroup({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <View style={{ gap: spacing.sm }}>
      <Pressable onPress={() => setOpen((o) => !o)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, marginTop: 4 }}>
        <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 }}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>
      {open && <View style={{ gap: spacing.md }}>{children}</View>}
    </View>
  );
}

// Cartão de um exercício no hub.
function HubRow({ icon, title, desc, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{title}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

export default function ExercisesScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const router = useRouter();
  // Gravidade de hoje (para as sugestões "Para ti").
  const [severityToday, setSeverityToday] = useState<number | null>(null);
  useEffect(() => { loadSeverity().then((l) => { const e = l.find((x) => x.date === isoLocal()); setSeverityToday(e ? e.value : null); }); }, []);
  // Cada exercício abre numa rota própria (/exercise?type=…), para o deslizar do
  // iOS voltar a este hub e deste para os Recursos (hierarquia correta).
  const open = (type: string) => () => router.push({ pathname: '/exercise', params: { type } } as any);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('resources.exercises')} onBack={onBack} />
      <View style={{ flex: 1, padding: spacing.xl }}>
        <ScrollView contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xxl }}>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('exercises.intro')}</Text>

          {/* Para ti: os 2 exercícios mais indicados agora (regras, sem IA) */}
          <ForYouExercises severity={severityToday} />

          <HubGroup title={L('Enfrentar o medo', 'Facing the fear')} defaultOpen>
            <HubRow icon="trending-up-outline" title={t('exercises.exposure')} desc={t('exercises.exposureDesc')} onPress={open('exposure')} />
            <HubRow icon="text-outline" title={t('games.words')} desc={t('games.wordsDesc')} onPress={open('words')} />
            <HubRow icon="shuffle-outline" title={t('exercises.challenges')} desc={t('exercises.challengesDesc')} onPress={open('challenges')} />
          </HubGroup>

          <HubGroup title={L('Trabalhar o pensamento', 'Working with thoughts')}>
            <HubRow icon="bulb-outline" title={t('exercises.thought')} desc={t('exercises.thoughtDesc')} onPress={open('thought')} />
            <HubRow icon="flask-outline" title={L('Experiências', 'Experiments')} desc={L('Prever vs o que acontece mesmo', 'Predict vs what actually happens')} onPress={open('experiments')} />
            <HubRow icon="help-circle-outline" title={t('games.myth')} desc={t('games.mythDesc')} onPress={open('myth')} />
          </HubGroup>

          <HubGroup title={L('Aceitação e memória', 'Acceptance & memory')}>
            <HubRow icon="leaf-outline" title={L('Aceitação e valores', 'Acceptance & values')} desc={L('Princípios, valores e compromissos de aproximação', 'Principles, values and approach commitments')} onPress={open('acceptance')} />
            <HubRow icon="sparkles-outline" title={t('exercises.memory')} desc={t('exercises.memoryDesc')} onPress={open('memory')} />
          </HubGroup>
        </ScrollView>
      </View>
    </View>
  );
}
