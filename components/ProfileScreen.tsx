// Perfil: modo de VISUALIZAÇÃO por defeito; edição pelo botão "Editar".

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
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [p, setP] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const L = (pt: string, en: string) => (lang === 'pt' ? pt : en);

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

  const sections: { title: string; icon: keyof typeof Ionicons.glyphMap; items: ProfileItem[]; show: boolean }[] = [
    { title: t('settings.subtypes'), icon: 'albums-outline', items: asItems(data.subtypes), show: p.showSubtypes },
    { title: t('settings.triggers'), icon: 'flash-outline', items: asItems(data.triggers), show: p.showTriggers },
    { title: t('settings.affects'), icon: 'pulse-outline', items: asItems(data.symptoms), show: p.showSymptoms },
    { title: t('settings.losses'), icon: 'sad-outline', items: asItems(data.losses), show: p.showLosses },
    { title: t('settings.recover'), icon: 'ribbon-outline', items: asItems(data.recover), show: p.showRecover },
    { title: t('settings.coping'), icon: 'heart-outline', items: asItems(data.coping), show: p.showCoping },
  ];

  const Avatar = ({ size, onPress }: { size: number; onPress?: () => void }) => {
    const inner = p.photoUri ? (
      <Image source={{ uri: p.photoUri }} style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 3, borderColor: colors.card }} />
    ) : (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.card }}>
        <Ionicons name="person" size={size * 0.42} color={colors.primary} />
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

          {/* Cartão de topo (identidade) — info à esquerda, foto à direita */}
          <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ color: colors.text, fontSize: 21, fontWeight: '800' }}>{p.name || user?.name || '—'}</Text>
                {!!p.username && <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>@{p.username}</Text>}
                {!!user?.email && <Text style={{ color: colors.textMuted, fontSize: 13 }}>{user.email}</Text>}
              </View>
              <Avatar size={82} />
            </View>
            {!!p.bio && <Text style={{ color: colors.text, fontSize: 15, lineHeight: 21 }}>{p.bio}</Text>}
            <Pressable onPress={() => setEditing(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.card, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16 }}>
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>{t('profile.edit')}</Text>
            </Pressable>
          </View>

          {/* Secções (as tuas escolhas) */}
          {sections.map((sec) =>
            sec.show && sec.items.length > 0 ? (
              <Card key={sec.title} style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={sec.icon} size={18} color={colors.primary} />
                  </View>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, flex: 1 }}>{sec.title}</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {sec.items.map((it) => (
                    <View key={it.id} style={{ backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 }}>
                      <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{it.label}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            ) : null
          )}

          {/* Estado vazio: nenhuma secção visível */}
          {sections.every((s) => !(s.show && s.items.length > 0)) && (
            <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 4 }}>
              {L('Ainda não tens nada visível no perfil. Toca em "Editar" para escolheres o que mostrar.',
                 "You don't have anything visible on your profile yet. Tap \"Edit\" to choose what to show.")}
            </Text>
          )}
        </ScrollView>
      </View>
    );
  }

  // ---------- MODO EDIÇÃO ----------
  const toggleRow = (label: string, key: keyof ProfileData) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{label}</Text>
      <Switch value={p[key] as boolean} onValueChange={(v) => set(key, v as any)} trackColor={{ true: colors.primary, false: colors.track }} />
    </View>
  );

  const field = (label: string, value: string, onChange: (v: string) => void, extra?: object) => (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} placeholderTextColor={colors.textMuted}
        style={{ padding: 14, borderRadius: radius.md, backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: colors.border, color: colors.text, fontSize: 16, ...extra }} />
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBackBar title={t('profile.editTitle')} onBack={() => setEditing(false)} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Avatar size={100} onPress={pickPhoto} />
          <Pressable onPress={pickPhoto}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{t('profile.photo')}</Text>
          </Pressable>
        </View>

        <Card style={{ gap: spacing.md }}>
          {field(t('profile.name'), p.name, (v) => set('name', v))}
          {field(t('profile.username'), p.username, (v) => set('username', v.replace(/\s/g, '')))}
          {field(t('profile.bio'), p.bio, (v) => set('bio', v), { minHeight: 70, textAlignVertical: 'top' })}
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
