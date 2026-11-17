// "Os meus planos": junta o Plano para dias difíceis e o Plano de prevenção de
// recaída em duas abas (chips estilo Notion).

import { useState } from 'react';
import { View } from 'react-native';
import { useLang , tr2 } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import { HardDayBody } from './HardDayPlanScreen';
import { RelapseBody } from './RelapsePlanScreen';
import { Segmented, TopBackBar } from './ui';

export default function PlansScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);
  const [tab, setTab] = useState<'hardday' | 'relapse'>('hardday');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={L('Os meus planos', 'My plans')} onBack={onBack} />
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm }}>
        <Segmented value={tab} onChange={setTab} options={[['hardday', L('Dias difíceis', 'Hard days')], ['relapse', L('Recaída', 'Relapse')]]} />
      </View>
      {tab === 'hardday' ? <HardDayBody /> : <RelapseBody />}
    </View>
  );
}
