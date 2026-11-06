// Desafios de incerteza: pequenos passos para treinar a tolerância à incerteza
// e ao desconforto. Em cima, uma sugestão de desafio (muda todos os dias); em
// baixo, "Os meus desafios" — escolhidos da lista de sugestões ou criados pelo
// utilizador — que se marcam como feitos em cada dia.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { pick, useLang } from '../i18n/i18n';
import { CustomChallenge, loadChallengesDone, loadCustomChallenges, saveChallengesDone, saveCustomChallenges } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card } from './ui';

type L = { pt: string; en: string };

// Do mais fácil para o mais difícil.
export const CHALLENGES: { id: string; text: L }[] = [
  { id: 'c1', text: { pt: 'Deixa uma pergunta por responder — não vás procurar a certeza.', en: 'Leave a question unanswered — don\'t go looking for certainty.' } },
  { id: 'c2', text: { pt: 'Come algo sem o cheirar primeiro.', en: 'Eat something without smelling it first.' } },
  { id: 'c3', text: { pt: 'Escolhe algo sem confirmar (um prato, um caminho) e segue com a escolha.', en: 'Choose something without checking (a dish, a route) and stick with it.' } },
  { id: 'c4', text: { pt: 'Passa 1 hora sem verificar o corpo à procura de sintomas.', en: 'Go 1 hour without checking your body for symptoms.' } },
  { id: 'c5', text: { pt: 'Hoje não perguntes a ninguém "achas que estou bem?".', en: "Today, don't ask anyone \"do you think I'm okay?\"." } },
  { id: 'c6', text: { pt: 'Come um alimento um pouco fora da tua "lista segura".', en: 'Eat a food slightly outside your "safe list".' } },
  { id: 'c7', text: { pt: 'Come algo sem verificares a validade antes.', en: "Eat something without checking the expiry date first." } },
  { id: 'c8', text: { pt: 'Fica num sítio mesmo com um pouco de enjoo, sem sair.', en: 'Stay somewhere even while feeling a bit queasy, without leaving.' } },
  { id: 'c9', text: { pt: 'Vê uma cena ou imagem que costumas evitar, sem saltar.', en: 'Watch a scene or image you usually avoid, without skipping.' } },
  { id: 'c10', text: { pt: 'Diz "sim" a um plano que recusarias por medo.', en: 'Say "yes" to a plan you would decline out of fear.' } },
  { id: 'c11', text: { pt: 'Sai de casa sem um "item de segurança" (saco, antináuseas).', en: 'Leave the house without a "safety item" (bag, anti-nausea).' } },
  { id: 'c12', text: { pt: 'Resiste a pesquisar sintomas online durante todo o dia.', en: 'Resist searching symptoms online all day.' } },
  { id: 'c13', text: { pt: 'Come fora ou num sítio novo.', en: 'Eat out or somewhere new.' } },
  { id: 'c14', text: { pt: 'Fica sem companhia num momento em que a pedirias por segurança.', en: 'Be alone at a moment when you would ask for company for safety.' } },
  { id: 'c15', text: { pt: 'Deixa uma dúvida em aberto e diz a ti: "posso viver sem ter a certeza".', en: 'Leave a doubt open and tell yourself: "I can live without being certain".' } },
  { id: 'c16', text: { pt: 'Faz algo espontâneo, que não planeaste nem controlaste.', en: 'Do something spontaneous, unplanned and uncontrolled.' } },
];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ChallengesScreen() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const tt = (o: L) => pick(o, lang);

  const [done, setDone] = useState<string[]>([]);
  const [mine, setMine] = useState<CustomChallenge[]>([]);
  const [mode, setMode] = useState<'none' | 'pick' | 'create'>('none');
  const [newText, setNewText] = useState('');
  const [offset, setOffset] = useState(0); // "outra sugestão"

  // Fixados ao abrir o ecrã (estáveis entre renderizações).
  const [nowMs] = useState(() => Date.now());
  const today = ymd(new Date(nowMs));
  const dayIndex = Math.floor(nowMs / 86400000);

  useEffect(() => {
    loadChallengesDone().then(setDone);
    loadCustomChallenges().then(setMine);
  }, []);

  const mineIds = new Set(mine.map((m) => m.id));
  const available = CHALLENGES.filter((c) => !mineIds.has(c.id));
  // Sugestão do dia: roda pelas sugestões que ainda não estão nos meus desafios.
  const suggestion = available.length ? available[(dayIndex + offset) % available.length] : null;

  const labelOf = (m: CustomChallenge) => {
    const c = CHALLENGES.find((x) => x.id === m.id);
    return c ? tt(c.text) : (m.text ?? '');
  };

  function persistMine(next: CustomChallenge[]) {
    setMine(next);
    saveCustomChallenges(next);
  }
  function addSuggestion(id: string) {
    if (mineIds.has(id)) return;
    persistMine([...mine, { id }]);
  }
  function addCustom() {
    const v = newText.trim();
    if (!v) return;
    // id sem ':' (as marcações são guardadas como "data:id").
    persistMine([...mine, { id: 'u' + Date.now(), text: v }]);
    setNewText('');
    setMode('none');
  }
  function remove(m: CustomChallenge) {
    Alert.alert(tt({ pt: 'Remover desafio?', en: 'Remove challenge?' }), labelOf(m), [
      { text: tt({ pt: 'Cancelar', en: 'Cancel' }), style: 'cancel' },
      {
        text: tt({ pt: 'Remover', en: 'Remove' }), style: 'destructive', onPress: () => {
          persistMine(mine.filter((x) => x.id !== m.id));
          // Os desafios criados por mim desaparecem de vez; os da lista podem voltar
          // a ser escolhidos, por isso mantemos o histórico deles.
          if (!CHALLENGES.some((c) => c.id === m.id)) {
            const nd = done.filter((k) => k.split(':')[1] !== m.id);
            setDone(nd);
            saveChallengesDone(nd);
          }
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
  const doneTodayCount = mine.filter((m) => isDoneToday(m.id)).length;

  const pill = (active: boolean) => ({
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 5, paddingHorizontal: 12, height: 36, borderRadius: 999,
    backgroundColor: active ? colors.primary : colors.primarySoft,
  });

  return (
    <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
        {tt({
          pt: 'Pequenos passos para treinar a tolerância à incerteza e ao desconforto. A ideia não é gostar — é deixar entrar e perceber que a incerteza não magoa.',
          en: 'Small steps to train tolerance of uncertainty and discomfort. The idea is not to like it — it is to let it in and see that uncertainty does not hurt.',
        })}
      </Text>

      {/* Sugestão de desafio */}
      {suggestion && (
        <Card style={{ gap: spacing.sm, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700', flex: 1 }}>{tt({ pt: 'Sugestão de desafio', en: 'Suggested challenge' })}</Text>
            {available.length > 1 && (
              <Pressable onPress={() => setOffset((o) => o + 1)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="shuffle" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{tt({ pt: 'Outra', en: 'Another' })}</Text>
              </Pressable>
            )}
          </View>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600', lineHeight: 24 }}>{tt(suggestion.text)}</Text>
          <Pressable
            onPress={() => addSuggestion(suggestion.id)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: radius.md, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.card, marginTop: 4 }}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700' }}>{tt({ pt: 'Adicionar aos meus desafios', en: 'Add to my challenges' })}</Text>
          </Pressable>
        </Card>
      )}

      {/* Os meus desafios */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>{tt({ pt: 'Os meus desafios', en: 'My challenges' })}</Text>
        {mine.length > 0 && (
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{tt({ pt: 'Hoje', en: 'Today' })}: {doneTodayCount}/{mine.length}</Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable onPress={() => setMode((m) => (m === 'pick' ? 'none' : 'pick'))} style={pill(mode === 'pick')}>
          <Ionicons name={mode === 'pick' ? 'close' : 'list-outline'} size={16} color={mode === 'pick' ? '#fff' : colors.primary} />
          <Text style={{ color: mode === 'pick' ? '#fff' : colors.primary, fontWeight: '700', fontSize: 13 }}>{tt({ pt: 'Escolher da lista', en: 'Pick from list' })}</Text>
        </Pressable>
        <Pressable onPress={() => setMode((m) => (m === 'create' ? 'none' : 'create'))} style={pill(mode === 'create')}>
          <Ionicons name={mode === 'create' ? 'close' : 'add'} size={16} color={mode === 'create' ? '#fff' : colors.primary} />
          <Text style={{ color: mode === 'create' ? '#fff' : colors.primary, fontWeight: '700', fontSize: 13 }}>{tt({ pt: 'Criar o meu', en: 'Create my own' })}</Text>
        </Pressable>
      </View>

      {mode === 'create' && (
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

      {mode === 'pick' && (
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{tt({ pt: 'Do mais fácil para o mais difícil. Toca para adicionar.', en: 'From easiest to hardest. Tap to add.' })}</Text>
          {available.length === 0 ? (
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>{tt({ pt: 'Já adicionaste todas as sugestões.', en: "You've added all the suggestions." })}</Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {available.map((c) => (
                <Pressable key={c.id} onPress={() => addSuggestion(c.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, maxWidth: '100%' }}>
                  <Ionicons name="add" size={15} color={colors.primary} />
                  <Text style={{ color: colors.text, fontSize: 13, flexShrink: 1 }}>{tt(c.text)}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      {mine.length === 0 ? (
        <Card>
          <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
            {tt({ pt: 'Ainda não tens desafios. Adiciona a sugestão acima, escolhe da lista ou cria o teu.', en: 'No challenges yet. Add the suggestion above, pick from the list or create your own.' })}
          </Text>
        </Card>
      ) : (
        <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
          {mine.map((m, i) => {
            const checked = isDoneToday(m.id);
            return (
              <Pressable key={m.id} onPress={() => toggle(m.id)} accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={labelOf(m)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.lg, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
                <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: checked ? colors.success : colors.border, backgroundColor: checked ? colors.success : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {checked && <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>✓</Text>}
                </View>
                <Text style={{ color: colors.text, fontSize: 14, flex: 1, lineHeight: 20 }}>{labelOf(m)}</Text>
                <Pressable onPress={() => remove(m)} hitSlop={8} accessibilityRole="button" accessibilityLabel={tt({ pt: 'Remover desafio', en: 'Remove challenge' })} style={{ padding: 2 }}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
