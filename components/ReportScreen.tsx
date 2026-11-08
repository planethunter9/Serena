// "Resumo para a consulta": cria um PDF com o progresso (exposições, momentos
// difíceis, comportamentos de segurança…) para mostrar ou enviar a quem acompanha
// a pessoa. O PDF é criado no telemóvel e só sai dele se for partilhado.

import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { reportText } from '../data/reportText';
import { useLang } from '../i18n/i18n';
import { collectReportData, ReportPeriod } from '../lib/reportData';
import { buildReportHtml } from '../lib/reportHtml';
import { isoLocal } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, PrimaryButton, TopBackBar } from './ui';

export default function ReportScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const x = reportText(lang);

  const [period, setPeriod] = useState<ReportPeriod>('30');
  const [includeName, setIncludeName] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [talk, setTalk] = useState('');
  const [busy, setBusy] = useState<'share' | 'preview' | null>(null);

  async function html() {
    const data = await collectReportData({ lang, period, includeName, includeNotes, talk });
    return buildReportHtml(data, x, lang);
  }

  async function share() {
    setBusy('share');
    try {
      const { uri } = await Print.printToFileAsync({ html: await html() });
      // Nome de ficheiro legível (ex.: Serena-2026-11-08.pdf).
      let file = uri;
      try {
        const target = `${FileSystem.cacheDirectory}Serena-${isoLocal(new Date())}.pdf`;
        await FileSystem.deleteAsync(target, { idempotent: true });
        await FileSystem.moveAsync({ from: uri, to: target });
        file = target;
      } catch {}
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: x.screenTitle });
      } else {
        await Print.printAsync({ uri: file });
      }
    } catch {
      Alert.alert(x.error);
    } finally {
      setBusy(null);
    }
  }

  async function preview() {
    setBusy('preview');
    try {
      await Print.printAsync({ html: await html() });
    } catch {
      // cancelar a impressão também cai aqui — não é um erro para mostrar
    } finally {
      setBusy(null);
    }
  }

  const periods: [ReportPeriod, string][] = [['30', x.p30], ['90', x.p90], ['all', x.pAll]];

  const toggle = (label: string, value: boolean, onChange: (v: boolean) => void, hint?: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{label}</Text>
        {hint ? <Text style={{ color: colors.textMuted, fontSize: 12 }}>{hint}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={label} trackColor={{ true: colors.primary, false: colors.track }} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={x.screenTitle} onBack={onBack} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="document-text-outline" size={22} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22, flex: 1 }}>{x.screenIntro}</Text>
          </View>

          {/* Período */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{x.period}</Text>
            <View style={{ flexDirection: 'row', backgroundColor: colors.cardAlt, borderRadius: 999, padding: 4 }}>
              {periods.map(([v, label]) => {
                const active = period === v;
                return (
                  <Pressable key={v} onPress={() => setPeriod(v)} accessibilityRole="radio" accessibilityState={{ selected: active }} style={{ flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center', backgroundColor: active ? colors.card : 'transparent' }}>
                    <Text style={{ color: active ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 13 }}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Privacidade */}
          <Card style={{ gap: spacing.md }}>
            {toggle(x.includeName, includeName, setIncludeName)}
            {toggle(x.includeNotes, includeNotes, setIncludeNotes, x.journalNever)}
          </Card>

          {/* Para falar na consulta */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{x.talkLabel}</Text>
            <TextInput
              value={talk}
              onChangeText={setTalk}
              placeholder={x.talkPlaceholder}
              placeholderTextColor={colors.textMuted}
              multiline
              accessibilityLabel={x.talkLabel}
              style={{ minHeight: 96, textAlignVertical: 'top', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, color: colors.text, fontSize: 15 }}
            />
          </View>

          <View style={{ gap: spacing.sm }}>
            {busy === 'share' ? (
              <View style={{ padding: 18, alignItems: 'center' }}><ActivityIndicator color={colors.primary} /></View>
            ) : (
              <PrimaryButton label={x.generate} onPress={share} disabled={!!busy} />
            )}
            <Pressable onPress={preview} disabled={!!busy} accessibilityRole="button" style={{ alignItems: 'center', padding: 12, opacity: busy ? 0.5 : 1 }}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>{x.preview}</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
              <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 17, flex: 1 }}>{x.privacyHint}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
