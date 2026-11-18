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
      <TopBackBar
        title={L('Os meus planos', 'My plans')}
        onBack={onBack}
        info={tab === 'hardday'
          ? L('Prepara isto agora, com calma. Num dia mau é difícil pensar — ter o plano escrito e à mão faz toda a diferença. Guarda-se sozinho.', 'Prepare this now, calmly. On a bad day it\'s hard to think — having the plan written and ready makes all the difference. It saves itself.')
          : L('Recuperar não é apagar o medo para sempre — é saber o que fazer quando ele tenta voltar. Escreve o teu plano; fica guardado para quando precisares. Vai atualizando à medida que aprendes mais sobre ti.', 'Recovery is not erasing fear forever — it is knowing what to do when it tries to come back. Write your plan; it is saved for when you need it. Update it as you learn more about yourself.')}
      />
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm }}>
        <Segmented value={tab} onChange={setTab} options={[['hardday', L('Dias difíceis', 'Hard days')], ['relapse', L('Recaída', 'Relapse')]]} />
      </View>
      {tab === 'hardday' ? <HardDayBody /> : <RelapseBody />}
    </View>
  );
}
