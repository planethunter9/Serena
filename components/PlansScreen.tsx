// "Os meus planos": junta o Plano para dias difíceis e o Plano de prevenção de
// recaída em duas abas (chips estilo Notion).

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { tr2 } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import { HardDayBody } from './HardDayPlanScreen';
import { RelapseBody } from './RelapsePlanScreen';
import { TopBackBar } from './ui';

export default function PlansScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const [tab, setTab] = useState<'hardday' | 'relapse'>('hardday');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={L('Os meus planos', 'My plans')} onBack={onBack} />
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm }}>
        <View style={{ flexDirection: 'row', backgroundColor: colors.cardAlt, borderRadius: 999, padding: 4 }}>
          {(['hardday', 'relapse'] as const).map((v) => {
            const active = tab === v;
            return (
              <Pressable key={v} onPress={() => setTab(v)} style={{ flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center', backgroundColor: active ? colors.card : 'transparent' }}>
                <Text numberOfLines={1} style={{ color: active ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 14 }}>
                  {v === 'hardday' ? L('Dias difíceis', 'Hard days') : L('Recaída', 'Relapse')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {tab === 'hardday' ? <HardDayBody /> : <RelapseBody />}
    </View>
  );
}
