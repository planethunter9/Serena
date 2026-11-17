// Mantém o ecrã ligado enquanto este componente estiver montado (exercícios
// com tempo). Usa a API assíncrona para que uma falha (ex.: browser sem
// suporte de wake lock) nunca rebente o ecrã.

import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect, useId } from 'react';

export default function KeepAwake() {
  const tag = useId();
  useEffect(() => {
    activateKeepAwakeAsync(tag).catch(() => {});
    return () => {
      // Pode ainda não ter ativado (ou não ser suportado): ignora.
      deactivateKeepAwake(tag).catch(() => {});
    };
  }, [tag]);
  return null;
}
