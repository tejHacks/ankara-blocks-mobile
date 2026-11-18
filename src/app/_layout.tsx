import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';
import { Nunito_500Medium, Nunito_700Bold, Nunito_900Black } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { DarkTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { brand } from '@/brand';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

const c = colors.dark;

/** Dark-first "Ankara Night Market" shell: fonts, gestures, stack. */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ LilitaOne_400Regular, Nunito_500Medium, Nunito_700Bold, Nunito_900Black });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: c.background }}>
      <ThemeProvider value={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: c.background, card: c.background, text: c.text, primary: c.accent, border: c.border } }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background }, animation: 'fade' }}>
          {brand.screens.map((s) => (
            <Stack.Screen key={s.name} name={s.name} options={{ title: s.title }} />
          ))}
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
