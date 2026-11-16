// Fluxo de entrada (onboarding). Um único ecrã que avança por "passos".

import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COPING_OPTIONS, LOSS_OPTIONS, PHOBIA, RECOVER_OPTIONS, SUBTYPE_OPTIONS, SYMPTOM_OPTIONS, TRIGGERS_OPTIONS } from '../data/content';
import { pick, useLang } from '../i18n/i18n';
import { OnboardingData } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { enterItem, enterStep, FadeInItem, useAnimatedNumber } from '../lib/motion';
import { OptionRow, PrimaryButton } from './ui';

const TOTAL_STEPS = 7;

// Campo "acrescentar o meu" — fora do componente principal para o teclado não
// fechar a cada letra (um componente definido dentro de outro é recriado).
function CustomInput({ value, onChange, onAdd }: { value: string; onChange: (v: string) => void; onAdd: () => void }) {
  const { colors } = useTheme();
  const { t } = useLang();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onAdd}
        placeholder={t('onb.customPlaceholder')}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={t('onb.customPlaceholder')}
        style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 16 }}
      />
      <Pressable onPress={onAdd} accessibilityRole="button" style={{ paddingHorizontal: 18, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>{t('common.add')}</Text>
      </Pressable>
    </View>
  );
}

export default function Onboarding({ onComplete }: { onComplete: (data: OnboardingData) => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  // Direção da última mudança de passo (para a animação deslizar do lado certo).
  const [dir, setDir] = useState<1 | -1>(1);
  const progress = useAnimatedNumber(step > 0 ? (step + 1) / TOTAL_STEPS : 0);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));

  const [subtypes, setSubtypes] = useState<string[]>([]);
  const [customSubtypes, setCustomSubtypes] = useState<{ id: string; label: string }[]>([]);
  const [subtypeText, setSubtypeText] = useState('');

  const [losses, setLosses] = useState<string[]>([]);
  const [customLosses, setCustomLosses] = useState<{ id: string; label: string }[]>([]);
  const [lossText, setLossText] = useState('');

  const [recover, setRecover] = useState<string[]>([]);
  const [customRecover, setCustomRecover] = useState<{ id: string; label: string }[]>([]);
  const [recoverText, setRecoverText] = useState('');

  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptoms, setCustomSymptoms] = useState<{ id: string; label: string }[]>([]);
  const [symptomText, setSymptomText] = useState('');

  const [triggers, setTriggers] = useState<string[]>([]);
  const [customTriggers, setCustomTriggers] = useState<{ id: string; label: string }[]>([]);
  const [triggerText, setTriggerText] = useState('');

  const [coping, setCoping] = useState<string[]>([]);
  const [customCoping, setCustomCoping] = useState<{ id: string; label: string }[]>([]);
  const [copingText, setCopingText] = useState('');

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function addCustom(
    text: string,
    setText: (v: string) => void,
    customs: { id: string; label: string }[],
    setCustoms: (v: { id: string; label: string }[]) => void,
    selected: string[],
    setSelected: (v: string[]) => void
  ) {
    const value = text.trim();
    if (!value) return;
    const id = 'custom:' + Date.now();
    setCustoms([...customs, { id, label: value }]);
    setSelected([...selected, id]);
    setText('');
  }

  const allSubtypes = [...SUBTYPE_OPTIONS.map((o) => ({ id: o.id, label: pick(o.label, lang) })), ...customSubtypes];
  const allLosses = [...LOSS_OPTIONS.map((o) => ({ id: o.id, label: pick(o.label, lang) })), ...customLosses];
  const allRecover = [...RECOVER_OPTIONS.map((o) => ({ id: o.id, label: pick(o.label, lang) })), ...customRecover];
  const allSymptoms = [...SYMPTOM_OPTIONS.map((o) => ({ id: o.id, label: pick(o.label, lang) })), ...customSymptoms];
  const allCoping = [...COPING_OPTIONS.map((o) => ({ id: o.id, label: pick(o.label, lang) })), ...customCoping];
  const allTriggers = [...TRIGGERS_OPTIONS.map((o) => ({ id: o.id, label: pick(o.label, lang) })), ...customTriggers];

  const canProceed =
    step === 0 ? true
    : step === 1 ? subtypes.length > 0
    : step === 2 ? losses.length > 0
    : step === 3 ? recover.length > 0
    : step === 4 ? symptoms.length > 0
    : step === 5 ? triggers.length > 0
    : step === 6 ? coping.length > 0
    : true;

  function itemsFrom(selected: string[], catalog: { id: string; label: L2 }[], customs: { id: string; label: string }[]) {
    return selected.map((id) => {
      const cat = catalog.find((o) => o.id === id);
      if (cat) return { id, label: pick(cat.label, lang) };
      const c = customs.find((x) => x.id === id);
      return { id, label: c ? c.label : id };
    });
  }

  function next() {
    if (step < TOTAL_STEPS - 1) {
      setDir(1);
      setStep(step + 1);
    } else {
      onComplete({
        phobiaId: PHOBIA.id,
        plan: null,
        subtypes: itemsFrom(subtypes, SUBTYPE_OPTIONS, customSubtypes),
        coping: itemsFrom(coping, COPING_OPTIONS, customCoping),
        losses: itemsFrom(losses, LOSS_OPTIONS, customLosses),
        recover: itemsFrom(recover, RECOVER_OPTIONS, customRecover),
        symptoms: itemsFrom(symptoms, SYMPTOM_OPTIONS, customSymptoms),
        triggers: itemsFrom(triggers, TRIGGERS_OPTIONS, customTriggers),
        completedAt: new Date().toISOString(),
      });
    }
  }

  function back() {
    if (step > 0) { setDir(-1); setStep(step - 1); }
  }

  const buttonLabel = step === 0 ? t('common.start') : step === TOTAL_STEPS - 1 ? t('common.finish') : t('common.continue');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: spacing.md }}>
        {step > 0 && (
          <Pressable onPress={back} hitSlop={12}>
            <Text style={{ color: colors.textMuted, fontSize: 16 }}>‹ {t('common.back')}</Text>
          </Pressable>
        )}
        {step > 0 && (
          <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.track, overflow: 'hidden' }}>
            <Animated.View style={[{ height: '100%', backgroundColor: colors.primary }, progressStyle]} />
          </View>
        )}
      </View>

      <ScrollView key={step} contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.sm, gap: spacing.md }}>
       <Animated.View entering={enterStep(dir)} style={{ gap: spacing.md }}>
        {step === 0 && (
          <View style={{ gap: spacing.md, paddingTop: spacing.xxl }}>
            <Animated.Text entering={enterItem(0)} style={{ color: colors.textMuted, fontSize: 17 }}>{t('onb.welcomeEyebrow')}</Animated.Text>
            <Animated.Text entering={enterItem(1)} style={{ color: colors.text, fontSize: 34, fontWeight: '700', lineHeight: 40 }}>
              {t('onb.welcomeTitle')}{'\n'}
              <Text style={{ color: colors.primary }}>{pick(PHOBIA.name, lang)}</Text>
            </Animated.Text>
            <Animated.Text entering={enterItem(2)} style={{ color: colors.textMuted, fontSize: 16, lineHeight: 23 }}>{t('onb.welcomeSubtitle')}</Animated.Text>
          </View>
        )}

        {step === 1 && (
          <StepList title={t('onb.qSubtypesTitle')} subtitle={t('onb.qSubtypesSubtitle')}>
            {allSubtypes.map((o, i) => (
              <FadeInItem key={o.id} index={i + 1}><OptionRow label={o.label} selected={subtypes.includes(o.id)} onPress={() => toggle(subtypes, setSubtypes, o.id)} /></FadeInItem>
            ))}
            <CustomInput
              value={subtypeText}
              onChange={setSubtypeText}
              onAdd={() => addCustom(subtypeText, setSubtypeText, customSubtypes, setCustomSubtypes, subtypes, setSubtypes)}
            />
          </StepList>
        )}

        {step === 2 && (
          <StepList title={t('onb.q1Title', { phobia: pick(PHOBIA.name, lang) })} subtitle={t('onb.q1Subtitle')}>
            {allLosses.map((o, i) => (
              <FadeInItem key={o.id} index={i + 1}><OptionRow label={o.label} selected={losses.includes(o.id)} onPress={() => toggle(losses, setLosses, o.id)} /></FadeInItem>
            ))}
            <CustomInput
              value={lossText}
              onChange={setLossText}
              onAdd={() => addCustom(lossText, setLossText, customLosses, setCustomLosses, losses, setLosses)}
            />
          </StepList>
        )}

        {step === 3 && (
          <StepList title={t('onb.q2Title')} subtitle={t('onb.q2Subtitle')}>
            {allRecover.map((o, i) => (
              <FadeInItem key={o.id} index={i + 1}><OptionRow label={o.label} selected={recover.includes(o.id)} onPress={() => toggle(recover, setRecover, o.id)} /></FadeInItem>
            ))}
            <CustomInput
              value={recoverText}
              onChange={setRecoverText}
              onAdd={() => addCustom(recoverText, setRecoverText, customRecover, setCustomRecover, recover, setRecover)}
            />
          </StepList>
        )}

        {step === 4 && (
          <StepList title={t('onb.q3Title')} subtitle={t('onb.q3Subtitle')}>
            {allSymptoms.map((o, i) => (
              <FadeInItem key={o.id} index={i + 1}><OptionRow label={o.label} selected={symptoms.includes(o.id)} onPress={() => toggle(symptoms, setSymptoms, o.id)} /></FadeInItem>
            ))}
            <CustomInput
              value={symptomText}
              onChange={setSymptomText}
              onAdd={() => addCustom(symptomText, setSymptomText, customSymptoms, setCustomSymptoms, symptoms, setSymptoms)}
            />
          </StepList>
        )}

        {step === 5 && (
          <StepList title={t('onb.qTriggersTitle')} subtitle={t('onb.qTriggersSubtitle')}>
            {allTriggers.map((o, i) => (
              <FadeInItem key={o.id} index={i + 1}><OptionRow label={o.label} selected={triggers.includes(o.id)} onPress={() => toggle(triggers, setTriggers, o.id)} /></FadeInItem>
            ))}
            <CustomInput
              value={triggerText}
              onChange={setTriggerText}
              onAdd={() => addCustom(triggerText, setTriggerText, customTriggers, setCustomTriggers, triggers, setTriggers)}
            />
          </StepList>
        )}

        {step === 6 && (
          <StepList title={t('onb.qCopingTitle')} subtitle={t('onb.qCopingSubtitle')}>
            {allCoping.map((o, i) => (
              <FadeInItem key={o.id} index={i + 1}><OptionRow label={o.label} selected={coping.includes(o.id)} onPress={() => toggle(coping, setCoping, o.id)} /></FadeInItem>
            ))}
            <CustomInput
              value={copingText}
              onChange={setCopingText}
              onAdd={() => addCustom(copingText, setCopingText, customCoping, setCustomCoping, coping, setCoping)}
            />
          </StepList>
        )}

       </Animated.View>
      </ScrollView>

      <View style={{ padding: spacing.xl, paddingBottom: (insets.bottom || 0) + spacing.md }}>
        <PrimaryButton label={buttonLabel} onPress={next} disabled={!canProceed} />
      </View>
    </View>
  );
}

type L2 = { pt: string; en: string };

function StepList({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.md }}>
      <Text style={{ color: colors.text, fontSize: 26, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 15, marginBottom: spacing.sm }}>{subtitle}</Text>
      <View style={{ gap: spacing.sm }}>{children}</View>
    </View>
  );
}
