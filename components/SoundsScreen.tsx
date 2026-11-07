// Sons ambiente, organizados em "Acalmar" e "Dormir", mais "Os meus sons"
// (ficheiros que o utilizador adiciona do telemóvel).

import { Ionicons } from '@expo/vector-icons';
import { useA11y } from '../lib/a11y';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { loadUserSounds, saveUserSounds, UserSound } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

export default function SoundsScreen({ onBack, category }: { onBack: () => void; category: 'calm' | 'sleep' }) {
  const { colors } = useTheme();
  const a11y = useA11y();
  const { t } = useLang();

  // Sons de origem (empacotados com a app).
  const brown = useAudioPlayer(require('../assets/sounds/brown.wav'));
  const rain = useAudioPlayer(require('../assets/sounds/rain.wav'));
  const ocean = useAudioPlayer(require('../assets/sounds/ocean.wav'));
  const stream = useAudioPlayer(require('../assets/sounds/stream.wav'));
  const sleep = useAudioPlayer(require('../assets/sounds/sleep.wav'));
  const night = useAudioPlayer(require('../assets/sounds/night.wav'));
  const delta = useAudioPlayer(require('../assets/sounds/delta.wav'));

  // Leitor partilhado para os sons do utilizador (troca a fonte conforme se toca).
  const userPlayer = useAudioPlayer(null);

  const [userSounds, setUserSounds] = useState<UserSound[]>([]);
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
  const builtin = [...calm, ...sleepSounds];

  // Os leitores do expo-audio configuram-se por atribuição (API da biblioteca).
  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    for (const s of builtin) s.player.loop = true;
    // eslint-disable-next-line react-hooks/immutability -- API do expo-audio
    userPlayer.loop = true;
    loadUserSounds().then(setUserSounds);
  }, []);

  function stopAll() {
    for (const s of builtin) s.player.pause();
    userPlayer.pause();
  }

  function toggleBuiltin(id: string) {
    stopAll();
    const sel = builtin.find((s) => s.id === id)!;
    if (active === id) {
      setActive(null);
    } else {
      sel.player.seekTo(0);
      sel.player.play();
      setActive(id);
    }
  }

  function toggleUser(snd: UserSound) {
    stopAll();
    if (active === snd.id) {
      setActive(null);
    } else {
      // Aponta o leitor partilhado para o ficheiro do utilizador.
      userPlayer.replace({ uri: snd.uri });
      // eslint-disable-next-line react-hooks/immutability -- API do expo-audio
      userPlayer.loop = true;
      userPlayer.play();
      setActive(snd.id);
    }
  }

  // Escolher um ficheiro de áudio do telemóvel e copiá-lo para dentro da app.
  async function addSound() {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
      if (res.canceled || !res.assets?.[0]) return;
      const file = res.assets[0];
      const dir = FileSystem.documentDirectory + 'sounds/';
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
      const dest = dir + Date.now() + '_' + (file.name || 'som.mp3').replace(/[^a-zA-Z0-9._-]/g, '');
      await FileSystem.copyAsync({ from: file.uri, to: dest });
      const name = (file.name || 'Som').replace(/\.[^.]+$/, '');
      const next = [...userSounds, { id: 'us' + Date.now(), name, uri: dest, category }];
      setUserSounds(next);
      await saveUserSounds(next);
    } catch (e) {
      Alert.alert(t('sounds.addError'));
    }
  }

  function removeSound(snd: UserSound) {
    Alert.alert(t('sounds.removeTitle'), snd.name, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('sounds.remove'),
        style: 'destructive',
        onPress: async () => {
          if (active === snd.id) { stopAll(); setActive(null); }
          FileSystem.deleteAsync(snd.uri, { idempotent: true }).catch(() => {});
          const next = userSounds.filter((s) => s.id !== snd.id);
          setUserSounds(next);
          await saveUserSounds(next);
        },
      },
    ]);
  }

  const list = category === 'sleep' ? sleepSounds : calm;
  const title = category === 'sleep' ? t('sounds.sleepTitle') : t('sounds.calmTitle');
  const myList = userSounds.filter((s) => s.category === category);

  function Row({ playing, icon, name, onPress, onDelete }: { playing: boolean; icon: keyof typeof Ionicons.glyphMap; name: string; onPress: () => void; onDelete?: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: playing ? colors.primarySoft : colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 2, borderColor: playing ? colors.primary : colors.border }}>
        <View style={{ width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>{name}</Text>
        {onDelete && (
          <Pressable onPress={onDelete} hitSlop={8} accessibilityRole="button" accessibilityLabel={a11y.delete} style={{ padding: 4 }}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </Pressable>
        )}
        <Ionicons name={playing ? 'pause-circle' : 'play-circle'} size={40} color={colors.primary} />
      </Pressable>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={title} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('sounds.hint')}</Text>

        {list.map((s) => <Row key={s.id} playing={active === s.id} icon={s.icon} name={s.title} onPress={() => toggleBuiltin(s.id)} />)}

        {/* Os meus sons */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{t('sounds.mine')}</Text>
          <Pressable onPress={addSound} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{t('sounds.add')}</Text>
          </Pressable>
        </View>

        {myList.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('sounds.mineEmpty')}</Text>
        ) : (
          myList.map((s) => (
            <Row key={s.id} playing={active === s.id} icon="musical-notes-outline" name={s.name} onPress={() => toggleUser(s)} onDelete={() => removeSound(s)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
