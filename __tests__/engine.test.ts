import { canPlace, emptyBoard, fitsAnywhere, newTray, place, shapeSize, SIZE, type Piece } from '@/game/engine';

const single: Piece = { id: 's', shape: [[0, 0]], color: 0 };
const bar3: Piece = { id: 'b', shape: [[0, 0], [0, 1], [0, 2]], color: 1 };
const square: Piece = { id: 'q', shape: [[0, 0], [0, 1], [1, 0], [1, 1]], color: 2 };

describe('placement rules', () => {
  it('allows a piece on empty cells inside the board', () => {
    expect(canPlace(emptyBoard(), bar3.shape, 0, 0)).toBe(true);
    expect(canPlace(emptyBoard(), bar3.shape, 7, 5)).toBe(true);
  });

  it('rejects pieces that hang off the board', () => {
    expect(canPlace(emptyBoard(), bar3.shape, 0, 6)).toBe(false);
    expect(canPlace(emptyBoard(), square.shape, 7, 0)).toBe(false);
    expect(canPlace(emptyBoard(), single.shape, -1, 0)).toBe(false);
  });

  it('rejects overlapping filled cells', () => {
    const b = place(emptyBoard(), single, 3, 3, 0).board;
    expect(canPlace(b, square.shape, 2, 2)).toBe(false);
    expect(canPlace(b, square.shape, 4, 4)).toBe(true);
  });
});

describe('scoring and clears', () => {
  it('scores one point per block with no clear', () => {
    const res = place(emptyBoard(), square, 0, 0, 0);
    expect(res.points).toBe(4);
    expect(res.linesCleared).toBe(0);
  });

  it('clears a full row and scores 10 × lines²', () => {
    let b = emptyBoard();
    for (let c = 0; c < SIZE - 1; c++) b = place(b, single, 2, c, 0).board;
    const res = place(b, single, 2, SIZE - 1, 0);
    expect(res.linesCleared).toBe(1);
    expect(res.points).toBe(1 + 10);
    expect(res.board[2].every((x) => x === null)).toBe(true);
  });

  it('clears a row and a column at once (2 lines → 40, boosted by combo)', () => {
    let b = emptyBoard();
    for (let i = 0; i < SIZE; i++) {
      if (i !== 4) b = place(b, single, 4, i, 0).board; // row 4 minus the crossing
      if (i !== 4) b = place(b, single, i, 4, 0).board; // column 4 minus the crossing
    }
    const res = place(b, single, 4, 4, 2);
    expect(res.linesCleared).toBe(2);
    expect(res.points).toBe(1 + 10 * 4 * (1 + 2));
    expect(res.board.flat().every((x) => x === null)).toBe(true);
  });

  it('does not mutate the original board', () => {
    const b = emptyBoard();
    place(b, square, 0, 0, 0);
    expect(b.flat().every((x) => x === null)).toBe(true);
  });
});

describe('game over detection', () => {
  it('knows when a piece fits nowhere', () => {
    let b = emptyBoard();
    // Checkerboard: no two adjacent free cells, so only singles fit.
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if ((r + c) % 2 === 0) b = place(b, single, r, c, 0).board;
    expect(fitsAnywhere(b, bar3.shape)).toBe(false);
    expect(fitsAnywhere(b, square.shape)).toBe(false);
    expect(fitsAnywhere(b, single.shape)).toBe(true);
  });
});

describe('tray', () => {
  it('deals three pieces with unique ids and valid colours', () => {
    const t = newTray();
    expect(t).toHaveLength(3);
    expect(new Set(t.map((p) => p.id)).size).toBe(3);
    t.forEach((p) => expect(p.color).toBeGreaterThanOrEqual(0));
  });

  it('measures shapes', () => {
    expect(shapeSize(bar3.shape)).toEqual({ rows: 1, cols: 3 });
    expect(shapeSize(square.shape)).toEqual({ rows: 2, cols: 2 });
  });
});
