// Detalhe de um comportamento que "alimenta o medo" — ecrã próprio (rota
// /feedingdet?id=…), para o deslizar do iOS voltar à lista e não aos Recursos.
// Mostra um exemplo concreto, porque alimenta o medo, a alternativa com um
// atalho para o exercício certo, e os comportamentos de segurança ligados
// (que se podem marcar para largar aqui mesmo).

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { FEEDING_BEHAVIORS } from '../data/content';
import { SAFETY_BEHAVIORS } from '../data/safety';
import { FEEDING_META, safetyText } from '../data/safetyText';
import { pick, useLang } from '../i18n/i18n';
import { applyBehavior } from '../lib/safetyState';
import { DroppedBehavior, loadDropped, loadFeeding, loadSafety, SafetyItem, saveDropped, saveFeeding, saveSafety } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

export default function FeedingDetailScreen() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const sx = safetyText(lang);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = FEEDING_BEHAVIORS.find((b) => b.id === id) ?? null;
  const meta = item ? FEEDING_META[item.id] : undefined;
  const [working, setWorking] = useState<string[]>([]);
  const [stored, setStored] = useState<SafetyItem[]>([]);
  const [dropped, setDropped] = useState<DroppedBehavior[]>([]);

  useEffect(() => {
    loadFeeding().then(setWorking);
    loadSafety().then(setStored);
    loadDropped().then(setDropped);
  }, []);

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBackBar title="" onBack={() => router.back()} />
      </View>
    );
  }

  const isWorking = working.includes(item.id);
  function toggle() {
    if (!isWorking) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const next = isWorking ? working.filter((x) => x !== item!.id) : [...working, item!.id];
    setWorking(next);
    saveFeeding(next);
  }
  function toggleDrop(bid: string, label: string, on: boolean) {
    Haptics.selectionAsync().catch(() => {});
    const res = applyBehavior(stored, dropped, bid, label, { dropping: !on });
    setStored(res.stored);
    saveSafety(res.stored);
    setDropped(res.dropped);
    saveDropped(res.dropped);
  }

  const related = (meta?.related ?? [])
    .map((rid) => SAFETY_BEHAVIORS.find((b) => b.id === rid))
    .filter(Boolean) as typeof SAFETY_BEHAVIORS;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={pick(item.label, lang)} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }}>
        {/* Exemplo */}
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={(meta?.icon ?? 'flame-outline') as keyof typeof Ionicons.glyphMap} size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{sx.example}</Text>
            <Text style={{ color: colors.text, fontSize: 16, lineHeight: 23, fontStyle: 'italic' }}>{sx.examples[item.id]}</Text>
          </View>
        </View>

        <Card style={{ gap: 8 }}>
          <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 14 }}>{t('feeding.why')}</Text>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{pick(item.why, lang)}</Text>
        </Card>

        <Card style={{ gap: 10, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{t('feeding.alternative')}</Text>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{pick(item.alternative, lang)}</Text>
          {meta && (
            <Pressable
              onPress={() => router.push(meta.route as any)}
              accessibilityRole="button"
              style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{sx.tryNow}</Text>
              <Ionicons name="arrow-forward" size={15} color="#fff" />
            </Pressable>
          )}
        </Card>

        {/* Comportamentos ligados */}
        {related.length > 0 && (
          <Card style={{ gap: 10 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{sx.related}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 17 }}>{sx.relatedHint}</Text>
            {related.map((b) => {
              const label = pick(b.label, lang);
              const on = !!stored.find((s) => s.id === b.id)?.dropping;
              return (
                <View key={b.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{label}</Text>
                  <Pressable
                    onPress={() => toggleDrop(b.id, label, on)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: on ? colors.successSoft : colors.cardAlt }}
                  >
                    <Ionicons name={on ? 'checkmark-circle' : 'flag-outline'} size={14} color={on ? colors.success : colors.primary} />
                    <Text style={{ color: on ? colors.success : colors.primary, fontSize: 12, fontWeight: '700' }}>{on ? sx.dropping : sx.drop}</Text>
                  </Pressable>
                </View>
              );
            })}
          </Card>
        )}

        <Pressable
          onPress={toggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isWorking }}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: radius.md, borderWidth: 2, borderColor: isWorking ? colors.success : colors.primary, backgroundColor: isWorking ? colors.successSoft : 'transparent' }}
        >
          <Ionicons name={isWorking ? 'checkmark-circle' : 'add-circle-outline'} size={20} color={isWorking ? colors.success : colors.primary} />
          <Text style={{ color: isWorking ? colors.success : colors.primary, fontWeight: '700' }}>
            {isWorking ? t('feeding.working') : t('feeding.work')}
          </Text>
        </Pressable>
        <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: -4 }}>{sx.workHint}</Text>
      </ScrollView>
    </View>
  );
}
