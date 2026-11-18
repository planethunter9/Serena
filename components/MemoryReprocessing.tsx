// Reprocessamento de memória com estimulação bilateral (luz que vai de um lado ao outro).
// Ferramenta de APOIO, inspirada em técnicas usadas por terapeutas (tipo EMDR).
// NÃO é terapia EMDR nem substitui acompanhamento profissional. Tem salvaguardas.

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { pick, useLang } from '../i18n/i18n';
import { loadMemorySessions, MemorySession, saveMemorySessions } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, PrimaryButton } from './ui';

type L = { pt: string; en: string };
type Step = 'intro' | 'calm' | 'setup' | 'processing' | 'checkin' | 'done';

const DOT = 30;
const SPEEDS = [
  { id: 'slow', label: { pt: 'Lenta', en: 'Slow' } as L, dur: 1600 },
  { id: 'medium', label: { pt: 'Média', en: 'Medium' } as L, dur: 1100 },
  { id: 'fast', label: { pt: 'Rápida', en: 'Fast' } as L, dur: 750 },
];

// Escala simples 0–10 (SUDS).
function Suds({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {Array.from({ length: 11 }, (_, v) => {
        const active = value === v;
        return (
          <Pressable key={v} onPress={() => onChange(v)} accessibilityRole="button" accessibilityState={{ selected: active }}
            style={{ width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.primary : colors.cardAlt, borderWidth: 2, borderColor: active ? colors.primary : colors.border }}>
            <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: '700' }}>{v}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SafetyNote() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => pick(o, lang);
  return (
  <View style={{ backgroundColor: colors.cardAlt, borderRadius: radius.md, borderLeftWidth: 3, borderLeftColor: colors.danger, padding: spacing.md, gap: 6 }}>
    <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 13 }}>
      {tt({ pt: 'Antes de começar', en: 'Before you start' })}
    </Text>
    <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19 }}>
      {tt({
        pt: 'Esta é uma ferramenta de apoio, inspirada em técnicas que os terapeutas usam (estimulação bilateral). Não é terapia EMDR nem substitui um profissional. Escolhe uma memória que consigas tolerar — não comeces pela pior. Podes parar a qualquer momento. Se te sentires muito em baixo, com a sensação de estares "fora" da realidade, ou o mal-estar disparar e não descer, para e procura apoio profissional. Em crise, contacta os serviços de saúde ou uma linha de apoio da tua região.',
        en: 'This is a support tool, inspired by techniques therapists use (bilateral stimulation). It is not EMDR therapy and does not replace a professional. Choose a memory you can tolerate — do not start with the worst one. You can stop at any time. If you feel very low, "detached" from reality, or the distress spikes and will not come down, stop and seek professional support. In a crisis, contact your health services or a support line in your area.',
      })}
    </Text>
  </View>
  );
}

export default function MemoryView() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => pick(o, lang);

  const [step, setStep] = useState<Step>('intro');
  const [before, setBefore] = useState<number | null>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [sets, setSets] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState(SPEEDS[1].dur);
  const [trackW, setTrackW] = useState(0);
  const [history, setHistory] = useState<MemorySession[]>([]);

  const [anim] = useState(() => new Animated.Value(0));
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadMemorySessions().then(setHistory);
    return () => {
      loopRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startAnim() {
    anim.setValue(0);
    const seq = Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: speed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]);
    loopRef.current = Animated.loop(seq);
    loopRef.current.start();
    setRunning(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }
  function stopAnim() {
    loopRef.current?.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setRunning(false);
  }

  function finishSet() {
    stopAnim();
    setSets((s) => s + 1);
    setStep('checkin');
  }

  function anotherSet() {
    setStep('processing');
  }

  function finishSession() {
    stopAnim();
    const now = new Date();
    const entry: MemorySession = {
      id: 'm' + now.getTime(),
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
      ts: now.toISOString(),
      before: before ?? 0,
      after: current ?? before ?? 0,
      note: note.trim(),
    };
    const next = [entry, ...history];
    setHistory(next);
    saveMemorySessions(next);
    setStep('done');
  }

  function reset() {
    stopAnim();
    setStep('intro'); setBefore(null); setCurrent(null); setNote(''); setSets(0); setElapsed(0);
  }

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max(0, trackW - DOT)] });

  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: 40 }}>
      {step === 'intro' && (
        <>
          <SafetyNote />
          <PrimaryButton label={tt({ pt: 'Começar', en: 'Start' })} onPress={() => setStep('calm')} />
          {history.length > 0 && (
            <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
              {tt({ pt: 'Sessões feitas', en: 'Sessions done' })}: {history.length}
            </Text>
          )}
        </>
      )}

      {step === 'calm' && (
        <>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
            {tt({ pt: 'Primeiro, um lugar seguro', en: 'First, a safe place' })}
          </Text>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
            {tt({
              pt: 'Antes de tocar na memória, cria uma âncora de calma. Fecha os olhos por uns segundos e imagina um sítio onde te sentes em segurança e em paz — real ou inventado. Repara nas cores, nos sons, na temperatura. Respira devagar, com a expiração mais longa. Podes voltar aqui sempre que precisares durante o exercício.',
              en: 'Before touching the memory, create an anchor of calm. Close your eyes for a few seconds and picture a place where you feel safe and at ease — real or imagined. Notice the colours, the sounds, the temperature. Breathe slowly, with a longer out-breath. You can come back here any time you need during the exercise.',
            })}
          </Text>
          <PrimaryButton label={tt({ pt: 'Vamos começar', en: "I'm ready" })} onPress={() => setStep('setup')} />
          <Pressable onPress={() => setStep('intro')} hitSlop={8} style={{ alignItems: 'center', paddingVertical: 6 }}>
            <Text style={{ color: colors.textMuted }}>{tt({ pt: 'Voltar atrás', en: 'Go back' })}</Text>
          </Pressable>
        </>
      )}

      {step === 'setup' && (
        <>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
            {tt({ pt: 'A memória', en: 'The memory' })}
          </Text>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
            {tt({
              pt: 'Traz à mente a memória que queres trabalhar e a imagem mais marcante dela. Não precisas de reviver tudo — basta tê-la presente. Se quiseres, dá-lhe um nome curto (só para ti).',
              en: 'Bring to mind the memory you want to work on and its most striking image. You do not need to relive all of it — just hold it present. If you like, give it a short label (just for you).',
            })}
          </Text>
          <TextInput
            value={note} onChangeText={setNote}
            placeholder={tt({ pt: 'Ex.: a virose aos 9 anos (opcional)', en: 'E.g.: the bug when I was 9 (optional)' })}
            placeholderTextColor={colors.textMuted}
            style={{ padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15 }}
          />
          <Card style={{ gap: 10 }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>
              {tt({ pt: 'Quanto mal-estar sentes agora, ao pensar nela? (0–10)', en: 'How much distress do you feel now, thinking of it? (0–10)' })}
            </Text>
            <Suds value={before} onChange={(v) => { setBefore(v); setCurrent(v); }} />
          </Card>
          <PrimaryButton label={tt({ pt: 'Seguir a luz', en: 'Follow the light' })} onPress={() => setStep('processing')} disabled={before === null} />
        </>
      )}

      {step === 'processing' && (
        <>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
            {tt({
              pt: 'Deixa a memória estar presente ao de leve e segue a luz com os olhos, sem mexer a cabeça. Respira normalmente. Quando quiseres, para e vê o que mudou.',
              en: 'Let the memory be lightly present and follow the light with your eyes, without moving your head. Breathe normally. Whenever you want, stop and see what changed.',
            })}
          </Text>

          {/* Pista com a luz */}
          <View onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
            style={{ height: 80, borderRadius: radius.lg, backgroundColor: colors.cardAlt, justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
            <Animated.View style={{ transform: [{ translateX }], width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.9, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 8 }} />
          </View>

          {/* Velocidade */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            {SPEEDS.map((s) => {
              const active = speed === s.dur;
              return (
                <Pressable key={s.id} onPress={() => { setSpeed(s.dur); if (running) { stopAnim(); } }}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? colors.primarySoft : colors.cardAlt, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}>
                  <Text style={{ color: active ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 13 }}>{tt(s.label)}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
            {running
              ? `${tt({ pt: 'A decorrer', en: 'Running' })} · ${elapsed}s`
              : tt({ pt: 'Sugestão: cada série ~20–30 segundos.', en: 'Tip: each set ~20–30 seconds.' })}
          </Text>

          {!running ? (
            <PrimaryButton label={tt({ pt: 'Começar série', en: 'Start set' })} onPress={startAnim} />
          ) : (
            <PrimaryButton label={tt({ pt: 'Parar e ver', en: 'Stop and check' })} onPress={finishSet} />
          )}

          <Pressable onPress={() => { stopAnim(); setStep('calm'); }} hitSlop={8} style={{ alignItems: 'center', paddingVertical: 6 }}>
            <Text style={{ color: colors.textMuted }}>{tt({ pt: 'Preciso de uma pausa (lugar seguro)', en: 'I need a break (safe place)' })}</Text>
          </Pressable>
        </>
      )}

      {step === 'checkin' && (
        <>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
            {tt({ pt: 'O que mudou?', en: 'What changed?' })}
          </Text>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
            {tt({
              pt: 'Respira devagar. Repara, sem julgar, no que surgiu — uma imagem, um pensamento, uma sensação no corpo. Agora, voltando a pensar na memória, quanto mal-estar sentes?',
              en: 'Breathe slowly. Notice, without judging, what came up — an image, a thought, a body sensation. Now, thinking of the memory again, how much distress do you feel?',
            })}
          </Text>
          <Card style={{ gap: 10 }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{tt({ pt: 'Mal-estar agora (0–10)', en: 'Distress now (0–10)' })}</Text>
            <Suds value={current} onChange={setCurrent} />
            {before !== null && current !== null && (
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                {tt({ pt: 'Início', en: 'Start' })} {before} → {tt({ pt: 'agora', en: 'now' })} {current} · {sets} {tt({ pt: 'série(s)', en: 'set(s)' })}
              </Text>
            )}
          </Card>

          {current !== null && current >= 8 && (
            <View style={{ backgroundColor: colors.cardAlt, borderRadius: radius.md, borderLeftWidth: 3, borderLeftColor: colors.danger, padding: spacing.md }}>
              <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19 }}>
                {tt({
                  pt: 'O mal-estar ainda está alto. Não faz mal. Se preferires, volta ao lugar seguro e termina por hoje — não tens de resolver tudo numa vez. Se isto se repetir sem descer, vale mesmo a pena o apoio de um profissional.',
                  en: 'The distress is still high. That is okay. If you prefer, return to the safe place and finish for today — you do not have to resolve everything at once. If this keeps happening without coming down, it is really worth a professional\'s support.',
                })}
              </Text>
            </View>
          )}

          <PrimaryButton label={tt({ pt: 'Fazer outra série', en: 'Do another set' })} onPress={anotherSet} />
          <Pressable onPress={finishSession} hitSlop={8} style={{ alignItems: 'center', paddingVertical: 10 }}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>{tt({ pt: 'Terminar sessão', en: 'Finish session' })}</Text>
          </Pressable>
        </>
      )}

      {step === 'done' && (
        <>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
            {tt({ pt: 'Fechar com calma', en: 'Close with calm' })}
          </Text>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
            {tt({
              pt: 'Volta ao teu lugar seguro por uns momentos e respira devagar. Seja qual for o número, o importante é que te aproximaste da memória em vez de fugires dela — isso é coragem. Podes repetir noutro dia; estas coisas trabalham-se aos poucos.',
              en: 'Return to your safe place for a few moments and breathe slowly. Whatever the number, what matters is that you moved toward the memory instead of fleeing it — that is courage. You can repeat another day; these things are worked through little by little.',
            })}
          </Text>
          {before !== null && current !== null && (
            <Card style={{ gap: 4 }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{tt({ pt: 'Esta sessão', en: 'This session' })}</Text>
              <Text style={{ color: colors.text, fontSize: 15 }}>{before} → {current} · {sets} {tt({ pt: 'série(s)', en: 'set(s)' })}</Text>
            </Card>
          )}
          <PrimaryButton label={tt({ pt: 'Concluir', en: 'Done' })} onPress={reset} />
        </>
      )}
    </ScrollView>
  );
}
