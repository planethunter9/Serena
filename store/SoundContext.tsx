// Leitor de sons partilhado pela app inteira: o som continua a tocar quando se
// sai do ecrã "Acalmar"/"Dormir", e o mini-leitor (components/MiniPlayer)
// mostra-o em baixo, com pausa, parar e o temporizador.

import { AudioPlayer, setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Source = number | { uri: string };
type Current = { id: string; name: string; source: Source; category: 'calm' | 'sleep' };

type Ctx = {
  current: Current | null;
  playing: boolean;
  timerMin: number | null;
  remaining: number | null;
  play: (c: Current) => void;   // toca (ou pausa, se já for este a tocar)
  toggle: () => void;            // pausa / retoma
  stop: () => void;              // pára e fecha o mini-leitor
  setTimerMin: (m: number | null) => void;
};

const SoundCtx = createContext<Ctx | null>(null);

// O leitor do expo-audio configura-se por atribuição (API da biblioteca).
function setVolume(p: AudioPlayer, v: number) { p.volume = v; }
function setLoop(p: AudioPlayer, v: boolean) { p.loop = v; }

export function SoundProvider({ children }: { children: ReactNode }) {
  const player = useAudioPlayer(null);
  const [current, setCurrent] = useState<Current | null>(null);
  const [playing, setPlaying] = useState(false);
  const [timerMin, setTimerMin] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    // Continua a tocar com o ecrã bloqueado e em modo silencioso (útil para dormir).
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(() => {});
    setLoop(player, true);
  }, [player]);

  // Temporizador: desliga ao fim de X minutos, com fade-out nos últimos 30 s.
  useEffect(() => {
    if (!playing || !timerMin) return;
    const endAt = Date.now() + timerMin * 60000;
    const FADE = 30000;
    const tick = () => {
      const left = endAt - Date.now();
      if (left <= 0) {
        player.pause();
        setVolume(player, 1);
        setPlaying(false);
        setCurrent(null);
        setRemaining(null);
        return;
      }
      setVolume(player, left < FADE ? Math.max(0, left / FADE) : 1);
      setRemaining(Math.ceil(left / 60000));
    };
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(id); setVolume(player, 1); setRemaining(null); };
  }, [playing, timerMin, player, current?.id]);

  const value: Ctx = {
    current, playing, timerMin, remaining,
    play: (c) => {
      if (current?.id === c.id) {
        if (playing) { player.pause(); setPlaying(false); } else { player.play(); setPlaying(true); }
        return;
      }
      player.replace(c.source);
      setLoop(player, true);
      setVolume(player, 1);
      player.play();
      setCurrent(c);
      setPlaying(true);
    },
    toggle: () => {
      if (!current) return;
      if (playing) { player.pause(); setPlaying(false); } else { player.play(); setPlaying(true); }
    },
    stop: () => {
      player.pause();
      setPlaying(false);
      setCurrent(null);
    },
    setTimerMin,
  };

  return <SoundCtx.Provider value={value}>{children}</SoundCtx.Provider>;
}

export function useSound(): Ctx {
  const c = useContext(SoundCtx);
  if (!c) throw new Error('useSound fora do SoundProvider');
  return c;
}
