// Linhas de apoio: contactos de crise e apoio emocional do país da pessoa
// (detetado pela região do telemóvel, ou escolhido à mão) + findahelpline.com
// para os restantes. Toca para ligar. Dados em data/crisisLines.ts.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { COUNTRIES, CrisisLine, deviceRegion, LText, resolveCountry } from '../data/crisisLines';
import { pick, useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

const COUNTRY_KEY = 'app:crisisCountry'; // escolha manual (neste telemóvel)
const OTHER = 'OTHER';

function LineCard({ line }: { line: CrisisLine }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  return (
    <Pressable
      onPress={() => Linking.openURL(`tel:${line.dial}`).catch(() => {})}
      accessibilityRole="button"
      accessibilityLabel={`${line.name}, ${line.number}`}
      accessibilityHint={pick(line.desc, lang)}
      style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: 4 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', flex: 1 }}>{line.name}</Text>
        <Ionicons name="call-outline" size={20} color={colors.primary} />
      </View>
      <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>{line.number}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>{pick(line.desc, lang)}</Text>
    </Pressable>
  );
}

export default function CrisisLinesScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const tt = (o: LText) => pick(o, lang);
  const [saved, setSaved] = useState<string | null | undefined>(undefined); // undefined = a carregar
  const [picking, setPicking] = useState(false);
  const [region] = useState(() => deviceRegion());

  useEffect(() => {
    AsyncStorage.getItem(COUNTRY_KEY).then((v) => setSaved(v), () => setSaved(null));
  }, []);

  const country = saved === undefined ? null : resolveCountry({ saved, region, lang });
  const emergencyNo = country?.emergency ?? '112';

  function choose(code: string) {
    setSaved(code);
    setPicking(false);
    AsyncStorage.setItem(COUNTRY_KEY, code).catch(() => {});
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('resources.crisislines')} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 40 }}>
        <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>
          {tt({
            pt: 'Se estás em sofrimento intenso ou em crise, não tens de passar por isto sem ninguém. Fala com alguém agora — tocar num contacto liga diretamente.',
            en: 'If you are in intense distress or crisis, you do not have to go through this alone. Talk to someone now — tapping a contact calls directly.',
          })}
        </Text>

        {/* País */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', flex: 1 }}>
            {country ? `${country.flag}  ${country.name}` : tt({ pt: 'Outro país', en: 'Other country' })}
          </Text>
          <Pressable onPress={() => setPicking((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: picking }} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name={picking ? 'chevron-up' : 'globe-outline'} size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{tt({ pt: 'Mudar país', en: 'Change country' })}</Text>
          </Pressable>
        </View>

        {picking && (
          <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
            {[...COUNTRIES.map((c) => ({ code: c.code, label: `${c.flag}  ${c.name}` })), { code: OTHER, label: `🌍  ${tt({ pt: 'Outro país', en: 'Other country' })}` }].map((c, i) => {
              const active = (country?.code ?? OTHER) === c.code;
              return (
                <Pressable key={c.code} onPress={() => choose(c.code)} accessibilityRole="button" accessibilityState={{ selected: active }} style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, paddingHorizontal: spacing.lg, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border, backgroundColor: active ? colors.primarySoft : 'transparent' }}>
                  <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{c.label}</Text>
                  {active && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                </Pressable>
              );
            })}
          </View>
        )}

        {country ? (
          country.lines.map((l) => <LineCard key={l.name + l.number} line={l} />)
        ) : saved !== undefined ? (
          <LineCard line={{ name: '112', number: '112', dial: '112', desc: { pt: 'Número de emergência na Europa (24h). Noutros países pode ser outro — procura em baixo.', en: 'Emergency number in Europe (24h). In other countries it may differ — see below.' } }} />
        ) : null}

        {/* Internacional */}
        <Pressable onPress={() => Linking.openURL('https://findahelpline.com').catch(() => {})} accessibilityRole="link" style={{ backgroundColor: colors.cardAlt, borderRadius: radius.lg, padding: spacing.lg, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', flex: 1 }}>{tt({ pt: 'Noutro país', en: 'In another country' })}</Text>
            <Ionicons name="open-outline" size={18} color={colors.primary} />
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
            {tt({ pt: 'Encontra uma linha de apoio gratuita no teu país em findahelpline.com.', en: 'Find a free helpline in your country at findahelpline.com.' })}
          </Text>
        </Pressable>

        <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
          {tt({ pt: `Esta app não é um serviço de emergência. Em perigo imediato, liga ${emergencyNo}.`, en: `This app is not an emergency service. In immediate danger, call ${emergencyNo}.` })}
        </Text>
      </ScrollView>
    </View>
  );
}
