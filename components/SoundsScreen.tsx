// Sons ambiente, organizados em "Acalmar" e "Dormir" (data/sounds.ts), mais
// "Os meus sons" (ficheiros que o utilizador adiciona do telemóvel).
// Temporizador para desligar com fade-out; continua com o ecrã bloqueado e ao
// sair do ecrã (leitor partilhado + mini-leitor em baixo).

import { Ionicons } from '@expo/vector-icons';
import { useA11y } from '../lib/a11y';
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
import { useSound } from '../store/SoundContext';

export default function SoundsScreen({ onBack, category }: { onBack: () => void; category: 'calm' | 'sleep' }) {
  const { colors } = useTheme();
  const a11y = useA11y();
  const { t, lang } = useLang();
  const tm = TIMER_TEXT[lang] ?? TIMER_TEXT.en;

  // O leitor é partilhado pela app (store/SoundContext): o som continua ao sair
  // deste ecrã e aparece no mini-leitor em baixo.
  const snd = useSound();
  const [userSounds, setUserSounds] = useState<UserSound[]>([]);
  const active = snd.playing ? snd.current?.id ?? null : null;
  const timerMin = snd.timerMin;
  const setTimerMin = snd.setTimerMin;
  const remaining = snd.remaining;

  const list = SOUNDS.filter((s) => s.category === category);

  useEffect(() => {
    loadUserSounds().then(setUserSounds);
    // "Dormir" começa com 30 min de temporizador (se ainda não estiver a tocar nada).
    if (!snd.current) snd.setTimerMin(category === 'sleep' ? 30 : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function play(id: string, source: number | { uri: string }, name: string) {
    snd.play({ id, name, source, category });
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

  function removeSound(us: UserSound) {
    Alert.alert(t('sounds.removeTitle'), us.name, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('sounds.remove'),
        style: 'destructive',
        onPress: async () => {
          if (snd.current?.id === us.id) snd.stop();
          FileSystem.deleteAsync(us.uri, { idempotent: true }).catch(() => {});
          const next = userSounds.filter((s) => s.id !== us.id);
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
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 120 }}>
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
          <Row key={s.id} playing={active === s.id} icon={s.icon} name={s.title[lang] ?? s.title.en} desc={s.desc[lang] ?? s.desc.en} onPress={() => play(s.id, s.source, s.title[lang] ?? s.title.en)} />
        ))}

        {/* Os meus sons */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{t('sounds.mine')}</Text>
          <Pressable onPress={addSound} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{t('sounds.add')}</Text>
          </Pressable>
        </View>

        {myList.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('sounds.mineEmpty')}</Text>
        ) : (
          myList.map((s) => (
            <Row key={s.id} playing={active === s.id} icon="musical-notes-outline" name={s.name} onPress={() => play(s.id, { uri: s.uri }, s.name)} onDelete={() => removeSound(s)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
