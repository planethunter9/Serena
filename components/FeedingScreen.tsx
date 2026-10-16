// "Alimentar o medo": comportamentos que mantêm a fobia + o que fazer em vez disso.
// Cada um pode ser marcado como "a trabalhar nisto".

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { FEEDING_BEHAVIORS } from '../data/content';
import { useLang } from '../i18n/i18n';
import { loadFeeding, saveFeeding } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

export default function FeedingScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [working, setWorking] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadFeeding().then(setWorking);
  }, []);

  function toggleWorking(id: string) {
    const next = working.includes(id) ? working.filter((x) => x !== id) : [...working, id];
    setWorking(next);
    saveFeeding(next);
  }

  const selected = FEEDING_BEHAVIORS.find((b) => b.id === selectedId) ?? null;

  // Vista de detalhe de um comportamento.
  if (selected) {
    const isWorking = working.includes(selected.id);
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBackBar title={selected.label[lang]} onBack={() => setSelectedId(null)} />
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
          <Card style={{ gap: 8 }}>
            <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 14 }}>{t('feeding.why')}</Text>
            <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{selected.why[lang]}</Text>
          </Card>
          <Card style={{ gap: 8, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{t('feeding.alternative')}</Text>
            <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{selected.alternative[lang]}</Text>
          </Card>
          <Pressable
            onPress={() => toggleWorking(selected.id)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: radius.md, borderWidth: 2, borderColor: isWorking ? colors.success : colors.primary, backgroundColor: isWorking ? colors.successSoft : 'transparent' }}
          >
            <Ionicons name={isWorking ? 'checkmark-circle' : 'add-circle-outline'} size={20} color={isWorking ? colors.success : colors.primary} />
            <Text style={{ color: isWorking ? colors.success : colors.primary, fontWeight: '700' }}>
              {isWorking ? t('feeding.working') : t('feeding.work')}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // Lista.
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('feeding.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, gap: 6 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{t('feeding.introTitle')}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{t('feeding.intro')}</Text>
        </Card>

        {working.length > 0 && (
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{t('feeding.count', { n: working.length })}</Text>
        )}

        {FEEDING_BEHAVIORS.map((b) => {
          const isWorking = working.includes(b.id);
          return (
            <Pressable
              key={b.id}
              onPress={() => setSelectedId(b.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: isWorking ? colors.success : colors.border }}
            >
              <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="flame-outline" size={20} color={colors.primary} />
              </View>
              <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{b.label[lang]}</Text>
              {isWorking && <Ionicons name="checkmark-circle" size={18} color={colors.success} />}
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
