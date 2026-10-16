// Perfil: modo de VISUALIZAÇÃO por defeito; edição só pelo menu de 3 pontos.

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { useLang } from '../i18n/i18n';
import { loadProfile, OnboardingData, ProfileData, ProfileItem, saveProfile } from '../storage/storage';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';
import { Card, PrimaryButton, TopBackBar } from './ui';

function asItems(arr: any[]): ProfileItem[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((it, i) => (typeof it === 'string' ? { id: 'x' + i, label: it } : { id: it.id ?? 'x' + i, label: it.label ?? '' }));
}

export default function ProfileScreen({ onBack, data }: { onBack: () => void; data: OnboardingData }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const { user } = useAuth();
  const [p, setP] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadProfile().then((loaded) => setP({ ...loaded, name: loaded.name || user?.name || '' }));
  }, []);

  if (!p) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  function set<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setP((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert(t('profile.permPhoto')); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 });
    if (!res.canceled && res.assets?.[0]?.uri) set('photoUri', res.assets[0].uri);
  }

  function save() {
    if (p) saveProfile(p);
    setEditing(false);
  }

  const sections: { title: string; items: ProfileItem[]; show: boolean }[] = [
    { title: t('settings.subtypes'), items: asItems(data.subtypes), show: p.showSubtypes },
    { title: t('settings.triggers'), items: asItems(data.triggers), show: p.showTriggers },
    { title: t('settings.affects'), items: asItems(data.symptoms), show: p.showSymptoms },
    { title: t('settings.losses'), items: asItems(data.losses), show: p.showLosses },
    { title: t('settings.recover'), items: asItems(data.recover), show: p.showRecover },
    { title: t('settings.coping'), items: asItems(data.coping), show: p.showCoping },
  ];

  const Avatar = ({ size, onPress }: { size: number; onPress?: () => void }) => {
    const inner = p.photoUri ? (
      <Image source={{ uri: p.photoUri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
    ) : (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border }}>
        <Ionicons name="person" size={size * 0.4} color={colors.textMuted} />
      </View>
    );
    return onPress ? <Pressable onPress={onPress}>{inner}</Pressable> : inner;
  };

  // ---------- MODO VISUALIZAÇÃO ----------
  if (!editing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBackBar title={t('profile.title')} onBack={onBack} />
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <View>
              <Pressable onPress={() => setMenuOpen((o) => !o)} hitSlop={10} style={{ padding: 6 }}>
                <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
              </Pressable>
              {menuOpen && (
                <View style={{ position: 'absolute', right: 0, top: 36, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: 4, minWidth: 160, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6, zIndex: 10 }}>
                  <Pressable onPress={() => { setMenuOpen(false); setEditing(true); }} style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
                    <Text style={{ color: colors.text, fontSize: 15 }}>{t('profile.edit')}</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          <View style={{ alignItems: 'center', gap: 6 }}>
            <Avatar size={110} />
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 8 }}>{p.name || user?.name || '—'}</Text>
            {!!p.username && <Text style={{ color: colors.textMuted, fontSize: 14 }}>@{p.username}</Text>}
            {!!p.bio && <Text style={{ color: colors.text, fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 21 }}>{p.bio}</Text>}
          </View>

          {sections.map((sec) =>
            sec.show && sec.items.length > 0 ? (
              <Card key={sec.title} style={{ gap: 8 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{sec.title}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {sec.items.map((it) => (
                    <View key={it.id} style={{ backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
                      <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{it.label}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            ) : null
          )}
        </ScrollView>
      </View>
    );
  }

  // ---------- MODO EDIÇÃO ----------
  const toggleRow = (label: string, key: keyof ProfileData) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{label}</Text>
      <Switch value={p[key] as boolean} onValueChange={(v) => set(key, v as any)} trackColor={{ true: colors.primary, false: colors.track }} />
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('profile.editTitle')} onBack={() => setEditing(false)} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Avatar size={110} onPress={pickPhoto} />
          <Pressable onPress={pickPhoto}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{t('profile.photo')}</Text>
          </Pressable>
        </View>

        <Card style={{ gap: spacing.md }}>
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{t('profile.name')}</Text>
            <TextInput value={p.name} onChangeText={(v) => set('name', v)} placeholderTextColor={colors.textMuted} style={{ padding: 14, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 16 }} />
          </View>
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{t('profile.username')}</Text>
            <TextInput value={p.username} onChangeText={(v) => set('username', v.replace(/\s/g, ''))} autoCapitalize="none" placeholder="@" placeholderTextColor={colors.textMuted} style={{ padding: 14, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 16 }} />
          </View>
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{t('profile.bio')}</Text>
            <TextInput value={p.bio} onChangeText={(v) => set('bio', v)} multiline placeholderTextColor={colors.textMuted} style={{ minHeight: 70, padding: 14, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 16, textAlignVertical: 'top' }} />
          </View>
        </Card>

        <Card style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{t('profile.show')}</Text>
          {toggleRow(t('settings.subtypes'), 'showSubtypes')}
          {toggleRow(t('settings.triggers'), 'showTriggers')}
          {toggleRow(t('settings.affects'), 'showSymptoms')}
          {toggleRow(t('settings.losses'), 'showLosses')}
          {toggleRow(t('settings.recover'), 'showRecover')}
          {toggleRow(t('settings.coping'), 'showCoping')}
        </Card>

        <PrimaryButton label={t('profile.save')} onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
