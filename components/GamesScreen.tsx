// Jogos de dessensibilização: "Palavra a palavra" (exposição a palavras/frases)
// e "Verdade ou mito" (corrigir crenças catastróficas).

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { practiceText } from '../data/practiceText';
import { FEAR_WORDS, MYTHS } from '../data/games';
import { appendExerciseLog } from '../storage/storage';
import { pick, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, PrimaryButton, TopBackBar } from './ui';

// ---- Palavra a palavra (exposição a palavras/frases) ----
// Barra de progresso, pergunta de desconforto no início, a meio e no fim (pode
// saltar-se) e um ecrã final com "início → fim".
// `footer` é mostrado no ecrã final (ex.: botão "Guardar registo").
const WORD_CHECK_AT = (n: number) => [0, Math.floor(n / 2), n]; // antes da 1.ª, a meio, no fim

function MiniSuds({ onPick }: { onPick: (v: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
      {Array.from({ length: 11 }, (_, v) => (
        <Pressable key={v} onPress={() => onPick(v)} accessibilityRole="button" style={{ width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{v}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function WordGame({ footer }: { footer?: React.ReactNode } = {}) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const px = practiceText(lang);
  const n = FEAR_WORDS.length;
  const [i, setI] = useState(0);
  const [checks, setChecks] = useState<Record<number, number | null>>({}); // posição → valor (null = saltou)
  const askAt = WORD_CHECK_AT(n);
  const asking = askAt.includes(i) && !(i in checks);
  const done = i >= n && !asking;

  function answer(v: number | null) {
    if (v !== null) Haptics.selectionAsync().catch(() => {});
    setChecks({ ...checks, [i]: v });
  }
  function restart() {
    setI(0);
    setChecks({});
  }

  const vals = askAt.map((k) => checks[k]).filter((v): v is number => typeof v === 'number');
  const first = vals.length ? vals[0] : null;
  const last = vals.length > 1 ? vals[vals.length - 1] : null;

  const progress = (
    <View style={{ gap: 6 }}>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.track, overflow: 'hidden' }}>
        <View style={{ width: `${(Math.min(i, n) / n) * 100}%`, height: '100%', backgroundColor: colors.primary, borderRadius: 3 }} />
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'right', fontVariant: ['tabular-nums'] }}>{Math.min(i + (done ? 0 : 1), n)} / {n}</Text>
    </View>
  );

  if (asking) {
    return (
      <View style={{ flex: 1, justifyContent: 'space-between', gap: spacing.lg }}>
        {progress}
        <View style={{ gap: spacing.lg }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' }}>{px.w_checkQ}</Text>
          <MiniSuds onPick={answer} />
        </View>
        <Pressable onPress={() => answer(null)} accessibilityRole="button" style={{ alignItems: 'center', padding: 12 }}>
          <Text style={{ color: colors.textMuted, fontSize: 15, fontWeight: '600' }}>{px.w_skip}</Text>
        </Pressable>
      </View>
    );
  }

  if (done) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: spacing.lg }}>
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark" size={32} color={colors.success} />
          </View>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>{t('word.done')}</Text>
        </View>
        <Card style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{px.w_words}</Text>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{n}</Text>
            </View>
            {first !== null && last !== null && (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{px.w_discomfort}</Text>
                <Text style={{ color: last < first ? colors.success : colors.text, fontSize: 28, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{first} → {last}</Text>
              </View>
            )}
          </View>
          {first !== null && last !== null && (
            <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, textAlign: 'center' }}>{last < first ? px.w_down : px.w_same}</Text>
          )}
        </Card>
        <View style={{ gap: spacing.md }}>
          <PrimaryButton label={t('word.restart')} onPress={restart} />
          {footer}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      {progress}
      <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: spacing.sm }}>{t('word.intro')}</Text>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 30, fontWeight: '600', textAlign: 'center' }}>{pick(FEAR_WORDS[i], lang)}</Text>
      </View>
      <PrimaryButton label={t('word.next')} onPress={() => setI(i + 1)} />
    </View>
  );
}

// ---- Verdade ou mito (reestruturação cognitiva) ----
// No fim: pontuação e, por baixo, as perguntas em que a pessoa se enganou, com
// a resposta certa e a explicação.
export function MythGame() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const px = practiceText(lang);
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState<null | boolean>(null); // resposta do utilizador (true=mito)
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);

  const n = MYTHS.length;
  const done = i >= n;

  const progress = (
    <View style={{ gap: 6 }}>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.track, overflow: 'hidden' }}>
        <View style={{ width: `${(Math.min(i, n) / n) * 100}%`, height: '100%', backgroundColor: colors.primary, borderRadius: 3 }} />
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'right', fontVariant: ['tabular-nums'] }}>{Math.min(i + 1, n)} / {n}</Text>
    </View>
  );

  if (done) {
    return (
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}>
        <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg }}>
          <Ionicons name="trophy-outline" size={52} color={colors.primary} />
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center' }}>{t('myth.score', { have: score, total: n })}</Text>
          <View style={{ alignSelf: 'stretch', height: 8, borderRadius: 4, backgroundColor: colors.track, overflow: 'hidden', marginTop: 4 }}>
            <View style={{ width: `${(score / n) * 100}%`, height: '100%', backgroundColor: colors.success, borderRadius: 4 }} />
          </View>
        </View>
        {wrong.length === 0 ? (
          <Card><Text style={{ color: colors.success, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>{px.m_perfect}</Text></Card>
        ) : (
          <>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{px.m_review}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: -6 }}>{px.m_reviewHint}</Text>
            {wrong.map((k) => {
              const it = MYTHS[k];
              return (
                <Card key={k} style={{ gap: 8 }}>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', lineHeight: 21 }}>{pick(it.text, lang)}</Text>
                  <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: it.isMyth ? colors.cardAlt : colors.successSoft }}>
                    <Text style={{ color: it.isMyth ? colors.text : colors.success, fontSize: 12, fontWeight: '700' }}>{it.isMyth ? px.m_isMyth : px.m_isTrue}</Text>
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{pick(it.explanation, lang)}</Text>
                </Card>
              );
            })}
          </>
        )}
        <PrimaryButton label={t('myth.restart')} onPress={() => { setI(0); setScore(0); setAnswered(null); setWrong([]); }} />
      </ScrollView>
    );
  }

  const item = MYTHS[i];
  function answer(isMyth: boolean) {
    if (answered !== null) return;
    setAnswered(isMyth);
    if (isMyth === item.isMyth) {
      setScore((s) => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      setWrong((w) => [...w, i]);
      Haptics.selectionAsync().catch(() => {});
    }
  }
  function nextQ() {
    setAnswered(null);
    // Ao terminar a ronda, regista a sessão (conta para os pilares e aparece no histórico).
    if (i + 1 >= n) appendExerciseLog('myth', `${score}/${n}`).catch(() => {});
    setI(i + 1);
  }

  const correct = answered !== null && answered === item.isMyth;

  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      {progress}
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <Text style={{ color: colors.text, fontSize: 21, fontWeight: '600', textAlign: 'center', lineHeight: 29 }}>{pick(item.text, lang)}</Text>

        {answered === null ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}><PrimaryButton label={t('myth.true')} onPress={() => answer(false)} /></View>
            <View style={{ flex: 1 }}>
              <Pressable onPress={() => answer(true)} accessibilityRole="button" style={{ backgroundColor: colors.cardAlt, padding: 18, borderRadius: radius.lg, alignItems: 'center', borderWidth: 2, borderColor: colors.border }}>
                <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600' }}>{t('myth.myth')}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Ionicons name={correct ? 'checkmark-circle' : 'information-circle'} size={20} color={correct ? colors.success : colors.danger} />
              <Text style={{ color: correct ? colors.success : colors.danger, fontSize: 16, fontWeight: '700' }}>
                {correct ? t('myth.correct') : t('myth.wrong')} · {item.isMyth ? px.m_isMyth : px.m_isTrue}
              </Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 15, lineHeight: 21, textAlign: 'center' }}>{pick(item.explanation, lang)}</Text>
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
