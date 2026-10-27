// Separador "Recursos": lista de atalhos, reordenável pelo utilizador.
// Os itens "Em breve" abrem um aviso; os prontos abrem o respetivo ecrã.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { TKey, useLang } from '../i18n/i18n';
import { loadResourcesOrder, saveResourcesOrder } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { ScreenTitle } from './ui';

// Cada item usa uma chave i18n (titleKey) OU um título inline (title).
const ITEMS: { id: string; titleKey?: TKey; title?: { pt: string; en: string }; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'lessons', titleKey: 'resources.lessons', icon: 'book-outline' },
  { id: 'exercises', titleKey: 'resources.exercises', icon: 'barbell-outline' },
  { id: 'goalsachievements', titleKey: 'resources.goalsachievements', icon: 'trophy-outline' },
  { id: 'reminders', titleKey: 'resources.reminders', icon: 'notifications-outline' },
  { id: 'hardday', title: { pt: 'Plano para dias difíceis', en: 'Plan for hard days' }, icon: 'umbrella-outline' },
  { id: 'journal', titleKey: 'resources.journal', icon: 'create-outline' },
  { id: 'safetyfeeding', titleKey: 'resources.safetyfeeding', icon: 'shield-checkmark-outline' },
  { id: 'crisislines', titleKey: 'resources.crisislines', icon: 'call-outline' },
];

// Ids que já têm ecrã a funcionar.
const READY = ['lessons', 'exercises', 'goalsachievements', 'reminders', 'hardday', 'journal', 'safetyfeeding', 'crisislines'];

export default function ResourcesScreen({
  onOpen,
  onSoon,
}: {
  onOpen: (id: string) => void;
  onSoon: (title: string) => void;
}) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [order, setOrder] = useState<string[]>([]);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    loadResourcesOrder().then(setOrder);
  }, []);

  // Aplica a ordem guardada; itens novos (não na ordem) vão para o fim.
  const byId = new Map(ITEMS.map((it) => [it.id, it]));
  const ordered = order.map((id) => byId.get(id)).filter(Boolean) as typeof ITEMS;
  const seen = new Set(order);
  const items = [...ordered, ...ITEMS.filter((it) => !seen.has(it.id))];

  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const ids = items.map((it) => it.id);
    [ids[index], ids[j]] = [ids[j], ids[index]];
    setOrder(ids);
    saveResourcesOrder(ids);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <ScreenTitle title={t('resources.title')} />
        </View>
        <Pressable onPress={() => setReordering((r) => !r)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name={reordering ? 'checkmark' : 'swap-vertical'} size={18} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{reordering ? t('common.done') : t('common.reorder')}</Text>
        </Pressable>
      </View>

      <View style={{ gap: spacing.sm }}>
        {items.map((r, i) => {
          const title = r.title ? r.title[lang] : t(r.titleKey!);
          const body = (
            <>
              <View style={{ width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={r.icon} size={22} color={colors.primary} />
              </View>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 }}>{title}</Text>
            </>
          );
          const rowStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border };

          if (reordering) {
            return (
              <View key={r.id} style={rowStyle}>
                {body}
                <Pressable onPress={() => move(i, -1)} hitSlop={6} disabled={i === 0} accessibilityRole="button" accessibilityLabel={lang === 'pt' ? 'Mover para cima' : 'Move up'} style={{ padding: 4, opacity: i === 0 ? 0.3 : 1 }}>
                  <Ionicons name="chevron-up" size={22} color={colors.primary} />
                </Pressable>
                <Pressable onPress={() => move(i, 1)} hitSlop={6} disabled={i === items.length - 1} accessibilityRole="button" accessibilityLabel={lang === 'pt' ? 'Mover para baixo' : 'Move down'} style={{ padding: 4, opacity: i === items.length - 1 ? 0.3 : 1 }}>
                  <Ionicons name="chevron-down" size={22} color={colors.primary} />
                </Pressable>
              </View>
            );
          }

          return (
            <Pressable key={r.id} onPress={() => (READY.includes(r.id) ? onOpen(r.id) : onSoon(title))} style={rowStyle}>
              {body}
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
