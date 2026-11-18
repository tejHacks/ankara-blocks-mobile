import { router } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Block } from '@/game/block';
import { GameButton } from '@/game/sheets';
import { themeForLevel } from '@/game/themes';
import { useStoredState } from '@/lib/storage';
import { colors, space, type } from '@/theme/tokens';

const c = colors.dark;
const B = 34;
const T1 = themeForLevel(1);

/** Mini illustrations built from real game blocks. */
function Grid({ cells, highlight }: { cells: [number, number, number][]; highlight?: number }) {
  return (
    <View style={{ width: B * 5, height: B * 4 }}>
      {Array.from({ length: 20 }, (_, i) => (
        <View key={i} style={{ position: 'absolute', left: (i % 5) * B + 2, top: Math.floor(i / 5) * B + 2, width: B - 4, height: B - 4, borderRadius: 7, backgroundColor: highlight === Math.floor(i / 5) ? c.cellClearHighlight : c.cellEmpty }} />
      ))}
      {cells.map(([r, col, color]) => (
        <View key={`${r}-${col}`} style={{ position: 'absolute', left: col * B + 2, top: r * B + 2 }}>
          <Block color={color} size={B - 4} theme={T1} />
        </View>
      ))}
    </View>
  );
}

export const cards: { key: string; title: string; body: string; art: ReactNode }[] = [
  {
    key: 'drag',
    title: 'Drag pieces onto the board',
    body: 'Pick any of the three pieces and drop it where it fits. Prefer tapping? Tap a piece, then tap a spot.',
    art: <Grid cells={[[1, 1, 0], [1, 2, 0], [2, 1, 0], [2, 2, 0], [3, 3, 4]]} />,
  },
  {
    key: 'clear',
    title: 'Fill a row or column',
    body: 'Complete a full line and it clears in a burst of colour.',
    art: <Grid highlight={2} cells={[[2, 0, 1], [2, 1, 2], [2, 2, 3], [2, 3, 5], [2, 4, 1], [3, 1, 0]]} />,
  },
  {
    key: 'combo',
    title: 'Chain clears for combos',
    body: 'Clear lines on back-to-back moves to multiply your points. Empty the whole board for a perfect-clear bonus.',
    art: <Grid cells={[[0, 0, 4], [1, 0, 4], [2, 0, 4], [3, 0, 4], [3, 1, 2], [3, 2, 2], [3, 3, 5], [3, 4, 5]]} />,
  },
  {
    key: 'levels',
    title: '50 levels, 50 designs',
    body: 'Every point is XP. Level up to unlock a new fabric design — and new sounds every five levels.',
    art: (
      <View style={{ gap: 8 }}>
        {[1, 11, 26, 41].map((lv) => {
          const t = themeForLevel(lv);
          return (
            <View key={lv} style={{ flexDirection: 'row', gap: 4, padding: 4, borderRadius: 10, backgroundColor: t.board }}>
              {[0, 1, 2, 3, 4].map((c) => (
                <Block key={c} color={c} size={26} theme={t} />
              ))}
            </View>
          );
        })}
      </View>
    ),
  },
];

export default function HowToPlay() {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [listHeight, setListHeight] = useState(0);
  const [, setOnboarded] = useStoredState('onboarded', false);
  const list = useRef<FlatList>(null);
  const last = index === cards.length - 1;

  const done = () => {
    setOnboarded(true);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={styles.top}>
        <Text style={[type.heading, { color: c.accent }]}>Ankara Blocks</Text>
        {!last ? (
          <Pressable onPress={done} accessibilityRole="button" hitSlop={12}>
            <Text style={[type.bodyStrong, { color: c.textMuted }]}>Skip</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        ref={list}
        data={cards}
        keyExtractor={(x) => x.key}
        style={{ flex: 1 }}
        onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.card, { width, height: listHeight || undefined }]}>
            <View style={styles.artWrap}>{item.art}</View>
            <Text style={[type.title, { color: c.text, textAlign: 'center' }]}>{item.title}</Text>
            <Text style={[type.body, { color: c.textMuted, textAlign: 'center', maxWidth: 320 }]}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots} accessibilityLabel={`Step ${index + 1} of ${cards.length}`}>
          {cards.map((x, i) => (
            <View key={x.key} style={[styles.dot, { width: i === index ? 24 : 8, backgroundColor: i === index ? c.accent : c.border }]} />
          ))}
        </View>
        <GameButton
          title={last ? 'Let’s play' : 'Next'}
          onPress={() => {
            if (last) return done();
            list.current?.scrollToIndex({ index: index + 1, animated: true });
            setIndex(index + 1);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space[6], height: 48 },
  card: { alignItems: 'center', justifyContent: 'center', gap: space[4], paddingHorizontal: space[8] },
  artWrap: { padding: space[5], borderRadius: 28, backgroundColor: c.board, marginBottom: space[4] },
  footer: { paddingHorizontal: space[6], paddingBottom: space[4], gap: space[4] },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
});
