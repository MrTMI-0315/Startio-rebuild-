import type { PlanAllowed } from '../coaching/result.ts';
import type { BehaviorEvent } from '../events/event.ts';
import {
  createCompletionState,
  type CompletionState,
} from './completion.ts';
import type { TimerState } from './timerMachine.ts';
import { isLocalProofPhoto } from '../storage/proofFileRepository.ts';

export const SESSION_SNAPSHOT_VERSION = 'session_snapshot_v0.3' as const;
const LEGACY_SESSION_SNAPSHOT_VERSIONS = new Set([
  'session_snapshot_v0.1',
  'session_snapshot_v0.2',
]);

export interface SessionSnapshot {
  version: typeof SESSION_SNAPSHOT_VERSION;
  sessionId: string;
  savedAt: string;
  product: {
    result: PlanAllowed;
    timerState: TimerState;
    completionState: CompletionState;
  };
  analytics: {
    events: readonly BehaviorEvent[];
  };
}

const ALLOWED_EVENT_KEYS = new Set([
  'schema_version',
  'event_type',
  'raw_input_stored',
  'session_id',
  'task_id',
  'plan_id',
  'assigned_step_count',
  'task_category',
  'barrier_type',
  'coaching_plan_source',
  'step_id',
  'step_index',
  'timer_seconds',
  'active_timer_seconds',
  'task_elapsed_seconds',
  'last_completed_step_index',
  'completion_status',
  'proof_submitted',
  'exp_granted',
  'created_at',
]);

const ALLOWED_EVENT_TYPES = new Set([
  'task_submitted',
  'plan_generated',
  'fallback_used',
  'remote_timeout',
  'api_error',
  'timer_started',
  'timer_paused',
  'timer_completed',
  'timer_abandoned',
  'app_opened',
  'session_started',
  'session_resumed',
  'task_restarted',
  'reentry_prompt_created',
  'proof_submitted',
  'exp_granted',
  'session_ended',
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasPrivacySafeEvents(value: unknown, sessionId: string): value is BehaviorEvent[] {
  return (
    Array.isArray(value) &&
    value.every(
      (event) =>
        isObject(event) &&
        Object.keys(event).every((key) => ALLOWED_EVENT_KEYS.has(key)) &&
        event.schema_version === 'behavior_event_v0.1' &&
        ALLOWED_EVENT_TYPES.has(String(event.event_type)) &&
        event.raw_input_stored === false &&
        event.session_id === sessionId,
    )
  );
}

function parseCompletionState(value: unknown): CompletionState | null {
  if (!isObject(value) || !Array.isArray(value.records)) {
    return null;
  }

  const records = value.records.map((record) => {
    if (
      !isObject(record) ||
      typeof record.completionKey !== 'string' ||
      typeof record.taskId !== 'string' ||
      typeof record.planId !== 'string' ||
      !isObject(record.proof) ||
      record.proof.proofType !== 'check' ||
      typeof record.proof.submittedAt !== 'string' ||
      !isObject(record.reward) ||
      record.reward.rewardKey !== record.completionKey ||
      record.reward.amount !== 30 ||
      typeof record.reward.grantedAt !== 'string' ||
      typeof record.sessionEndedAt !== 'string'
    ) {
      return null;
    }

    const photo =
      record.proof.photo === undefined || record.proof.photo === null
        ? null
        : isLocalProofPhoto(record.proof.photo)
          ? record.proof.photo
          : undefined;
    if (photo === undefined) {
      return null;
    }

    return {
      ...record,
      proof: {
        ...record.proof,
        photo,
      },
    };
  });

  return records.every((record) => record !== null)
    ? ({ records } as unknown as CompletionState)
    : null;
}

export function createSessionSnapshot(input: {
  sessionId: string;
  result: PlanAllowed;
  timerState: TimerState;
  completionState: CompletionState;
  events: readonly BehaviorEvent[];
  savedAt?: Date;
}): SessionSnapshot {
  return {
    version: SESSION_SNAPSHOT_VERSION,
    sessionId: input.sessionId,
    savedAt: (input.savedAt ?? new Date()).toISOString(),
    product: {
      result: input.result,
      timerState: input.timerState,
      completionState: input.completionState,
    },
    analytics: {
      events: input.events,
    },
  };
}

export function parseSessionSnapshot(value: string): SessionSnapshot | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !isObject(parsed) ||
      (parsed.version !== SESSION_SNAPSHOT_VERSION &&
        !LEGACY_SESSION_SNAPSHOT_VERSIONS.has(String(parsed.version))) ||
      typeof parsed.sessionId !== 'string' ||
      typeof parsed.savedAt !== 'string' ||
      Number.isNaN(Date.parse(parsed.savedAt)) ||
      !isObject(parsed.product) ||
      !isObject(parsed.analytics)
    ) {
      return null;
    }

    const result = parsed.product.result;
    const timerState = parsed.product.timerState;
    if (
      !isObject(result) ||
      result.kind !== 'plan_allowed' ||
      !isObject(result.plan) ||
      !Array.isArray(result.plan.steps) ||
      result.plan.steps.length !== 3 ||
      !isObject(timerState) ||
      !['idle', 'running', 'paused', 'completed', 'abandoned'].includes(
        String(timerState.status),
      ) ||
      !hasPrivacySafeEvents(parsed.analytics.events, parsed.sessionId)
    ) {
      return null;
    }

    const parsedCompletionState = parseCompletionState(
      parsed.product.completionState,
    );
    const completionState =
      parsedCompletionState ??
      (parsed.version === 'session_snapshot_v0.1'
        ? createCompletionState()
        : null);
    if (!completionState) {
      return null;
    }

    return {
      version: SESSION_SNAPSHOT_VERSION,
      sessionId: parsed.sessionId,
      savedAt: parsed.savedAt,
      product: {
        result: result as unknown as PlanAllowed,
        timerState: timerState as unknown as TimerState,
        completionState,
      },
      analytics: {
        events: parsed.analytics.events,
      },
    };
  } catch {
    return null;
  }
}

export function normalizeRestoredTimerState(
  state: TimerState,
  restoredAt: number,
): TimerState {
  if (state.status !== 'running') {
    return {
      ...state,
      stepTimings: state.stepTimings ?? [],
    };
  }

  return {
    ...state,
    stepTimings: state.stepTimings ?? [],
    status: 'paused',
    pausedAt: restoredAt,
  };
}
