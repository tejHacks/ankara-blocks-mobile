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
export function randomPiece(): Piece {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { id: `p${counter++}`, shape, color: Math.floor(Math.random() * COLORS) };
}

export const newTray = () => [randomPiece(), randomPiece(), randomPiece()];

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
}

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
  // 1 point per placed cell; lines score 10 × lines², boosted by the combo streak.
  const points = piece.shape.length + (lines ? 10 * lines * lines * (1 + combo) : 0);
  return { board: next, linesCleared: lines, clearedCells: cleared, points };
}

export const shapeSize = (shape: Shape) => ({
  rows: Math.max(...shape.map(([r]) => r)) + 1,
  cols: Math.max(...shape.map(([, c]) => c)) + 1,
});
