/**
 * Sound, music and haptics for every game moment, respecting the player's settings.
 * Sound effects come from the current level's instrument pack (a new one every
 * 5 levels); "Victory at the Summit" loops quietly underneath.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';

import { useStoredState } from '@/lib/storage';
import { SHARED_SFX, SOUND_PACKS } from './sfx-index';

export type Moment = 'pickup' | 'place' | 'invalid' | 'clear' | 'combo' | 'best' | 'levelup';

const HAPTIC: Record<Moment, () => Promise<void>> = {
  pickup: () => Haptics.selectionAsync(),
  place: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  invalid: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  clear: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  combo: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  best: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  levelup: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
};

export interface Settings {
  sound: boolean;
  haptics: boolean;
  music: boolean;
}

export const useSettings = () => useStoredState<Settings>('settings', { sound: true, haptics: true, music: true });

const MUSIC = require('@/assets/music/victory-at-the-summit.m4a');
const MUSIC_VOLUME = 0.35;

function makePlayers(pack: number) {
  try {
    const p = SOUND_PACKS[pack % SOUND_PACKS.length];
    return {
      pickup: createAudioPlayer(p.pickup),
      place: createAudioPlayer(p.place),
      clear: createAudioPlayer(p.clear),
      combo: createAudioPlayer(p.combo),
      best: createAudioPlayer(p.best),
      invalid: createAudioPlayer(SHARED_SFX.invalid),
      levelup: createAudioPlayer(SHARED_SFX.levelup),
    } as Record<Moment, AudioPlayer>;
  } catch {
    return null; // audio unavailable — haptics still work
  }
}

/** Background music that follows the Music setting. */
export function useMusic(enabled: boolean) {
  const [player] = useState(() => {
    try {
      const p = createAudioPlayer(MUSIC);
      p.loop = true;
      p.volume = MUSIC_VOLUME;
      return p;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    // Respect the silent switch for a game; music and effects mix together.
    setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
    return () => player?.remove();
  }, [player]);
  useEffect(() => {
    if (!player) return;
    if (enabled) player.play();
    else player.pause();
  }, [enabled, player]);
}

export function useFeedback(pack: number) {
  const [settings] = useSettings();
  // One set of players per instrument pack; the old pack is released when it changes.
  const players = useMemo(() => makePlayers(pack), [pack]);
  useEffect(
    () => () => {
      if (players) Object.values(players).forEach((p) => p.remove());
    },
    [players],
  );

  return (moment: Moment) => {
    if (settings.haptics) HAPTIC[moment]().catch(() => {});
    const p = players?.[moment];
    if (settings.sound && p) {
      p.seekTo(0).catch(() => {});
      p.play();
    }
  };
}
