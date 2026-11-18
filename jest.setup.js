/* global jest */
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
require('react-native-gesture-handler/jestSetup');
// Sound effects are not needed in tests.
jest.mock('expo-audio', () => ({
  createAudioPlayer: () => ({ play: jest.fn(), seekTo: jest.fn(() => Promise.resolve()), remove: jest.fn() }),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));
// Reanimated 4's official mock still loads native initialisers, so package.json maps
// 'react-native-reanimated/mock' (also used by expo-router's test mocks) to test/reanimated-mock.js.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
