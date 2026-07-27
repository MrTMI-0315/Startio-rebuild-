import { StatusBar } from 'expo-status-bar';

import { CompletionScreen } from '@/features/completion/CompletionScreen';
import { FlowRouteBoundary } from '@/features/session/FlowRouteBoundary';

export default function DoneRoute() {
  return (
    <>
      <StatusBar style="auto" />
      <FlowRouteBoundary target="/done">
        <CompletionScreen />
      </FlowRouteBoundary>
    </>
  );
}
