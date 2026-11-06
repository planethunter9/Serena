// "Estou com um gatilho": mostra frases de coping para baixar a intensidade,
// específicas para cada gatilho que o utilizador escolheu.

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { GENERAL_TRIGGER_PHRASES, TRIGGER_PHRASES } from '../data/content';
import { pick, useLang } from '../i18n/i18n';
import { OnboardingData, ProfileItem } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

function asItems(arr: any[]): ProfileItem[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((it, i) => (typeof it === 'string' ? { id: 'x' + i, label: it } : { id: it.id ?? 'x' + i, label: it.label ?? '' }));
}

export default function TriggerHelpScreen({ onBack, data }: { onBack: () => void; data: OnboardingData }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [selected, setSelected] = useState<ProfileItem | null>(null);

  const triggers = asItems(data.triggers);

  // Frases para o gatilho escolhido (ou frases gerais se for personalizado/sem frases).
  function phrasesFor(id: string) {
    const list = TRIGGER_PHRASES[id] ?? GENERAL_TRIGGER_PHRASES;
    return list.map((p) => pick(p, lang));
  }

  // Vista de detalhe: frases do gatilho escolhido.
  if (selected) {
    const phrases = phrasesFor(selected.id);
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBackBar title={selected.label} onBack={() => setSelected(null)} />
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('triggerhelp.detailHint')}</Text>
          {phrases.map((phrase, i) => (
            <Card key={i} style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', lineHeight: 26 }}>“{phrase}”</Text>
            </Card>
          ))}
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: spacing.sm }}>{t('triggerhelp.breathe')}</Text>
        </ScrollView>
      </View>
    );
  }

  // Lista dos gatilhos do utilizador.
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('triggerhelp.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('triggerhelp.intro')}</Text>

        {triggers.length === 0 ? (
          <Card>
            <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{t('triggerhelp.empty')}</Text>
          </Card>
        ) : (
          triggers.map((tr) => (
            <Pressable
              key={tr.id}
              onPress={() => setSelected(tr)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}
            >
              <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="flash-outline" size={20} color={colors.primary} />
              </View>
              <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{tr.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
