// Definições › Ecrã inicial: escolher que blocos aparecem na Visão geral.
// A escolha é guardada por conta (e sincronizada); a ordem muda-se no início.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { HOME_BLOCKS, HOME_SETTINGS_TEXT } from '../data/homeBlocks';
import { useLang } from '../i18n/i18n';
import { loadHomeHidden, saveHomeHidden } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

export default function HomeBlocksScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const x = HOME_SETTINGS_TEXT[lang] ?? HOME_SETTINGS_TEXT.en;
  const [hidden, setHidden] = useState<string[] | null>(null);

  useEffect(() => { loadHomeHidden().then(setHidden); }, []);

  function toggle(id: string, show: boolean) {
    setHidden((cur) => {
      const next = show ? (cur ?? []).filter((k) => k !== id) : [...(cur ?? []).filter((k) => k !== id), id];
      saveHomeHidden(next);
      return next;
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={x.title} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.md, gap: spacing.lg, paddingBottom: 60 }}>
        <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>{x.intro}</Text>
        {hidden && (
          <Card style={{ paddingVertical: spacing.sm }}>
            {HOME_BLOCKS.map((b, i) => {
              const shown = !hidden.includes(b.id);
              const title = b.title[lang] ?? b.title.en;
              return (
                <View key={b.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
                  <View style={{ width: 36, height: 36, borderRadius: radius.md, backgroundColor: shown ? colors.primarySoft : colors.cardAlt, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={b.icon} size={18} color={shown ? colors.primary : colors.textMuted} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{title}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 17 }}>{b.desc[lang] ?? b.desc.en}</Text>
                  </View>
                  <Switch value={shown} onValueChange={(v) => toggle(b.id, v)} accessibilityLabel={title} trackColor={{ true: colors.primary, false: colors.track }} />
                </View>
              );
            })}
          </Card>
        )}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Ionicons name="swap-vertical" size={15} color={colors.textMuted} style={{ marginTop: 1 }} />
          <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, flex: 1 }}>{x.reorderHint}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
