# Ankara Blocks — Redesign notes (ui-v2)

Branch: `redesign/ui-v2`. Status: **phase 1–2 (audit + direction + tokens) — awaiting approval before build.**

## 1. Audit

### Screens and flows today

| # | Screen / state | Where | Notes |
|---|---|---|---|
| 1 | Game board + tray + score | `src/app/index.tsx` | The whole app is one screen |
| 2 | Piece selected | same | Only a thin border on the tray slot |
| 3 | Invalid placement | same | Error haptic only, no visual |
| 4 | Line clear / combo | same | Text flash `+40` / `Combo ×2!` — nothing moves |
| 5 | Game over | same | One line of grey text + "Play again" |
| 6 | First run | — | None. Rules aren't explained |
| — | Pause, settings, sound | — | Don't exist |

### Critique — what looks dated or inconsistent

1. **No identity.** System font, a generic white navigation header, and a flat maroon board. Nothing says "Ankara" except small motifs inside tiles.
2. **Interaction is tap-tap, not drag.** Selecting a piece then tapping a cell is slow and unclear; the brief calls for drag-and-drop with snap.
3. **Pieces in the tray are tiny** (18 px blocks) and hard to read; the selected state is just a 2 px border.
4. **No feedback on the moments that matter.** Placing, clearing a line and combos have no motion, no particles, no sound. A puzzle game lives or dies on this "juice."
5. **No ghost preview** of where a piece will land, and no highlight of rows/columns about to clear.
6. **Game over is an afterthought** — no final score card, no "new best!" celebration, no share.
7. **No onboarding, pause, settings, sound or reduce-motion handling.**
8. **Styles are inline magic numbers** (`#3B0A0A`, `padding: 8`, `borderRadius: 20`) instead of tokens.
9. **Contrast**: the "Pick a piece…" hint uses muted grey on near-black, borderline for AA at 14 px.

## 2. Design direction — "Ankara Night Market"

**Mood:** a lively evening market under string lights — bold wax-print colour against a deep indigo night, warm gold light, joyful and confident. Proudly Nigerian, never cartoonish.

**Palette:** deep indigo night (`#0E0B2E` → `#1B1650`) as the stage; six wax-print block colours (cobalt, marigold, emerald, terracotta, magenta, teal), each checked at ≥ 3:1 against the board (cobalt was brightened to pass); **gold** (`#F5B82E`) as the single accent for score, combos and primary actions. A subtle repeating Ankara pattern (diamonds + concentric rings) sits behind the board at 6% opacity.

**Type:**
- Display — **Lilita One** (chunky, rounded, joyful) for score, combo call-outs and titles.
- UI — **Nunito** (friendly, very legible) for everything else.

**Shape language:** soft-cornered squares everywhere (radius ≈ 22% of size). Blocks are "chunky": top highlight, darker bottom lip and an inner motif, so they feel like printed fabric tiles you can pick up.

**Motion personality:** springy and physical, but fast. Pieces lift and scale up when grabbed, snap with a small overshoot, lines sweep away left-to-right, then burst into fabric-coloured confetti. Two or more lines trigger a short screen shake and a combo banner. Every motion has a Reduce Motion fallback (fade only, no shake, no particles).

**Sound + haptics map:**

| Moment | Haptic | Sound |
|---|---|---|
| Pick up piece | selection | soft "tok" |
| Place | light impact | wooden "clack" |
| Invalid drop | error notification | low thud, piece springs back to tray |
| Clear 1 line | medium impact | shaker sweep |
| Combo (2+ lines / streak) | heavy impact | talking-drum hit, rising pitch per combo |
| New best / game over | success notification | short highlife-style sting |

### Screens to build

1. **Game** — dark stage, gold score in Lilita One, best score chip, board with ghost preview and clear-highlight, three large tray slots, drag-and-drop with Gesture Handler + Reanimated.
2. **Pause sheet** — resume, restart, sound/haptics toggles, how to play.
3. **Game over sheet** — final score, best, "New best!" celebration, play again, share score card.
4. **First run** — 3 quick swipeable cards (drag pieces · fill a line · chain combos) with Skip.
5. **States** — loading (font/sound preload) and reduce-motion variants.

## 3. Libraries this redesign would add

- `react-native-reanimated` + `react-native-gesture-handler` (already in the template) — drag, springs, particles
- `@expo-google-fonts/lilita-one`, `@expo-google-fonts/nunito` + `expo-font` — typography
- `expo-audio` — sound effects (original, synthesised like Beatpd's kit)

## 4. Token file

See `src/theme/tokens.ts` (added on this branch, not yet wired into screens).

## Open questions for you

1. Drag-and-drop **only**, or keep tap-to-place as an accessibility alternative? *(Default: keep both.)*
2. Ads: the brief says ad-supported — interstitial after every N games, or rewarded "continue" only? *(Default: rewarded continue only; nothing built until you decide.)*
