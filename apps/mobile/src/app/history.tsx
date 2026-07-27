import { StatusBar } from 'expo-status-bar';

import { HistoryScreen } from '@/features/history/HistoryScreen';

export default function HistoryRoute() {
  return (
    <>
      <StatusBar style="auto" />
      <HistoryScreen />
    </>
  );
}
