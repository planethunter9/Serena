// Plano de prevenção de recaída ("blueprint"): o que aprendi, os meus sinais de
// alerta e o que faço se a fobia voltar. Inclui notas sobre dias maus e sobre o
// reasseguramento. Guarda-se automaticamente.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLang , tr2 } from '../i18n/i18n';
import { plansText } from '../data/plansText';
import { loadExperiments, loadExposureSessions, loadRelapsePlan, loadUnplanned, RelapsePlan, saveRelapsePlan } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

export function RelapseBody() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const [p, setP] = useState<RelapsePlan | null>(null);
  const px = plansText(lang);
  // Aprendizagens escritas nas sessões (exposição, não planeada, experiências).
  const [learnings, setLearnings] = useState<string[]>([]);

  useEffect(() => {
    loadRelapsePlan().then(setP);
    Promise.all([loadExposureSessions(), loadUnplanned(), loadExperiments()]).then(([exp, unp, xp]) => {
      const all = [
        ...(Array.isArray(exp) ? exp : []).map((e) => ({ ts: e.ts || e.date, t: e.learned })),
        ...(Array.isArray(unp) ? unp : []).map((u) => ({ ts: u.ts || u.date, t: u.learned })),
        ...(Array.isArray(xp) ? xp : []).map((x) => ({ ts: x.ts || x.date, t: x.learned })),
      ].filter((x) => typeof x.t === 'string' && x.t.trim()) as { ts: string; t: string }[];
      all.sort((a, b) => (a.ts < b.ts ? 1 : -1));
      setLearnings(Array.from(new Set(all.map((x) => x.t.trim()))).slice(0, 8));
    });
  }, []);

  if (!p) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  function set<K extends keyof RelapsePlan>(key: K, value: string) {
    setP((prev) => {
      const next = { ...(prev as RelapsePlan), [key]: value };
      saveRelapsePlan(next);
      return next;
    });
  }

  const suggestions = learnings.filter((x) => !p.learned.includes(x));
  function addLearning(txt: string) {
    const cur = p!.learned.trim();
    set('learned', cur ? `${cur}\n• ${txt}` : `• ${txt}`);
  }

  const field = (label: string, hint: string, value: string, onChange: (v: string) => void) => (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{label}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>{hint}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline
        placeholder={L('Escreve aqui…', 'Write here…')}
        placeholderTextColor={colors.textMuted}
        style={{ minHeight: 84, padding: 14, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15, textAlignVertical: 'top' }}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
          {L('Recuperar não é apagar o medo para sempre — é saber o que fazer quando ele tenta voltar. Escreve o teu plano; fica guardado para quando precisares. Vai atualizando à medida que aprendes mais sobre ti.',
             'Recovery is not erasing fear forever — it is knowing what to do when it tries to come back. Write your plan; it is saved for when you need it. Update it as you learn more about yourself.')}
        </Text>

        <Card style={{ gap: spacing.md }}>
          {field(
            L('O que aprendi', 'What I learned'),
            L('O que te ajudou mesmo? O que percebeste sobre o medo e sobre ti?', 'What really helped? What did you realise about the fear and about yourself?'),
            p.learned, (v) => set('learned', v),
          )}
          {suggestions.length > 0 && (
            <View style={{ gap: 6, marginTop: -4 }}>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{px.fromSessions}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{px.fromHint}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {suggestions.map((txt) => (
                  <Pressable key={txt} onPress={() => addLearning(txt)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '100%', backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                    <Ionicons name="add" size={14} color={colors.primary} />
                    <Text numberOfLines={2} style={{ color: colors.text, fontSize: 13, flexShrink: 1 }}>{txt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          {field(
            L('Os meus sinais de alerta', 'My warning signs'),
            L('O que costuma aparecer primeiro quando o medo começa a crescer (evitar, verificar, pedir reassurance…)?', 'What usually shows up first when fear starts to grow (avoiding, checking, seeking reassurance…)?'),
            p.warningSigns, (v) => set('warningSigns', v),
          )}
          {field(
            L('O que faço se voltar', 'What I do if it returns'),
            L('Os teus primeiros passos: voltar à exposição, retomar um exercício, falar com alguém, procurar ajuda profissional…', 'Your first steps: go back to exposure, resume an exercise, talk to someone, seek professional help…'),
            p.ifItReturns, (v) => set('ifItReturns', v),
          )}
        </Card>

        {/* Dias maus */}
        <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="partly-sunny-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>{L('Um dia mau não apaga o progresso', 'A bad day does not erase progress')}</Text>
          </View>
          <Text style={{ color: colors.text, fontSize: 14, lineHeight: 21 }}>
            {L('Recaídas e dias piores fazem parte — não são um fracasso nem voltar à estaca zero. O que aprendeste continua lá. Um tropeço é informação, não um veredicto: repara no que o despoletou, sê gentil contigo e dá o passo seguinte, por mais pequeno que seja.',
               'Setbacks and worse days are part of it — they are not failure or going back to square one. What you learned is still there. A stumble is information, not a verdict: notice what triggered it, be kind to yourself, and take the next step, however small.')}
          </Text>
        </View>

        {/* Reasseguramento */}
        <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="shield-half-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>{L('Cuidado com o reasseguramento', 'Watch out for reassurance')}</Text>
          </View>
          <Text style={{ color: colors.text, fontSize: 14, lineHeight: 21 }}>
            {L('Procurar provas de que "está tudo bem" — perguntar à mesma pessoa, pesquisar sintomas, verificar validades, reler factos vezes sem conta — alivia por minutos mas alimenta a fobia a longo prazo. Inclui a própria app: usa-a para aprender e praticar, não para te tranquilizares sempre que a ansiedade aperta. Tolerar a dúvida, sem a resolver, é que enfraquece o medo.',
               'Seeking proof that "everything is fine" — asking the same person, searching symptoms, checking expiry dates, re-reading facts over and over — soothes for minutes but feeds the phobia long term. That includes this app: use it to learn and practise, not to reassure yourself every time anxiety spikes. Tolerating doubt, without resolving it, is what weakens the fear.')}
          </Text>
        </View>

        <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
          {L('Guarda-se sozinho. Isto é apoio psicoeducativo e não substitui um profissional de saúde.',
             'Saved automatically. This is psychoeducational support and does not replace a health professional.')}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function RelapsePlanScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={L('Plano de prevenção de recaída', 'Relapse-prevention plan')} onBack={onBack} />
      <RelapseBody />
    </View>
  );
}
