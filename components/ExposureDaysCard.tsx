// Cartão "Dias de exposição" (Terapia de exposição): série de dias seguidos,
// total, os últimos 7 dias à vista e o botão para registar a sessão de hoje.
// Sem animações (só a vibração de sucesso ao registar, feita por quem o usa).

import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { Lang, useLang } from '../i18n/i18n';
import { isoLocal } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

type Txt = {
  title: string; inARow: (n: number) => string; total: (n: number) => string; week: string;
  log: string; logged: string; undo: string; hint: string; zeroHint: string;
  days: string[]; // iniciais Seg..Dom
};

const TXT: Record<Lang, Txt> = {
  pt: { title: 'Dias de exposição', inARow: (n) => (n === 1 ? 'dia seguido' : 'dias seguidos'), total: (n) => `${n} no total`, week: 'Últimos 7 dias',
    log: 'Registar a sessão de hoje', logged: 'Sessão de hoje registada', undo: 'Toca para anular',
    hint: 'Praticar em dias seguidos ajuda o cérebro a aprender mais depressa.', zeroHint: 'Faz um degrau hoje e regista-o aqui.',
    days: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'] },
  'pt-BR': { title: 'Dias de exposição', inARow: (n) => (n === 1 ? 'dia seguido' : 'dias seguidos'), total: (n) => `${n} no total`, week: 'Últimos 7 dias',
    log: 'Registrar a sessão de hoje', logged: 'Sessão de hoje registrada', undo: 'Toque para desfazer',
    hint: 'Praticar em dias seguidos ajuda o cérebro a aprender mais rápido.', zeroHint: 'Faça um degrau hoje e registre aqui.',
    days: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'] },
  en: { title: 'Exposure days', inARow: (n) => (n === 1 ? 'day in a row' : 'days in a row'), total: (n) => `${n} in total`, week: 'Last 7 days',
    log: "Log today's session", logged: "Today's session logged", undo: 'Tap to undo',
    hint: 'Practising on consecutive days helps your brain learn faster.', zeroHint: 'Do a step today and log it here.',
    days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] },
  es: { title: 'Días de exposición', inARow: (n) => (n === 1 ? 'día seguido' : 'días seguidos'), total: (n) => `${n} en total`, week: 'Últimos 7 días',
    log: 'Registrar la sesión de hoy', logged: 'Sesión de hoy registrada', undo: 'Toca para deshacer',
    hint: 'Practicar en días seguidos ayuda al cerebro a aprender más rápido.', zeroHint: 'Haz un paso hoy y regístralo aquí.',
    days: ['L', 'M', 'X', 'J', 'V', 'S', 'D'] },
  fr: { title: "Jours d'exposition", inARow: (n) => (n === 1 ? "jour d'affilée" : "jours d'affilée"), total: (n) => `${n} au total`, week: '7 derniers jours',
    log: "Noter la séance d'aujourd'hui", logged: "Séance d'aujourd'hui notée", undo: 'Touche pour annuler',
    hint: "S'exercer plusieurs jours d'affilée aide le cerveau à apprendre plus vite.", zeroHint: "Fais une étape aujourd'hui et note-la ici.",
    days: ['L', 'M', 'M', 'J', 'V', 'S', 'D'] },
  de: { title: 'Expositionstage', inARow: (n) => (n === 1 ? 'Tag in Folge' : 'Tage in Folge'), total: (n) => `${n} insgesamt`, week: 'Letzte 7 Tage',
    log: 'Heutige Übung eintragen', logged: 'Heutige Übung eingetragen', undo: 'Tippen zum Rückgängigmachen',
    hint: 'An aufeinanderfolgenden Tagen zu üben hilft dem Gehirn, schneller zu lernen.', zeroHint: 'Mach heute einen Schritt und trag ihn hier ein.',
    days: ['M', 'D', 'M', 'D', 'F', 'S', 'S'] },
  it: { title: 'Giorni di esposizione', inARow: (n) => (n === 1 ? 'giorno di fila' : 'giorni di fila'), total: (n) => `${n} in totale`, week: 'Ultimi 7 giorni',
    log: 'Registra la sessione di oggi', logged: 'Sessione di oggi registrata', undo: 'Tocca per annullare',
    hint: 'Esercitarsi in giorni consecutivi aiuta il cervello a imparare più in fretta.', zeroHint: 'Fai un passo oggi e registralo qui.',
    days: ['L', 'M', 'M', 'G', 'V', 'S', 'D'] },
  nl: { title: 'Blootstellingsdagen', inARow: (n) => (n === 1 ? 'dag op rij' : 'dagen op rij'), total: (n) => `${n} in totaal`, week: 'Laatste 7 dagen',
    log: 'Sessie van vandaag vastleggen', logged: 'Sessie van vandaag vastgelegd', undo: 'Tik om ongedaan te maken',
    hint: 'Op opeenvolgende dagen oefenen helpt je brein sneller te leren.', zeroHint: 'Doe vandaag een stap en leg hem hier vast.',
    days: ['M', 'D', 'W', 'D', 'V', 'Z', 'Z'] },
  pl: { title: 'Dni ekspozycji', inARow: (n) => (n === 1 ? 'dzień z rzędu' : 'dni z rzędu'), total: (n) => `łącznie: ${n}`, week: 'Ostatnie 7 dni',
    log: 'Zapisz dzisiejszą sesję', logged: 'Dzisiejsza sesja zapisana', undo: 'Dotknij, aby cofnąć',
    hint: 'Ćwiczenie dzień po dniu pomaga mózgowi szybciej się uczyć.', zeroHint: 'Zrób dziś jeden krok i zapisz go tutaj.',
    days: ['P', 'W', 'Ś', 'C', 'P', 'S', 'N'] },
  ru: { title: 'Дни экспозиции', inARow: (n) => (n % 10 === 1 && n % 100 !== 11 ? 'день подряд' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'дня подряд' : 'дней подряд'), total: (n) => `всего: ${n}`, week: 'Последние 7 дней',
    log: 'Отметить сегодняшнее занятие', logged: 'Сегодняшнее занятие отмечено', undo: 'Нажми, чтобы отменить',
    hint: 'Практика несколько дней подряд помогает мозгу учиться быстрее.', zeroHint: 'Сделай сегодня один шаг и отметь его здесь.',
    days: ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'] },
};

export default function ExposureDaysCard({ days, streak, markedToday, onToggle }: { days: string[]; streak: number; markedToday: boolean; onToggle: () => void }) {
  const { colors, isDark } = useTheme();
  const { lang } = useLang();
  const x = TXT[lang] ?? TXT.en;
  const set = new Set(days);

  // Últimos 7 dias, a terminar hoje.
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = isoLocal(d);
    return { iso, letter: x.days[(d.getDay() + 6) % 7], done: set.has(iso), today: i === 6 };
  });

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md }}>
      {/* Série + total */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        {/* Chama em âmbar (em azul parecia uma gota) */}
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: streak > 0 ? (isDark ? '#3a2a10' : '#fff1d6') : colors.cardAlt, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={streak > 0 ? 'flame' : 'flame-outline'} size={30} color={streak > 0 ? '#f59e0b' : colors.textMuted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600' }}>{x.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <Text style={{ color: colors.text, fontSize: 30, fontWeight: '800' }}>{streak}</Text>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{x.inARow(streak)}</Text>
          </View>
        </View>
        <View style={{ backgroundColor: colors.cardAlt, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
          <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700' }}>{x.total(set.size)}</Text>
        </View>
      </View>

      {/* Últimos 7 dias */}
      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>{x.week}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} accessible accessibilityLabel={`${x.week}: ${last7.filter((d) => d.done).length}/7`}>
          {last7.map((d) => (
            <View key={d.iso} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: d.done ? colors.success : 'transparent',
                  borderWidth: 2, borderColor: d.done ? colors.success : d.today ? colors.primary : colors.border,
                  borderStyle: d.done || d.today ? 'solid' : 'dashed',
                }}
              >
                {d.done ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
              </View>
              <Text style={{ color: d.today ? colors.primary : colors.textMuted, fontSize: 12, fontWeight: d.today ? '800' : '600' }}>{d.letter}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Registar hoje */}
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={markedToday ? `${x.logged}. ${x.undo}` : x.log}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: radius.md, paddingVertical: 13, backgroundColor: markedToday ? colors.successSoft : colors.primary, borderWidth: markedToday ? 1 : 0, borderColor: colors.success }}
      >
        <Ionicons name={markedToday ? 'checkmark-circle' : 'add-circle-outline'} size={20} color={markedToday ? colors.success : '#fff'} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: markedToday ? colors.success : '#fff', fontWeight: '700', fontSize: 15 }}>{markedToday ? x.logged : x.log}</Text>
          {markedToday && <Text style={{ color: colors.success, fontSize: 11, opacity: 0.8 }}>{x.undo}</Text>}
        </View>
      </Pressable>

      <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 17, textAlign: 'center' }}>{streak === 0 && !markedToday ? x.zeroHint : x.hint}</Text>
    </View>
  );
}
