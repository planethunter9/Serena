// Sons ambiente, organizados em "Acalmar" e "Dormir" (data/sounds.ts), mais
// "Os meus sons" (ficheiros que o utilizador adiciona do telemóvel).
// Temporizador para desligar com fade-out; continua com o ecrã bloqueado.

import { Ionicons } from '@expo/vector-icons';
import { useA11y } from '../lib/a11y';
import { AudioPlayer, setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SOUNDS, TIMER_MINUTES, TIMER_TEXT } from '../data/sounds';
import { useLang } from '../i18n/i18n';
import { loadUserSounds, saveUserSounds, UserSound } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

// O leitor do expo-audio configura-se por atribuição (API da biblioteca).
function setVolume(p: AudioPlayer, v: number) { p.volume = v; }
function setLoop(p: AudioPlayer, v: boolean) { p.loop = v; }

export default function SoundsScreen({ onBack, category }: { onBack: () => void; category: 'calm' | 'sleep' }) {
  const { colors } = useTheme();
  const a11y = useA11y();
  const { t, lang } = useLang();
  const tm = TIMER_TEXT[lang] ?? TIMER_TEXT.en;

  // Um só leitor para tudo (sons da app e do utilizador): troca a fonte ao tocar.
  const player = useAudioPlayer(null);

  const [userSounds, setUserSounds] = useState<UserSound[]>([]);
  const [active, setActive] = useState<string | null>(null);
  // Temporizador: desliga ao fim de X minutos, com fade-out nos últimos 30 s.
  const [timerMin, setTimerMin] = useState<number | null>(category === 'sleep' ? 30 : null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const list = SOUNDS.filter((s) => s.category === category);

  // Os leitores do expo-audio configuram-se por atribuição (API da biblioteca).
  useEffect(() => {
    // Continua a tocar com o ecrã bloqueado e em modo silencioso (útil para dormir).
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(() => {});
    setLoop(player, true);
    loadUserSounds().then(setUserSounds);
    // Configurar uma vez ao abrir (o leitor é o mesmo durante o ecrã).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Contagem decrescente do temporizador (recomeça ao trocar de som ou de tempo).
  useEffect(() => {
    if (!active || !timerMin) return;
    const endAt = Date.now() + timerMin * 60000;
    const FADE = 30000;
    const tick = () => {
      const left = endAt - Date.now();
      if (left <= 0) {
        player.pause();
        setVolume(player, 1);
        setActive(null);
        setRemaining(null);
        return;
      }
      setVolume(player, left < FADE ? Math.max(0, left / FADE) : 1);
      setRemaining(Math.ceil(left / 60000));
    };
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(id); setVolume(player, 1); setRemaining(null); };
  }, [active, timerMin, player]);

  function play(id: string, source: number | { uri: string }) {
    if (active === id) {
      player.pause();
      setActive(null);
      return;
    }
    player.replace(source);
    setLoop(player, true);
    setVolume(player, 1);
    player.play();
    setActive(id);
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
    } catch {
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
          if (active === snd.id) { player.pause(); setActive(null); }
          FileSystem.deleteAsync(snd.uri, { idempotent: true }).catch(() => {});
          const next = userSounds.filter((s) => s.id !== snd.id);
          setUserSounds(next);
          await saveUserSounds(next);
        },
      },
    ]);
  }

  const title = category === 'sleep' ? t('sounds.sleepTitle') : t('sounds.calmTitle');
  const myList = userSounds.filter((s) => s.category === category);

  function Row({ playing, icon, name, desc, onPress, onDelete }: { playing: boolean; icon: keyof typeof Ionicons.glyphMap; name: string; desc?: string; onPress: () => void; onDelete?: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: playing ? colors.primarySoft : colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 2, borderColor: playing ? colors.primary : colors.border }}>
        <View style={{ width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{name}</Text>
          {desc ? <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>{desc}</Text> : null}
        </View>
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

        {/* Temporizador */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="timer-outline" size={16} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '700', flex: 1 }}>{tm.label}</Text>
            {remaining != null && <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{tm.endsIn} {remaining} {tm.min}</Text>}
          </View>
          <View style={{ flexDirection: 'row', backgroundColor: colors.cardAlt, borderRadius: 999, padding: 4 }}>
            {[null, ...TIMER_MINUTES].map((m) => {
              const on = timerMin === m;
              return (
                <Pressable key={String(m)} onPress={() => setTimerMin(m)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={{ flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: 'center', backgroundColor: on ? colors.card : 'transparent' }}>
                  <Text style={{ color: on ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 13 }}>{m == null ? tm.off : `${m} ${tm.min}`}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {list.map((s) => (
          <Row key={s.id} playing={active === s.id} icon={s.icon} name={s.title[lang] ?? s.title.en} desc={s.desc[lang] ?? s.desc.en} onPress={() => play(s.id, s.source)} />
        ))}

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
            <Row key={s.id} playing={active === s.id} icon="musical-notes-outline" name={s.name} onPress={() => play(s.id, { uri: s.uri })} onDelete={() => removeSound(s)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
