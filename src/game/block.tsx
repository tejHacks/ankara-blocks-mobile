import { StyleSheet, View } from 'react-native';

import { radius } from '@/theme/tokens';
import type { Motif, Theme } from './themes';

/**
 * A chunky wax-print tile from the current level's design: base colour,
 * top highlight, darker bottom lip, and a motif (so colour is never the only cue).
 */
export function Block({ color, size, theme, ghost = false }: { color: number; size: number; theme: Theme; ghost?: boolean }) {
  const b = theme.blocks[color % theme.blocks.length];
  const r = size * radius.block;
  return (
    <View style={{ width: size, height: size, borderRadius: r, backgroundColor: b.shadow, opacity: ghost ? 0.45 : 1 }}>
      <View style={[styles.face, { borderRadius: r, backgroundColor: b.base, bottom: size * 0.09 }]}>
        <View style={[styles.highlight, { height: size * 0.22, borderTopLeftRadius: r, borderTopRightRadius: r, backgroundColor: b.light }]} />
        <MotifMark kind={theme.motifs[color % 3]} size={size} ink={b.motif} />
      </View>
    </View>
  );
}

function MotifMark({ kind, size, ink }: { kind: Motif; size: number; ink: string }) {
  const m = size * 0.34;
  const stroke = Math.max(2, size * 0.075);
  switch (kind) {
    case 'dot':
      return <View style={{ width: m, height: m, borderRadius: m / 2, backgroundColor: ink }} />;
    case 'diamond':
      return <View style={{ width: m, height: m, transform: [{ rotate: '45deg' }], borderWidth: stroke, borderColor: ink }} />;
    case 'ring':
      return <View style={{ width: m * 1.25, height: m * 1.25, borderRadius: m, borderWidth: stroke, borderColor: ink }} />;
    case 'bars':
      return (
        <View style={{ gap: stroke * 0.9 }}>
          <View style={{ width: m * 1.3, height: stroke, borderRadius: stroke, backgroundColor: ink }} />
          <View style={{ width: m * 1.3, height: stroke, borderRadius: stroke, backgroundColor: ink }} />
        </View>
      );
    case 'cross':
      return (
        <View style={{ width: m * 1.2, height: m * 1.2, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: m * 1.2, height: stroke, borderRadius: stroke, backgroundColor: ink }} />
          <View style={{ position: 'absolute', width: stroke, height: m * 1.2, borderRadius: stroke, backgroundColor: ink }} />
        </View>
      );
    case 'chevron':
      return <View style={{ width: m * 0.9, height: m * 0.9, marginTop: m * 0.35, borderLeftWidth: stroke, borderTopWidth: stroke, borderColor: ink, transform: [{ rotate: '45deg' }] }} />;
  }
}

const styles = StyleSheet.create({
  face: { position: 'absolute', left: 0, right: 0, top: 0, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  highlight: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0.55 },
});
