import { StatusBar } from 'expo-status-bar';

import { PlanScreen } from '@/features/plan/PlanScreen';
import { FlowRouteBoundary } from '@/features/session/FlowRouteBoundary';

export default function PlanRoute() {
  return (
    <>
      <StatusBar style="auto" />
      <FlowRouteBoundary target="/plan">
        <PlanScreen />
      </FlowRouteBoundary>
    </>
  );
}
