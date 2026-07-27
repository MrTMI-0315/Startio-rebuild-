import { StatusBar } from 'expo-status-bar';

import { StartScreen } from '@/features/start/StartScreen';

export default function HomeScreen() {
  return (
    <>
      <StatusBar style="auto" />
      <StartScreen />
    </>
  );
}
