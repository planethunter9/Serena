// Ecrã "As minhas escolhas": edição das listas do onboarding, fora das Definições.

import { ScrollView, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { OnboardingData, ProfileItem } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import ListEditor from './ListEditor';
import { TopBackBar } from './ui';

// Garante o formato { id, label } (dados antigos podiam ser texto simples).
function asItems(arr: any[]): ProfileItem[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((it, i) =>
    typeof it === 'string' ? { id: 'x' + i, label: it } : { id: it.id ?? 'x' + i, label: it.label ?? '' }
  );
}

export default function ChoicesScreen({
  onBack,
  data,
  onUpdate,
}: {
  onBack: () => void;
  data: OnboardingData;
  onUpdate: (data: OnboardingData) => void;
}) {
  const { colors } = useTheme();
  const { t } = useLang();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('settings.choices')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <ListEditor title={t('settings.subtypes')} items={asItems(data.subtypes)} onChange={(items) => onUpdate({ ...data, subtypes: items })} />
        <ListEditor title={t('settings.losses')} items={asItems(data.losses)} onChange={(items) => onUpdate({ ...data, losses: items })} />
        <ListEditor title={t('settings.affects')} items={asItems(data.symptoms)} onChange={(items) => onUpdate({ ...data, symptoms: items })} />
        <ListEditor title={t('settings.recover')} items={asItems(data.recover)} onChange={(items) => onUpdate({ ...data, recover: items })} />
        <ListEditor title={t('settings.coping')} items={asItems(data.coping)} onChange={(items) => onUpdate({ ...data, coping: items })} />
      </ScrollView>
    </View>
  );
}
