// Técnica de pensamento positivo: mostra uma frase de cada vez.

import { useState } from 'react';
import { Text, View } from 'react-native';
import { AFFIRMATIONS } from '../data/content';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import { PrimaryButton, TopBackBar } from './ui';

export default function PositiveTalkScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [i, setI] = useState(0);

  function another() {
    setI((prev) => (prev + 1) % AFFIRMATIONS.length);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('tech.positive')} onBack={onBack} />
      <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'space-between' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: '700', textAlign: 'center', lineHeight: 38 }}>
            “{AFFIRMATIONS[i][lang]}”
          </Text>
        </View>
        <PrimaryButton label={t('tech.another')} onPress={another} />
      </View>
    </View>
  );
}
