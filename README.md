# Ankara Blocks

> An endless block puzzle wrapped in Ankara patterns.

## What's built

- Playable **8×8 block puzzle**: 18 piece shapes, row/column clears, combo multiplier, game-over detection
- Ankara-patterned tiles (dots, diamonds, rings) in a six-colour wax-print palette
- Best score saved on-device; haptics on place, clear and invalid moves
- Pure, testable engine in `src/game/engine.ts`

## Next

- Drag-and-drop placement with Gesture Handler + Reanimated (currently tap piece → tap cell)
- Clear animations, original music and SFX (expo-audio), AdMob rewarded/interstitials

## Run it

```bash
npm install          # already done once after scaffolding
npx expo start       # then press i (iOS), a (Android) or w (web)
npm run typecheck
npx expo lint
```

Built on **Expo SDK 58** (React Native 0.88, React 19.3), Expo Router, TypeScript.
Everything is stored on-device with AsyncStorage (`src/lib/storage.ts`); there is no backend yet.

## Structure

- `src/app/` — screens (Expo Router; every file is a route)
- `src/brand.ts` — app name, brand colours, screen titles
- `src/theme.ts` — light/dark design tokens
- `src/components/ui.tsx` — shared UI primitives
