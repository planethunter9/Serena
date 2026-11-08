// Coach marks (tutorial de abertura): escurece o ecrã, realça um elemento real
// e mostra um balão com título, texto, "Anterior / Seguinte / Saltar" e pontos
// de progresso. Sem bibliotecas — mede os elementos com measureInWindow.
//
// Um passo pode trazer `show`, chamado antes de medir, para mudar de separador
// (ou abrir o ecrã) onde o elemento vive. Assim o tutorial percorre vários ecrãs.
// Um passo sem `name` (ou cujo alvo não aparece) mostra o balão ao centro.
//
// Uso:
//   <CoachProvider> ... </CoachProvider>   (à volta da app)
//   <CoachTarget name="pillars">…</CoachTarget>   (à volta do que se realça)
//   const { start } = useCoach();
//   start([{ name?, title?, text, show? }, …], onDone)

import { ReactNode, RefObject, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tutorialPack } from '../data/tutorial';
import { useLang } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../theme/theme';

export type CoachStep = { name?: string; title?: string; text: string; show?: () => void };
type Rect = { x: number; y: number; w: number; h: number };

type CoachCtx = {
  register: (name: string, ref: RefObject<any>) => void;
  unregister: (name: string) => void;
  start: (steps: CoachStep[], onDone?: () => void) => void;
  active: boolean;
};

const Ctx = createContext<CoachCtx>({ register: () => {}, unregister: () => {}, start: () => {}, active: false });
export const useCoach = () => useContext(Ctx);

// Envolve o que se quer realçar. collapsable={false} garante que é mensurável no Android.
export function CoachTarget({ name, children, style }: { name: string; children: ReactNode; style?: any }) {
  const { register, unregister } = useCoach();
  const ref = useRef<any>(null);
  useEffect(() => { register(name, ref); return () => unregister(name); }, [name, register, unregister]);
  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}

// Recorta o retângulo à zona visível e limita a altura (listas compridas),
// para sobrar espaço para o balão. Devolve null se quase nada estiver visível.
export function clampRect(r: Rect, screenW: number, screenH: number, topInset = 0): Rect | null {
  const top = Math.max(r.y, topInset);
  const bottom = Math.min(r.y + r.h, screenH);
  const left = Math.max(r.x, 0);
  const right = Math.min(r.x + r.w, screenW);
  if (bottom - top < 36 || right - left < 36) return null;
  const maxH = screenH * 0.45;
  return { x: left, y: top, w: right - left, h: Math.min(bottom - top, maxH) };
}

const PAD = 8;
const DIM = 'rgba(0,0,0,0.68)';
const MAX_TRIES = 15; // × 120 ms

export function CoachProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const { lang } = useLang();
  const ui = tutorialPack(lang).ui;
  const insets = useSafeAreaInsets();
  const SCREEN = useWindowDimensions();

  const refs = useRef<Record<string, RefObject<any>>>({});
  const onDoneRef = useRef<(() => void) | undefined>(undefined);
  const [steps, setSteps] = useState<CoachStep[]>([]);
  const [idx, setIdx] = useState(-1);
  const [rect, setRect] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false); // medição concluída (com ou sem alvo)
  const [tipH, setTipH] = useState(200);

  const register = useCallback((name: string, ref: RefObject<any>) => { refs.current[name] = ref; }, []);
  const unregister = useCallback((name: string) => { if (refs.current[name]) delete refs.current[name]; }, []);
  const goTo = (i: number) => { setRect(null); setReady(false); setIdx(i); };
  const start = useCallback((s: CoachStep[], onDone?: () => void) => {
    onDoneRef.current = onDone; setSteps(s); setRect(null); setReady(false); setIdx(0);
  }, []);
  const finish = () => { setIdx(-1); setRect(null); setReady(false); const cb = onDoneRef.current; onDoneRef.current = undefined; if (cb) cb(); };

  // Ao entrar num passo: muda de ecrã (show) e depois mede o elemento, com
  // várias tentativas até o ecrã novo montar e o alvo ter layout.
  useEffect(() => {
    if (idx < 0 || !steps[idx]) return;
    const step = steps[idx];
    try { step.show?.(); } catch {}
    let cancelled = false;
    let tries = 0;
    const giveUp = () => { if (!cancelled) { setRect(null); setReady(true); } };
    const retry = () => { if (tries++ < MAX_TRIES) setTimeout(measure, 120); else giveUp(); };
    const measure = () => {
      if (cancelled) return;
      const node = step.name ? refs.current[step.name]?.current : null;
      if (!step.name) { giveUp(); return; }
      if (node && typeof node.measureInWindow === 'function') {
        node.measureInWindow((x: number, y: number, w: number, h: number) => {
          if (cancelled) return;
          if (w === 0 && h === 0) { retry(); return; }
          setRect({ x, y, w, h });
          setReady(true);
        });
      } else retry();
    };
    // pequeno atraso para o ecrã que acabou de ser mostrado montar
    const first = setTimeout(measure, step.name ? 120 : 0);
    return () => { cancelled = true; clearTimeout(first); };
  }, [idx, steps]);

  // Leitores de ecrã: anuncia o passo.
  const step = idx >= 0 ? steps[idx] : undefined;
  useEffect(() => {
    if (step && ready) AccessibilityInfo.announceForAccessibility?.([step.title, step.text].filter(Boolean).join('. '));
  }, [step, ready]);

  const active = !!step;
  const isLast = idx === steps.length - 1;
  const next = () => { if (isLast) finish(); else goTo(idx + 1); };
  const prev = () => { if (idx > 0) goTo(idx - 1); };

  const r = rect ? clampRect(rect, SCREEN.width, SCREEN.height, insets.top) : null;

  // Posição do balão: por baixo do elemento se couber, senão por cima; se não
  // couber em lado nenhum, fica em baixo, por cima da barra; sem alvo, ao centro.
  const GAP = PAD + 10;
  const minTop = insets.top + 12;
  const maxTop = SCREEN.height - insets.bottom - 12 - tipH;
  let tooltipTop = (SCREEN.height - tipH) / 2;
  if (r) {
    if (r.y + r.h + GAP + tipH <= SCREEN.height - insets.bottom - 12) tooltipTop = r.y + r.h + GAP;
    else if (r.y - GAP - tipH >= minTop) tooltipTop = r.y - GAP - tipH;
    else tooltipTop = maxTop;
  }
  tooltipTop = Math.max(minTop, Math.min(tooltipTop, maxTop));

  return (
    <Ctx.Provider value={{ register, unregister, start, active }}>
      {children}
      {active && (
        <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} accessibilityViewIsModal>
          {r ? (
            <>
              {/* Zonas escuras à volta do buraco */}
              <View style={{ position: 'absolute', left: 0, top: 0, width: SCREEN.width, height: Math.max(0, r.y - PAD), backgroundColor: DIM }} />
              <View style={{ position: 'absolute', left: 0, top: r.y + r.h + PAD, width: SCREEN.width, height: Math.max(0, SCREEN.height - (r.y + r.h + PAD)), backgroundColor: DIM }} />
              <View style={{ position: 'absolute', left: 0, top: Math.max(0, r.y - PAD), width: Math.max(0, r.x - PAD), height: r.h + PAD * 2, backgroundColor: DIM }} />
              <View style={{ position: 'absolute', left: r.x + r.w + PAD, top: Math.max(0, r.y - PAD), width: Math.max(0, SCREEN.width - (r.x + r.w + PAD)), height: r.h + PAD * 2, backgroundColor: DIM }} />
              {/* Apanha toques sobre o elemento realçado (tutorial guiado, só avança pelos botões) */}
              <Pressable onPress={() => {}} accessible={false} style={{ position: 'absolute', left: r.x - PAD, top: r.y - PAD, width: r.w + PAD * 2, height: r.h + PAD * 2 }} />
              {/* Anel de destaque */}
              <View pointerEvents="none" style={{ position: 'absolute', left: r.x - PAD, top: r.y - PAD, width: r.w + PAD * 2, height: r.h + PAD * 2, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.primary }} />
            </>
          ) : (
            <Pressable onPress={() => {}} accessible={false} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: DIM }} />
          )}

          {/* Balão (só depois de medir, para não saltar de sítio) */}
          {ready && (
            <View
              onLayout={(e) => { const h = Math.round(e.nativeEvent.layout.height); if (Math.abs(h - tipH) > 2) setTipH(h); }}
              style={{ position: 'absolute', left: spacing.xl, right: spacing.xl, top: tooltipTop, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, gap: 10, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 10 }}
            >
              {!!step!.title && (
                <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>{step!.title}</Text>
              )}
              <Text style={{ color: colors.text, fontSize: 15, lineHeight: 21 }}>{step!.text}</Text>

              {/* Pontos de progresso */}
              <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }} accessible accessibilityLabel={`${idx + 1}/${steps.length}`}>
                {steps.map((_, i) => (
                  <View key={i} style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === idx ? colors.primary : colors.border }} />
                ))}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {!isLast ? (
                  <Pressable onPress={finish} hitSlop={8} accessibilityRole="button" style={{ paddingHorizontal: 6, paddingVertical: 6 }}>
                    <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: 14 }}>{ui.skip}</Text>
                  </Pressable>
                ) : null}
                <View style={{ flex: 1 }} />
                {idx > 0 && (
                  <Pressable onPress={prev} hitSlop={6} accessibilityRole="button" style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.border }}>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{ui.back}</Text>
                  </Pressable>
                )}
                <Pressable onPress={next} accessibilityRole="button" style={{ backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 9, marginLeft: 6 }}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{isLast ? ui.done : ui.next}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      )}
    </Ctx.Provider>
  );
}
