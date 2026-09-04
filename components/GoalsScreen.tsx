// Os meus objetivos: adicionar, marcar como cumprido e remover.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { Goal, loadGoals, saveGoals } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

export default function GoalsScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [text, setText] = useState('');

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
  function toggle(id: string) {
    persist(goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
  }
  function remove(id: string) {
    persist(goals.filter((g) => g.id !== id));
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('goals.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('goals.subtitle')}</Text>

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

        {goals.length === 0 && <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 8 }}>{t('goals.empty')}</Text>}

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
