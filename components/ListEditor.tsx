// Editor de uma lista de itens: adicionar da lista, escrever a própria, editar e remover.

import { Ionicons } from '@expo/vector-icons';
import { useA11y } from '../lib/a11y';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { ProfileItem } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import Animated, { ReduceMotion, ZoomIn } from 'react-native-reanimated';
import { enterFade, exitFade, layoutSmooth, PressableScale, tapHaptic } from '../lib/motion';
import { Card } from './ui';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const chipIn = (i: number) => ZoomIn.delay(Math.min(i, 12) * 25).springify().damping(14).reduceMotion(ReduceMotion.System);

export default function ListEditor({
  title,
  items,
  onChange,
  catalog,
}: {
  title: string;
  items: ProfileItem[];
  onChange: (items: ProfileItem[]) => void;
  // Opções pré-definidas da categoria (id + texto já traduzido). Opcional.
  catalog?: { id: string; label: string }[];
}) {
  const { colors } = useTheme();
  const a11y = useA11y();
  const { t } = useLang();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newText, setNewText] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

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
  function addFromCatalog(opt: { id: string; label: string }) {
    if (items.some((it) => it.id === opt.id)) return;
    onChange([...items, { id: opt.id, label: opt.label }]);
  }

  // Opções do catálogo que ainda não estão escolhidas.
  const available = (catalog ?? []).filter((o) => !items.some((it) => it.id === o.id));

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
          <Animated.View key={item.id} entering={enterFade} exiting={exitFade} layout={layoutSmooth} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {editing ? (
              <>
                <TextInput value={editText} onChangeText={setEditText} onSubmitEditing={saveEdit} autoFocus style={inputBase} />
                <Pressable onPress={saveEdit} hitSlop={8} accessibilityRole="button" accessibilityLabel={a11y.save} style={{ padding: 6 }}>
                  <Ionicons name="checkmark" size={22} color={colors.success} />
                </Pressable>
              </>
            ) : (
              <>
                <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{item.label}</Text>
                <Pressable onPress={() => startEdit(item)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${a11y.edit}: ${item.label}`} style={{ padding: 6 }}>
                  <Ionicons name="pencil" size={18} color={colors.textMuted} />
                </Pressable>
                <Pressable onPress={() => remove(item.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${a11y.delete}: ${item.label}`} style={{ padding: 6 }}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              </>
            )}
          </Animated.View>
        );
      })}

      {/* Botão "Adicionar da lista" (só se houver catálogo com opções por escolher) */}
      {available.length > 0 && (
        <>
          <PressableScale
            onPress={() => { tapHaptic(); setPickerOpen((o) => !o); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.cardAlt, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginTop: 4 }}
          >
            <Ionicons name={pickerOpen ? 'chevron-up' : 'list-outline'} size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{t('settings.addFromList')}</Text>
          </PressableScale>

          {pickerOpen && (
            <Animated.View entering={enterFade} exiting={exitFade} layout={layoutSmooth} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {available.map((o, i) => (
                <AnimatedPressable
                  key={o.id}
                  entering={chipIn(i)}
                  exiting={exitFade}
                  layout={layoutSmooth}
                  onPress={() => { tapHaptic(); addFromCatalog(o); }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}
                >
                  <Ionicons name="add" size={15} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{o.label}</Text>
                </AnimatedPressable>
              ))}
            </Animated.View>
          )}
        </>
      )}

      {/* Adicionar a própria */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
        <TextInput value={newText} onChangeText={setNewText} onSubmitEditing={add} placeholder={t('settings.addPlaceholder')} placeholderTextColor={colors.textMuted} style={inputBase} />
        <Pressable onPress={add} style={{ paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('common.add')}</Text>
        </Pressable>
      </View>
    </Card>
  );
}
