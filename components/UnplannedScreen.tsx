// Exposição não planeada: um susto inesperado (alguém enjoado, uma cena, um
// cheiro, um enjoo próprio…) aproveitado como treino, em vez de fugir.
//  1. "Estou nisto agora" — passos curtos para o próprio momento + atalhos
//     (respiração, surfar a vontade, linhas de apoio).
//  2. Registo depois — o que aconteceu, onde, antes/pico/depois, o que temia e
//     se aconteceu, comportamentos de segurança usados, o que aprendi.
//  3. Histórico com o detalhe de cada registo.

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SAFETY_BEHAVIORS } from '../data/safety';
import { tr2, useLang } from '../i18n/i18n';
import { isoLocal, loadUnplanned, saveUnplanned, UnplannedLog } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { HistoryButton } from './HistoryButton';
import { Card, PrimaryButton, TopBackBar } from './ui';

type L = { pt: string; en: string };

// O que pode ter desencadeado o momento.
export const UNPLANNED_TRIGGERS: { id: string; label: L }[] = [
  { id: 'someone', label: { pt: 'Alguém enjoado ou a vomitar', en: 'Someone nauseous or vomiting' } },
  { id: 'heard', label: { pt: 'Ouvi alguém a vomitar', en: 'Heard someone vomiting' } },
  { id: 'news', label: { pt: 'Notícia de vírus / alguém doente', en: 'News of a bug / someone ill' } },
  { id: 'scene', label: { pt: 'Cena ou imagem (filme, redes)', en: 'Scene or image (film, social media)' } },
  { id: 'talk', label: { pt: 'Conversa sobre o tema', en: 'Conversation about it' } },
  { id: 'smell', label: { pt: 'Cheiro', en: 'Smell' } },
  { id: 'body', label: { pt: 'Enjoo ou sensação no meu corpo', en: 'Nausea or a sensation in my body' } },
  { id: 'food', label: { pt: 'Comida que me pareceu "arriscada"', en: 'Food that felt "risky"' } },
  { id: 'transport', label: { pt: 'Transporte / sítio sem saída fácil', en: 'Transport / place with no easy exit' } },
  { id: 'child', label: { pt: 'Criança doente', en: 'A sick child' } },
];

// Passos para o próprio momento (curtos, para ler em pânico).
const NOW_STEPS: { icon: keyof typeof Ionicons.glyphMap; title: L; text: L }[] = [
  { icon: 'hand-left-outline', title: { pt: 'Para', en: 'Pause' },
    text: { pt: 'Não tens de fazer nada já. Isto é medo — desconfortável, mas não perigoso.', en: "You don't have to do anything right now. This is fear — uncomfortable, not dangerous." } },
  { icon: 'leaf-outline', title: { pt: 'Respira devagar', en: 'Breathe slowly' },
    text: { pt: 'Expira mais tempo do que inspiras (4 a entrar, 6 a sair). Solta os ombros e a barriga.', en: 'Breathe out longer than in (4 in, 6 out). Drop your shoulders and soften your belly.' } },
  { icon: 'eye-outline', title: { pt: 'Nomeia o que sentes', en: 'Name what you feel' },
    text: { pt: '"Estou a sentir medo. O meu corpo está em alerta." Repara nas sensações sem lutar contra elas.', en: '"I\'m feeling fear. My body is on alert." Notice the sensations without fighting them.' } },
  { icon: 'footsteps-outline', title: { pt: 'Fica, se conseguires', en: 'Stay, if you can' },
    text: { pt: 'Evita fugir, verificar ou procurar tranquilização. Cada minuto que ficas ensina ao cérebro que aguentas.', en: 'Avoid escaping, checking or seeking reassurance. Every minute you stay teaches your brain you can cope.' } },
  { icon: 'trending-down-outline', title: { pt: 'Deixa a onda passar', en: 'Let the wave pass' },
    text: { pt: 'O medo sobe, atinge um pico e desce sozinho. Não precisas de o fazer desaparecer.', en: "Fear rises, peaks and falls on its own. You don't need to make it disappear." } },
];

const PHRASES: L[] = [
  { pt: 'Isto é desconfortável, mas eu aguento.', en: 'This is uncomfortable, but I can handle it.' },
  { pt: 'Não preciso de ter a certeza de que vai correr bem.', en: "I don't need to be certain it'll be fine." },
  { pt: 'Já senti isto antes e passou.', en: "I've felt this before and it passed." },
  { pt: 'Sentir enjoo não é o mesmo que vomitar.', en: 'Feeling nauseous is not the same as vomiting.' },
];

function Suds({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {Array.from({ length: 11 }, (_, v) => {
        const active = value === v;
        return (
          <Pressable key={v} onPress={() => onChange(v)} accessibilityRole="button" accessibilityState={{ selected: active }} style={{ width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.primary : colors.cardAlt, borderWidth: 2, borderColor: active ? colors.primary : colors.border }}>
            <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700' }}>{v}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 2, borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primarySoft : colors.cardAlt, maxWidth: '100%' }}>
      <Text style={{ color: active ? colors.primary : colors.text, fontSize: 13, fontWeight: active ? '700' : '500' }}>{label}</Text>
    </Pressable>
  );
}

export default function UnplannedScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const router = useRouter();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const lx = (o: L) => tr2(lang, o.pt, o.en);

  const [logs, setLogs] = useState<UnplannedLog[]>([]);
  const [nowOpen, setNowOpen] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);

  // Formulário
  const [triggers, setTriggers] = useState<string[]>([]);
  const [otherTrigger, setOtherTrigger] = useState('');
  const [where, setWhere] = useState('');
  const [before, setBefore] = useState<number | null>(null);
  const [peak, setPeak] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [fear, setFear] = useState('');
  const [happened, setHappened] = useState<'yes' | 'partly' | 'no' | null>(null);
  const [stayed, setStayed] = useState(true);
  const [safety, setSafety] = useState<string[]>([]);
  const [showSafety, setShowSafety] = useState(false);
  const [learned, setLearned] = useState('');
  const [note, setNote] = useState('');
  const [openLog, setOpenLog] = useState<string | null>(null);

  useEffect(() => {
    loadUnplanned().then(setLogs);
  }, []);

  const toggleIn = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  function reset() {
    setTriggers([]); setOtherTrigger(''); setWhere('');
    setBefore(null); setPeak(null); setAfter(null);
    setFear(''); setHappened(null); setStayed(true);
    setSafety([]); setShowSafety(false); setLearned(''); setNote('');
  }

  function save() {
    if (before === null) return;
    const now = new Date();
    const trig = [...triggers, ...(otherTrigger.trim() ? [otherTrigger.trim()] : [])];
    const entry: UnplannedLog = {
      id: 'u' + now.getTime(),
      date: isoLocal(now),
      ts: now.toISOString(),
      before,
      peak: peak ?? undefined,
      after: after ?? before,
      stayed,
      note: note.trim(),
      triggers: trig,
      where: where.trim() || undefined,
      fear: fear.trim() || undefined,
      happened: happened ?? undefined,
      safety,
      learned: learned.trim() || undefined,
    };
    const next = [entry, ...logs];
    setLogs(next);
    saveUnplanned(next);
    reset();
    Alert.alert(
      L('Bem feito 💛', 'Well done 💛'),
      stayed
        ? L('Enfrentaste um momento que não escolheste. Isso conta muito.', "You faced a moment you didn't choose. That counts a lot.")
        : L('Registar já é um passo. Da próxima vez, tenta ficar só mais um bocadinho.', 'Logging it is already a step. Next time, try to stay just a little longer.'),
    );
  }

  function removeLog(id: string) {
    Alert.alert(L('Eliminar registo?', 'Delete entry?'), '', [
      { text: L('Cancelar', 'Cancel'), style: 'cancel' },
      { text: L('Eliminar', 'Delete'), style: 'destructive', onPress: () => {
        const next = logs.filter((l) => l.id !== id);
        setLogs(next);
        saveUnplanned(next);
      } },
    ]);
  }

  const triggerLabel = (id: string) => {
    const f = UNPLANNED_TRIGGERS.find((x) => x.id === id);
    return f ? lx(f.label) : id;
  };
  const safetyLabel = (id: string) => {
    const f = SAFETY_BEHAVIORS.find((x) => x.id === id);
    return f ? lx(f.label) : id;
  };
  const happenedLabel = (h: 'yes' | 'partly' | 'no') =>
    h === 'yes' ? L('Sim', 'Yes') : h === 'partly' ? L('Em parte', 'Partly') : L('Não', 'No');

  const label = (text: string) => <Text style={{ color: colors.text, fontWeight: '600' }}>{text}</Text>;
  const hint = (text: string) => <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 17 }}>{text}</Text>;
  const input = { padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15 } as const;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('unplanned.title')} onBack={onBack} right={<HistoryButton kind="unplanned" />} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, gap: 6 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{t('unplanned.guideTitle')}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{t('unplanned.guide')}</Text>
        </Card>

        {/* ---------- Estou nisto agora ---------- */}
        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.primary, overflow: 'hidden' }}>
          <Pressable onPress={() => setNowOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: nowOpen }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.lg }}>
            <Ionicons name="pulse-outline" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{L('Estou nisto agora', "It's happening now")}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{L('Passos rápidos para este momento', 'Quick steps for this moment')}</Text>
            </View>
            <Ionicons name={nowOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </Pressable>
          {nowOpen && (
            <View style={{ padding: spacing.lg, paddingTop: 0, gap: spacing.md }}>
              {NOW_STEPS.map((s, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={s.icon} size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: colors.text, fontWeight: '700' }}>{i + 1}. {lx(s.title)}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{lx(s.text)}</Text>
                  </View>
                </View>
              ))}

              {/* Frase para repetir */}
              <Pressable onPress={() => setPhraseIdx((p) => (p + 1) % PHRASES.length)} style={{ backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, gap: 4 }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{L('Diz a ti (toca para outra)', 'Tell yourself (tap for another)')}</Text>
                <Text style={{ color: colors.text, fontSize: 16, fontStyle: 'italic', fontWeight: '600' }}>“{lx(PHRASES[phraseIdx])}”</Text>
              </Pressable>

              {/* Atalhos */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {([
                  { icon: 'leaf-outline', label: L('Respiração', 'Breathing'), path: '/breathing' },
                  { icon: 'water-outline', label: L('Surfar a vontade', 'Urge surfing'), path: '/urgesurf' },
                  { icon: 'call-outline', label: L('Linhas de apoio', 'Support lines'), path: '/crisislines' },
                ] as const).map((a) => (
                  <Pressable key={a.path} onPress={() => router.push(a.path as any)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, height: 38, borderRadius: 999 }}>
                    <Ionicons name={a.icon} size={16} color={colors.primary} />
                    <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>{a.label}</Text>
                  </Pressable>
                ))}
              </View>
              {hint(L('Quando a onda baixar, regista abaixo — é aí que se consolida a aprendizagem.', 'When the wave settles, log it below — that is where the learning sticks.'))}
            </View>
          )}
        </View>

        {/* ---------- Registo ---------- */}
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800', marginTop: spacing.sm }}>{L('Registar o momento', 'Log the moment')}</Text>

        <Card style={{ gap: 8 }}>
          {label(L('O que aconteceu?', 'What happened?'))}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {UNPLANNED_TRIGGERS.map((tr) => (
              <Chip key={tr.id} label={lx(tr.label)} active={triggers.includes(tr.id)} onPress={() => setTriggers((l) => toggleIn(l, tr.id))} />
            ))}
          </View>
          <TextInput value={otherTrigger} onChangeText={setOtherTrigger} placeholder={L('Outra coisa…', 'Something else…')} placeholderTextColor={colors.textMuted} style={input} />
        </Card>

        <Card style={{ gap: 8 }}>
          {label(L('Onde estavas?', 'Where were you?'))}
          <TextInput value={where} onChangeText={setWhere} placeholder={L('Ex.: no autocarro, no trabalho, em casa…', 'E.g. on the bus, at work, at home…')} placeholderTextColor={colors.textMuted} style={input} />
        </Card>

        <Card style={{ gap: 8 }}>
          {label(L('O que temeste que acontecesse?', 'What did you fear would happen?'))}
          <TextInput value={fear} onChangeText={setFear} multiline placeholder={L('Ex.: "Vou vomitar", "vou apanhar o vírus"…', 'E.g. "I\'ll throw up", "I\'ll catch the bug"…')} placeholderTextColor={colors.textMuted} style={[input, { minHeight: 56, textAlignVertical: 'top' }]} />
        </Card>

        <Card style={{ gap: 10 }}>
          {label(t('exposure.before'))}
          {hint(L('Quando percebeste o que se passava (0 = calma, 10 = máximo).', 'When you realised what was happening (0 = calm, 10 = max).'))}
          <Suds value={before} onChange={setBefore} />
          {label(L('Pico do desconforto', 'Peak discomfort'))}
          <Suds value={peak} onChange={setPeak} />
          {label(t('exposure.after'))}
          <Suds value={after} onChange={setAfter} />
        </Card>

        <Card style={{ gap: 10 }}>
          <Pressable onPress={() => setStayed((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: stayed }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: stayed ? colors.primary : colors.border, backgroundColor: stayed ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {stayed && <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>✓</Text>}
            </View>
            <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{t('unplanned.stayed')}</Text>
          </Pressable>

          <Pressable onPress={() => setShowSafety((o) => !o)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: colors.text, fontWeight: '600', flex: 1 }}>
              {L('Usei comportamentos de segurança?', 'Did I use safety behaviours?')}{safety.length ? ` (${safety.length})` : ''}
            </Text>
            <Ionicons name={showSafety ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </Pressable>
          {showSafety && (
            <View style={{ gap: 8 }}>
              {hint(L('Sem julgamento — saber o que fizeste ajuda a largar da próxima vez.', 'No judgement — knowing what you did helps you drop it next time.'))}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SAFETY_BEHAVIORS.map((b) => (
                  <Chip key={b.id} label={lx(b.label)} active={safety.includes(b.id)} onPress={() => setSafety((l) => toggleIn(l, b.id))} />
                ))}
              </View>
            </View>
          )}
        </Card>

        <Card style={{ gap: 8 }}>
          {label(L('O que temias aconteceu?', 'Did what you feared happen?'))}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['no', 'partly', 'yes'] as const).map((h) => (
              <Chip key={h} label={happenedLabel(h)} active={happened === h} onPress={() => setHappened(happened === h ? null : h)} />
            ))}
          </View>
          {label(L('O que aprendi?', 'What did I learn?'))}
          <TextInput value={learned} onChangeText={setLearned} multiline placeholder={L('Ex.: "Senti enjoo e passou sozinho", "consegui ficar"…', 'E.g. "I felt sick and it passed on its own", "I managed to stay"…')} placeholderTextColor={colors.textMuted} style={[input, { minHeight: 56, textAlignVertical: 'top' }]} />
        </Card>

        <TextInput value={note} onChangeText={setNote} placeholder={t('exposure.note')} placeholderTextColor={colors.textMuted} multiline style={[input, { minHeight: 60, textAlignVertical: 'top' }]} />
        <PrimaryButton label={t('unplanned.save')} onPress={save} disabled={before === null} />
        {before === null && hint(L('Indica pelo menos o desconforto "antes" para guardar.', 'Enter at least the "before" discomfort to save.'))}

        {/* ---------- Histórico ---------- */}
        {logs.length > 0 && (
          <View style={{ gap: 8, marginTop: 4 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{t('unplanned.history')}</Text>
            {logs.map((l) => {
              const open = openLog === l.id;
              const trig = (l.triggers ?? []).map(triggerLabel);
              return (
                <View key={l.id} style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
                  <Pressable onPress={() => setOpenLog(open ? null : l.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.lg }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{l.date.split('-').reverse().join('/')}</Text>
                      {trig.length > 0 && <Text numberOfLines={1} style={{ color: colors.text, fontSize: 14 }}>{trig.join(', ')}</Text>}
                    </View>
                    <Text style={{ color: colors.text, fontWeight: '600' }}>
                      {l.before}{l.peak != null ? ` → ${l.peak}` : ''} → {l.after}{l.stayed ? '  ✓' : ''}
                    </Text>
                    <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                  </Pressable>
                  {open && (
                    <View style={{ padding: spacing.lg, paddingTop: 0, gap: 6 }}>
                      {l.where ? <Detail k={L('Onde', 'Where')} v={l.where} /> : null}
                      {l.fear ? <Detail k={L('Temia', 'Feared')} v={l.fear} /> : null}
                      {l.happened ? <Detail k={L('Aconteceu?', 'Did it happen?')} v={happenedLabel(l.happened)} /> : null}
                      <Detail k={L('Antes / pico / depois', 'Before / peak / after')} v={`${l.before} / ${l.peak ?? '–'} / ${l.after}`} />
                      <Detail k={L('Fiquei', 'Stayed')} v={l.stayed ? L('Sim', 'Yes') : L('Não', 'No')} />
                      {l.safety && l.safety.length > 0 ? <Detail k={L('Segurança usada', 'Safety used')} v={l.safety.map(safetyLabel).join(', ')} /> : null}
                      {l.learned ? <Detail k={L('Aprendi', 'Learned')} v={l.learned} /> : null}
                      {l.note ? <Detail k={L('Nota', 'Note')} v={l.note} /> : null}
                      <Pressable onPress={() => removeLog(l.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 4 }}>
                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                        <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 13 }}>{L('Eliminar', 'Delete')}</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Detail({ k, v }: { k: string; v: string }) {
  const { colors } = useTheme();
  return (
    <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
      <Text style={{ color: colors.textMuted }}>{k}: </Text>{v}
    </Text>
  );
}
