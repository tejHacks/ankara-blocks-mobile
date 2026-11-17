import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button, Label, Row, Screen } from '@/components/ui';
import { canPlace, emptyBoard, fitsAnywhere, newTray, place, shapeSize, SIZE, type Board, type Piece } from '@/game/engine';
import { Tile } from '@/game/tile';
import { useStoredState } from '@/lib/storage';
import { usePalette } from '@/theme';

/**
 * Tap a piece in the tray, then tap the board where its top-left block
 * should go. Fill a row or column to clear it; chain clears for combos.
 */
export default function Game() {
  const c = usePalette();
  const { width } = useWindowDimensions();
  const boardPx = Math.min(width - 32, 440);
  const cell = Math.floor((boardPx - 16) / SIZE);

  const [board, setBoard] = useState<Board>(emptyBoard);
  const [tray, setTray] = useState<(Piece | null)[]>(newTray);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [best, setBest] = useStoredState('best-score', 0);

  const gameOver = useMemo(() => tray.every((p) => !p || !fitsAnywhere(board, p.shape)) && tray.some(Boolean), [tray, board]);

  const tapCell = (r: number, col: number) => {
    if (selected === null) return;
    const piece = tray[selected];
    if (!piece) return;
    if (!canPlace(board, piece.shape, r, col)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    const res = place(board, piece, r, col, combo);
    const nextCombo = res.linesCleared ? combo + 1 : 0;
    const nextScore = score + res.points;
    let nextTray = tray.map((p, i) => (i === selected ? null : p));
    if (nextTray.every((p) => p === null)) nextTray = newTray();

    Haptics.impactAsync(res.linesCleared ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setBoard(res.board);
    setTray(nextTray);
    setSelected(null);
    setScore(nextScore);
    setCombo(nextCombo);
    setFlash(res.linesCleared ? (nextCombo > 1 ? `Combo ×${nextCombo}! +${res.points}` : `+${res.points}`) : null);
    if (nextScore > best) setBest(nextScore);
  };

  const restart = () => {
    setBoard(emptyBoard());
    setTray(newTray());
    setSelected(null);
    setScore(0);
    setCombo(0);
    setFlash(null);
  };

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <View>
          <Label>Score</Label>
          <Text style={[styles.score, { color: c.text }]}>{score}</Text>
        </View>
        <Text style={[styles.flash, { color: c.primary }]}>{flash ?? ''}</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Label>Best</Label>
          <Text style={[styles.score, { color: c.text }]}>{best}</Text>
        </View>
      </Row>

      {/* Board */}
      <View style={[styles.board, { width: cell * SIZE + 16, alignSelf: 'center', backgroundColor: '#3B0A0A' }]}>
        {board.map((row, r) => (
          <View key={r} style={{ flexDirection: 'row' }}>
            {row.map((v, col) => (
              <Pressable key={col} onPress={() => tapCell(r, col)} accessibilityLabel={`Row ${r + 1}, column ${col + 1}`} style={{ width: cell, height: cell, padding: 2 }}>
                {v === null ? <View style={[styles.empty, { borderRadius: cell * 0.2 }]} /> : <Tile color={v} size={cell - 4} />}
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      {/* Tray */}
      <Row style={{ justifyContent: 'space-around', minHeight: 120 }}>
        {tray.map((p, i) => {
          if (!p) return <View key={i} style={{ width: 96 }} />;
          const mini = 18;
          const { rows, cols } = shapeSize(p.shape);
          const fits = fitsAnywhere(board, p.shape);
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelected(selected === i ? null : i)}
              accessibilityLabel={`Piece ${i + 1}${selected === i ? ', selected' : ''}`}
              style={[styles.trayItem, { borderColor: selected === i ? c.primary : 'transparent', opacity: fits ? 1 : 0.35 }]}>
              <View style={{ width: cols * mini, height: rows * mini }}>
                {p.shape.map(([r, col]) => (
                  <View key={`${r}-${col}`} style={{ position: 'absolute', left: col * mini, top: r * mini, padding: 1 }}>
                    <Tile color={p.color} size={mini - 2} />
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}
      </Row>

      <Text style={{ color: c.muted, textAlign: 'center' }}>
        {gameOver ? 'No more moves — great game!' : selected === null ? 'Pick a piece, then tap the board.' : 'Tap where the top-left block should go.'}
      </Text>
      {gameOver ? <Button title="Play again" onPress={restart} /> : <Button title="New game" variant="secondary" onPress={restart} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  score: { fontSize: 32, fontWeight: '800', fontVariant: ['tabular-nums'] },
  flash: { fontSize: 18, fontWeight: '800' },
  board: { padding: 8, borderRadius: 20 },
  empty: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  trayItem: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderRadius: 18 },
});
