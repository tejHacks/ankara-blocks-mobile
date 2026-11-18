import { Redirect, router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Pressable, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Block } from '@/game/block';
import { ClearingBlock, ComboBanner, LevelUpCelebration, Particle, ScorePop } from '@/game/effects';
import { canPlace, emptyBoard, fitsAnywhere, newTray, place, SIZE, type Board, type Piece } from '@/game/engine';
import { useFeedback, useMusic, useSettings } from '@/game/feedback';
import { levelForXp, levelProgress, usePinnedTheme, useXp } from '@/game/progress';
import { GameOverSheet, PauseSheet } from '@/game/sheets';
import { themeForLevel, type Theme } from '@/game/themes';
import { TrayPiece, type BoardRect } from '@/game/tray-piece';
import { useReduceMotion } from '@/lib/reduce-motion';
import { useStoredState } from '@/lib/storage';
import { duration, effects, radius, size as sizes, space, type } from '@/theme/tokens';

interface Clearing {
  id: number;
  cells: { r: number; c: number; color: number }[];
}
interface Pop {
  id: number;
  points: number;
  x: number;
  y: number;
}

let effectId = 0;

export default function Game() {
  const { width } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const [settings, setSettings] = useSettings();
  const [onboarded, , onboardReady] = useStoredState('onboarded', false);
  const [best, setBest] = useStoredState('best-score', 0);
  const [xp, setXp] = useXp();
  const [pinned] = usePinnedTheme();

  const level = levelForXp(xp);
  const progress = levelProgress(xp);
  const theme = themeForLevel(pinned > 0 && pinned <= level ? pinned : level);
  const play = useFeedback(theme.soundPack);

  const boardPx = Math.min(width - space[4] * 2, sizes.boardMax);
  const cell = Math.floor((boardPx - sizes.boardPadding * 2) / SIZE);

  const [board, setBoard] = useState<Board>(emptyBoard);
  const [tray, setTray] = useState<(Piece | null)[]>(() => newTray());
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hover, setHover] = useState<{ piece: number; r: number; c: number } | null>(null);
  const [clearing, setClearing] = useState<Clearing[]>([]);
  const [pops, setPops] = useState<Pop[]>([]);
  const [banner, setBanner] = useState<{ id: number; text: string } | null>(null);
  const [levelUp, setLevelUp] = useState<{ id: number; theme: Theme } | null>(null);
  const [paused, setPaused] = useState(false);
  /** Set the moment this game's score passes the stored best. */
  const [beatBest, setBeatBest] = useState(false);

  const boardRef = useRef<ComponentRef<typeof View>>(null);
  const boardRect = useSharedValue<BoardRect>({ x: 0, y: 0, cell });
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const gameOver = useMemo(() => tray.some(Boolean) && tray.every((p) => !p || !fitsAnywhere(board, p.shape)), [tray, board]);
  const newBest = gameOver && beatBest;
  useMusic(settings.music && !gameOver);

  useEffect(() => {
    if (!newBest) return;
    const t = setTimeout(() => play('best'), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newBest]);

  const measureBoard = useCallback(() => {
    boardRef.current?.measureInWindow((x, y) => {
      boardRect.set({ x: x + sizes.boardPadding, y: y + sizes.boardPadding, cell });
    });
  }, [boardRect, cell]);

  /** Preview: where the hovered piece would land and which lines it would clear. */
  const preview = useMemo(() => {
    if (!hover) return null;
    const piece = tray[hover.piece];
    if (!piece) return null;
    const valid = canPlace(board, piece.shape, hover.r, hover.c);
    const cells = new Set(piece.shape.map(([r, cc]) => `${hover.r + r}-${hover.c + cc}`));
    const clears = new Set<string>();
    if (valid) place(board, piece, hover.r, hover.c, 0).clearedCells.forEach(([r, cc]) => clears.add(`${r}-${cc}`));
    return { valid, cells, clears };
  }, [hover, tray, board]);

  const tryPlace = (index: number, r: number, col: number) => {
    const piece = tray[index];
    if (!piece) return false;
    if (!canPlace(board, piece.shape, r, col)) {
      play('invalid');
      return false;
    }
    const placed = board.map((row) => [...row]);
    for (const [pr, pc] of piece.shape) placed[r + pr][col + pc] = piece.color;
    const res = place(board, piece, r, col, combo);
    const nextCombo = res.linesCleared ? combo + 1 : 0;
    const nextScore = score + res.points;
    let nextTray = tray.map((p, i) => (i === index ? null : p));
    if (nextTray.every((p) => p === null)) nextTray = newTray(level, res.board);

    setBoard(res.board);
    setTray(nextTray);
    setSelected(null);
    setHover(null);
    setScore(nextScore);
    setCombo(nextCombo);
    if (nextScore > best) {
      setBest(nextScore);
      setBeatBest(true);
    }

    // Lifetime XP — may unlock the next level (and its design) mid-game.
    const nextXp = xp + res.points;
    setXp(nextXp);
    const nextLevel = levelForXp(nextXp);
    const id = ++effectId;
    if (nextLevel > level) {
      setLevelUp({ id, theme: themeForLevel(nextLevel) });
      setTimeout(() => setLevelUp((l) => (l?.id === id ? null : l)), 2600);
      setTimeout(() => play('levelup'), 150);
    }

    // Floating "+N" from the middle of the placed piece.
    const cy = piece.shape.reduce((a, [pr]) => a + pr, 0) / piece.shape.length;
    const cx = piece.shape.reduce((a, [, pc]) => a + pc, 0) / piece.shape.length;
    setPops((list) => [...list, { id, points: res.points, x: sizes.boardPadding + (col + cx + 0.5) * cell, y: sizes.boardPadding + (r + cy + 0.5) * cell }]);
    setTimeout(() => setPops((list) => list.filter((p) => p.id !== id)), 950);

    if (res.linesCleared) {
      const uniq = new Map(res.clearedCells.map(([cr, cc]) => [`${cr}-${cc}`, { r: cr, c: cc, color: placed[cr][cc] ?? 0 }]));
      setClearing((list) => [...list, { id, cells: [...uniq.values()] }]);
      setTimeout(() => setClearing((list) => list.filter((x) => x.id !== id)), effects.particleLifetime + 200);
      const big = res.linesCleared >= 2 || res.perfect;
      if (nextLevel === level) play(big || nextCombo > 1 ? 'combo' : 'clear');
      const label = res.perfect
        ? 'Perfect clear!'
        : res.linesCleared >= 4
          ? 'Ankara storm!'
          : res.linesCleared === 3
            ? 'Triple clear!'
            : res.linesCleared === 2
              ? 'Double clear!'
              : nextCombo > 1
                ? `Combo ×${nextCombo}!`
                : null;
      if (label) setBanner({ id, text: `${label}  +${res.points}` });
      if (big && !reduceMotion) {
        const a = effects.shakeAmplitude * (res.perfect ? 1.6 : 1);
        shake.set(withSequence(withTiming(-a, { duration: 40 }), withTiming(a, { duration: 60 }), withTiming(-a / 2, { duration: 60 }), withTiming(0, { duration: duration.shake - 160 })));
      }
    } else if (nextLevel === level) {
      play('place');
    }
    return true;
  };

  const restart = () => {
    setBoard(emptyBoard());
    setTray(newTray(level));
    setSelected(null);
    setHover(null);
    setScore(0);
    setCombo(0);
    setClearing([]);
    setPops([]);
    setBanner(null);
    setPaused(false);
    setBeatBest(false);
  };

  if (!onboardReady) return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  if (!onboarded) return <Redirect href="/how-to-play" />;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <Backdrop theme={theme} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Pause" onPress={() => setPaused(true)} style={[styles.iconButton, { backgroundColor: theme.backgroundRaised }]} hitSlop={8}>
          <View style={styles.pauseBar} />
          <View style={styles.pauseBar} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={[type.label, { color: '#CFC8E8' }]}>{combo >= 2 ? `Combo ×${combo}` : 'Score'}</Text>
          <Text style={[type.score, { color: '#FFF8EC' }]} accessibilityLabel={`Score ${score}`}>
            {score}
          </Text>
        </View>
        <View style={[styles.bestChip, { backgroundColor: theme.backgroundRaised }]} accessibilityLabel={`Best ${best}`}>
          <Text style={[type.label, { color: '#CFC8E8' }]}>Best</Text>
          <Text style={[type.heading, { color: theme.accent }]}>{best}</Text>
        </View>
      </View>

      {/* Level bar */}
      <Pressable
        onPress={() => router.push('/designs')}
        accessibilityRole="button"
        accessibilityLabel={`Level ${progress.level}, ${theme.name}. ${progress.needed ? `${progress.into} of ${progress.needed} XP to the next level.` : 'Max level.'} Open designs`}
        style={styles.levelBar}>
        <View style={[styles.levelBadge, { backgroundColor: theme.accent }]}>
          <Text style={[type.bodyStrong, { color: theme.onAccent, fontSize: 13 }]}>LV {progress.level}</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[type.caption, { color: '#CFC8E8' }]} numberOfLines={1}>
            {theme.name}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(progress.fraction * 100)}%`, backgroundColor: theme.accent }]} />
          </View>
        </View>
        <Text style={[type.caption, { color: '#A39CC7' }]}>{progress.needed ? `${progress.needed - progress.into} XP` : 'MAX'}</Text>
      </Pressable>

      {/* Board */}
      <Animated.View style={[{ alignSelf: 'center' }, shakeStyle]}>
        <View ref={boardRef} onLayout={measureBoard} style={[styles.board, { width: cell * SIZE + sizes.boardPadding * 2, backgroundColor: theme.board }]} accessibilityLabel="Board">
          {board.map((row, r) => (
            <View key={r} style={{ flexDirection: 'row' }}>
              {row.map((v, col) => {
                const key = `${r}-${col}`;
                const ghost = preview?.cells.has(key);
                const willClear = preview?.clears.has(key);
                return (
                  <Pressable
                    key={col}
                    accessibilityLabel={`Row ${r + 1}, column ${col + 1}${v === null ? ', empty' : ', filled'}`}
                    onPress={() => (selected !== null ? tryPlace(selected, r, col) : undefined)}
                    onHoverIn={() => selected !== null && setHover({ piece: selected, r, c: col })}
                    style={{ width: cell, height: cell, padding: sizes.cellGap / 2 }}>
                    {v === null ? (
                      <View
                        style={[
                          styles.empty,
                          { borderRadius: cell * radius.block, backgroundColor: theme.cellEmpty },
                          ghost ? { backgroundColor: preview?.valid ? `${theme.accent}66` : 'rgba(255,107,107,0.30)' } : null,
                        ]}
                      />
                    ) : (
                      <View>
                        <Block color={v} size={cell - sizes.cellGap} theme={theme} />
                        {willClear ? <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,248,236,0.25)', borderRadius: cell * radius.block }]} /> : null}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}

          {/* Clear sweep + confetti */}
          {clearing.map((cl) =>
            cl.cells.map((p, i) => (
              <View key={`${cl.id}-${p.r}-${p.c}`} pointerEvents="none" style={{ position: 'absolute', left: sizes.boardPadding + p.c * cell + sizes.cellGap / 2, top: sizes.boardPadding + p.r * cell + sizes.cellGap / 2 }}>
                <ClearingBlock color={p.color} size={cell - sizes.cellGap} delay={(p.c + p.r) * 18} reduceMotion={reduceMotion} theme={theme} />
                {!reduceMotion && i < 32
                  ? Array.from({ length: effects.particlesPerCell + 1 }, (_, k) => (
                      <View key={k} style={{ position: 'absolute', left: cell / 2 - 5, top: cell / 2 - 5 }}>
                        <Particle color={p.color} seed={cl.id * 31 + i * 7 + k} theme={theme} />
                      </View>
                    ))
                  : null}
              </View>
            )),
          )}

          {pops.map((p) => (
            <ScorePop key={p.id} points={p.points} x={p.x} y={p.y} color={theme.accent} />
          ))}
        </View>
      </Animated.View>

      {/* Tray */}
      <View style={styles.tray}>
        {tray.map((p, i) =>
          p ? (
            <TrayPiece
              key={p.id}
              piece={p}
              index={i}
              selected={selected === i}
              fits={fitsAnywhere(board, p.shape)}
              board={boardRect}
              theme={theme}
              reduceMotion={reduceMotion}
              onTap={(idx) => {
                play('pickup');
                setSelected((s) => (s === idx ? null : idx));
              }}
              onPickUp={(idx) => {
                measureBoard();
                setSelected(null);
                play('pickup');
                setHover({ piece: idx, r: -99, c: -99 });
              }}
              onHover={(idx, r, col) => setHover({ piece: idx, r, c: col })}
              onDrop={(idx, r, col) => {
                if (!tryPlace(idx, r, col)) setHover(null);
              }}
            />
          ) : (
            <View key={`empty-${i}`} style={{ width: 112, height: 112 }} />
          ),
        )}
      </View>

      <Text style={[type.caption, styles.hint]}>
        {gameOver ? 'No more moves.' : selected !== null ? 'Tap the board where the top-left block should go.' : 'Drag a piece onto the board — or tap it, then tap a spot.'}
      </Text>

      {banner ? <ComboBanner key={banner.id} text={banner.text} reduceMotion={reduceMotion} theme={theme} /> : null}
      {levelUp ? <LevelUpCelebration key={levelUp.id} theme={levelUp.theme} reduceMotion={reduceMotion} /> : null}

      {paused && !gameOver ? (
        <PauseSheet
          theme={theme}
          settings={settings}
          onChange={setSettings}
          onResume={() => setPaused(false)}
          onRestart={restart}
          onDesigns={() => {
            setPaused(false);
            router.push('/designs');
          }}
          onHowToPlay={() => {
            setPaused(false);
            router.push('/how-to-play');
          }}
        />
      ) : null}

      {gameOver ? (
        <GameOverSheet
          theme={theme}
          score={score}
          best={Math.max(best, score)}
          newBest={newBest}
          xpGained={score}
          level={progress.level}
          levelFraction={progress.fraction}
          onPlayAgain={restart}
          onShare={() => Share.share({ message: `I scored ${score} and reached level ${progress.level} in Ankara Blocks. Can you beat it?` }).catch(() => {})}
        />
      ) : null}
    </SafeAreaView>
  );
}

/** Faint motifs from the current design scattered behind the board. */
function Backdrop({ theme }: { theme: Theme }) {
  const shapes = [
    { top: '6%', left: '-8%', s: 120, ring: true },
    { top: '30%', left: '82%', s: 90, ring: false },
    { top: '68%', left: '-6%', s: 100, ring: false },
    { top: '84%', left: '78%', s: 130, ring: true },
  ] as const;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {shapes.map((sh, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: sh.top,
            left: sh.left,
            width: sh.s,
            height: sh.s,
            borderWidth: 14,
            borderColor: theme.pattern,
            borderRadius: sh.ring ? sh.s : 12,
            transform: sh.ring ? [] : [{ rotate: '45deg' }],
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, gap: space[3] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[4], paddingTop: space[2] },
  iconButton: { width: sizes.iconButton, height: sizes.iconButton, borderRadius: sizes.iconButton / 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  pauseBar: { width: 5, height: 16, borderRadius: 2, backgroundColor: '#FFF8EC' },
  bestChip: { minWidth: sizes.iconButton, alignItems: 'center', paddingHorizontal: space[3], paddingVertical: space[1], borderRadius: radius.md },
  levelBar: { flexDirection: 'row', alignItems: 'center', gap: space[3], marginHorizontal: space[4], minHeight: sizes.touchMin },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  board: { padding: sizes.boardPadding, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  empty: { flex: 1 },
  tray: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: space[2], minHeight: 120, zIndex: 5 },
  hint: { color: '#CFC8E8', textAlign: 'center', paddingHorizontal: space[6] },
});
