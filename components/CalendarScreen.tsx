// Calendário mensal: marca os dias com ataques/comportamentos (vermelho)
// e os dias de terapia exposta (verde).

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLang } from '../i18n/i18n';
import { AttackEntry, loadAttacks, loadExposureDays } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, ScreenTitle } from './ui';

const MONTHS = {
  pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const WEEKDAYS = {
  pt: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

function pad(n: number) {
  return n < 10 ? '0' + n : '' + n;
}

export default function CalendarScreen() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const [events, setEvents] = useState<AttackEntry[]>([]);
  const [expDays, setExpDays] = useState<string[]>([]);

  useEffect(() => {
    loadAttacks().then(setEvents);
    loadExposureDays().then(setExpDays);
  }, []);

  // Agrupa os eventos por dia (AAAA-MM-DD).
  const byDate = useMemo(() => {
    const m: Record<string, AttackEntry[]> = {};
    for (const e of events) {
      if (!m[e.date]) m[e.date] = [];
      m[e.date].push(e);
    }
    return m;
  }, [events]);

  const expSet = useMemo(() => new Set(expDays), [expDays]);

  function prevMonth() {
    setSelected(null);
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((mth) => mth - 1);
  }
  function nextMonth() {
    setSelected(null);
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((mth) => mth + 1);
  }

  const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7; // segunda = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const todayStr = now.toISOString().slice(0, 10);
  const cellW = `${100 / 7}%`;

  function typeLabel(type: string) {
    if (type === 'anxiety') return t('home.anxiety');
    if (type === 'panic') return t('home.panic');
    return t('home.behavior');
  }
  function timeOf(ts: string) {
    const d = new Date(ts);
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  const selectedEvents = selected ? byDate[selected] ?? [] : [];
  const selectedHasExp = selected ? expSet.has(selected) : false;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 120 }}>
      <ScreenTitle title={t('calendar.title')} />

      <Card style={{ gap: spacing.md }}>
        {/* Cabeçalho do mês */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={prevMonth} hitSlop={10} style={{ padding: 6 }}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </Pressable>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{MONTHS[lang][month]} {year}</Text>
          <Pressable onPress={nextMonth} hitSlop={10} style={{ padding: 6 }}>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </Pressable>
        </View>

        {/* Dias da semana */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {WEEKDAYS[lang].map((w, i) => (
            <View key={i} style={{ width: cellW, alignItems: 'center', paddingVertical: 4 }}>
              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>{w}</Text>
            </View>
          ))}
        </View>

        {/* Grelha de dias */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cells.map((day, idx) => {
            if (day === null) return <View key={'e' + idx} style={{ width: cellW, height: 46 }} />;
            const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
            const hasAttack = !!byDate[dateStr];
            const hasExp = expSet.has(dateStr);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selected;
            return (
              <Pressable key={dateStr} onPress={() => setSelected(dateStr)} style={{ width: cellW, height: 46, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? colors.primary : isToday ? colors.primarySoft : 'transparent' }}>
                  <Text style={{ color: isSelected ? '#fff' : colors.text, fontSize: 15, fontWeight: isToday ? '700' : '500' }}>{day}</Text>
                </View>
                {/* Marcas: vermelho (ataque) e/ou verde (exposição) */}
                <View style={{ flexDirection: 'row', gap: 3, marginTop: 2, height: 6 }}>
                  {hasAttack && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger }} />}
                  {hasExp && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success }} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Legenda */}
      <View style={{ gap: 6, paddingHorizontal: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }} />
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('calendar.legend')}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('calendar.legendExposure')}</Text>
        </View>
      </View>

      {/* Detalhe do dia escolhido */}
      {selected && (
        <Card style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{selected.split('-').reverse().join('/')}</Text>

          {selectedHasExp && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success }} />
              <Text style={{ color: colors.text, fontSize: 15 }}>{t('calendar.exposureDay')}</Text>
            </View>
          )}

          {selectedEvents.map((e, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger }} />
              <Text style={{ color: colors.text, fontSize: 15 }}>{typeLabel(e.type)}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginLeft: 'auto' }}>{timeOf(e.ts)}</Text>
            </View>
          ))}

          {selectedEvents.length === 0 && !selectedHasExp && (
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('calendar.noneDay')}</Text>
          )}
        </Card>
      )}

      {!selected && <Text style={{ color: colors.textMuted, fontSize: 13, paddingHorizontal: 4 }}>{t('calendar.pickHint')}</Text>}
    </ScrollView>
  );
}
