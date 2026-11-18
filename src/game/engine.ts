/**
 * Ankara Blocks game engine — pure functions, no React.
 * Board is SIZE×SIZE; each cell holds a colour index or null.
 */
export const SIZE = 8;

export type Cell = number | null;
export type Board = Cell[][];
export type Shape = [number, number][];

export interface Piece {
  id: string;
  shape: Shape;
  color: number;
}

export const COLORS = 6;

const SHAPES: Shape[] = [
  [[0, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 0], [1, 1]],
  [[0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [1, 0]],
  [[0, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [2, 0], [2, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 1]],
];

export const emptyBoard = (): Board => Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(null));

let counter = 0;

/**
 * How likely each shape is at a given level. Small and medium pieces are
 * common; the big ones (5-long bars, 3×3 square) start rare and become
 * more frequent as you level up — the game gets harder as it gets prettier.
 */
export function shapeWeights(level = 1) {
  const t = Math.min(1, Math.max(0, (level - 1) / 49));
  return SHAPES.map((shape) => {
    const n = shape.length;
    if (n >= 5) return 0.35 + 1.3 * t; // big
    if (n === 4) return 1 + 0.4 * t;
    return 1.2 - 0.3 * t; // small
  });
}

function pick<T>(items: T[], weights: number[]) {
  const total = weights.reduce((a, b) => a + b, 0);
  let x = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    x -= weights[i];
    if (x < 0) return items[i];
  }
  return items[items.length - 1];
}

export function randomPiece(level = 1): Piece {
  const shape = pick(SHAPES, shapeWeights(level));
  return { id: `p${counter++}`, shape, color: Math.floor(Math.random() * COLORS) };
}

/**
 * Deal three pieces. Fair by design: if the board is given, at least one of
 * them always fits, so you lose because you ran out of room — not to bad luck.
 */
export function newTray(level = 1, board?: Board): Piece[] {
  for (let attempt = 0; attempt < 30; attempt++) {
    const tray = [randomPiece(level), randomPiece(level), randomPiece(level)];
    if (!board || tray.some((p) => fitsAnywhere(board, p.shape))) return tray;
  }
  // Last resort: guarantee a single block (fits whenever any cell is empty).
  return [{ id: `p${counter++}`, shape: SHAPES[0], color: 0 }, randomPiece(level), randomPiece(level)];
}

export function canPlace(board: Board, shape: Shape, row: number, col: number) {
  return shape.every(([r, c]) => {
    const rr = row + r;
    const cc = col + c;
    return rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE && board[rr][cc] === null;
  });
}

export function fitsAnywhere(board: Board, shape: Shape) {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (canPlace(board, shape, r, c)) return true;
  return false;
}

export interface PlaceResult {
  board: Board;
  linesCleared: number;
  clearedCells: [number, number][];
  points: number;
  /** The board was completely emptied by this move. */
  perfect: boolean;
}

/** Bonus for emptying the whole board. */
export const PERFECT_BONUS = 100;

/** Place a piece, clear full rows/columns, and score it. `combo` is the current streak. */
export function place(board: Board, piece: Piece, row: number, col: number, combo: number): PlaceResult {
  const next = board.map((r) => [...r]);
  for (const [r, c] of piece.shape) next[row + r][col + c] = piece.color;

  const fullRows = next.map((r, i) => (r.every((x) => x !== null) ? i : -1)).filter((i) => i >= 0);
  const fullCols = Array.from({ length: SIZE }, (_, c) => c).filter((c) => next.every((r) => r[c] !== null));

  const cleared: [number, number][] = [];
  for (const r of fullRows) for (let c = 0; c < SIZE; c++) cleared.push([r, c]);
  for (const c of fullCols) for (let r = 0; r < SIZE; r++) cleared.push([r, c]);
  for (const [r, c] of cleared) next[r][c] = null;

  const lines = fullRows.length + fullCols.length;
  const perfect = lines > 0 && next.every((row) => row.every((x) => x === null));
  // 1 point per placed cell; lines score 10 × lines², boosted by the combo streak;
  // emptying the board adds a perfect-clear bonus.
  const points = piece.shape.length + (lines ? 10 * lines * lines * (1 + combo) : 0) + (perfect ? PERFECT_BONUS * (1 + combo) : 0);
  return { board: next, linesCleared: lines, clearedCells: cleared, points, perfect };
}

export const shapeSize = (shape: Shape) => ({
  rows: Math.max(...shape.map(([r]) => r)) + 1,
  cols: Math.max(...shape.map(([, c]) => c)) + 1,
});
