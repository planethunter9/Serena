// Desafios diários de incerteza: pequenos passos para treinar a tolerância à
// incerteza e ao desconforto. Um desafio por dia + a lista toda para marcar.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { CustomChallenge, loadChallengesDone, loadCustomChallenges, saveChallengesDone, saveCustomChallenges } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card } from './ui';

type L = { pt: string; en: string };

// Do mais fácil para o mais difícil.
const CHALLENGES: { id: string; text: L }[] = [
  { id: 'c1', text: { pt: 'Deixa uma pergunta por responder — não vás procurar a certeza.', en: 'Leave a question unanswered — don\'t go looking for certainty.' } },
  { id: 'c2', text: { pt: 'Come algo sem o cheirar primeiro.', en: 'Eat something without smelling it first.' } },
  { id: 'c3', text: { pt: 'Escolhe algo sem confirmar (um prato, um caminho) e segue com a escolha.', en: 'Choose something without checking (a dish, a route) and stick with it.' } },
  { id: 'c4', text: { pt: 'Passa 1 hora sem verificar o corpo à procura de sintomas.', en: 'Go 1 hour without checking your body for symptoms.' } },
  { id: 'c5', text: { pt: 'Hoje não perguntes a ninguém "achas que estou bem?".', en: "Today, don't ask anyone \"do you think I'm okay?\"." } },
  { id: 'c6', text: { pt: 'Come um alimento um pouco fora da tua "lista segura".', en: 'Eat a food slightly outside your "safe list".' } },
  { id: 'c7', text: { pt: 'Come algo sem verificares a validade antes.', en: "Eat something without checking the expiry date first." } },
  { id: 'c8', text: { pt: 'Fica num sítio mesmo sentindo-te um pouco enjoada, sem sair.', en: 'Stay somewhere even while feeling a bit queasy, without leaving.' } },
  { id: 'c9', text: { pt: 'Vê uma cena ou imagem que costumas evitar, sem saltar.', en: 'Watch a scene or image you usually avoid, without skipping.' } },
  { id: 'c10', text: { pt: 'Diz "sim" a um plano que recusarias por medo.', en: 'Say "yes" to a plan you would decline out of fear.' } },
  { id: 'c11', text: { pt: 'Sai de casa sem um "item de segurança" (saco, antináuseas).', en: 'Leave the house without a "safety item" (bag, anti-nausea).' } },
  { id: 'c12', text: { pt: 'Resiste a pesquisar sintomas online durante todo o dia.', en: 'Resist searching symptoms online all day.' } },
  { id: 'c13', text: { pt: 'Come fora ou num sítio novo.', en: 'Eat out or somewhere new.' } },
  { id: 'c14', text: { pt: 'Fica sozinha num momento em que pedirias companhia por segurança.', en: 'Be alone at a moment when you would ask for company for safety.' } },
  { id: 'c15', text: { pt: 'Deixa uma dúvida em aberto e diz a ti: "posso viver sem ter a certeza".', en: 'Leave a doubt open and tell yourself: "I can live without being certain".' } },
  { id: 'c16', text: { pt: 'Faz algo espontâneo, que não planeaste nem controlaste.', en: 'Do something spontaneous, unplanned and uncontrolled.' } },
];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ChallengesScreen() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => o[lang];

  const [done, setDone] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [custom, setCustom] = useState<CustomChallenge[]>([]);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');

  const today = ymd(new Date());
  const dayIndex = Math.floor(Date.now() / 86400000);
  const todayChallenge = CHALLENGES[dayIndex % CHALLENGES.length];

  useEffect(() => {
    loadChallengesDone().then(setDone);
    loadCustomChallenges().then(setCustom);
  }, []);

  // Lista completa: os desafios sugeridos + os do utilizador (no fim).
  const all: { id: string; label: string; custom: boolean }[] = [
    ...CHALLENGES.map((c) => ({ id: c.id, label: tt(c.text), custom: false })),
    ...custom.map((c) => ({ id: c.id, label: c.text, custom: true })),
  ];

  function addCustom() {
    const v = newText.trim();
    if (!v) return;
    // id sem ':' (as marcações são guardadas como "data:id").
    const next = [...custom, { id: 'u' + Date.now(), text: v }];
    setCustom(next);
    saveCustomChallenges(next);
    setNewText('');
    setAdding(false);
    setShowAll(true);
  }
  function removeCustom(c: { id: string; label: string }) {
    Alert.alert(tt({ pt: 'Eliminar desafio?', en: 'Delete challenge?' }), c.label, [
      { text: tt({ pt: 'Cancelar', en: 'Cancel' }), style: 'cancel' },
      {
        text: tt({ pt: 'Eliminar', en: 'Delete' }), style: 'destructive', onPress: () => {
          const next = custom.filter((x) => x.id !== c.id);
          setCustom(next);
          saveCustomChallenges(next);
          const nd = done.filter((k) => k.split(':')[1] !== c.id);
          setDone(nd);
          saveChallengesDone(nd);
        },
      },
    ]);
  }

  function toggle(id: string) {
    const key = `${today}:${id}`;
    const next = done.includes(key) ? done.filter((x) => x !== key) : [...done, key];
    setDone(next);
    saveChallengesDone(next);
  }
  const isDoneToday = (id: string) => done.includes(`${today}:${id}`);
  const validIds = new Set(all.map((c) => c.id));
  const everDone = new Set(done.map((k) => k.split(':')[1]).filter((id) => validIds.has(id)));

  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: 40 }}>
      <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
        {tt({
          pt: 'Pequenos passos para treinar a tolerância à incerteza e ao desconforto. A ideia não é gostar — é deixar entrar e perceber que a incerteza não magoa.',
          en: 'Small steps to train tolerance of uncertainty and discomfort. The idea is not to like it — it is to let it in and see that uncertainty does not hurt.',
        })}
      </Text>

      {/* Desafio de hoje */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{tt({ pt: 'Desafio de hoje', en: "Today's challenge" })}</Text>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600', lineHeight: 24 }}>{tt(todayChallenge.text)}</Text>
        <Pressable
          onPress={() => toggle(todayChallenge.id)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: radius.md, borderWidth: 2, borderColor: isDoneToday(todayChallenge.id) ? colors.success : colors.primary, backgroundColor: isDoneToday(todayChallenge.id) ? colors.successSoft : colors.card, marginTop: 4 }}
        >
          <Ionicons name={isDoneToday(todayChallenge.id) ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={isDoneToday(todayChallenge.id) ? colors.success : colors.primary} />
          <Text style={{ color: isDoneToday(todayChallenge.id) ? colors.success : colors.primary, fontWeight: '700' }}>
            {isDoneToday(todayChallenge.id) ? tt({ pt: 'Feito hoje', en: 'Done today' }) : tt({ pt: 'Marcar como feito', en: 'Mark as done' })}
          </Text>
        </Pressable>
      </Card>

      {/* Ver todos + adicionar o meu */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable onPress={() => setShowAll((o) => !o)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
          <Ionicons name={showAll ? 'chevron-up' : 'list-outline'} size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>
            {tt({ pt: 'Ver todos os desafios', en: 'See all challenges' })} ({everDone.size}/{all.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setAdding((a) => !a)}
          hitSlop={6}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primarySoft, paddingHorizontal: 12, height: 36, borderRadius: 999 }}
        >
          <Ionicons name={adding ? 'close' : 'add'} size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{tt({ pt: 'Adicionar', en: 'Add' })}</Text>
        </Pressable>
      </View>

      {adding && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={newText}
            onChangeText={setNewText}
            onSubmitEditing={addCustom}
            autoFocus
            placeholder={tt({ pt: 'Escreve o teu desafio…', en: 'Write your own challenge…' })}
            placeholderTextColor={colors.textMuted}
            style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15 }}
          />
          <Pressable onPress={addCustom} style={{ paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{tt({ pt: 'Adicionar', en: 'Add' })}</Text>
          </Pressable>
        </View>
      )}

      {showAll && (
        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
          {all.map((c, i) => {
            const checked = isDoneToday(c.id);
            const ever = everDone.has(c.id);
            return (
              <Pressable key={c.id} onPress={() => toggle(c.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.lg, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
                <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: checked ? colors.success : ever ? colors.primary : colors.border, backgroundColor: checked ? colors.success : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {checked && <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>✓</Text>}
                </View>
                <Text style={{ color: colors.text, fontSize: 14, flex: 1, lineHeight: 20 }}>{c.label}</Text>
                {c.custom && (
                  <Pressable onPress={() => removeCustom(c)} hitSlop={8} accessibilityRole="button" accessibilityLabel={tt({ pt: 'Eliminar desafio', en: 'Delete challenge' })} style={{ padding: 2 }}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
