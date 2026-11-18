import { StyleSheet, View } from 'react-native';

import { blocks, radius } from '@/theme/tokens';

/**
 * A chunky wax-print tile: base colour, a top highlight, a darker bottom lip,
 * and a motif (dot / diamond / ring) so colour is never the only cue.
 */
export function Block({ color, size, ghost = false }: { color: number; size: number; ghost?: boolean }) {
  const b = blocks[color % blocks.length];
  const r = size * radius.block;
  const m = size * 0.34;
  const stroke = Math.max(2, size * 0.075);
  const motif = color % 3;

  return (
    <View style={{ width: size, height: size, borderRadius: r, backgroundColor: b.shadow, opacity: ghost ? 0.45 : 1 }}>
      <View style={[styles.face, { borderRadius: r, backgroundColor: b.base, bottom: size * 0.09 }]}>
        <View style={[styles.highlight, { height: size * 0.22, borderTopLeftRadius: r, borderTopRightRadius: r, backgroundColor: b.light }]} />
        {motif === 0 ? <View style={{ width: m, height: m, borderRadius: m / 2, backgroundColor: b.motif }} /> : null}
        {motif === 1 ? <View style={{ width: m, height: m, transform: [{ rotate: '45deg' }], borderWidth: stroke, borderColor: b.motif }} /> : null}
        {motif === 2 ? <View style={{ width: m * 1.25, height: m * 1.25, borderRadius: m, borderWidth: stroke, borderColor: b.motif }} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  face: { position: 'absolute', left: 0, right: 0, top: 0, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  highlight: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0.55 },
});
