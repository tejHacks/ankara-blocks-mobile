import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, elevation, radius, size, space, type } from '@/theme/tokens';
import type { Settings } from './feedback';
import type { Theme } from './themes';

const c = colors.dark;

export function GameButton({ title, onPress, variant = 'primary', label, accent = c.accent, onAccent = c.onAccent }: { title: string; onPress: () => void; variant?: 'primary' | 'secondary'; label?: string; accent?: string; onAccent?: string }) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? title}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: primary ? accent : 'transparent', borderColor: primary ? accent : c.border, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      <Text style={[type.bodyStrong, { color: primary ? onAccent : c.text, fontSize: 17 }]}>{title}</Text>
    </Pressable>
  );
}

/** Bottom sheet over a dimmed scrim. */
function Sheet({ children, onDismiss, theme }: { children: ReactNode; onDismiss?: () => void; theme: Theme }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      <Animated.View entering={FadeIn} exiting={FadeOut} style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]}>
        <Pressable style={{ flex: 1 }} onPress={onDismiss} accessibilityLabel="Close" accessible={!!onDismiss} />
      </Animated.View>
      <Animated.View entering={SlideInDown.springify().damping(18)} exiting={SlideOutDown} style={[styles.sheet, elevation.sheet, { backgroundColor: theme.backgroundRaised, paddingBottom: insets.bottom + space[6] }]}>
        <View style={styles.grabber} />
        {children}
      </Animated.View>
    </View>
  );
}

function Toggle({ label, value, onChange, theme }: { label: string; value: boolean; onChange: (v: boolean) => void; theme: Theme }) {
  return (
    <View style={styles.row}>
      <Text style={[type.bodyStrong, { color: c.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.accent }} accessibilityLabel={label} />
    </View>
  );
}

export function PauseSheet({
  theme,
  settings,
  onChange,
  onResume,
  onRestart,
  onDesigns,
  onHowToPlay,
}: {
  theme: Theme;
  settings: Settings;
  onChange: (s: Settings) => void;
  onResume: () => void;
  onRestart: () => void;
  onDesigns: () => void;
  onHowToPlay: () => void;
}) {
  return (
    <Sheet onDismiss={onResume} theme={theme}>
      <Text style={[type.title, { color: c.text, textAlign: 'center' }]}>Paused</Text>
      <Toggle label="Music" value={settings.music} onChange={(music) => onChange({ ...settings, music })} theme={theme} />
      <Toggle label="Sound" value={settings.sound} onChange={(sound) => onChange({ ...settings, sound })} theme={theme} />
      <Toggle label="Haptics" value={settings.haptics} onChange={(haptics) => onChange({ ...settings, haptics })} theme={theme} />
      <GameButton title="Resume" onPress={onResume} accent={theme.accent} onAccent={theme.onAccent} />
      <View style={{ flexDirection: 'row', gap: space[3] }}>
        <View style={{ flex: 1 }}>
          <GameButton title="Designs" variant="secondary" onPress={onDesigns} />
        </View>
        <View style={{ flex: 1 }}>
          <GameButton title="Restart" variant="secondary" onPress={onRestart} />
        </View>
      </View>
      <GameButton title="How to play" variant="secondary" onPress={onHowToPlay} />
    </Sheet>
  );
}

export function GameOverSheet({
  theme,
  score,
  best,
  newBest,
  xpGained,
  level,
  levelFraction,
  onPlayAgain,
  onShare,
}: {
  theme: Theme;
  score: number;
  best: number;
  newBest: boolean;
  xpGained: number;
  level: number;
  levelFraction: number;
  onPlayAgain: () => void;
  onShare: () => void;
}) {
  return (
    <Sheet theme={theme}>
      <Text style={[type.label, { color: c.textSubtle, textAlign: 'center' }]}>{newBest ? 'New best!' : 'No more moves'}</Text>
      <Text style={[type.hero, { color: newBest ? theme.accent : c.text, textAlign: 'center' }]} accessibilityLabel={`Final score ${score}`}>
        {score}
      </Text>
      <Text style={[type.body, { color: c.textMuted, textAlign: 'center' }]}>{newBest ? 'You beat your best score.' : `Best: ${best}`}</Text>
      <View style={styles.xpCard} accessibilityLabel={`Plus ${xpGained} XP. Level ${level}`}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[type.bodyStrong, { color: c.text }]}>Level {level}</Text>
          <Text style={[type.bodyStrong, { color: theme.accent }]}>+{xpGained} XP</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(levelFraction * 100)}%`, backgroundColor: theme.accent }]} />
        </View>
      </View>
      <GameButton title="Play again" onPress={onPlayAgain} accent={theme.accent} onAccent={theme.onAccent} />
      <GameButton title="Share score" variant="secondary" onPress={onShare} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space[6], gap: space[3] },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: c.border, marginBottom: space[2] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: size.touchMin },
  button: { minHeight: 56, borderRadius: radius.pill, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  xpCard: { gap: space[2], padding: space[4], borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.05)' },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});
