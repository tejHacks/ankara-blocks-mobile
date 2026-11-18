import { useState } from 'react';
import { View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { effects, springs, size as sizes } from '@/theme/tokens';
import { Block } from './block';
import { shapeSize, type Piece } from './engine';
import type { Theme } from './themes';

export interface BoardRect {
  x: number;
  y: number;
  cell: number;
}

interface Props {
  piece: Piece;
  index: number;
  selected: boolean;
  fits: boolean;
  board: SharedValue<BoardRect>;
  theme: Theme;
  reduceMotion: boolean;
  onTap: (index: number) => void;
  onPickUp: (index: number) => void;
  onHover: (index: number, row: number, col: number) => void;
  onDrop: (index: number, row: number, col: number) => void;
}

const MINI = sizes.trayBlock;
/** Tray slot size. Gesture coordinates (e.x / e.y) are relative to this slot. */
const SLOT = 112;

/**
 * A tray piece you can drag onto the board (or tap to select).
 * While dragging it grows to board-cell size and floats above the finger
 * so you can see where it will land.
 */
export function TrayPiece({ piece, index, selected, fits, board, theme, reduceMotion, onTap, onPickUp, onHover, onDrop }: Props) {
  const { rows, cols } = shapeSize(piece.shape);
  const w = cols * MINI;
  const h = rows * MINI;

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);
  const dragging = useSharedValue(false);
  /** Did this press ever turn into a drag? (A press that didn't is a tap.) */
  const activated = useSharedValue(false);
  const start = useSharedValue({ cx: 0, cy: 0 });
  const lastCell = useSharedValue({ r: -99, c: -99 });
  const [lifted, setLifted] = useState(false);

  const pan = usePanGesture({
    minDistance: 6,
    onBegin: (e) => {
      'worklet';
      // Where the piece's centre is on screen before any transform.
      activated.value = false;
      // The piece is centred in its slot, so the slot's centre is the piece's centre.
      start.value = { cx: e.absoluteX - e.x + SLOT / 2, cy: e.absoluteY - e.y + SLOT / 2 };
    },
    onActivate: () => {
      'worklet';
      dragging.value = true;
      activated.value = true;
      scale.value = withSpring(board.value.cell / MINI, springs.pickUp);
      scheduleOnRN(setLifted, true);
      scheduleOnRN(onPickUp, index);
    },
    onUpdate: (e) => {
      'worklet';
      const cell = board.value.cell;
      const bigW = cols * cell;
      const bigH = rows * cell;
      const lift = cell * 1.6; // float above the finger
      const cx = e.absoluteX;
      const cy = e.absoluteY - bigH / 2 - lift;
      tx.value = cx - start.value.cx;
      ty.value = cy - start.value.cy;
      // Top-left of the enlarged piece → nearest board cell.
      const col = Math.round((cx - bigW / 2 - board.value.x) / cell);
      const row = Math.round((cy - bigH / 2 - board.value.y) / cell);
      if (row !== lastCell.value.r || col !== lastCell.value.c) {
        lastCell.value = { r: row, c: col };
        scheduleOnRN(onHover, index, row, col);
      }
    },
    onDeactivate: () => {
      'worklet';
      if (dragging.value) scheduleOnRN(onDrop, index, lastCell.value.r, lastCell.value.c);
      dragging.value = false;
      lastCell.value = { r: -99, c: -99 };
      tx.value = withSpring(0, springs.returnToTray);
      ty.value = withSpring(0, springs.returnToTray);
      scale.value = withSpring(1, springs.returnToTray);
      scheduleOnRN(setLifted, false);
    },
    onFinalize: () => {
      'worklet';
      // A press that never became a drag is a tap (tap-to-place mode).
      if (!activated.value) scheduleOnRN(onTap, index);
    },
  });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
    zIndex: dragging.value ? 10 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <View
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Piece ${index + 1}, ${piece.shape.length} blocks${selected ? ', selected' : ''}${fits ? '' : ', no room on the board'}`}
        accessibilityHint="Double-tap to select, then choose a spot on the board"
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={(e) => e.nativeEvent.actionName === 'activate' && onTap(index)}
        style={{ width: SLOT, height: SLOT, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: 2, borderColor: selected ? theme.accent : 'transparent', opacity: fits ? 1 : 0.35 }}>
        <Animated.View style={[{ width: w, height: h }, style, lifted && !reduceMotion ? { shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 10 } } : null]}>
          {piece.shape.map(([r, c]) => (
            <View key={`${r}-${c}`} style={{ position: 'absolute', left: c * MINI, top: r * MINI, padding: 1 }}>
              <Block color={piece.color} size={MINI - 2} theme={theme} />
            </View>
          ))}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

export const PICKUP_SCALE = effects.pickUpScale;
