// Fotografia de perfil redonda. Se não houver foto, ou se o ficheiro já não
// existir (ex.: a cache do telemóvel foi limpa, ou a foto veio da cópia na
// cloud de outro telemóvel), mostra o ícone de pessoa.

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Avatar({ uri, size, border = 0, bg, iconColor }: { uri?: string | null; size: number; border?: number; bg?: string; iconColor?: string }) {
  const { colors } = useTheme();
  // Guarda o uri que falhou: se a foto mudar, volta a tentar.
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const showPhoto = !!uri && failedUri !== uri;
  const base = { width: size, height: size, borderRadius: size / 2, borderWidth: border, borderColor: border ? colors.card : colors.border };
  return showPhoto ? (
    <Image source={{ uri: uri! }} onError={() => setFailedUri(uri!)} accessibilityIgnoresInvertColors style={base} />
  ) : (
    <View style={[base, { backgroundColor: bg ?? colors.cardAlt, alignItems: 'center', justifyContent: 'center', borderWidth: border || 1 }]}>
      <Ionicons name="person" size={size * 0.5} color={iconColor ?? colors.textMuted} />
    </View>
  );
}
