import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, elevation, palette, radius, size, space, type } from '@/theme/tokens';
import type { Settings } from './feedback';

const c = colors.dark;

export function GameButton({ title, onPress, variant = 'primary', label }: { title: string; onPress: () => void; variant?: 'primary' | 'secondary'; label?: string }) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? title}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: primary ? c.accent : 'transparent', borderColor: primary ? c.accent : c.border, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      <Text style={[type.bodyStrong, { color: primary ? c.onAccent : c.text, fontSize: 17 }]}>{title}</Text>
    </Pressable>
  );
}

/** Bottom sheet over a dimmed scrim. */
function Sheet({ children, onDismiss }: { children: ReactNode; onDismiss?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      <Animated.View entering={FadeIn} exiting={FadeOut} style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]}>
        <Pressable style={{ flex: 1 }} onPress={onDismiss} accessibilityLabel="Close" accessible={!!onDismiss} />
      </Animated.View>
      <Animated.View entering={SlideInDown.springify().damping(18)} exiting={SlideOutDown} style={[styles.sheet, elevation.sheet, { paddingBottom: insets.bottom + space[6] }]}>
        <View style={styles.grabber} />
        {children}
      </Animated.View>
    </View>
  );
}

export function PauseSheet({
  settings,
  onChange,
  onResume,
  onRestart,
  onHowToPlay,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
  onResume: () => void;
  onRestart: () => void;
  onHowToPlay: () => void;
}) {
  return (
    <Sheet onDismiss={onResume}>
      <Text style={[type.title, { color: c.text, textAlign: 'center' }]}>Paused</Text>
      <View style={styles.row}>
        <Text style={[type.bodyStrong, { color: c.text }]}>Sound</Text>
        <Switch value={settings.sound} onValueChange={(sound) => onChange({ ...settings, sound })} trackColor={{ true: palette.gold }} accessibilityLabel="Sound" />
      </View>
      <View style={styles.row}>
        <Text style={[type.bodyStrong, { color: c.text }]}>Haptics</Text>
        <Switch value={settings.haptics} onValueChange={(haptics) => onChange({ ...settings, haptics })} trackColor={{ true: palette.gold }} accessibilityLabel="Haptics" />
      </View>
      <GameButton title="Resume" onPress={onResume} />
      <GameButton title="Restart" variant="secondary" onPress={onRestart} />
      <GameButton title="How to play" variant="secondary" onPress={onHowToPlay} />
    </Sheet>
  );
}

export function GameOverSheet({ score, best, newBest, onPlayAgain, onShare }: { score: number; best: number; newBest: boolean; onPlayAgain: () => void; onShare: () => void }) {
  return (
    <Sheet>
      <Text style={[type.label, { color: c.textSubtle, textAlign: 'center' }]}>{newBest ? 'New best!' : 'No more moves'}</Text>
      <Text style={[type.hero, { color: newBest ? c.accent : c.text, textAlign: 'center' }]} accessibilityLabel={`Final score ${score}`}>
        {score}
      </Text>
      <Text style={[type.body, { color: c.textMuted, textAlign: 'center' }]}>{newBest ? 'You beat your best score.' : `Best: ${best}`}</Text>
      <GameButton title="Play again" onPress={onPlayAgain} />
      <GameButton title="Share score" variant="secondary" onPress={onShare} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: c.backgroundRaised, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space[6], gap: space[3] },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: c.border, marginBottom: space[2] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: size.touchMin },
  button: { minHeight: 56, borderRadius: radius.pill, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
