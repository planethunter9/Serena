// Barra "Fiz este exercício hoje" (registo simples para exercícios sem formulário).

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLang, tr2 } from '../../i18n/i18n';
import {
  appendExerciseLog,
  ExerciseLogEntry,
  loadExerciseLog,
  removeLastExerciseLog,
} from '../../storage/storage';
import { useTheme } from '../../theme/ThemeContext';
import { radius } from '../../theme/theme';
import { ymd } from './shared';

export function ExerciseLogBar({ type }: { type: string }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const Lx = (pt: string, en: string) => tr2(lang, pt, en);
  const [log, setLog] = useState<ExerciseLogEntry[]>([]);
  useEffect(() => { loadExerciseLog().then(setLog); }, []);
  const today = ymd(new Date());
  const todayCount = log.filter((e) => e.type === type && e.date === today).length;
  async function add() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setLog(await appendExerciseLog(type));
  }
  async function undo() { setLog(await removeLastExerciseLog(type)); }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Pressable onPress={add} accessibilityRole="button" accessibilityLabel={Lx('Guardar registo', 'Save entry')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 11, paddingHorizontal: 16 }}>
        <Ionicons name="checkmark" size={16} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{Lx('Guardar registo', 'Save entry')}</Text>
      </Pressable>
      {todayCount > 0 && (
        <>
          <Text style={{ color: colors.success, fontSize: 13, fontWeight: '600' }}>{Lx(`✓ feito ${todayCount}× hoje`, `✓ done ${todayCount}× today`)}</Text>
          <Pressable onPress={undo} hitSlop={6} accessibilityRole="button" accessibilityLabel={Lx('Anular último registo', 'Undo last log')} style={{ marginLeft: 'auto' }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{Lx('anular', 'undo')}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

// Categoria colapsável no hub de exercícios (estilo "Lições").
