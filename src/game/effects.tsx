import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { duration, effects, springs, type } from '@/theme/tokens';
import { Block } from './block';
import type { Theme } from './themes';

/** A block that sweeps away when its line clears (staggered left → right). */
export function ClearingBlock({ color, size, delay, reduceMotion, theme }: { color: number; size: number; delay: number; reduceMotion: boolean; theme: Theme }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(withDelay(reduceMotion ? 0 : delay, withTiming(1, { duration: duration.clearSweep, easing: Easing.in(Easing.quad) })));
  }, [p, delay, reduceMotion]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - p.value,
    transform: reduceMotion ? [] : [{ scale: 1 + p.value * 0.25 - p.value * p.value * 1.1 }],
  }));
  return (
    <Animated.View style={style} pointerEvents="none">
      <Block color={color} size={size} theme={theme} />
    </Animated.View>
  );
}

/** One fabric-coloured confetti piece flying out of a cleared cell. */
export function Particle({ color, seed, theme }: { color: number; seed: number; theme: Theme }) {
  const p = useSharedValue(0);
  const angle = ((seed * 137.508) % 360) * (Math.PI / 180);
  const dist = 34 + ((seed * 53) % 56);
  const spin = ((seed * 97) % 360) - 180;
  useEffect(() => {
    p.set(withTiming(1, { duration: effects.particleLifetime, easing: Easing.out(Easing.cubic) }));
  }, [p]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - p.value,
    transform: [
      { translateX: Math.cos(angle) * dist * p.value },
      { translateY: Math.sin(angle) * dist * p.value + 44 * p.value * p.value },
      { rotate: `${spin * p.value}deg` },
      { scale: 1 - p.value * 0.4 },
    ],
  }));
  const b = theme.blocks[color % theme.blocks.length];
  return <Animated.View pointerEvents="none" style={[styles.particle, { backgroundColor: seed % 2 ? b.base : b.light }, style]} />;
}

/** "+40" that floats up from where the piece landed. */
export function ScorePop({ points, x, y, color }: { points: number; x: number; y: number; color: string }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [p]);
  const style = useAnimatedStyle(() => ({ opacity: p.value < 0.7 ? 1 : (1 - p.value) / 0.3, transform: [{ translateY: -46 * p.value }, { scale: 0.8 + 0.4 * Math.min(1, p.value * 3) }] }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: x - 40, top: y - 20, width: 80, alignItems: 'center' }, style]}>
      <Text style={[type.heading, { color, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 6 }]}>+{points}</Text>
    </Animated.View>
  );
}

/** "Double clear! +40" banner that pops in and floats away. */
export function ComboBanner({ text, reduceMotion, theme }: { text: string; reduceMotion: boolean; theme: Theme }) {
  const s = useSharedValue(reduceMotion ? 1 : 0.4);
  const o = useSharedValue(0);
  useEffect(() => {
    o.set(withSequence(withTiming(1, { duration: duration.fast }), withDelay(duration.comboBanner - 300, withTiming(0, { duration: 300 }))));
    if (!reduceMotion) s.set(withSpring(1, springs.pop));
  }, [o, s, reduceMotion]);
  const style = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ scale: s.value }, { translateY: (1 - o.value) * -10 }] }));
  return (
    <Animated.View pointerEvents="none" style={[styles.banner, { backgroundColor: theme.accent }, style]}>
      <Text style={[type.title, { color: theme.onAccent }]}>{text}</Text>
    </Animated.View>
  );
}

/** Full-width celebration when a new level (and its design) unlocks. */
export function LevelUpCelebration({ theme, reduceMotion }: { theme: Theme; reduceMotion: boolean }) {
  const s = useSharedValue(reduceMotion ? 1 : 0.6);
  const o = useSharedValue(0);
  useEffect(() => {
    o.set(withSequence(withTiming(1, { duration: 220 }), withDelay(1900, withTiming(0, { duration: 400 }))));
    if (!reduceMotion) s.set(withSpring(1, springs.pop));
  }, [o, s, reduceMotion]);
  const style = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ scale: s.value }] }));
  return (
    <Animated.View pointerEvents="none" style={[styles.levelUp, { backgroundColor: theme.backgroundRaised, borderColor: theme.accent }, style]} accessibilityLiveRegion="polite">
      <Text style={[type.label, { color: theme.accent }]}>Level up!</Text>
      <Text style={[type.hero, { color: '#FFF8EC' }]}>{theme.level}</Text>
      <Text style={[type.heading, { color: '#FFF8EC', textAlign: 'center' }]}>{theme.name}</Text>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
        {theme.blocks.map((b, i) => (
          <View key={i} style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: b.base }} />
        ))}
      </View>
      <Text style={[type.caption, { color: '#CFC8E8', marginTop: 4 }]}>New design unlocked</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  particle: { position: 'absolute', width: 10, height: 10, borderRadius: 2 },
  banner: { position: 'absolute', alignSelf: 'center', top: '38%', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 999 },
  levelUp: { position: 'absolute', alignSelf: 'center', top: '24%', alignItems: 'center', paddingHorizontal: 28, paddingVertical: 22, borderRadius: 28, borderWidth: 2, minWidth: 260 },
});
