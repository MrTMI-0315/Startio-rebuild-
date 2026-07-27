import type { PlanResult } from '../coaching/result.ts';
import type { TimerState } from './timerMachine.ts';

export type GuardedFlowRoute = '/plan' | '/timer' | '/done';
export type FlowRouteDecision =
  | { kind: 'pending' }
  | { kind: 'allow' }
  | { kind: 'redirect'; href: '/' | '/timer' | '/done' };

export function resolveFlowRoute(input: {
  target: GuardedFlowRoute;
  isHydrated: boolean;
  result: PlanResult | null;
  timerState: TimerState | null;
}): FlowRouteDecision {
  if (!input.isHydrated) {
    return { kind: 'pending' };
  }

  if (input.result?.kind !== 'plan_allowed' || !input.timerState) {
    return { kind: 'redirect', href: '/' };
  }

  if (input.timerState.status === 'completed') {
    return input.target === '/done'
      ? { kind: 'allow' }
      : { kind: 'redirect', href: '/done' };
  }

  if (input.target === '/done') {
    return { kind: 'redirect', href: '/timer' };
  }

  if (
    input.target === '/plan' &&
    (input.timerState.status !== 'idle' ||
      input.timerState.currentStepOrder !== 1 ||
      input.timerState.completedStepCount !== 0)
  ) {
    return { kind: 'redirect', href: '/timer' };
  }

  return { kind: 'allow' };
}
