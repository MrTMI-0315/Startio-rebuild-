import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_600SemiBold,
  NotoSansKR_700Bold,
} from '@expo-google-fonts/noto-sans-kr';
import { NotoSerif_400Regular } from '@expo-google-fonts/noto-serif';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppearanceProvider } from '@/design/appearance';
import { useThemeTokens } from '@/design/tokens';
import { StartioFlowProvider } from '@/features/session/StartioFlowProvider';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_600SemiBold,
    NotoSansKR_700Bold,
    NotoSerif_400Regular,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppearanceProvider>
        <StartioFlowProvider>
          <RootNavigator />
        </StartioFlowProvider>
      </AppearanceProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const tokens = useThemeTokens();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: tokens.reduceMotion ? 'none' : 'fade',
        contentStyle: { backgroundColor: tokens.colors.background },
      }}
    >
      <Stack.Screen name="plan" options={{ gestureEnabled: false }} />
      <Stack.Screen name="timer" options={{ gestureEnabled: false }} />
      <Stack.Screen name="done" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
