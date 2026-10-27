// Detalhe de um comportamento que "alimenta o medo" — ecrã próprio (rota
// /feeding?id=…), para o deslizar do iOS voltar à lista e não aos Recursos.

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { FEEDING_BEHAVIORS } from '../data/content';
import { useLang } from '../i18n/i18n';
import { loadFeeding, saveFeeding } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

export default function FeedingDetailScreen() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = FEEDING_BEHAVIORS.find((b) => b.id === id) ?? null;
  const [working, setWorking] = useState<string[]>([]);

  useEffect(() => { loadFeeding().then(setWorking); }, []);

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBackBar title="" onBack={() => router.back()} />
      </View>
    );
  }

  const isWorking = working.includes(item.id);
  function toggle() {
    const next = isWorking ? working.filter((x) => x !== item!.id) : [...working, item!.id];
    setWorking(next);
    saveFeeding(next);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={item.label[lang]} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }}>
        <Card style={{ gap: 8 }}>
          <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 14 }}>{t('feeding.why')}</Text>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{item.why[lang]}</Text>
        </Card>
        <Card style={{ gap: 8, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{t('feeding.alternative')}</Text>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{item.alternative[lang]}</Text>
        </Card>
        <Pressable
          onPress={toggle}
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
