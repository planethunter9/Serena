// Aceitação e valores (ACT): princípios para interiorizar, a regra do "abranda
// tudo" para a urgência, os meus valores e compromissos de aproximação.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  ActCommitment,
  ActValues,
  isoLocal,
  loadActCommitments,
  loadActValues,
  saveActCommitments,
  saveActValues,
} from '../storage/storage';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, PrimaryButton } from './ui';

type L = { pt: string; en: string };

const PRINCIPLES: { title: L; body: L }[] = [
  {
    title: { pt: 'O vómito existe — e um dia vai acontecer', en: 'Vomiting exists — and one day it will happen' },
    body: { pt: 'Por mais energia que gastes a tentar evitá-lo, não o controlas. Aceitar que é possível (e raro) devolve-te a energia que a vigilância rouba.', en: "However much energy you spend avoiding it, you don't control it. Accepting it's possible (and rare) gives back the energy vigilance steals." },
  },
  {
    title: { pt: 'Recuperar não é deixar de ter medo', en: "Recovery isn't the end of fear" },
    body: { pt: 'Recuperar é voltar a viver a tua vida ao lado do medo e da ansiedade — não esperar que desapareçam para começar.', en: "Recovery is living your life alongside fear and anxiety — not waiting for them to vanish before you start." },
  },
  {
    title: { pt: 'Aprender a sofrer', en: 'Learning to suffer' },
    body: { pt: 'Não é procurar dor. É deixar o desconforto existir sem lutar contra ele — e descobrir que és capaz de o aguentar.', en: "It's not seeking pain. It's letting discomfort be there without fighting it — and finding you can bear it." },
  },
  {
    title: { pt: 'Estar ok com sentir medo', en: 'Being ok with feeling fear' },
    body: { pt: 'Não precisas de te livrar do medo para agir. Podes ter medo e, ainda assim, fazer o que importa.', en: "You don't need to get rid of fear to act. You can be afraid and still do what matters." },
  },
];

const URGENCY_STEPS: L[] = [
  { pt: 'Abranda a respiração — expira mais devagar do que inspiras.', en: 'Slow your breathing — breathe out more slowly than you breathe in.' },
  { pt: 'Abranda os movimentos. Não corras para "resolver".', en: "Slow your movements. Don't rush to 'fix' it." },
  { pt: 'Nomeia: "isto é urgência, não é emergência."', en: 'Name it: "this is urgency, not an emergency."' },
  { pt: 'Deixa a onda subir e descer. Não tens de agir.', en: "Let the wave rise and fall. You don't have to act." },
];

const COMMITMENTS: { key: string; label: L }[] = [
  { key: 'eatNauseous', label: { pt: 'Comer mesmo enjoada (ansiedade ou doença)', en: 'Eat even when nauseous (anxiety or illness)' } },
  { key: 'keepPlans', label: { pt: 'Fazer o que planeei, mesmo sem me sentir bem', en: 'Do what I planned, even when I feel off' } },
  { key: 'approach', label: { pt: 'Ir atrás do que costumo evitar', en: 'Go toward what I usually avoid' } },
  { key: 'scaryFood', label: { pt: 'Comer comidas "assustadoras"', en: 'Eat "scary" foods' } },
  { key: 'stayUncomfortable', label: { pt: 'Ficar desconfortável sem fugir', en: 'Stay uncomfortable without fleeing' } },
  { key: 'doWhatILove', label: { pt: 'Fazer o que gosto sempre que posso', en: 'Do what I love whenever I can' } },
];

const VALUE_SUGGESTIONS: L[] = [
  { pt: 'Família', en: 'Family' }, { pt: 'Saúde', en: 'Health' }, { pt: 'Relações', en: 'Relationships' },
  { pt: 'Amizades', en: 'Friendships' }, { pt: 'Trabalho / estudar', en: 'Work / study' }, { pt: 'Liberdade', en: 'Freedom' },
  { pt: 'Criatividade', en: 'Creativity' }, { pt: 'Natureza', en: 'Nature' }, { pt: 'Aventura', en: 'Adventure' },
];

export default function AcceptanceView() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const L = (pt: string, en: string) => (lang === 'pt' ? pt : en);

  const [openPrinciple, setOpenPrinciple] = useState<number | null>(null);
  const [vals, setVals] = useState<ActValues>({ values: '', reflection: '' });
  const [valsSaved, setValsSaved] = useState(false);
  const [items, setItems] = useState<ActCommitment[]>([]);
  const [newC, setNewC] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadActValues().then(setVals);
    loadActCommitments().then((stored) => {
      if (stored.length === 0) {
        const seeded = COMMITMENTS.map((c) => ({ id: c.key, key: c.key, logs: [] as string[] }));
        setItems(seeded);
        saveActCommitments(seeded);
      } else {
        setItems(stored);
      }
    });
  }, []);

  // Princípio do dia (roda sozinho, sem guardar nada).
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const focus = PRINCIPLES[dayOfYear % PRINCIPLES.length];

  function persist(next: ActCommitment[]) {
    setItems(next);
    saveActCommitments(next);
  }
  function logDone(id: string) {
    persist(items.map((it) => (it.id === id ? { ...it, logs: [...it.logs, isoLocal(new Date())] } : it)));
  }
  function undoLast(id: string) {
    persist(items.map((it) => (it.id === id ? { ...it, logs: it.logs.slice(0, -1) } : it)));
  }
  function removeCustom(id: string) {
    persist(items.filter((it) => it.id !== id));
  }
  function addCommitment() {
    const v = newC.trim();
    if (!v) return;
    persist([...items, { id: 'c' + Date.now(), label: v, logs: [] }]);
    setNewC('');
    setAdding(false);
  }

  function saveValues() {
    saveActValues(vals);
    setValsSaved(true);
    setTimeout(() => setValsSaved(false), 1800);
  }
  function addValueChip(text: string) {
    const cur = vals.values.trim();
    if (cur.toLowerCase().includes(text.toLowerCase())) return;
    setVals((v) => ({ ...v, values: cur ? `${cur}, ${text}` : text }));
  }

  const label = (it: ActCommitment) =>
    it.key ? (COMMITMENTS.find((c) => c.key === it.key)?.label[lang] ?? it.label ?? '') : (it.label ?? '');

  const textInput = {
    minHeight: 70, padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt,
    borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15, textAlignVertical: 'top' as const,
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ gap: spacing.md }}>
        <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
          {L('Recuperar é voltar a viver a tua vida ao lado do medo — não sem ele. Aqui tens os princípios para interiorizar, os teus valores e os compromissos de te aproximares do que importa.',
             'Recovery is living your life alongside fear — not without it. Here are the principles to internalise, your values, and the commitments to move toward what matters.')}
        </Text>

        {/* Princípio do dia */}
        <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, gap: 4 }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{L('PRINCÍPIO DO DIA', 'PRINCIPLE OF THE DAY')}</Text>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800' }}>{focus.title[lang]}</Text>
          <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>{focus.body[lang]}</Text>
        </View>

        {/* Princípios (cartões que abrem) */}
        <Text style={{ color: colors.text, fontWeight: '700', marginTop: 4 }}>{L('Princípios', 'Principles')}</Text>
        {PRINCIPLES.map((p, i) => {
          const open = openPrinciple === i;
          return (
            <View key={i} style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
              <Pressable onPress={() => setOpenPrinciple(open ? null : i)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.lg }}>
                <Ionicons name="leaf-outline" size={18} color={colors.primary} />
                <Text style={{ color: colors.text, fontWeight: '600', flex: 1 }}>{p.title[lang]}</Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </Pressable>
              {open && <Text style={{ color: colors.text, fontSize: 14, lineHeight: 21, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>{p.body[lang]}</Text>}
            </View>
          );
        })}

        {/* Regra da urgência */}
        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.primary, padding: spacing.lg, gap: 8, marginTop: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="hourglass-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '800' }}>{L('Quando vier a urgência: abranda tudo', 'When urgency hits: slow everything down')}</Text>
          </View>
          {URGENCY_STEPS.map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
              <Text style={{ color: colors.primary }}>•</Text>
              <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20, flex: 1 }}>{s[lang]}</Text>
            </View>
          ))}
        </View>

        {/* Os meus valores */}
        <Text style={{ color: colors.text, fontWeight: '700', marginTop: 4 }}>{L('Os meus valores', 'My values')}</Text>
        <Card style={{ gap: spacing.md }}>
          <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
            {L('O que torna a tua vida tua? Escreve os teus valores e volta a eles quando o medo tentar decidir por ti.',
               'What makes your life yours? Write your values and return to them when fear tries to decide for you.')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {VALUE_SUGGESTIONS.map((s) => (
              <Pressable key={s.pt} onPress={() => addValueChip(s[lang])} style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.cardAlt }}>
                <Text style={{ color: colors.text, fontSize: 13 }}>{s[lang]}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput value={vals.values} onChangeText={(t) => setVals((v) => ({ ...v, values: t }))} multiline
            placeholder={L('Os meus valores…', 'My values…')} placeholderTextColor={colors.textMuted} style={textInput} />
          <TextInput value={vals.reflection} onChangeText={(t) => setVals((v) => ({ ...v, reflection: t }))} multiline
            placeholder={L('Porque importam? Como quero viver a partir deles?', 'Why do they matter? How do I want to live from them?')} placeholderTextColor={colors.textMuted} style={textInput} />
          <PrimaryButton label={valsSaved ? L('Guardado ✓', 'Saved ✓') : L('Guardar valores', 'Save values')} onPress={saveValues} />
        </Card>

        {/* Compromissos de aproximação */}
        <Text style={{ color: colors.text, fontWeight: '700', marginTop: 4 }}>{L('Compromissos de aproximação', 'Approach commitments')}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: -4 }}>
          {L('Marca cada vez que te aproximas do que o medo te manda evitar. Cada registo é uma vitória — não há castigo por não o fazer.',
             'Log each time you move toward what fear tells you to avoid. Every entry is a win — there is no penalty for not doing it.')}
        </Text>
        {/* Adicionar compromisso — no topo (não no fundo) */}
        {adding ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput value={newC} onChangeText={setNewC} onSubmitEditing={addCommitment} autoFocus
              placeholder={L('O teu compromisso…', 'Your commitment…')} placeholderTextColor={colors.textMuted}
              style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15 }} />
            <Pressable onPress={addCommitment} style={{ paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{L('Adicionar', 'Add')}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setAdding(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.primarySoft, paddingHorizontal: 14, height: 38, borderRadius: 999 }}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{L('Adicionar compromisso', 'Add commitment')}</Text>
          </Pressable>
        )}

        {items.map((it) => (
          <View key={it.id} style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>{label(it)}</Text>
              {!it.key && (
                <Pressable onPress={() => removeCustom(it.id)} hitSlop={6} accessibilityRole="button" accessibilityLabel={L('Remover compromisso', 'Remove commitment')}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Pressable onPress={() => logDone(it.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.primary }}>
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{L('Fiz isto', 'I did this')}</Text>
              </Pressable>
              {it.logs.length > 0 && (
                <>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                    {L(`feito ${it.logs.length}×`, `done ${it.logs.length}×`)} · {it.logs[it.logs.length - 1].split('-').reverse().join('/')}
                  </Text>
                  <Pressable onPress={() => undoLast(it.id)} hitSlop={6} style={{ marginLeft: 'auto' }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{L('anular', 'undo')}</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
