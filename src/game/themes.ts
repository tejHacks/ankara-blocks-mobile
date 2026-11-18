/**
 * 50 level designs: 10 fabric families × 5 variants.
 * Level 1 is "Ankara Night · Dawn"; every level unlocks the next design.
 * Block colours are lightened automatically until they reach 3:1 contrast
 * against their board (checked in __tests__/themes.test.ts).
 */

export const MAX_LEVEL = 50;

export type Motif = 'dot' | 'diamond' | 'ring' | 'bars' | 'cross' | 'chevron';

export interface BlockColor {
  base: string;
  light: string;
  shadow: string;
  motif: string;
}

export interface Theme {
  level: number;
  family: string;
  variant: string;
  name: string;
  background: string;
  backgroundRaised: string;
  board: string;
  cellEmpty: string;
  pattern: string;
  accent: string;
  onAccent: string;
  blocks: BlockColor[];
  motifs: [Motif, Motif, Motif];
  /** Sound pack index (one per family). */
  soundPack: number;
}

interface Family {
  name: string;
  background: string;
  board: string;
  accent: string;
  blocks: string[]; // six base colours
  motifs: [Motif, Motif, Motif];
}

const FAMILIES: Family[] = [
  { name: 'Ankara Night', background: '#0E0B2E', board: '#1B1650', accent: '#F5B82E', blocks: ['#4170F0', '#F2A81D', '#0E9F6E', '#D9572B', '#C2287A', '#0F8A99'], motifs: ['dot', 'diamond', 'ring'] },
  { name: 'Adire Indigo', background: '#081630', board: '#122650', accent: '#9CC9FF', blocks: ['#5B8DEF', '#38BDF8', '#E2E8F0', '#818CF8', '#2DD4BF', '#A78BFA'], motifs: ['ring', 'bars', 'dot'] },
  { name: 'Kente Gold', background: '#170F04', board: '#2A1C09', accent: '#F5B82E', blocks: ['#F5B82E', '#16A34A', '#E23B3B', '#3B82F6', '#EA580C', '#FDE68A'], motifs: ['bars', 'diamond', 'cross'] },
  { name: 'Aso-Oke Coral', background: '#22060E', board: '#3A0D1A', accent: '#FB7185', blocks: ['#FB7185', '#F43F5E', '#FDBA74', '#C026D3', '#FDE4CF', '#F472B6'], motifs: ['chevron', 'dot', 'ring'] },
  { name: 'Bògòlan Earth', background: '#1A120B', board: '#2E2015', accent: '#D6A15C', blocks: ['#D9622B', '#CA8A04', '#E7C9A0', '#B7791F', '#84A98C', '#C2672A'], motifs: ['cross', 'bars', 'dot'] },
  { name: 'Lagos Neon', background: '#05060F', board: '#10122A', accent: '#22D3EE', blocks: ['#22D3EE', '#F472B6', '#A3E635', '#8B5CF6', '#FACC15', '#FB923C'], motifs: ['diamond', 'ring', 'chevron'] },
  { name: 'Harmattan Haze', background: '#241C14', board: '#3A2E22', accent: '#FCD34D', blocks: ['#F59E0B', '#EA7A4A', '#A3B14A', '#93C5FD', '#FDE68A', '#E07A5F'], motifs: ['dot', 'bars', 'diamond'] },
  { name: 'Ọ̀ṣun River', background: '#031F1C', board: '#073A34', accent: '#FDE047', blocks: ['#FACC15', '#14B8A6', '#5EEAD4', '#10B981', '#F59E0B', '#A7F3D0'], motifs: ['ring', 'chevron', 'dot'] },
  { name: 'Calabar Carnival', background: '#1C0430', board: '#2E0A4D', accent: '#F0ABFC', blocks: ['#D946EF', '#FACC15', '#22C55E', '#EF4444', '#3B82F6', '#F97316'], motifs: ['diamond', 'cross', 'ring'] },
  { name: 'Savannah Dusk', background: '#2A1507', board: '#3D2110', accent: '#FB923C', blocks: ['#F97316', '#EAB308', '#65A30D', '#A855F7', '#EF4444', '#60A5FA'], motifs: ['chevron', 'diamond', 'bars'] },
];

const VARIANTS = ['Dawn', 'Market', 'Festival', 'Royal', 'Midnight'] as const;
const ALL_MOTIFS: Motif[] = ['dot', 'diamond', 'ring', 'bars', 'cross', 'chevron'];

/* ── colour helpers ─────────────────────────────────────────────────────── */

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]: number[]) {
  return `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}
/** Mix towards white (amount > 0) or black (amount < 0). */
export function shade(hex: string, amount: number) {
  const [r, g, b] = hexToRgb(hex);
  const t = amount > 0 ? 255 : 0;
  const a = Math.abs(amount);
  return rgbToHex([r + (t - r) * a, g + (t - g) * a, b + (t - b) * a]);
}
function luminance(hex: string) {
  const f = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = hexToRgb(hex).map(f);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

function block(base: string, board: string): BlockColor {
  let b = base;
  for (let i = 0; i < 12 && contrast(b, board) < 3; i++) b = shade(b, 0.08);
  const dark = luminance(b) > 0.45;
  return { base: b, light: shade(b, 0.28), shadow: shade(b, -0.35), motif: dark ? shade(b, -0.55) : shade(b, 0.75) };
}

/* ── theme builder ──────────────────────────────────────────────────────── */

export function themeForLevel(level: number): Theme {
  const L = Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
  const f = Math.floor((L - 1) / VARIANTS.length);
  const v = (L - 1) % VARIANTS.length;
  const fam = FAMILIES[f];

  // Each variant shifts mood, palette order and motifs so every level looks new.
  const bgShift = [0, 0.04, 0.02, -0.02, -0.25][v];
  const boardShift = [0, 0.06, 0.03, 0.08, -0.15][v];
  const background = bgShift >= 0 ? shade(fam.background, bgShift) : shade(fam.background, bgShift);
  const board = boardShift >= 0 ? shade(fam.board, boardShift) : shade(fam.board, boardShift);
  const rotated = fam.blocks.map((_, i) => fam.blocks[(i + v) % fam.blocks.length]);
  const palette = v === 2 ? rotated.map((c) => shade(c, 0.12)) : rotated;
  const motifs: [Motif, Motif, Motif] =
    v === 0 ? fam.motifs : (fam.motifs.map((m) => ALL_MOTIFS[(ALL_MOTIFS.indexOf(m) + v) % ALL_MOTIFS.length]) as [Motif, Motif, Motif]);
  const accent = v === 3 ? '#F5B82E' : fam.accent;

  return {
    level: L,
    family: fam.name,
    variant: VARIANTS[v],
    name: `${fam.name} · ${VARIANTS[v]}`,
    background,
    backgroundRaised: shade(board, 0.06),
    board,
    cellEmpty: 'rgba(255,255,255,0.06)',
    pattern: `${accent}14`,
    accent,
    onAccent: contrast(accent, '#0E0B2E') >= contrast(accent, '#FFFFFF') ? '#0E0B2E' : '#FFFFFF',
    blocks: palette.map((c) => block(c, board)),
    motifs,
    soundPack: f,
  };
}

export const allThemes = () => Array.from({ length: MAX_LEVEL }, (_, i) => themeForLevel(i + 1));
