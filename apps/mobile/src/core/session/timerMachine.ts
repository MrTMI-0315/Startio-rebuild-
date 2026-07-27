import type { ActionPlan, StepOrder } from '../coaching/result.ts';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed' | 'abandoned';

export interface CompletedStepTiming {
  stepOrder: StepOrder;
  plannedMs: number;
  activeMs: number;
  varianceMs: number;
  completedAt: number;
}

export interface TimerState {
  status: TimerStatus;
  currentStepOrder: StepOrder;
  completedStepCount: 0 | 1 | 2 | 3;
  stepTimings: readonly CompletedStepTiming[];
  startedAt: number | null;
  pausedAt: number | null;
  accumulatedPausedMs: number;
  completedAt: number | null;
  abandonedAt: number | null;
}

export function createTimerState(): TimerState {
  return {
    status: 'idle',
    currentStepOrder: 1,
    completedStepCount: 0,
    stepTimings: [],
    startedAt: null,
    pausedAt: null,
    accumulatedPausedMs: 0,
    completedAt: null,
    abandonedAt: null,
  };
}

export function startTimer(state: TimerState, now: number): TimerState {
  if (state.status !== 'idle') {
    return state;
  }

  return {
    ...state,
    status: 'running',
    startedAt: now,
    pausedAt: null,
    accumulatedPausedMs: 0,
  };
}

export function pauseTimer(state: TimerState, now: number): TimerState {
  if (state.status !== 'running') {
    return state;
  }

  return {
    ...state,
    status: 'paused',
    pausedAt: now,
  };
}

export function resumeTimer(state: TimerState, now: number): TimerState {
  if (state.status !== 'paused' || state.pausedAt === null) {
    return state;
  }

  return {
    ...state,
    status: 'running',
    pausedAt: null,
    accumulatedPausedMs: state.accumulatedPausedMs + Math.max(0, now - state.pausedAt),
  };
}

export function getRemainingMs(
  state: TimerState,
  plan: ActionPlan,
  now: number,
): number {
  const step = plan.steps[state.currentStepOrder - 1];
  const durationMs = step.timerSeconds * 1000;

  if (state.status === 'idle') {
    return durationMs;
  }

  if (state.status === 'completed') {
    return 0;
  }

  const elapsedMs = getActiveElapsedMs(state, now);

  return Math.max(0, durationMs - elapsedMs);
}

export function getActiveElapsedMs(state: TimerState, now: number): number {
  const effectiveNow =
    state.status === 'paused' && state.pausedAt !== null ? state.pausedAt : now;

  return state.startedAt === null
    ? 0
    : Math.max(0, effectiveNow - state.startedAt - state.accumulatedPausedMs);
}

export function getOvertimeMs(
  state: TimerState,
  plan: ActionPlan,
  now: number,
): number {
  const step = plan.steps[state.currentStepOrder - 1];
  return Math.max(0, getActiveElapsedMs(state, now) - step.timerSeconds * 1000);
}

export function getStepProgress(
  state: TimerState,
  plan: ActionPlan,
  now: number,
): number {
  const step = plan.steps[state.currentStepOrder - 1];
  return Math.min(1, getActiveElapsedMs(state, now) / (step.timerSeconds * 1000));
}

export function completeCurrentStep(
  state: TimerState,
  plan: ActionPlan,
  now: number,
): TimerState {
  if (
    state.status !== 'running' &&
    state.status !== 'paused'
  ) {
    return state;
  }

  const step = plan.steps[state.currentStepOrder - 1];
  const plannedMs = step.timerSeconds * 1000;
  const activeMs = getActiveElapsedMs(state, now);
  const completedTiming: CompletedStepTiming = {
    stepOrder: state.currentStepOrder,
    plannedMs,
    activeMs,
    varianceMs: activeMs - plannedMs,
    completedAt: now,
  };
  const stepTimings = [...(state.stepTimings ?? []), completedTiming];

  if (state.currentStepOrder === 3) {
    return {
      ...state,
      status: 'completed',
      completedStepCount: 3,
      stepTimings,
      completedAt: now,
      pausedAt: null,
    };
  }

  const nextStepOrder = (state.currentStepOrder + 1) as StepOrder;
  const completedStepCount = state.currentStepOrder as 1 | 2;

  return {
    ...state,
    status: 'idle',
    currentStepOrder: nextStepOrder,
    completedStepCount,
    stepTimings,
    startedAt: null,
    pausedAt: null,
    accumulatedPausedMs: 0,
  };
}

export function abandonTimer(state: TimerState, now: number): TimerState {
  if (state.status === 'completed' || state.status === 'abandoned') {
    return state;
  }

  return {
    ...state,
    status: 'abandoned',
    abandonedAt: now,
    pausedAt: null,
  };
}

export function restartAbandonedTimer(state: TimerState): TimerState {
  if (state.status !== 'abandoned') {
    return state;
  }

  return {
    ...state,
    status: 'idle',
    startedAt: null,
    pausedAt: null,
    accumulatedPausedMs: 0,
    abandonedAt: null,
  };
}
