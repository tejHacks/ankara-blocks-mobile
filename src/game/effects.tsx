import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { blocks, colors, duration, effects, springs, type } from '@/theme/tokens';
import { Block } from './block';

/** A block that sweeps away when its line clears (staggered left → right). */
export function ClearingBlock({ color, size, delay, reduceMotion }: { color: number; size: number; delay: number; reduceMotion: boolean }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(reduceMotion ? 0 : delay, withTiming(1, { duration: duration.clearSweep, easing: Easing.in(Easing.quad) }));
  }, [p, delay, reduceMotion]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - p.value,
    transform: reduceMotion ? [] : [{ scale: 1 + p.value * 0.25 - p.value * p.value * 1.1 }],
  }));
  return (
    <Animated.View style={style} pointerEvents="none">
      <Block color={color} size={size} />
    </Animated.View>
  );
}

/** One fabric-coloured confetti piece flying out of a cleared cell. */
export function Particle({ color, seed }: { color: number; seed: number }) {
  const p = useSharedValue(0);
  // Deterministic per-particle direction from the seed.
  const angle = ((seed * 137.508) % 360) * (Math.PI / 180);
  const dist = 30 + ((seed * 53) % 50);
  const spin = ((seed * 97) % 360) - 180;
  useEffect(() => {
    p.value = withTiming(1, { duration: effects.particleLifetime, easing: Easing.out(Easing.cubic) });
  }, [p]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - p.value,
    transform: [
      { translateX: Math.cos(angle) * dist * p.value },
      { translateY: Math.sin(angle) * dist * p.value + 40 * p.value * p.value },
      { rotate: `${spin * p.value}deg` },
      { scale: 1 - p.value * 0.5 },
    ],
  }));
  const b = blocks[color % blocks.length];
  return <Animated.View pointerEvents="none" style={[styles.particle, { backgroundColor: seed % 2 ? b.base : b.light }, style]} />;
}

/** "Combo ×3!" banner that pops in and floats away. */
export function ComboBanner({ text, reduceMotion }: { text: string; reduceMotion: boolean }) {
  const s = useSharedValue(reduceMotion ? 1 : 0.4);
  const o = useSharedValue(0);
  useEffect(() => {
    o.value = withSequence(withTiming(1, { duration: duration.fast }), withDelay(duration.comboBanner - 300, withTiming(0, { duration: 300 })));
    if (!reduceMotion) s.value = withSpring(1, springs.pop);
  }, [o, s, reduceMotion]);
  const style = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ scale: s.value }, { translateY: (1 - o.value) * -10 }] }));
  return (
    <Animated.View pointerEvents="none" style={[styles.banner, style]}>
      <Text style={styles.bannerText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  particle: { position: 'absolute', width: 8, height: 8, borderRadius: 2 },
  banner: { position: 'absolute', alignSelf: 'center', top: '38%', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.dark.accent },
  bannerText: { ...type.title, color: colors.dark.onAccent },
});
