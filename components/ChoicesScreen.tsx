// Ecrã "As minhas escolhas": edição das listas do onboarding, fora das Definições.

import { localizeItems } from '../lib/onbLabels';
import { ScrollView, View } from 'react-native';
import { COPING_OPTIONS, LOSS_OPTIONS, RECOVER_OPTIONS, SUBTYPE_OPTIONS, SYMPTOM_OPTIONS, TRIGGERS_OPTIONS } from '../data/content';
import { pick, useLang } from '../i18n/i18n';
import { OnboardingData } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import ListEditor from './ListEditor';
import { FadeInItem } from '../lib/motion';
import { TopBackBar } from './ui';


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
        <FadeInItem index={0}><ListEditor title={t('settings.subtypes')} items={localizeItems(data.subtypes, 'subtypes', lang)} catalog={cat(SUBTYPE_OPTIONS)} onChange={(items) => onUpdate({ ...data, subtypes: items })} /></FadeInItem>
        <FadeInItem index={1}><ListEditor title={t('settings.triggers')} items={localizeItems(data.triggers, 'triggers', lang)} catalog={cat(TRIGGERS_OPTIONS)} onChange={(items) => onUpdate({ ...data, triggers: items })} /></FadeInItem>
        <FadeInItem index={2}><ListEditor title={t('settings.losses')} items={localizeItems(data.losses, 'losses', lang)} catalog={cat(LOSS_OPTIONS)} onChange={(items) => onUpdate({ ...data, losses: items })} /></FadeInItem>
        <FadeInItem index={3}><ListEditor title={t('settings.affects')} items={localizeItems(data.symptoms, 'symptoms', lang)} catalog={cat(SYMPTOM_OPTIONS)} onChange={(items) => onUpdate({ ...data, symptoms: items })} /></FadeInItem>
        <FadeInItem index={4}><ListEditor title={t('settings.recover')} items={localizeItems(data.recover, 'recover', lang)} catalog={cat(RECOVER_OPTIONS)} onChange={(items) => onUpdate({ ...data, recover: items })} /></FadeInItem>
        <FadeInItem index={5}><ListEditor title={t('settings.coping')} items={localizeItems(data.coping, 'coping', lang)} catalog={cat(COPING_OPTIONS)} onChange={(items) => onUpdate({ ...data, coping: items })} /></FadeInItem>
      </ScrollView>
    </View>
  );
}
