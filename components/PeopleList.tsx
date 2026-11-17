// Pessoas de confiança do plano para dias difíceis: nome + telefone, com
// botões para ligar ou enviar mensagem. `editable` mostra o formulário e o
// botão de apagar.

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Pressable, Text, TextInput, View } from 'react-native';
import { plansText } from '../data/plansText';
import { useLang } from '../i18n/i18n';
import { useA11y } from '../lib/a11y';
import { newId } from '../lib/id';
import { PlanPerson } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

const clean = (p: string) => p.replace(/[^\d+]/g, '');

export function PeopleList({ people, onChange, editable, big }: { people: PlanPerson[]; onChange?: (p: PlanPerson[]) => void; editable?: boolean; big?: boolean }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const a11y = useA11y();
  const px = plansText(lang);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  function add() {
    if (!name.trim()) return;
    onChange?.([...people, { id: newId('p'), name: name.trim(), phone: phone.trim() }]);
    setName('');
    setPhone('');
  }
  const open = (url: string) => Linking.openURL(url).catch(() => {});
  const input = { flex: 1, minWidth: 0, padding: 12, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 15 };

  return (
    <View style={{ gap: spacing.sm }}>
      {people.map((p) => (
        <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: big ? 8 : 4 }}>
          <View style={{ width: big ? 44 : 36, height: big ? 44 : 36, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: big ? 18 : 15 }}>{p.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: big ? 18 : 15, fontWeight: '600' }}>{p.name}</Text>
            {p.phone ? <Text style={{ color: colors.textMuted, fontSize: 13 }}>{p.phone}</Text> : null}
          </View>
          {p.phone ? (
            <>
              <Pressable onPress={() => open(`sms:${clean(p.phone)}`)} accessibilityRole="button" accessibilityLabel={`${px.sms}: ${p.name}`} hitSlop={6} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
              </Pressable>
              <Pressable onPress={() => open(`tel:${clean(p.phone)}`)} accessibilityRole="button" accessibilityLabel={`${px.call}: ${p.name}`} hitSlop={6} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="call" size={18} color="#fff" />
              </Pressable>
            </>
          ) : null}
          {editable && (
            <Pressable onPress={() => onChange?.(people.filter((x) => x.id !== p.id))} accessibilityRole="button" accessibilityLabel={`${a11y.delete}: ${p.name}`} hitSlop={6} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      ))}
      {editable && (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput value={name} onChangeText={setName} placeholder={px.name} placeholderTextColor={colors.textMuted} style={input} />
            <TextInput value={phone} onChangeText={setPhone} placeholder={px.phone} placeholderTextColor={colors.textMuted} keyboardType="phone-pad" style={input} />
          </View>
          <Pressable onPress={add} disabled={!name.trim()} accessibilityRole="button" style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primarySoft, paddingHorizontal: 12, height: 36, borderRadius: 999, opacity: name.trim() ? 1 : 0.5 }}>
            <Ionicons name="person-add-outline" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{px.addPerson}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
