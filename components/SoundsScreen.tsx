// Sons ambiente, organizados em "Acalmar" e "Dormir".
// Sintetizados e livres de direitos (em assets/sounds/). Podes trocá-los por gravações tuas.

import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

export default function SoundsScreen({ onBack, category }: { onBack: () => void; category: 'calm' | 'sleep' }) {
  const { colors } = useTheme();
  const { t } = useLang();

  // Um leitor por som.
  const brown = useAudioPlayer(require('../assets/sounds/brown.wav'));
  const rain = useAudioPlayer(require('../assets/sounds/rain.wav'));
  const ocean = useAudioPlayer(require('../assets/sounds/ocean.wav'));
  const stream = useAudioPlayer(require('../assets/sounds/stream.wav'));
  const sleep = useAudioPlayer(require('../assets/sounds/sleep.wav'));
  const night = useAudioPlayer(require('../assets/sounds/night.wav'));
  const delta = useAudioPlayer(require('../assets/sounds/delta.wav'));
  const [active, setActive] = useState<string | null>(null);

  type Sound = { id: string; player: any; title: string; icon: keyof typeof Ionicons.glyphMap };

  const calm: Sound[] = [
    { id: 'brown', player: brown, title: t('sounds.brown'), icon: 'radio-outline' },
    { id: 'rain', player: rain, title: t('sounds.rain'), icon: 'rainy-outline' },
    { id: 'ocean', player: ocean, title: t('sounds.ocean'), icon: 'water-outline' },
    { id: 'stream', player: stream, title: t('sounds.stream'), icon: 'leaf-outline' },
  ];
  const sleepSounds: Sound[] = [
    { id: 'sleep', player: sleep, title: t('sounds.sleep'), icon: 'moon-outline' },
    { id: 'night', player: night, title: t('sounds.night'), icon: 'cloudy-night-outline' },
    { id: 'delta', player: delta, title: t('sounds.delta'), icon: 'pulse-outline' },
  ];
  const all = [...calm, ...sleepSounds];

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    for (const s of all) s.player.loop = true;
    // o expo-audio liberta os leitores sozinho ao sair.
  }, []);

  function toggle(id: string) {
    for (const s of all) if (s.id !== id) s.player.pause();
    const sel = all.find((s) => s.id === id)!;
    if (active === id) {
      sel.player.pause();
      setActive(null);
    } else {
      sel.player.seekTo(0);
      sel.player.play();
      setActive(id);
    }
  }

  function Row({ s }: { s: Sound }) {
    const playing = active === s.id;
    return (
      <Pressable
        onPress={() => toggle(s.id)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: playing ? colors.primarySoft : colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 2, borderColor: playing ? colors.primary : colors.border }}
      >
        <View style={{ width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={s.icon} size={24} color={colors.primary} />
        </View>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>{s.title}</Text>
        <Ionicons name={playing ? 'pause-circle' : 'play-circle'} size={40} color={colors.primary} />
      </Pressable>
    );
  }

  const list = category === 'sleep' ? sleepSounds : calm;
  const title = category === 'sleep' ? t('sounds.sleepTitle') : t('sounds.calmTitle');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={title} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('sounds.hint')}</Text>
        {list.map((s) => <Row key={s.id} s={s} />)}
      </ScrollView>
    </View>
  );
}
