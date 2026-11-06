// Coach marks (tutorial de abertura): escurece o ecrã, realça um elemento real
// e mostra um balão com "Seguinte / Saltar" e o contador de passos.
// Sem bibliotecas — mede os elementos com measureInWindow.
//
// Um passo pode trazer `show`, chamado antes de medir, para mudar de separador
// (ou abrir o ecrã) onde o elemento vive. Assim o tutorial percorre vários ecrãs.
//
// Uso:
//   <CoachProvider> ... </CoachProvider>   (à volta da app)
//   <CoachTarget name="pillars">…</CoachTarget>   (à volta do que se realça)
//   const { start } = useCoach();
//   start([{ name, text, show? }, …], onDone)

import { createContext, ReactNode, RefObject, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { useLang , tr2 } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

type Step = { name: string; text: string; show?: () => void };
type Rect = { x: number; y: number; w: number; h: number };

type CoachCtx = {
  register: (name: string, ref: RefObject<any>) => void;
  unregister: (name: string) => void;
  start: (steps: Step[], onDone?: () => void) => void;
  active: boolean;
};

const Ctx = createContext<CoachCtx>({ register: () => {}, unregister: () => {}, start: () => {}, active: false });
export const useCoach = () => useContext(Ctx);

// Envolve o que se quer realçar. collapsable={false} garante que é mensurável no Android.
export function CoachTarget({ name, children, style }: { name: string; children: ReactNode; style?: any }) {
  const { register, unregister } = useCoach();
  const ref = useRef<any>(null);
  useEffect(() => { register(name, ref); return () => unregister(name); }, [name]);
  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}

export function CoachProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const L = (pt: string, en: string) => tr2(lang, pt, en);

  const refs = useRef<Record<string, RefObject<any>>>({});
  const onDoneRef = useRef<(() => void) | undefined>(undefined);
  const [steps, setSteps] = useState<Step[]>([]);
  const [idx, setIdx] = useState(-1);
  const [rect, setRect] = useState<Rect | null>(null);

  const register = (name: string, ref: RefObject<any>) => { refs.current[name] = ref; };
  const unregister = (name: string) => { if (refs.current[name]) delete refs.current[name]; };
  const start = (s: Step[], onDone?: () => void) => { onDoneRef.current = onDone; setSteps(s); setRect(null); setIdx(0); };
  const finish = () => { setIdx(-1); setRect(null); const cb = onDoneRef.current; onDoneRef.current = undefined; if (cb) cb(); };

  // Ao entrar num passo: muda de ecrã (show) e depois mede o elemento, com
  // várias tentativas até o ecrã novo montar e o alvo ter layout.
  useEffect(() => {
    if (idx < 0 || !steps[idx]) return;
    const step = steps[idx];
    try { step.show?.(); } catch {}
    let cancelled = false;
    let tries = 0;
    const measure = () => {
      if (cancelled) return;
      const node = refs.current[step.name]?.current;
      if (node && typeof node.measureInWindow === 'function') {
        node.measureInWindow((x: number, y: number, w: number, h: number) => {
          if (cancelled) return;
          if ((w === 0 && h === 0) && tries < 25) { tries++; setTimeout(measure, 120); }
          else setRect({ x, y, w, h });
        });
      } else if (tries < 25) { tries++; setTimeout(measure, 120); }
    };
    // pequeno atraso para o ecrã que acabou de ser mostrado montar
    const first = setTimeout(measure, 80);
    return () => { cancelled = true; clearTimeout(first); };
  }, [idx, steps]);

  const active = idx >= 0 && !!steps[idx];
  const isLast = idx === steps.length - 1;
  const next = () => { if (isLast) finish(); else { setRect(null); setIdx(idx + 1); } };

  const SCREEN = Dimensions.get('window');
  const PAD = 8;
  const DIM = 'rgba(0,0,0,0.68)';

  // Posição do balão: por baixo do elemento se houver espaço, senão por cima.
  let tooltipTop = SCREEN.height / 2 - 80;
  if (rect) {
    const below = rect.y + rect.h + 170 < SCREEN.height;
    tooltipTop = below ? rect.y + rect.h + PAD + 10 : Math.max(60, rect.y - PAD - 180);
  }

  return (
    <Ctx.Provider value={{ register, unregister, start, active }}>
      {children}
      {active && (
        <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
          {rect ? (
            <>
              {/* Zonas escuras à volta do buraco */}
              <View style={{ position: 'absolute', left: 0, top: 0, width: SCREEN.width, height: Math.max(0, rect.y - PAD), backgroundColor: DIM }} />
              <View style={{ position: 'absolute', left: 0, top: rect.y + rect.h + PAD, width: SCREEN.width, height: Math.max(0, SCREEN.height - (rect.y + rect.h + PAD)), backgroundColor: DIM }} />
              <View style={{ position: 'absolute', left: 0, top: Math.max(0, rect.y - PAD), width: Math.max(0, rect.x - PAD), height: rect.h + PAD * 2, backgroundColor: DIM }} />
              <View style={{ position: 'absolute', left: rect.x + rect.w + PAD, top: Math.max(0, rect.y - PAD), width: Math.max(0, SCREEN.width - (rect.x + rect.w + PAD)), height: rect.h + PAD * 2, backgroundColor: DIM }} />
              {/* Apanha toques sobre o elemento realçado (tutorial guiado, só avança pelos botões) */}
              <Pressable onPress={() => {}} style={{ position: 'absolute', left: rect.x - PAD, top: rect.y - PAD, width: rect.w + PAD * 2, height: rect.h + PAD * 2 }} />
              {/* Anel de destaque */}
              <View pointerEvents="none" style={{ position: 'absolute', left: rect.x - PAD, top: rect.y - PAD, width: rect.w + PAD * 2, height: rect.h + PAD * 2, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.primary }} />
            </>
          ) : (
            <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: DIM }} />
          )}

          {/* Balão */}
          <View style={{ position: 'absolute', left: spacing.xl, right: spacing.xl, top: tooltipTop, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, gap: 12, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 10 }}>
            <Text style={{ color: colors.text, fontSize: 15, lineHeight: 21 }}>{steps[idx].text}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, fontSize: 13, flex: 1 }}>{idx + 1}/{steps.length}</Text>
              <Pressable onPress={finish} hitSlop={8} accessibilityRole="button" style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: 14 }}>{L('Saltar', 'Skip')}</Text>
              </Pressable>
              <Pressable onPress={next} accessibilityRole="button" style={{ backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 9 }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{isLast ? L('Concluir', 'Done') : L('Seguinte', 'Next')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </Ctx.Provider>
  );
}
