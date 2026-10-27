// Os meus objetivos: adicionar da lista, escrever os meus, marcar como cumprido e remover.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { Goal, loadGoals, saveGoals } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import EmptyState from './EmptyState';
import { TopBackBar } from './ui';

// Objetivos sugeridos (bilingue). O utilizador escolhe os que quiser.
const GOAL_SUGGESTIONS: { pt: string; en: string }[] = [
  { pt: 'Comer fora sem verificar tudo', en: 'Eat out without checking everything' },
  { pt: 'Viajar sem levar "itens de segurança"', en: 'Travel without "safety items"' },
  { pt: 'Comer um alimento que ando a evitar', en: 'Eat a food I have been avoiding' },
  { pt: 'Estar perto de alguém doente sem fugir', en: 'Be near someone ill without fleeing' },
  { pt: 'Dormir sem precisar de ninguém por perto', en: 'Sleep without needing anyone nearby' },
  { pt: 'Ver um vídeo que costumo evitar', en: 'Watch a video I usually avoid' },
  { pt: 'Passar um dia sem procurar reassurance', en: 'Go a day without seeking reassurance' },
  { pt: 'Reduzir as verificações de validade', en: 'Cut down on checking expiry dates' },
  { pt: 'Dizer "sim" a um plano que diria que não', en: 'Say "yes" to a plan I would decline' },
  { pt: 'Ficar com a náusea sem tomar nada', en: 'Stay with nausea without taking anything' },
];

export default function GoalsScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [text, setText] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    loadGoals().then(setGoals);
  }, []);

  function persist(next: Goal[]) {
    setGoals(next);
    saveGoals(next);
  }
  function add() {
    const v = text.trim();
    if (!v) return;
    persist([...goals, { id: 'g' + Date.now(), text: v, done: false }]);
    setText('');
  }
  function addSuggestion(label: string) {
    if (goals.some((g) => g.text === label)) return; // evita duplicados
    persist([...goals, { id: 'g' + Date.now() + Math.random().toString(36).slice(2, 6), text: label, done: false }]);
  }
  function toggle(id: string) {
    persist(goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
  }
  function remove(id: string) {
    persist(goals.filter((g) => g.id !== id));
  }

  // Sugestões que ainda não foram adicionadas.
  const available = GOAL_SUGGESTIONS.map((g) => g[lang]).filter((label) => !goals.some((x) => x.text === label));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('goals.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('goals.subtitle')}</Text>

        {/* Adicionar da lista */}
        {available.length > 0 && (
          <>
            <Pressable
              onPress={() => setPickerOpen((o) => !o)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.cardAlt, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}
            >
              <Ionicons name={pickerOpen ? 'chevron-up' : 'list-outline'} size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{t('settings.addFromList')}</Text>
            </Pressable>

            {pickerOpen && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {available.map((label) => (
                  <Pressable
                    key={label}
                    onPress={() => addSuggestion(label)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}
                  >
                    <Ionicons name="add" size={15} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}

        {/* Escrever o meu */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={add}
            placeholder={t('goals.addPlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 16 }}
          />
          <Pressable onPress={add} style={{ paddingHorizontal: 18, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('common.add')}</Text>
          </Pressable>
        </View>

        {goals.length === 0 && (
          <EmptyState
            icon="flag-outline"
            title={t('goals.empty')}
            subtitle={lang === 'pt' ? 'Escolhe da lista ou escreve o teu primeiro objetivo acima.' : 'Pick from the list or write your first goal above.'}
          />
        )}

        {goals.map((g) => (
          <View key={g.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Pressable onPress={() => toggle(g.id)} hitSlop={8}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: g.done ? colors.success : 'transparent', borderWidth: 2, borderColor: g.done ? colors.success : colors.border, alignItems: 'center', justifyContent: 'center' }}>
                {g.done && <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>✓</Text>}
              </View>
            </Pressable>
            <Text style={{ color: g.done ? colors.textMuted : colors.text, fontSize: 16, flex: 1, textDecorationLine: g.done ? 'line-through' : 'none' }}>{g.text}</Text>
            <Pressable onPress={() => remove(g.id)} hitSlop={8} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
