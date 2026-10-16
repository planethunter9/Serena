// Perfil do medo: resumo do que o utilizador escolheu + alguns números.

import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { loadAttacks, loadSafety, loadSeverity, loadStreakStart, OnboardingData, ProfileItem } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, TopBackBar } from './ui';

function asItems(arr: any[]): ProfileItem[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((it, i) => (typeof it === 'string' ? { id: 'x' + i, label: it } : { id: it.id ?? 'x' + i, label: it.label ?? '' }));
}

export default function FearProfileScreen({ onBack, data }: { onBack: () => void; data: OnboardingData }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const [streakDays, setStreakDays] = useState(0);
  const [avgFear, setAvgFear] = useState(0);
  const [attacks14, setAttacks14] = useState(0);
  const [droppingCount, setDroppingCount] = useState(0);

  useEffect(() => {
    (async () => {
      const [start, severity, attacks, safety] = await Promise.all([loadStreakStart(), loadSeverity(), loadAttacks(), loadSafety()]);
      setStreakDays(start ? Math.max(0, Math.floor((Date.now() - new Date(start).getTime()) / 86400000)) : 0);
      setAvgFear(severity.length ? severity.reduce((s, e) => s + e.value, 0) / severity.length : 0);
      const cutoff = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
      setAttacks14(attacks.filter((a) => a.date >= cutoff && a.type !== 'behavior').length);
      setDroppingCount(safety.filter((s) => s.dropping).length);
    })();
  }, []);

  const section = (title: string, items: ProfileItem[]) =>
    items.length > 0 ? (
      <Card style={{ gap: 8 }}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{title}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {items.map((it) => (
            <View key={it.id} style={{ backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{it.label}</Text>
            </View>
          ))}
        </View>
      </Card>
    ) : null;

  const stats = [
    { label: t('fearprofile.streak'), value: `${streakDays}` },
    { label: t('progress.statAvg'), value: `${avgFear.toFixed(1)}/5` },
    { label: t('progress.statAttacks'), value: `${attacks14}` },
    { label: t('fearprofile.dropping'), value: `${droppingCount}` },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('resources.fearprofile')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('fearprofile.intro')}</Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {stats.map((s) => (
            <Card key={s.label} style={{ width: '47%', flexGrow: 1, alignItems: 'center', paddingVertical: spacing.lg, gap: 4 }}>
              <Text style={{ color: colors.primary, fontSize: 22, fontWeight: '800' }}>{s.value}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>{s.label}</Text>
            </Card>
          ))}
        </View>

        {section(t('settings.subtypes'), asItems(data.subtypes))}
        {section(t('settings.triggers'), asItems(data.triggers))}
        {section(t('settings.losses'), asItems(data.losses))}
        {section(t('settings.affects'), asItems(data.symptoms))}
        {section(t('settings.recover'), asItems(data.recover))}
        {section(t('settings.coping'), asItems(data.coping))}
      </ScrollView>
    </View>
  );
}
