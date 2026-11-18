import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Block } from '@/game/block';
import { levelForXp, usePinnedTheme, useXp, xpForLevel } from '@/game/progress';
import { allThemes, MAX_LEVEL, themeForLevel } from '@/game/themes';
import { radius, space, type } from '@/theme/tokens';

const THEMES = allThemes();

/** Every design you've unlocked (and what's next). Tap one to play with it. */
export default function Designs() {
  const [xp] = useXp();
  const [pinned, setPinned] = usePinnedTheme();
  const level = levelForXp(xp);
  const active = pinned > 0 && pinned <= level ? pinned : level;
  const current = themeForLevel(active);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: current.background }}>
      <View style={styles.top}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} style={[styles.back, { backgroundColor: current.backgroundRaised }]}>
          <Text style={[type.heading, { color: '#FFF8EC' }]}>‹</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[type.title, { color: '#FFF8EC' }]}>Designs</Text>
          <Text style={[type.caption, { color: '#CFC8E8' }]}>
            {level} of {MAX_LEVEL} unlocked · level up to unlock more
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => setPinned(0)}
        accessibilityRole="radio"
        accessibilityState={{ checked: pinned === 0 }}
        style={[styles.auto, { borderColor: pinned === 0 ? current.accent : 'rgba(255,255,255,0.12)' }]}>
        <Text style={[type.bodyStrong, { color: '#FFF8EC' }]}>Always use my latest unlock</Text>
        <View style={[styles.radio, { borderColor: current.accent, backgroundColor: pinned === 0 ? current.accent : 'transparent' }]} />
      </Pressable>

      <FlatList
        data={THEMES}
        keyExtractor={(t) => String(t.level)}
        numColumns={2}
        contentContainerStyle={{ padding: space[4], gap: space[3], paddingBottom: space[12] }}
        columnWrapperStyle={{ gap: space[3] }}
        renderItem={({ item: t }) => {
          const unlocked = t.level <= level;
          const selected = t.level === active && pinned > 0;
          return (
            <Pressable
              disabled={!unlocked}
              onPress={() => setPinned(t.level)}
              accessibilityRole="button"
              accessibilityLabel={unlocked ? `Level ${t.level}, ${t.name}${selected ? ', in use' : ''}` : `Level ${t.level}, locked. ${xpForLevel(t.level) - xp} XP to unlock`}
              style={[styles.card, { backgroundColor: t.background, borderColor: selected ? t.accent : 'rgba(255,255,255,0.10)', opacity: unlocked ? 1 : 0.55 }]}>
              <View style={[styles.mini, { backgroundColor: t.board }]}>
                {[0, 1, 2, 3, 4, 5].map((c) => (
                  <View key={c} style={{ margin: 2 }}>
                    {unlocked ? <Block color={c} size={22} theme={t} /> : <View style={{ width: 22, height: 22, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.08)' }} />}
                  </View>
                ))}
              </View>
              <Text style={[type.label, { color: t.accent }]}>Level {t.level}</Text>
              <Text style={[type.bodyStrong, { color: '#FFF8EC', fontSize: 14 }]} numberOfLines={1}>
                {unlocked ? t.family : 'Locked'}
              </Text>
              <Text style={[type.caption, { color: '#CFC8E8' }]} numberOfLines={1}>
                {unlocked ? t.variant : `${(xpForLevel(t.level) - xp).toLocaleString()} XP to go`}
              </Text>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingHorizontal: space[4], paddingTop: space[2] },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  auto: { marginHorizontal: space[4], marginTop: space[4], padding: space[4], borderRadius: radius.lg, borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  card: { flex: 1, padding: space[3], borderRadius: radius.lg, borderWidth: 2, gap: 2 },
  mini: { flexDirection: 'row', flexWrap: 'wrap', padding: 4, borderRadius: radius.md, marginBottom: space[2], width: 3 * 26 + 8 },
});
