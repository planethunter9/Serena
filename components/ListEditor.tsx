// Editor de uma lista de itens: adicionar, editar (inline) e remover.
// Usado nas Definições para as escolhas "o que te tira", "como te afeta", etc.

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { ProfileItem } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card } from './ui';

export default function ListEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: ProfileItem[];
  onChange: (items: ProfileItem[]) => void;
}) {
  const { colors } = useTheme();
  const { t } = useLang();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newText, setNewText] = useState('');

  function startEdit(item: ProfileItem) {
    setEditingId(item.id);
    setEditText(item.label);
  }
  function saveEdit() {
    const text = editText.trim();
    if (text) onChange(items.map((it) => (it.id === editingId ? { ...it, label: text } : it)));
    setEditingId(null);
    setEditText('');
  }
  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }
  function add() {
    const text = newText.trim();
    if (!text) return;
    onChange([...items, { id: 'custom:' + Date.now(), label: text }]);
    setNewText('');
  }

  const inputBase = {
    flex: 1,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.cardAlt,
    borderWidth: 2,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 15,
  };

  return (
    <Card style={{ gap: spacing.sm }}>
      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{title}</Text>

      {items.map((item) => {
        const editing = editingId === item.id;
        return (
          <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {editing ? (
              <>
                <TextInput value={editText} onChangeText={setEditText} onSubmitEditing={saveEdit} autoFocus style={inputBase} />
                <Pressable onPress={saveEdit} hitSlop={8} style={{ padding: 6 }}>
                  <Ionicons name="checkmark" size={22} color={colors.success} />
                </Pressable>
              </>
            ) : (
              <>
                <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{item.label}</Text>
                <Pressable onPress={() => startEdit(item)} hitSlop={8} style={{ padding: 6 }}>
                  <Ionicons name="pencil" size={18} color={colors.textMuted} />
                </Pressable>
                <Pressable onPress={() => remove(item.id)} hitSlop={8} style={{ padding: 6 }}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              </>
            )}
          </View>
        );
      })}

      {/* Adicionar novo */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
        <TextInput value={newText} onChangeText={setNewText} onSubmitEditing={add} placeholder={t('settings.addPlaceholder')} placeholderTextColor={colors.textMuted} style={inputBase} />
        <Pressable onPress={add} style={{ paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('common.add')}</Text>
        </Pressable>
      </View>
    </Card>
  );
}
