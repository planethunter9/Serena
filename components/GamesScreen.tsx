// Jogos de dessensibilização: "Palavra a palavra" (exposição a palavras/frases)
// e "Verdade ou mito" (corrigir crenças catastróficas).

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { FEAR_WORDS, MYTHS } from '../data/games';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { PrimaryButton, TopBackBar } from './ui';

// ---- Jogo: palavra a palavra ----
function WordGame() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [i, setI] = useState(0);
  const done = i >= FEAR_WORDS.length;

  if (done) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
        <Ionicons name="checkmark-circle-outline" size={60} color={colors.success} />
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{t('word.done')}</Text>
        <View style={{ alignSelf: 'stretch' }}>
          <PrimaryButton label={t('word.restart')} onPress={() => setI(0)} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('word.intro')}</Text>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 8 }}>{i + 1} / {FEAR_WORDS.length}</Text>
        <Text style={{ color: colors.text, fontSize: 30, fontWeight: '800', textAlign: 'center' }}>{FEAR_WORDS[i][lang]}</Text>
      </View>
      <PrimaryButton label={t('word.next')} onPress={() => setI(i + 1)} />
    </View>
  );
}

// ---- Jogo: verdade ou mito ----
function MythGame() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState<null | boolean>(null); // resposta do utilizador (true=mito)
  const [score, setScore] = useState(0);

  const done = i >= MYTHS.length;
  if (done) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
        <Ionicons name="trophy-outline" size={60} color={colors.primary} />
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{t('myth.score', { have: score, total: MYTHS.length })}</Text>
        <View style={{ alignSelf: 'stretch' }}>
          <PrimaryButton label={t('myth.restart')} onPress={() => { setI(0); setScore(0); setAnswered(null); }} />
        </View>
      </View>
    );
  }

  const item = MYTHS[i];
  function answer(isMyth: boolean) {
    if (answered !== null) return;
    setAnswered(isMyth);
    if (isMyth === item.isMyth) setScore((s) => s + 1);
  }
  function nextQ() {
    setAnswered(null);
    setI(i + 1);
  }

  const correct = answered !== null && answered === item.isMyth;

  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      <Text style={{ color: colors.textMuted, fontSize: 14 }}>{i + 1} / {MYTHS.length}</Text>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center', lineHeight: 30 }}>{item.text[lang]}</Text>

        {answered === null ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}><PrimaryButton label={t('myth.true')} onPress={() => answer(false)} /></View>
            <View style={{ flex: 1 }}>
              <Pressable onPress={() => answer(true)} style={{ backgroundColor: colors.cardAlt, padding: 18, borderRadius: radius.lg, alignItems: 'center', borderWidth: 2, borderColor: colors.border }}>
                <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600' }}>{t('myth.myth')}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            <Text style={{ color: correct ? colors.success : colors.danger, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
              {correct ? t('myth.correct') : t('myth.wrong')}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 15, lineHeight: 21, textAlign: 'center' }}>{item.explanation[lang]}</Text>
            <PrimaryButton label={t('myth.next')} onPress={nextQ} />
          </View>
        )}
      </View>
    </View>
  );
}

export default function GamesScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const [view, setView] = useState<'hub' | 'words' | 'myth'>('hub');

  const title = view === 'words' ? t('games.words') : view === 'myth' ? t('games.myth') : t('resources.games');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={title} onBack={() => (view === 'hub' ? onBack() : setView('hub'))} />
      <View style={{ flex: 1, padding: spacing.xl }}>
        {view === 'hub' && (
          <ScrollView contentContainerStyle={{ gap: spacing.md }}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('games.intro')}</Text>
            <Pressable onPress={() => setView('words')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="text-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t('games.words')}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('games.wordsDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
            <Pressable onPress={() => setView('myth')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t('games.myth')}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('games.mythDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          </ScrollView>
        )}
        {view === 'words' && <WordGame />}
        {view === 'myth' && <MythGame />}
      </View>
    </View>
  );
}
