import { StatusBar } from 'expo-status-bar';

import { SettingsScreen } from '@/features/settings/SettingsScreen';

export default function SettingsRoute() {
  return (
    <>
      <StatusBar style="auto" />
      <SettingsScreen />
    </>
  );
}
