// Fluxo de entrada (onboarding). Um único ecrã que avança por "passos".

import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COPING_OPTIONS, LOSS_OPTIONS, PHOBIA, PLANS, RECOVER_OPTIONS, SUBTYPE_OPTIONS, SYMPTOM_OPTIONS, TRIGGERS_OPTIONS } from '../data/content';
import { useLang } from '../i18n/i18n';
import { OnboardingData } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { OptionRow, PrimaryButton } from './ui';

const TOTAL_STEPS = 8;

export default function Onboarding({ onComplete }: { onComplete: (data: OnboardingData) => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  const [subtypes, setSubtypes] = useState<string[]>([]);
  const [customSubtypes, setCustomSubtypes] = useState<{ id: string; label: string }[]>([]);
  const [subtypeText, setSubtypeText] = useState('');

  const [losses, setLosses] = useState<string[]>([]);
  const [recover, setRecover] = useState<string[]>([]);

  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptoms, setCustomSymptoms] = useState<{ id: string; label: string }[]>([]);
  const [symptomText, setSymptomText] = useState('');

  const [triggers, setTriggers] = useState<string[]>([]);
  const [customTriggers, setCustomTriggers] = useState<{ id: string; label: string }[]>([]);
  const [triggerText, setTriggerText] = useState('');

  const [coping, setCoping] = useState<string[]>([]);
  const [customCoping, setCustomCoping] = useState<{ id: string; label: string }[]>([]);
  const [copingText, setCopingText] = useState('');

  const [plan, setPlan] = useState<string | null>(null);

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

  const allSubtypes = [...SUBTYPE_OPTIONS.map((o) => ({ id: o.id, label: o.label[lang] })), ...customSubtypes];
  const allSymptoms = [...SYMPTOM_OPTIONS.map((o) => ({ id: o.id, label: o.label[lang] })), ...customSymptoms];
  const allCoping = [...COPING_OPTIONS.map((o) => ({ id: o.id, label: o.label[lang] })), ...customCoping];
  const allTriggers = [...TRIGGERS_OPTIONS.map((o) => ({ id: o.id, label: o.label[lang] })), ...customTriggers];

  const canProceed =
    step === 0 ? true
    : step === 1 ? subtypes.length > 0
    : step === 2 ? losses.length > 0
    : step === 3 ? recover.length > 0
    : step === 4 ? symptoms.length > 0
    : step === 5 ? triggers.length > 0
    : step === 6 ? coping.length > 0
    : step === 7 ? !!plan
    : true;

  function itemsFrom(selected: string[], catalog: { id: string; label: L2 }[], customs: { id: string; label: string }[]) {
    return selected.map((id) => {
      const cat = catalog.find((o) => o.id === id);
      if (cat) return { id, label: cat.label[lang] };
      const c = customs.find((x) => x.id === id);
      return { id, label: c ? c.label : id };
    });
  }

  function next() {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      onComplete({
        phobiaId: PHOBIA.id,
        plan,
        subtypes: itemsFrom(subtypes, SUBTYPE_OPTIONS, customSubtypes),
        coping: itemsFrom(coping, COPING_OPTIONS, customCoping),
        losses: LOSS_OPTIONS.filter((o) => losses.includes(o.id)).map((o) => ({ id: o.id, label: o.label[lang] })),
        recover: RECOVER_OPTIONS.filter((o) => recover.includes(o.id)).map((o) => ({ id: o.id, label: o.label[lang] })),
        symptoms: itemsFrom(symptoms, SYMPTOM_OPTIONS, customSymptoms),
        triggers: itemsFrom(triggers, TRIGGERS_OPTIONS, customTriggers),
        completedAt: new Date().toISOString(),
      });
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  const buttonLabel = step === 0 ? t('common.start') : step === TOTAL_STEPS - 1 ? t('common.finish') : t('common.continue');

  function CustomInput({ value, onChange, onAdd }: { value: string; onChange: (v: string) => void; onAdd: () => void }) {
    return (
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onAdd}
          placeholder={t('onb.customPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 16 }}
        />
        <Pressable onPress={onAdd} style={{ paddingHorizontal: 18, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>{t('common.add')}</Text>
        </Pressable>
      </View>
    );
  }

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
            <View style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%`, height: '100%', backgroundColor: colors.primary }} />
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.sm, gap: spacing.md }}>
        {step === 0 && (
          <View style={{ gap: spacing.md, paddingTop: spacing.xxl }}>
            <Text style={{ color: colors.textMuted, fontSize: 17 }}>{t('onb.welcomeEyebrow')}</Text>
            <Text style={{ color: colors.text, fontSize: 34, fontWeight: '800', lineHeight: 40 }}>
              {t('onb.welcomeTitle')}{'\n'}
              <Text style={{ color: colors.primary }}>{PHOBIA.name[lang]}</Text>
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 23 }}>{t('onb.welcomeSubtitle')}</Text>
          </View>
        )}

        {step === 1 && (
          <StepList title={t('onb.qSubtypesTitle')} subtitle={t('onb.qSubtypesSubtitle')}>
            {allSubtypes.map((o) => (
              <OptionRow key={o.id} label={o.label} selected={subtypes.includes(o.id)} onPress={() => toggle(subtypes, setSubtypes, o.id)} />
            ))}
            <CustomInput
              value={subtypeText}
              onChange={setSubtypeText}
              onAdd={() => addCustom(subtypeText, setSubtypeText, customSubtypes, setCustomSubtypes, subtypes, setSubtypes)}
            />
          </StepList>
        )}

        {step === 2 && (
          <StepList title={t('onb.q1Title', { phobia: PHOBIA.name[lang] })} subtitle={t('onb.q1Subtitle')}>
            {LOSS_OPTIONS.map((o) => (
              <OptionRow key={o.id} label={o.label[lang]} selected={losses.includes(o.id)} onPress={() => toggle(losses, setLosses, o.id)} />
            ))}
          </StepList>
        )}

        {step === 3 && (
          <StepList title={t('onb.q2Title')} subtitle={t('onb.q2Subtitle')}>
            {RECOVER_OPTIONS.map((o) => (
              <OptionRow key={o.id} label={o.label[lang]} selected={recover.includes(o.id)} onPress={() => toggle(recover, setRecover, o.id)} />
            ))}
          </StepList>
        )}

        {step === 4 && (
          <StepList title={t('onb.q3Title')} subtitle={t('onb.q3Subtitle')}>
            {allSymptoms.map((o) => (
              <OptionRow key={o.id} label={o.label} selected={symptoms.includes(o.id)} onPress={() => toggle(symptoms, setSymptoms, o.id)} />
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
            {allTriggers.map((o) => (
              <OptionRow key={o.id} label={o.label} selected={triggers.includes(o.id)} onPress={() => toggle(triggers, setTriggers, o.id)} />
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
            {allCoping.map((o) => (
              <OptionRow key={o.id} label={o.label} selected={coping.includes(o.id)} onPress={() => toggle(coping, setCoping, o.id)} />
            ))}
            <CustomInput
              value={copingText}
              onChange={setCopingText}
              onAdd={() => addCustom(copingText, setCopingText, customCoping, setCustomCoping, coping, setCoping)}
            />
          </StepList>
        )}

        {step === 7 && (
          <StepList title={t('onb.q4Title')} subtitle={t('onb.q4Subtitle')}>
            {PLANS.map((p) => {
              const active = plan === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setPlan(p.id)}
                  style={{ padding: spacing.lg, borderRadius: radius.lg, backgroundColor: active ? colors.primarySoft : colors.card, borderWidth: 2, borderColor: active ? colors.primary : colors.border, gap: 4 }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{p.title[lang]}</Text>
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>{p.subtitle[lang]}</Text>
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 14 }}>{p.desc[lang]}</Text>
                </Pressable>
              );
            })}
          </StepList>
        )}
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
      <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800' }}>{title}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 15, marginBottom: spacing.sm }}>{subtitle}</Text>
      <View style={{ gap: spacing.sm }}>{children}</View>
    </View>
  );
}
