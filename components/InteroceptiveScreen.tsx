// Exposição interocetiva guiada: provocar de propósito sensações corporais
// parecidas com as temidas, para o corpo aprender que não são perigosas.
// NUNCA se provoca o vómito. Com avisos de segurança.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, PrimaryButton } from './ui';

type L = { pt: string; en: string };
type Ex = { id: string; name: L; sensation: L; how: L; seconds: number };

const EXERCISES: Ex[] = [
  { id: 'spin', name: { pt: 'Rodar na cadeira', en: 'Spin on a chair' }, sensation: { pt: 'tontura', en: 'dizziness' },
    how: { pt: 'Senta-te numa cadeira giratória e roda devagar durante o tempo indicado. Depois para e fica com a tontura.', en: 'Sit on a swivel chair and spin slowly for the set time. Then stop and stay with the dizziness.' }, seconds: 30 },
  { id: 'overbreathe', name: { pt: 'Respirar mais depressa', en: 'Breathe faster' }, sensation: { pt: 'cabeça leve, formigueiro', en: 'light-headedness, tingling' },
    how: { pt: 'Respira um pouco mais depressa e fundo do que o normal durante o tempo indicado. Se ficar demais, abranda.', en: 'Breathe a little faster and deeper than usual for the set time. If it gets too much, slow down.' }, seconds: 30 },
  { id: 'straw', name: { pt: 'Respirar por uma palhinha', en: 'Breathe through a straw' }, sensation: { pt: 'falta de ar', en: 'shortness of breath' },
    how: { pt: 'Respira só pela boca através de uma palhinha fina (tapa o nariz se precisares). Fica com a sensação de ar mais "curto".', en: 'Breathe only through a thin straw with your mouth (pinch your nose if needed). Stay with the "shorter" air feeling.' }, seconds: 45 },
  { id: 'hold', name: { pt: 'Suster a respiração', en: 'Hold your breath' }, sensation: { pt: 'aperto no peito', en: 'chest tightness' },
    how: { pt: 'Suster a respiração durante o tempo indicado (ou o que conseguires). Depois respira normalmente e observa.', en: 'Hold your breath for the set time (or as long as you can). Then breathe normally and notice.' }, seconds: 20 },
  { id: 'jog', name: { pt: 'Correr no sítio', en: 'Jog in place' }, sensation: { pt: 'coração acelerado, calor', en: 'racing heart, heat' },
    how: { pt: 'Corre no sítio ou sobe e desce um degrau durante o tempo indicado, para sentir o coração acelerado.', en: 'Jog in place or step up and down for the set time, to feel your heart race.' }, seconds: 60 },
  { id: 'shake', name: { pt: 'Abanar a cabeça', en: 'Shake your head' }, sensation: { pt: 'tontura', en: 'dizziness' },
    how: { pt: 'Abana a cabeça de um lado para o outro, devagar, durante o tempo indicado. Depois para e fica com a sensação.', en: 'Shake your head side to side, slowly, for the set time. Then stop and stay with the sensation.' }, seconds: 30 },
];

function Suds({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {Array.from({ length: 11 }, (_, v) => {
        const active = value === v;
        return (
          <Pressable key={v} onPress={() => onChange(v)} style={{ width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.primary : colors.cardAlt, borderWidth: 2, borderColor: active ? colors.primary : colors.border }}>
            <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700' }}>{v}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function InteroceptiveScreen() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => o[lang];

  const [sel, setSel] = useState<Ex | null>(null);
  const [before, setBefore] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function open(ex: Ex) {
    setSel(ex); setBefore(null); setAfter(null); setRunning(false); setLeft(ex.seconds);
  }
  function start() {
    if (!sel) return;
    setRunning(true); setLeft(sel.seconds);
    timer.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) { if (timer.current) clearInterval(timer.current); setRunning(false); return 0; }
        return v - 1;
      });
    }, 1000);
  }
  function stop() {
    if (timer.current) clearInterval(timer.current);
    setRunning(false);
  }

  const SafetyNote = () => (
    <View style={{ backgroundColor: colors.cardAlt, borderRadius: radius.md, borderLeftWidth: 3, borderLeftColor: colors.danger, padding: spacing.md }}>
      <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 13, marginBottom: 4 }}>{tt({ pt: 'Antes de começar', en: 'Before you start' })}</Text>
      <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19 }}>
        {tt({
          pt: 'Isto é para te habituares às sensações — nunca se provoca o vómito. Para se te sentires mesmo mal, a ponto de desmaiar, ou se tiveres problemas de coração, respiratórios, gravidez ou outra condição: fala primeiro com um profissional sobre o que é adequado para ti.',
          en: 'This is to get used to the sensations — you never induce vomiting. Stop if you feel really unwell or faint, and if you have heart or breathing problems, are pregnant, or have another condition: check first with a professional about what is right for you.',
        })}
      </Text>
    </View>
  );

  // Detalhe de um exercício.
  if (sel) {
    return (
      <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: 40 }}>
        <Pressable onPress={() => { stop(); setSel(null); }} hitSlop={8}>
          <Text style={{ color: colors.textMuted }}>‹ {tt({ pt: 'Voltar', en: 'Back' })}</Text>
        </Pressable>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{tt(sel.name)}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{tt({ pt: 'Sensação', en: 'Sensation' })}: {tt(sel.sensation)}</Text>

        <Card style={{ gap: 6 }}>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{tt(sel.how)}</Text>
        </Card>

        <Card style={{ gap: 10 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{tt({ pt: 'Mal-estar antes (0–10)', en: 'Distress before (0–10)' })}</Text>
          <Suds value={before} onChange={setBefore} />
        </Card>

        {/* Cronómetro */}
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{ color: colors.primary, fontSize: 44, fontWeight: '800' }}>{left}s</Text>
          {!running ? (
            <PrimaryButton label={left === sel.seconds ? tt({ pt: 'Começar', en: 'Start' }) : tt({ pt: 'Recomeçar', en: 'Restart' })} onPress={start} disabled={before === null} />
          ) : (
            <PrimaryButton label={tt({ pt: 'Parar', en: 'Stop' })} onPress={stop} />
          )}
          {before === null && <Text style={{ color: colors.textMuted, fontSize: 12 }}>{tt({ pt: 'Avalia o mal-estar antes de começar.', en: 'Rate the distress before starting.' })}</Text>}
        </View>

        {!running && left === 0 && (
          <Card style={{ gap: 10 }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{tt({ pt: 'E agora? Fica com a sensação até descer. Mal-estar agora (0–10)', en: 'And now? Stay with the sensation until it drops. Distress now (0–10)' })}</Text>
            <Suds value={after} onChange={setAfter} />
            {before !== null && after !== null && (
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{tt({ pt: 'Antes', en: 'Before' })} {before} → {tt({ pt: 'agora', en: 'now' })} {after}</Text>
            )}
            <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
              {tt({ pt: 'Repete o mesmo exercício algumas vezes até a sensação deixar de assustar.', en: 'Repeat the same exercise a few times until the sensation stops being scary.' })}
            </Text>
          </Card>
        )}
      </ScrollView>
    );
  }

  // Lista.
  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: 40 }}>
      <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
        {tt({
          pt: 'Exercícios simples que criam sensações parecidas com as temidas, para o corpo aprender que não são perigosas. Escolhe um, avalia, fica com a sensação e repete.',
          en: 'Simple exercises that create sensations similar to the feared ones, so the body learns they are not dangerous. Pick one, rate, stay with the sensation and repeat.',
        })}
      </Text>
      <SafetyNote />
      {EXERCISES.map((ex) => (
        <Pressable key={ex.id} onPress={() => open(ex)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="pulse-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{tt(ex.name)}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{tt(ex.sensation)} · {ex.seconds}s</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      ))}
    </ScrollView>
  );
}
