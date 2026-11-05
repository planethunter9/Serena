// Walkthrough de abertura: carrossel de slides que aparece UMA vez, logo após
// criar conta + onboarding. Chama onDone() no "Começar" ou no "Saltar".
// Quem o renderiza deve guardar a flag (saveWalkthroughSeen) no onDone.

import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

export default function WalkthroughScreen({ onDone }: { onDone: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const L = (pt: string, en: string) => (lang === 'pt' ? pt : en);
  const W = Dimensions.get('window').width;
  const ref = useRef<any>(null); // tipado como any p/ aceder a scrollTo (tipos do SDK 58)
  const [i, setI] = useState(0);

  const slides: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }[] = [
    {
      icon: 'sparkles-outline',
      title: L('Bem-vinda à Serena', 'Welcome to Serena'),
      text: L('Um apoio para compreenderes e reduzires o medo de vomitar — ao teu ritmo, um passo de cada vez.', 'Support to understand and reduce the fear of vomiting — at your own pace, one step at a time.'),
    },
    {
      icon: 'book-outline',
      title: L('Aprende', 'Learn'),
      text: L('Lições curtas explicam como a fobia funciona. Perceber o medo já lhe tira muito poder.', 'Short lessons explain how the phobia works. Understanding the fear already takes much of its power away.'),
    },
    {
      icon: 'trending-up-outline',
      title: L('Pratica', 'Practise'),
      text: L('Monta a tua escada de exposição e faz exercícios para enfrentares o medo, do mais fácil ao mais difícil.', 'Build your exposure ladder and do exercises to face the fear, from easiest to hardest.'),
    },
    {
      icon: 'stats-chart-outline',
      title: L('Acompanha o teu caminho', 'Track your journey'),
      text: L('Os pilares, as sequências e as estatísticas mostram a tua evolução — sem pressão, cada passo conta.', 'Pillars, streaks and stats show your progress — no pressure, every step counts.'),
    },
    {
      icon: 'medkit-outline',
      title: L('Apoio quando precisares', 'Support when you need it'),
      text: L('Técnicas para os momentos difíceis, os teus planos e linhas de apoio, sempre à mão.', 'Techniques for hard moments, your plans and support lines, always within reach.'),
    },
  ];

  const last = i >= slides.length - 1;

  function next() {
    if (last) { onDone(); return; }
    ref.current?.scrollTo({ x: W * (i + 1), animated: true });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      {/* Saltar */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.xl, paddingVertical: spacing.sm }}>
        <Pressable onPress={onDone} hitSlop={10} accessibilityRole="button" accessibilityLabel={L('Saltar', 'Skip')}>
          <Text style={{ color: colors.textMuted, fontSize: 15, fontWeight: '600' }}>{L('Saltar', 'Skip')}</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / W))}
      >
        {slides.map((s, idx) => (
          <View key={idx} style={{ width: W, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl, gap: spacing.lg }}>
            <View style={{ width: 128, height: 128, borderRadius: 64, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={s.icon} size={56} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' }}>{s.title}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 24, textAlign: 'center' }}>{s.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Pontos + botão */}
      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: (insets.bottom || 0) + spacing.lg, gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 7 }}>
          {slides.map((_, idx) => (
            <View key={idx} style={{ width: idx === i ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: idx === i ? colors.primary : colors.border }} />
          ))}
        </View>
        <Pressable onPress={next} accessibilityRole="button" style={{ backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 16, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{last ? L('Começar', 'Get started') : L('Seguinte', 'Next')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
