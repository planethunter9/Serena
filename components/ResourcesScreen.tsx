// Separador "Recursos": Lições, Lembretes, Objetivos e Diário já funcionam;
// os restantes abrem "Em breve".

import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { TKey, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { ScreenTitle } from './ui';

const ITEMS: { id: string; titleKey: TKey; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'lessons', titleKey: 'resources.lessons', icon: 'book-outline' },
  { id: 'exercises', titleKey: 'resources.exercises', icon: 'barbell-outline' },
  { id: 'achievements', titleKey: 'resources.achievements', icon: 'trophy-outline' },
  { id: 'reminders', titleKey: 'resources.reminders', icon: 'notifications-outline' },
  { id: 'goals', titleKey: 'resources.goals', icon: 'flag-outline' },
  { id: 'journal', titleKey: 'resources.journal', icon: 'create-outline' },
  { id: 'toolbox', titleKey: 'resources.toolbox', icon: 'construct-outline' },
  { id: 'unplanned', titleKey: 'resources.unplanned', icon: 'flash-outline' },
  { id: 'fearprofile', titleKey: 'resources.fearprofile', icon: 'analytics-outline' },
  { id: 'safety', titleKey: 'resources.safety', icon: 'shield-checkmark-outline' },
  { id: 'games', titleKey: 'resources.games', icon: 'game-controller-outline' },
  { id: 'citations', titleKey: 'resources.citations', icon: 'library-outline' },
];

// Ids que já têm ecrã a funcionar.
const READY = ['lessons', 'exercises', 'games', 'achievements', 'reminders', 'goals', 'journal', 'unplanned', 'fearprofile', 'safety'];

export default function ResourcesScreen({
  onOpen,
  onSoon,
}: {
  onOpen: (id: string) => void;
  onSoon: (title: string) => void;
}) {
  const { colors } = useTheme();
  const { t } = useLang();

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }}>
      <ScreenTitle title={t('resources.title')} />
      <View style={{ gap: spacing.sm }}>
        {ITEMS.map((r) => {
          const title = t(r.titleKey);
          return (
            <Pressable
              key={r.id}
              onPress={() => (READY.includes(r.id) ? onOpen(r.id) : onSoon(title))}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }}
            >
              <View style={{ width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={r.icon} size={22} color={colors.primary} />
              </View>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 }}>{title}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
