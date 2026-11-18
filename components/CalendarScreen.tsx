// Calendário mensal: marca os dias com ataques/comportamentos (vermelho)
// e os dias com exposição (verde).

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Lang, useLang , tr2 } from '../i18n/i18n';
import { AttackEntry, loadAttacks, loadExposureDays, saveAttacks } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { CoachTarget } from './CoachMarks';
import { Card, ScreenTitle } from './ui';

const MONTHS: Record<Lang, string[]> = {
  pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  'pt-BR': ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  nl: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
  pl: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
};
const WEEKDAYS: Record<Lang, string[]> = {
  pt: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  'pt-BR': ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  es: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  it: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
  nl: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
  pl: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
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
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState<'anxiety' | 'panic' | 'behavior'>('anxiety');
  const [newReason, setNewReason] = useState('');
  const [newVomited, setNewVomited] = useState<boolean | null>(null);

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
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  // Semanas de 7 dias (a última é completada com vazios).
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const w = cells.slice(i, i + 7);
    while (w.length < 7) w.push(null);
    weeks.push(w);
  }

  function typeLabel(type: string) {
    if (type === 'anxiety') return t('home.anxiety');
    if (type === 'panic') return t('home.panic');
    return t('home.behavior');
  }
  function timeOf(ts: string) {
    const d = new Date(ts);
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function resetForm() {
    setAdding(false); setNewType('anxiety'); setNewReason(''); setNewVomited(null);
  }
  function addEntry() {
    if (!selected) return;
    const now = new Date();
    const entry: AttackEntry = {
      id: 'a' + now.getTime(),
      ts: now.toISOString(),
      date: selected,
      type: newType,
      reason: newReason.trim() || undefined,
      vomited: newVomited === null ? undefined : newVomited,
    };
    const next = [...events, entry];
    setEvents(next);
    saveAttacks(next);
    resetForm();
  }
  function deleteEntry(target: AttackEntry) {
    const next = events.filter((x) => x !== target);
    setEvents(next);
    saveAttacks(next);
  }

  const selectedEvents = selected ? byDate[selected] ?? [] : [];
  const selectedHasExp = selected ? expSet.has(selected) : false;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 120 }}>
      <ScreenTitle title={t('calendar.title')} />

      <CoachTarget name="calendar-card">
      <Card style={{ gap: spacing.md }}>
        {/* Cabeçalho do mês */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={prevMonth} hitSlop={10} accessibilityRole="button" accessibilityLabel={tr2(lang, 'Mês anterior', 'Previous month')} style={{ padding: 6 }}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </Pressable>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{MONTHS[lang][month]} {year}</Text>
          <Pressable onPress={nextMonth} hitSlop={10} accessibilityRole="button" accessibilityLabel={tr2(lang, 'Mês seguinte', 'Next month')} style={{ padding: 6 }}>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </Pressable>
        </View>

        {/* Dias da semana */}
        <View style={{ flexDirection: 'row' }}>
          {WEEKDAYS[lang].map((w, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }} numberOfLines={1}>{w}</Text>
            </View>
          ))}
        </View>

        {/* Grelha de dias: uma linha por semana, 7 colunas iguais (flex: 1).
            Antes usava largura de 100/7 % com quebra de linha, o que em algumas
            versões do React Native somava mais de 100 % e empurrava o domingo. */}
        <View>
          {weeks.map((week, wi) => (
            <View key={wi} style={{ flexDirection: 'row' }}>
              {week.map((day, di) => {
                if (day === null) return <View key={'e' + di} style={{ flex: 1, height: 46 }} />;
                const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
                const hasAttack = !!byDate[dateStr];
                const hasExp = expSet.has(dateStr);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selected;
                return (
                  <Pressable key={dateStr} onPress={() => setSelected(dateStr)} accessibilityRole="button" accessibilityState={{ selected: isSelected }} style={{ flex: 1, height: 46, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? colors.primary : isToday ? colors.primarySoft : 'transparent' }}>
                      <Text style={{ color: isSelected ? colors.onPrimary : colors.text, fontSize: 15, fontWeight: isToday ? '700' : '500' }}>{day}</Text>
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
          ))}
        </View>
      </Card>
      </CoachTarget>

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
            <View key={e.id ?? i} style={{ gap: 4, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border, paddingTop: i === 0 ? 0 : 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger }} />
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{typeLabel(e.type)}</Text>
                {e.vomited !== undefined && (
                  <View style={{ backgroundColor: e.vomited ? colors.danger : colors.successSoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ color: e.vomited ? colors.onPrimary : colors.success, fontSize: 11, fontWeight: '700' }}>{e.vomited ? (tr2(lang, 'vomitou', 'vomited')) : (tr2(lang, 'não vomitou', 'did not vomit'))}</Text>
                  </View>
                )}
                <Text style={{ color: colors.textMuted, fontSize: 13, marginLeft: 'auto' }}>{timeOf(e.ts)}</Text>
                <Pressable onPress={() => deleteEntry(e)} hitSlop={6} accessibilityRole="button" accessibilityLabel={tr2(lang, 'Apagar registo', 'Delete entry')} style={{ padding: 2 }}>
                  <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                </Pressable>
              </View>
              {!!e.reason && <Text style={{ color: colors.textMuted, fontSize: 13, marginLeft: 14 }}>{e.reason}</Text>}
            </View>
          ))}

          {selectedEvents.length === 0 && !selectedHasExp && (
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>{t('calendar.noneDay')}</Text>
          )}

          {/* Registar ataque / comportamento */}
          {adding ? (
            <View style={{ gap: 10, marginTop: 4, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{tr2(lang, 'O que aconteceu?', 'What happened?')}</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(['anxiety', 'panic', 'behavior'] as const).map((tp) => {
                  const active = newType === tp;
                  return (
                    <Pressable key={tp} onPress={() => setNewType(tp)} style={{ flex: 1, paddingVertical: 8, borderRadius: radius.md, alignItems: 'center', backgroundColor: active ? colors.primary : colors.cardAlt, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}>
                      <Text numberOfLines={1} style={{ color: active ? colors.onPrimary : colors.text, fontSize: 12, fontWeight: '700' }}>{typeLabel(tp)}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput value={newReason} onChangeText={setNewReason} placeholder={tr2(lang, 'Motivo / gatilho (opcional)', 'Reason / trigger (optional)')} placeholderTextColor={colors.textMuted} style={{ padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15 }} />
              <Text style={{ color: colors.text, fontSize: 14 }}>{tr2(lang, 'Acabei por vomitar?', 'Did I end up vomiting?')}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {([[true, tr2(lang, 'Sim', 'Yes')], [false, tr2(lang, 'Não', 'No')]] as const).map(([val, label]) => {
                  const active = newVomited === val;
                  return (
                    <Pressable key={String(val)} onPress={() => setNewVomited(val)} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center', backgroundColor: active ? colors.primary : colors.cardAlt, borderWidth: 2, borderColor: active ? colors.primary : colors.border }}>
                      <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: '700' }}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable onPress={resetForm} style={{ flex: 1, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center', borderWidth: 2, borderColor: colors.border }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{tr2(lang, 'Cancelar', 'Cancel')}</Text>
                </Pressable>
                <Pressable onPress={addEntry} style={{ flex: 1, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center', backgroundColor: colors.primary }}>
                  <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>{tr2(lang, 'Guardar', 'Save')}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => setAdding(true)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, marginTop: 4 }}>
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{tr2(lang, 'Registar ataque / comportamento', 'Log attack / behaviour')}</Text>
            </Pressable>
          )}
        </Card>
      )}

      {!selected && <Text style={{ color: colors.textMuted, fontSize: 13, paddingHorizontal: 4 }}>{t('calendar.pickHint')}</Text>}
    </ScrollView>
  );
}
