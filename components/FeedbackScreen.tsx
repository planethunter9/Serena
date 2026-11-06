// Caixa de sugestões: o utilizador envia sugestões, problemas ou melhorias.
// Grava na tabela `feedback` do Supabase (lês tudo no painel). Permite anónimo.

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { pick, useLang } from '../i18n/i18n';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { TopBackBar } from './ui';

type L = { pt: string; en: string };
type Kind = 'suggestion' | 'problem' | 'improvement';

const KINDS: { id: Kind; label: L; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'suggestion', label: { pt: 'Sugestão', en: 'Suggestion' }, icon: 'bulb-outline' },
  { id: 'problem', label: { pt: 'Problema', en: 'Problem' }, icon: 'bug-outline' },
  { id: 'improvement', label: { pt: 'Melhoria', en: 'Improvement' }, icon: 'sparkles-outline' },
];

export default function FeedbackScreen({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const { user } = useAuth();
  const tt = (o: L) => pick(o, lang);

  const [kind, setKind] = useState<Kind>('suggestion');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  async function send() {
    const text = message.trim();
    if (!text || sending) return;
    setSending(true);
    setError(false);
    try {
      const { error: err } = await supabase.from('feedback').insert({
        type: kind,
        message: text,
        user_id: user?.id ?? null,
        lang,
        platform: Platform.OS,
      });
      if (err) throw err;
      setSent(true);
      setMessage('');
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBackBar title={tt({ pt: 'Sugestões', en: 'Feedback' })} onBack={onBack} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: 14 }}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' }}>{tt({ pt: 'Obrigada!', en: 'Thank you!' })}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
            {tt({ pt: 'A tua mensagem foi enviada. É lida com atenção e ajuda a melhorar a app.', en: 'Your message was sent. It is read carefully and helps improve the app.' })}
          </Text>
          <Pressable onPress={() => setSent(false)} style={{ marginTop: 8, paddingVertical: 12, paddingHorizontal: 20, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{tt({ pt: 'Enviar outra', en: 'Send another' })}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={tt({ pt: 'Sugestões', en: 'Feedback' })} onBack={onBack} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
          <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 21 }}>
            {tt({
              pt: 'Tens uma ideia, encontraste um erro ou algo podia ficar melhor? Conta-me. Podes enviar anonimamente.',
              en: 'Have an idea, found a bug, or something could be better? Tell me. You can send anonymously.',
            })}
          </Text>

          {/* Tipo */}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {KINDS.map((kOpt) => {
              const active = kind === kOpt.id;
              return (
                <Pressable key={kOpt.id} onPress={() => setKind(kOpt.id)} style={{ flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14, borderRadius: radius.md, backgroundColor: active ? colors.primary : colors.card, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}>
                  <Ionicons name={kOpt.icon} size={20} color={active ? '#fff' : colors.primary} />
                  <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700', fontSize: 13 }}>{tt(kOpt.label)}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Mensagem */}
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            placeholder={tt({ pt: 'Escreve aqui a tua mensagem…', en: 'Write your message here…' })}
            placeholderTextColor={colors.textMuted}
            style={{ minHeight: 140, padding: 14, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 15, textAlignVertical: 'top' }}
          />

          {error && (
            <Text style={{ color: colors.danger, fontSize: 13 }}>
              {tt({ pt: 'Não foi possível enviar. Verifica a ligação e tenta de novo.', en: 'Could not send. Check your connection and try again.' })}
            </Text>
          )}

          <Pressable onPress={send} disabled={!message.trim() || sending} style={{ paddingVertical: 15, borderRadius: radius.md, alignItems: 'center', backgroundColor: !message.trim() || sending ? colors.border : colors.primary }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
              {sending ? tt({ pt: 'A enviar…', en: 'Sending…' }) : tt({ pt: 'Enviar', en: 'Send' })}
            </Text>
          </Pressable>

          <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 16 }}>
            {tt({ pt: 'Não recolhemos dados pessoais nesta mensagem. Não escrevas informação sensível.', en: 'We do not collect personal data in this message. Please do not include sensitive information.' })}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
