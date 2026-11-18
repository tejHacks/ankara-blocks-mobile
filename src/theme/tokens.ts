/**
 * Ankara Blocks — design tokens ("Ankara Night Market").
 * Every screen reads from here: no hard-coded colours, sizes or timings.
 */

/* ── Colour ─────────────────────────────────────────────────────────────── */

export const palette = {
  night900: '#0E0B2E',
  night800: '#1B1650',
  night700: '#2A2470',
  night600: '#3B348F',
  ink: '#FFF8EC',
  inkMuted: '#CFC8E8', // 11.8:1 on night900 (AAA)
  inkSubtle: '#A39CC7', // 7.4:1 on night900 (AAA)
  gold: '#F5B82E',
  goldDeep: '#C98A0A',
  danger: '#FF6B6B',
  success: '#4ADE80',
  white: '#FFFFFF',
  black: '#000000',
} as const;

/** Wax-print block colours: base, top highlight, bottom lip, motif ink.
 *  Every base is ≥ 3:1 against the board (night800), checked. */
export const blocks = [
  { name: 'cobalt', base: '#4170F0', light: '#6B93F7', shadow: '#2848A8', motif: '#FDE68A' },
  { name: 'marigold', base: '#F2A81D', light: '#FFC94D', shadow: '#B37306', motif: '#7C2D12' },
  { name: 'emerald', base: '#0E9F6E', light: '#34C38F', shadow: '#076B4A', motif: '#FDE68A' },
  { name: 'terracotta', base: '#D9572B', light: '#F07C52', shadow: '#99361A', motif: '#FED7AA' },
  { name: 'magenta', base: '#C2287A', light: '#E0559C', shadow: '#861853', motif: '#FBCFE8' },
  { name: 'teal', base: '#0F8A99', light: '#2FB2C2', shadow: '#09606B', motif: '#FDE68A' },
] as const;

export const motifs = ['dot', 'diamond', 'ring'] as const;

export const colors = {
  /** The app is dark-first; a light variant is provided for menus/sheets. */
  dark: {
    background: palette.night900,
    backgroundRaised: palette.night800,
    board: palette.night800,
    cellEmpty: 'rgba(255,255,255,0.06)',
    cellGhostValid: 'rgba(245,184,46,0.35)',
    cellGhostInvalid: 'rgba(255,107,107,0.30)',
    cellClearHighlight: 'rgba(255,248,236,0.22)',
    border: 'rgba(255,255,255,0.10)',
    text: palette.ink,
    textMuted: palette.inkMuted,
    textSubtle: palette.inkSubtle,
    accent: palette.gold,
    onAccent: palette.night900,
    danger: palette.danger,
    success: palette.success,
    scrim: 'rgba(8,6,28,0.72)',
    pattern: 'rgba(245,184,46,0.06)',
  },
  light: {
    background: '#FFF8EC',
    backgroundRaised: '#FFFFFF',
    board: palette.night800,
    cellEmpty: 'rgba(255,255,255,0.06)',
    cellGhostValid: 'rgba(245,184,46,0.35)',
    cellGhostInvalid: 'rgba(255,107,107,0.30)',
    cellClearHighlight: 'rgba(255,248,236,0.22)',
    border: 'rgba(14,11,46,0.12)',
    text: palette.night900,
    textMuted: '#4A4470',
    textSubtle: '#6B6593',
    accent: palette.goldDeep,
    onAccent: palette.white,
    danger: '#D93636',
    success: '#16A34A',
    scrim: 'rgba(14,11,46,0.5)',
    pattern: 'rgba(14,11,46,0.05)',
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type Colors = (typeof colors)[ColorScheme];

/* ── Typography ─────────────────────────────────────────────────────────── */

export const fonts = {
  display: 'LilitaOne_400Regular',
  body: 'Nunito_500Medium',
  bodyBold: 'Nunito_700Bold',
  bodyBlack: 'Nunito_900Black',
} as const;

/** Type scale (size / line height), 1.25 ratio. */
export const type = {
  hero: { fontFamily: fonts.display, fontSize: 56, lineHeight: 60 },
  score: { fontFamily: fonts.display, fontSize: 44, lineHeight: 48 },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38 },
  heading: { fontFamily: fonts.bodyBlack, fontSize: 22, lineHeight: 28 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.bodyBlack, fontSize: 12, lineHeight: 16, letterSpacing: 1.4, textTransform: 'uppercase' as const },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
} as const;

/* ── Space, size, shape ─────────────────────────────────────────────────── */

/** 4/8 grid. */
export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 } as const;

export const radius = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999, block: 0.22 /* × block size */ } as const;

export const size = {
  touchMin: 44,
  boardMax: 440,
  boardPadding: 8,
  cellGap: 3,
  trayBlock: 26,
  trayBlockDragging: 1, // dragged pieces scale up to board cell size
  iconButton: 48,
} as const;

/* ── Elevation ──────────────────────────────────────────────────────────── */

export const elevation = {
  board: { shadowColor: palette.black, shadowOpacity: 0.45, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 12 },
  sheet: { shadowColor: palette.black, shadowOpacity: 0.5, shadowRadius: 32, shadowOffset: { width: 0, height: -8 }, elevation: 24 },
  lifted: { shadowColor: palette.black, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 16 },
} as const;

/* ── Motion ─────────────────────────────────────────────────────────────── */

export const duration = { instant: 80, fast: 160, base: 240, slow: 420, clearSweep: 280, comboBanner: 900, shake: 260 } as const;

/** Reanimated spring configs. */
export const springs = {
  pickUp: { damping: 14, stiffness: 320, mass: 0.6 },
  snap: { damping: 12, stiffness: 420, mass: 0.5 }, // small overshoot on place
  returnToTray: { damping: 18, stiffness: 260, mass: 0.7 },
  pop: { damping: 9, stiffness: 300, mass: 0.6 }, // combo banner, new best
} as const;

export const easing = {
  /** cubic-bezier(0.16, 1, 0.3, 1) */
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const effects = {
  pickUpScale: 1.12,
  shakeAmplitude: 6, // px, only on 2+ line clears
  particlesPerCell: 3,
  particleLifetime: 650,
} as const;
