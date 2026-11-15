// Ecrã "As minhas escolhas": edição das listas do onboarding, fora das Definições.

import { ScrollView, View } from 'react-native';
import { COPING_OPTIONS, LOSS_OPTIONS, RECOVER_OPTIONS, SUBTYPE_OPTIONS, SYMPTOM_OPTIONS, TRIGGERS_OPTIONS } from '../data/content';
import { pick, useLang } from '../i18n/i18n';
import { OnboardingData, ProfileItem } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import ListEditor from './ListEditor';
import { FadeInItem } from '../lib/motion';
import { TopBackBar } from './ui';

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
  const { t, lang } = useLang();

  // Converte um catálogo bilingue para { id, label } no idioma atual.
  const cat = (options: { id: string; label: { pt: string; en: string } }[]) =>
    options.map((o) => ({ id: o.id, label: pick(o.label, lang) }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('settings.choices')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <FadeInItem index={0}><ListEditor title={t('settings.subtypes')} items={asItems(data.subtypes)} catalog={cat(SUBTYPE_OPTIONS)} onChange={(items) => onUpdate({ ...data, subtypes: items })} /></FadeInItem>
        <FadeInItem index={1}><ListEditor title={t('settings.triggers')} items={asItems(data.triggers)} catalog={cat(TRIGGERS_OPTIONS)} onChange={(items) => onUpdate({ ...data, triggers: items })} /></FadeInItem>
        <FadeInItem index={2}><ListEditor title={t('settings.losses')} items={asItems(data.losses)} catalog={cat(LOSS_OPTIONS)} onChange={(items) => onUpdate({ ...data, losses: items })} /></FadeInItem>
        <FadeInItem index={3}><ListEditor title={t('settings.affects')} items={asItems(data.symptoms)} catalog={cat(SYMPTOM_OPTIONS)} onChange={(items) => onUpdate({ ...data, symptoms: items })} /></FadeInItem>
        <FadeInItem index={4}><ListEditor title={t('settings.recover')} items={asItems(data.recover)} catalog={cat(RECOVER_OPTIONS)} onChange={(items) => onUpdate({ ...data, recover: items })} /></FadeInItem>
        <FadeInItem index={5}><ListEditor title={t('settings.coping')} items={asItems(data.coping)} catalog={cat(COPING_OPTIONS)} onChange={(items) => onUpdate({ ...data, coping: items })} /></FadeInItem>
      </ScrollView>
    </View>
  );
}
