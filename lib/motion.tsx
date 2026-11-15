// Animações partilhadas da app (Reanimated — funciona no Expo Go).
//
// Princípios: movimentos curtos e suaves (uma app para a ansiedade não deve
// "saltar"), e respeito pela definição "Reduzir movimento" do telemóvel: com
// ela ligada, as animações de entrada desaparecem e só ficam fades discretos.

import * as Haptics from 'expo-haptics';
import { ReactNode, useEffect } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export { useReducedMotion };

// Molas e tempos usados em toda a app (calmos, sem ressaltos exagerados).
export const SPRING = { damping: 18, stiffness: 180, mass: 0.9 } as const;
export const DURATION = { fast: 160, base: 260, slow: 380 } as const;

// Entrada em cascata para itens de listas/cartões (index = posição na lista).
export function enterItem(index = 0) {
  return FadeInDown.delay(Math.min(index, 10) * 45).duration(DURATION.slow).springify().damping(SPRING.damping).reduceMotion(ReduceMotion.System);
}

// Entrada simples (fade).
export const enterFade = FadeIn.duration(DURATION.base).reduceMotion(ReduceMotion.System);
export const exitFade = FadeOut.duration(DURATION.fast).reduceMotion(ReduceMotion.System);
// Itens que mudam de posição numa lista (ao adicionar/remover).
export const layoutSmooth = LinearTransition.springify().damping(SPRING.damping).reduceMotion(ReduceMotion.System);

// Entrada de um passo (questionário, tutorial): vem do lado para onde se avança.
export function enterStep(direction: 1 | -1) {
  const base = direction > 0 ? FadeInRight : FadeInLeft;
  return base.duration(DURATION.slow).springify().damping(SPRING.damping + 2).reduceMotion(ReduceMotion.System);
}

// Componente de conveniência: entra em cascata.
export function FadeInItem({ index = 0, children, style }: { index?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={enterItem(index)} style={style}>
      {children}
    </Animated.View>
  );
}

const APressable = Animated.createAnimatedComponent(Pressable);

// Pressable que encolhe ligeiramente ao toque (feedback tátil visual).
export function PressableScale({ style, children, scaleTo = 0.97, onPressIn, onPressOut, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; scaleTo?: number; children?: ReactNode }) {
  const reduce = useReducedMotion();
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <APressable
      {...rest}
      onPressIn={(e) => { if (!reduce) scale.set(withSpring(scaleTo, SPRING)); onPressIn?.(e); }}
      onPressOut={(e) => { scale.set(withSpring(1, SPRING)); onPressOut?.(e); }}
      style={[style, aStyle]}
    >
      {children}
    </APressable>
  );
}

// Vibração leve ao escolher uma opção (só onde existe; nunca rebenta).
export function tapHaptic() {
  Haptics.selectionAsync().catch(() => {});
}

// Valor animado que segue um número (ex.: barra de progresso).
export function useAnimatedNumber(target: number) {
  const reduce = useReducedMotion();
  const v = useSharedValue(target);
  useEffect(() => {
    v.set(reduce ? target : withTiming(target, { duration: DURATION.slow }));
  }, [target, reduce, v]);
  return v;
}
