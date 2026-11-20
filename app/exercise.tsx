// Rota /exercise?type=… → um exercício (ecrã próprio), para o deslizar do iOS
// voltar ao hub dos Exercícios e deste aos Recursos.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import AcceptanceView from '../components/AcceptanceScreen';
import ChallengesScreen from '../components/ChallengesScreen';
import { ExerciseLogBar } from '../components/exercises/ExerciseLogBar';
import { ExperimentsView } from '../components/exercises/ExperimentsView';
import { ExposureView } from '../components/exercises/ExposureView';
import type { Step } from '../components/exercises/shared';
import { ThoughtView } from '../components/exercises/ThoughtView';
import { MythGame, WordGame } from '../components/GamesScreen';
import { HistoryButton } from '../components/HistoryButton';
import { TopBackBar } from '../components/ui';
import { tr2, useLang } from '../i18n/i18n';
import { introText } from '../data/introTexts';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';

export default function ExerciseRoute() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const router = useRouter();
  const { type, step, label } = useLocalSearchParams<{ type: string; step?: string; label?: string }>();
  // ?step=…&label=… abre logo a sessão desse degrau (ex.: a partir do plano).
  const [expSelected, setExpSelected] = useState<Step | null>(() => (type === 'exposure' && step && label ? { id: step, label } : null));

  const title = type === 'exposure' ? t('exposure.title')
    : type === 'thought' ? t('thought.title')
    : type === 'challenges' ? t('challenges.title')
    : type === 'experiments' ? tr2(lang, 'Experiências', 'Experiments')
    : type === 'myth' ? t('games.myth')
    : type === 'words' ? t('games.words')
    : type === 'acceptance' ? tr2(lang, 'Aceitação e valores', 'Acceptance & values')
    : t('resources.exercises');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar
        title={title}
        onBack={() => router.back()}
        info={type ? introText(type, lang) : undefined}
        right={type ? <HistoryButton kind={type} /> : undefined}
      />
      <View style={{ flex: 1, padding: spacing.xl }}>
        {type === 'exposure' && <ExposureView selected={expSelected} setSelected={setExpSelected} />}
        {type === 'thought' && <ThoughtView />}
        {type === 'challenges' && <ChallengesScreen />}
        {type === 'experiments' && <ExperimentsView />}
        {type === 'myth' && <MythGame />}
        {type === 'words' && <WordGame footer={<ExerciseLogBar type="words" />} />}
        {type === 'acceptance' && <AcceptanceView />}
        {!type && <Text style={{ color: colors.textMuted }}>—</Text>}
      </View>
    </View>
  );
}
