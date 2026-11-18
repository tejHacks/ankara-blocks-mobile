/**
 * Sound + haptics for every game moment, respecting the player's settings.
 * One preloaded player per effect so hits start instantly.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';

import { useStoredState } from '@/lib/storage';

export type Moment = 'pickup' | 'place' | 'invalid' | 'clear' | 'combo' | 'best';

const SOURCES: Record<Moment, number> = {
  pickup: require('@/assets/sfx/pickup.wav'),
  place: require('@/assets/sfx/place.wav'),
  invalid: require('@/assets/sfx/invalid.wav'),
  clear: require('@/assets/sfx/clear.wav'),
  combo: require('@/assets/sfx/combo.wav'),
  best: require('@/assets/sfx/best.wav'),
};

const HAPTIC: Record<Moment, () => Promise<void>> = {
  pickup: () => Haptics.selectionAsync(),
  place: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  invalid: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  clear: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  combo: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  best: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
};

export interface Settings {
  sound: boolean;
  haptics: boolean;
}

export const useSettings = () => useStoredState<Settings>('settings', { sound: true, haptics: true });

export function useFeedback() {
  const [settings] = useSettings();
  const [players] = useState(() => {
    try {
      return Object.fromEntries((Object.keys(SOURCES) as Moment[]).map((k) => [k, createAudioPlayer(SOURCES[k])])) as Record<Moment, AudioPlayer>;
    } catch {
      return null; // audio unavailable (e.g. tests) — haptics still work
    }
  });

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
    return () => {
      if (players) Object.values(players).forEach((p) => p.remove());
    };
  }, [players]);

  return (moment: Moment) => {
    if (settings.haptics) HAPTIC[moment]().catch(() => {});
    const p = players?.[moment];
    if (settings.sound && p) {
      p.seekTo(0).catch(() => {});
      p.play();
    }
  };
}
