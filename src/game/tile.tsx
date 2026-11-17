import { StyleSheet, View } from 'react-native';

/** Ankara-inspired palette and per-colour motif. */
export const ANKARA = ['#1E3A8A', '#EAB308', '#047857', '#C2410C', '#BE185D', '#0F766E'];
const MOTIF_INK = ['#FDE68A', '#7C2D12', '#FDE68A', '#FED7AA', '#FBCFE8', '#FDE68A'];

/** A single patterned block. Motif alternates between dot, diamond and ring. */
export function Tile({ color, size, ghost }: { color: number; size: number; ghost?: boolean }) {
  const ink = MOTIF_INK[color];
  const m = size * 0.34;
  const motif = color % 3;
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: size * 0.22, backgroundColor: ANKARA[color], opacity: ghost ? 0.4 : 1 }]}>
      {motif === 0 ? <View style={{ width: m, height: m, borderRadius: m / 2, backgroundColor: ink }} /> : null}
      {motif === 1 ? <View style={{ width: m, height: m, transform: [{ rotate: '45deg' }], borderWidth: Math.max(2, size * 0.07), borderColor: ink }} /> : null}
      {motif === 2 ? <View style={{ width: m * 1.3, height: m * 1.3, borderRadius: m, borderWidth: Math.max(2, size * 0.07), borderColor: ink }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center' },
});
