// "Estou com um gatilho": mostra frases de coping para baixar a intensidade,
// específicas para cada gatilho que o utilizador escolheu.

import { localizeItems } from '../lib/onbLabels';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AFFIRMATIONS, GENERAL_TRIGGER_PHRASES, TRIGGER_PHRASES } from '../data/content';
import { phrasesText } from '../data/phrasesText';
import { plansText } from '../data/plansText';
import { pick, useLang } from '../i18n/i18n';
import { loadMyPhrases, loadPhraseFavs, OnboardingData, ProfileItem } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';


export default function TriggerHelpScreen({ onBack, data }: { onBack: () => void; data: OnboardingData }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const router = useRouter();
  const x = phrasesText(lang);
  const px = plansText(lang);
  const [selected, setSelected] = useState<ProfileItem | null>(null);
  // Frases favoritas e escritas pela pessoa (no ecrã "Frases positivas").
  const [own, setOwn] = useState<string[]>([]);
  useEffect(() => {
    Promise.all([loadPhraseFavs(), loadMyPhrases()]).then(([favs, mine]) => {
      const favTexts = AFFIRMATIONS.filter((a) => favs.includes(a.en)).map((a) => pick(a, lang));
      setOwn([...mine.map((m) => m.text), ...favTexts]);
    });
  }, [lang]);

  const triggers = localizeItems(data.triggers, 'triggers', lang);

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
          {own.length > 0 && (
            <>
              <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: spacing.md }}>{x.yours}</Text>
              {own.map((phrase, i) => (
                <Card key={'o' + i} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Ionicons name="heart" size={18} color={colors.primary} />
                  <Text style={{ flex: 1, color: colors.text, fontSize: 17, fontWeight: '600', lineHeight: 25 }}>“{phrase}”</Text>
                </Card>
              ))}
            </>
          )}
          <Pressable onPress={() => router.push('/positive')} accessibilityRole="button" style={{ alignItems: 'center', padding: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>{x.morePhrases}</Text>
          </Pressable>
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

        <Pressable onPress={() => router.push('/myplan' as any)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg }}>
          <Ionicons name="reader-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{px.viewPlan}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{px.viewHint}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>

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
