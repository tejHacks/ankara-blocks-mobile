import { fitsAnywhere, newTray, shapeWeights, SIZE, type Board } from '@/game/engine';
import { levelForXp, levelProgress, xpForLevel } from '@/game/progress';
import { SHARED_SFX, SOUND_PACKS } from '@/game/sfx-index';
import { allThemes, contrast, MAX_LEVEL, themeForLevel } from '@/game/themes';

describe('50 level designs', () => {
  const themes = allThemes();

  it('has exactly 50, each with a unique name', () => {
    expect(themes).toHaveLength(MAX_LEVEL);
    expect(new Set(themes.map((t) => t.name)).size).toBe(MAX_LEVEL);
  });

  it('every block colour is readable against its board (≥ 3:1)', () => {
    for (const t of themes) for (const b of t.blocks) expect(contrast(b.base, t.board)).toBeGreaterThanOrEqual(3);
  });

  it('every design has six distinct block colours and three motifs', () => {
    for (const t of themes) {
      expect(new Set(t.blocks.map((b) => b.base)).size).toBe(6);
      expect(t.motifs).toHaveLength(3);
    }
  });

  it('accent text is readable on the accent badge', () => {
    for (const t of themes) expect(contrast(t.accent, t.onAccent)).toBeGreaterThanOrEqual(4.5);
  });

  it('changes sound pack every 5 levels, and every pack exists', () => {
    expect(themeForLevel(1).soundPack).toBe(0);
    expect(themeForLevel(5).soundPack).toBe(0);
    expect(themeForLevel(6).soundPack).toBe(1);
    expect(themeForLevel(50).soundPack).toBe(9);
    for (const t of themes) expect(SOUND_PACKS[t.soundPack]).toBeDefined();
    expect(SHARED_SFX.levelup).toBeDefined();
  });

  it('clamps out-of-range levels', () => {
    expect(themeForLevel(0).level).toBe(1);
    expect(themeForLevel(999).level).toBe(MAX_LEVEL);
  });
});

describe('XP and levels', () => {
  it('starts at level 1 and reaches level 2 at 100 XP', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
  });

  it('requires steadily more XP for each level', () => {
    for (let L = 2; L < MAX_LEVEL; L++) {
      expect(xpForLevel(L + 1) - xpForLevel(L)).toBeGreaterThan(xpForLevel(L) - xpForLevel(L - 1));
    }
  });

  it('caps at level 50', () => {
    expect(levelForXp(10_000_000)).toBe(MAX_LEVEL);
    expect(levelProgress(10_000_000).fraction).toBe(1);
  });

  it('reports progress within a level', () => {
    const p = levelProgress(150); // level 2 runs 100 → 303
    expect(p.level).toBe(2);
    expect(p.into).toBe(50);
    expect(p.fraction).toBeGreaterThan(0.2);
    expect(p.fraction).toBeLessThan(0.3);
  });
});

describe('fair, level-aware dealing', () => {
  it('always deals at least one piece that fits — even with a single free cell', () => {
    // Every cell full except one: only a 1-block piece can fit.
    const b: Board = Array.from({ length: SIZE }, (_, r) => Array.from({ length: SIZE }, (_, c) => (r === 4 && c === 4 ? null : 1)));
    for (let i = 0; i < 50; i++) {
      const tray = newTray(50, b);
      expect(tray.some((p) => fitsAnywhere(b, p.shape))).toBe(true);
    }
  });

  it('makes big pieces more common at higher levels', () => {
    const big = (lv: number) => {
      const w = shapeWeights(lv);
      const total = w.reduce((a, b) => a + b, 0);
      return w.filter((_, i) => i === 7 || i === 8 || i === 10).reduce((a, b) => a + b, 0) / total;
    };
    expect(big(50)).toBeGreaterThan(big(1) * 2);
  });
});
