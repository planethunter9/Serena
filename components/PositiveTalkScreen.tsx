// Frases positivas: uma frase de cada vez, com coração para guardar nas
// favoritas, e um separador para escrever frases com as próprias palavras.
// As favoritas e as frases próprias aparecem também no "Estou com um gatilho".

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AFFIRMATIONS } from '../data/content';
import { phrasesText } from '../data/phrasesText';
import { pick, useLang } from '../i18n/i18n';
import { newId } from '../lib/id';
import { loadMyPhrases, loadPhraseFavs, MyPhrase, saveMyPhrases, savePhraseFavs } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, PrimaryButton, Segmented, TopBackBar } from './ui';

type Tab = 'all' | 'favs' | 'mine';

export default function PositiveTalkScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const x = phrasesText(lang);
  const [tab, setTab] = useState<Tab>('all');
  const [i, setI] = useState(0);
  const [favs, setFavs] = useState<string[]>([]);
  const [mine, setMine] = useState<MyPhrase[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    loadPhraseFavs().then(setFavs);
    loadMyPhrases().then(setMine);
  }, []);

  const current = AFFIRMATIONS[i];
  const isFav = favs.includes(current.en);

  function toggleFav(id: string) {
    Haptics.selectionAsync().catch(() => {});
    const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
    setFavs(next);
    savePhraseFavs(next);
  }
  function addMine() {
    const text = draft.trim();
    if (!text) return;
    const next = [{ id: newId('p'), text }, ...mine];
    setMine(next);
    setDraft('');
    saveMyPhrases(next);
  }
  function removeMine(id: string) {
    const next = mine.filter((p) => p.id !== id);
    setMine(next);
    saveMyPhrases(next);
  }

  const favList = AFFIRMATIONS.filter((a) => favs.includes(a.en));

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TopBackBar title={t('tech.positive')} onBack={onBack} />
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm }}>
        <Segmented value={tab} onChange={setTab} options={[['all', x.all], ['favs', x.favs], ['mine', x.mine]]} />
      </View>

      {tab === 'all' && (
        <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'space-between' }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl }}>
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: '700', textAlign: 'center', lineHeight: 38 }}>
              “{pick(current, lang)}”
            </Text>
            <Pressable
              onPress={() => toggleFav(current.en)}
              accessibilityRole="button"
              accessibilityLabel={isFav ? x.unfav : x.fav}
              accessibilityState={{ selected: isFav }}
              hitSlop={10}
              style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: isFav ? colors.primarySoft : colors.card, borderWidth: 1, borderColor: isFav ? colors.primary : colors.border }}
            >
              <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={24} color={isFav ? colors.primary : colors.textMuted} />
            </Pressable>
          </View>
          <PrimaryButton label={x.another} onPress={() => setI((p) => (p + 1) % AFFIRMATIONS.length)} />
        </View>
      )}

      {tab === 'favs' && (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
          {favList.length === 0 ? (
            <Card><Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{x.emptyFavs}</Text></Card>
          ) : (
            favList.map((a) => (
              <Card key={a.en} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Text style={{ flex: 1, color: colors.text, fontSize: 16, lineHeight: 24 }}>“{pick(a, lang)}”</Text>
                <Pressable onPress={() => toggleFav(a.en)} hitSlop={10} accessibilityRole="button" accessibilityLabel={x.unfav}>
                  <Ionicons name="heart" size={22} color={colors.primary} />
                </Pressable>
              </Card>
            ))
          )}
        </ScrollView>
      )}

      {tab === 'mine' && (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }} keyboardShouldPersistTaps="handled">
          <Card style={{ gap: spacing.md }}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={x.placeholder}
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={200}
              style={{ minHeight: 64, color: colors.text, fontSize: 16, lineHeight: 22, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, textAlignVertical: 'top' }}
            />
            <PrimaryButton label={x.add} onPress={addMine} disabled={!draft.trim()} />
          </Card>
          {mine.length === 0 ? (
            <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center' }}>{x.emptyMine}</Text>
          ) : (
            mine.map((p) => (
              <Card key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Text style={{ flex: 1, color: colors.text, fontSize: 16, lineHeight: 24 }}>“{p.text}”</Text>
                <Pressable onPress={() => removeMine(p.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={x.remove}>
                  <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
                </Pressable>
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}
