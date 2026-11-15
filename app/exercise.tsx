// Rota /exercise?type=… → um exercício (ecrã próprio), para o deslizar do iOS
// voltar ao hub dos Exercícios e deste aos Recursos.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import AcceptanceView from '../components/AcceptanceScreen';
import ChallengesScreen from '../components/ChallengesScreen';
import { ExerciseLogBar, ExperimentsView, ExposureView, Step, ThoughtView } from '../components/ExercisesScreen';
import { MythGame, WordGame } from '../components/GamesScreen';
import MemoryView from '../components/MemoryReprocessing';
import { HistoryButton } from '../components/HistoryButton';
import { TopBackBar } from '../components/ui';
import { tr2, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';

export default function ExerciseRoute() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const [expSelected, setExpSelected] = useState<Step | null>(null);

  const title = type === 'exposure' ? t('exposure.title')
    : type === 'thought' ? t('thought.title')
    : type === 'memory' ? t('memory.title')
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
        right={type ? <HistoryButton kind={type} /> : undefined}
      />
      <View style={{ flex: 1, padding: spacing.xl }}>
        {type === 'exposure' && <ExposureView selected={expSelected} setSelected={setExpSelected} />}
        {type === 'thought' && <ThoughtView />}
        {type === 'memory' && <MemoryView />}
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
