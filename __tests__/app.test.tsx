import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import { resetStoredStateCache } from '@/lib/storage';

const APP = './src/app';

/** Select a tray piece the way a screen reader (or a tap) does. */
async function selectPiece(n: number) {
  await fireEvent(screen.getByLabelText(new RegExp(`^Piece ${n},`)), 'accessibilityAction', { nativeEvent: { actionName: 'activate' } });
}

async function tapCell(r: number, c: number) {
  await fireEvent.press(screen.getByLabelText(new RegExp(`^Row ${r}, column ${c},`)));
}

async function startGame() {
  await AsyncStorage.setItem('onboarded', 'true');
  await renderRouter(APP, { initialUrl: '/' });
  await screen.findByLabelText('Score 0');
}

beforeEach(async () => {
  await AsyncStorage.clear();
  resetStoredStateCache();
  // Every dealt piece is a single block of colour 0 — predictable boards.
  jest.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => jest.restoreAllMocks());

describe('first launch', () => {
  it('shows How to play, and Skip starts the game', async () => {
    await renderRouter(APP, { initialUrl: '/' });
    expect(await screen.findByText('Drag pieces onto the board')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Skip'));
    expect(await screen.findByLabelText('Score 0')).toBeOnTheScreen();
    expect(await AsyncStorage.getItem('onboarded')).toBe('true');
  });
});

describe('playing', () => {
  it('tap a piece, then a cell, to place it', async () => {
    await startGame();
    await selectPiece(1);
    expect(screen.getByText(/Tap the board where the top-left block should go/)).toBeOnTheScreen();
    await tapCell(1, 1);
    expect(screen.getByLabelText('Score 1')).toBeOnTheScreen();
    expect(screen.getByLabelText('Row 1, column 1, filled')).toBeOnTheScreen();
  });

  it('refuses a move onto a filled cell', async () => {
    await startGame();
    await selectPiece(1);
    await tapCell(1, 1);
    await selectPiece(2);
    await tapCell(1, 1);
    expect(screen.getByLabelText('Score 1')).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Piece 2,.*selected/)).toBeOnTheScreen();
  });

  it('clears a full row — on an empty board that is a perfect clear — and deals a new tray', async () => {
    await startGame();
    for (let c = 1; c <= 8; c++) {
      const n = ((c - 1) % 3) + 1; // pieces 1, 2, 3 then a fresh tray
      await selectPiece(n);
      await tapCell(3, c);
    }
    // 8 blocks + 10 for the line + 100 perfect-clear bonus (the board is empty again)
    expect(screen.getByLabelText('Score 118')).toBeOnTheScreen();
    expect(screen.getAllByLabelText(/^Row 3, column \d, empty$/)).toHaveLength(8);
    expect(screen.getByLabelText('Best 118')).toBeOnTheScreen();
    expect(screen.getByText(/Perfect clear!/)).toBeOnTheScreen();
  });

  it('saves the best score', async () => {
    await startGame();
    await selectPiece(1);
    await tapCell(2, 2);
    expect(await AsyncStorage.getItem('best-score')).toBe('1');
  });
});

describe('levels', () => {
  it('earns XP as you score, and levels up with a celebration', async () => {
    await AsyncStorage.setItem('xp', '99'); // 1 XP short of level 2
    await startGame();
    expect(screen.getByLabelText(/^Level 1, Ankara Night · Dawn/)).toBeOnTheScreen();
    await selectPiece(1);
    await tapCell(1, 1);
    expect(await screen.findByText('Level up!')).toBeOnTheScreen();
    expect(screen.getAllByText('Ankara Night · Market').length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/^Level 2, Ankara Night · Market/)).toBeOnTheScreen();
    expect(await AsyncStorage.getItem('xp')).toBe('100');
  });

  it('shows unlocked and locked designs, and lets you pick one', async () => {
    await AsyncStorage.setItem('xp', '320'); // level 3
    await AsyncStorage.setItem('onboarded', 'true');
    await renderRouter(APP, { initialUrl: '/designs' });
    expect(await screen.findByText(/3 of 50 unlocked/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Level 4, locked/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByLabelText(/^Level 1, Ankara Night · Dawn/));
    expect(await AsyncStorage.getItem('pinned-theme')).toBe('1');
  });
});

describe('pause', () => {
  it('opens the pause sheet and Restart resets the game', async () => {
    await startGame();
    await selectPiece(1);
    await tapCell(1, 1);
    await fireEvent.press(screen.getByLabelText('Pause'));
    expect(await screen.findByText('Paused')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Restart'));
    expect(await screen.findByLabelText('Score 0')).toBeOnTheScreen();
    expect(screen.queryByText('Paused')).toBeNull();
  });

  it('toggles sound off and remembers it', async () => {
    await startGame();
    await fireEvent.press(screen.getByLabelText('Pause'));
    await fireEvent(screen.getByLabelText('Sound'), 'valueChange', false);
    expect(JSON.parse((await AsyncStorage.getItem('settings'))!)).toEqual({ sound: false, haptics: true, music: true });
  });
});
