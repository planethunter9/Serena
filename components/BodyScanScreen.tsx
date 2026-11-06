// Técnica de varrimento corporal: percorre as partes do corpo, uma a uma.

import { useState } from 'react';
import { Text, View } from 'react-native';
import { BODY_PARTS } from '../data/content';
import { pick, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/theme';
import { PrimaryButton, TopBackBar } from './ui';

export default function BodyScanScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [i, setI] = useState(0);

  const total = BODY_PARTS.length;
  const part = pick(BODY_PARTS[i], lang);
  const isLast = i === total - 1;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('tech.bodyscan')} onBack={onBack} />
      <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'space-between' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
          <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>
            {t('tech.bodyscanStep', { n: i + 1, total })}
          </Text>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center', lineHeight: 34 }}>
            {t('tech.bodyscanLead', { part })}
          </Text>
          {/* Barra de progresso */}
          <View style={{ height: 8, width: '80%', borderRadius: 4, backgroundColor: colors.track, overflow: 'hidden' }}>
            <View style={{ width: `${((i + 1) / total) * 100}%`, height: '100%', backgroundColor: colors.primary }} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {i > 0 && (
            <View style={{ flex: 1 }}>
              <PrimaryButton label={t('common.prev')} onPress={() => setI(i - 1)} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <PrimaryButton label={isLast ? t('common.done') : t('common.next')} onPress={() => (isLast ? onBack() : setI(i + 1))} />
          </View>
        </View>
      </View>
    </View>
  );
}
