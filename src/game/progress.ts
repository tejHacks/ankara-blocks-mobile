/**
 * Lifetime progression. Every point you score in any game is XP.
 * Level 2 arrives in your first game; later levels take longer.
 *   XP to reach level L = round(100 × (L − 1)^1.6)
 *   L2 = 100 · L5 ≈ 920 · L10 ≈ 3,350 · L25 ≈ 16,200 · L50 ≈ 50,800
 */
import { useStoredState } from '@/lib/storage';
import { MAX_LEVEL } from './themes';

export const xpForLevel = (level: number) => (level <= 1 ? 0 : Math.round(100 * Math.pow(level - 1, 1.6)));

export function levelForXp(xp: number) {
  let L = 1;
  while (L < MAX_LEVEL && xp >= xpForLevel(L + 1)) L++;
  return L;
}

/** Progress within the current level, 0..1 (1 at max level). */
export function levelProgress(xp: number) {
  const L = levelForXp(xp);
  if (L >= MAX_LEVEL) return { level: L, into: 0, needed: 0, fraction: 1 };
  const start = xpForLevel(L);
  const end = xpForLevel(L + 1);
  return { level: L, into: xp - start, needed: end - start, fraction: (xp - start) / (end - start) };
}

export const useXp = () => useStoredState('xp', 0);
/** Pinned design level, or 0 for "always use my latest unlock". */
export const usePinnedTheme = () => useStoredState('pinned-theme', 0);
