import { TimerScreen } from '@/features/timer/TimerScreen';
import { FlowRouteBoundary } from '@/features/session/FlowRouteBoundary';

export default function TimerRoute() {
  return (
    <FlowRouteBoundary target="/timer">
      <TimerScreen />
    </FlowRouteBoundary>
  );
}
