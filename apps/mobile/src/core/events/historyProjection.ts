import type { ActionPlan } from '../coaching/result.ts';
import type { CompletionRecord } from '../session/completion.ts';
import type { TimerState } from '../session/timerMachine.ts';
import type { BehaviorEvent } from './event.ts';
import {
  isLocalProofPhoto,
  type LocalProofPhoto,
} from '../storage/proofFileRepository.ts';

export const HISTORY_ARCHIVE_VERSION = 'history_archive_v0.3' as const;
const LEGACY_HISTORY_ARCHIVE_VERSIONS = new Set([
  'history_archive_v0.1',
  'history_archive_v0.2',
]);

export interface HistoryRecord {
  completionKey: string;
  sessionId: string;
  taskId: string;
  planId: string;
  taskTitle: string;
  completedStepCount: 3;
  completedAt: string;
  expGranted: 30;
  startLatencySeconds: number | null;
  plannedDurationSeconds: number | null;
  activeDurationSeconds: number | null;
  overtimeSeconds: number | null;
  savedSeconds: number | null;
  proofPhoto: LocalProofPhoto | null;
}

export interface HistoryArchive {
  version: typeof HISTORY_ARCHIVE_VERSION;
  records: readonly HistoryRecord[];
  events: readonly BehaviorEvent[];
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

const ALLOWED_RECORD_KEYS = new Set([
  'completionKey',
  'sessionId',
  'taskId',
  'planId',
  'taskTitle',
  'completedStepCount',
  'completedAt',
  'expGranted',
  'startLatencySeconds',
  'plannedDurationSeconds',
  'activeDurationSeconds',
  'overtimeSeconds',
  'savedSeconds',
  'proofPhoto',
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

export function createHistoryArchive(): HistoryArchive {
  return {
    version: HISTORY_ARCHIVE_VERSION,
    records: [],
    events: [],
  };
}

export function parseHistoryArchive(value: string): HistoryArchive | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !isObject(parsed) ||
      (parsed.version !== HISTORY_ARCHIVE_VERSION &&
        !LEGACY_HISTORY_ARCHIVE_VERSIONS.has(String(parsed.version))) ||
      !Array.isArray(parsed.records) ||
      !Array.isArray(parsed.events)
    ) {
      return null;
    }

    const validRecords = parsed.records.every(
      (record) =>
        isObject(record) &&
        Object.keys(record).every((key) => ALLOWED_RECORD_KEYS.has(key)) &&
        typeof record.completionKey === 'string' &&
        typeof record.sessionId === 'string' &&
        typeof record.taskId === 'string' &&
        typeof record.planId === 'string' &&
        typeof record.taskTitle === 'string' &&
        record.completedStepCount === 3 &&
        typeof record.completedAt === 'string' &&
        !Number.isNaN(Date.parse(record.completedAt)) &&
        record.expGranted === 30 &&
        (record.proofPhoto === undefined ||
          record.proofPhoto === null ||
          isLocalProofPhoto(record.proofPhoto)) &&
        (record.startLatencySeconds === null ||
          (typeof record.startLatencySeconds === 'number' &&
            record.startLatencySeconds >= 0)) &&
        [
          record.plannedDurationSeconds,
          record.activeDurationSeconds,
          record.overtimeSeconds,
          record.savedSeconds,
        ].every(
          (duration) =>
            duration === undefined ||
            duration === null ||
            (typeof duration === 'number' && duration >= 0),
        ),
    );
    const validEvents = parsed.events.every(
      (event) =>
        isObject(event) &&
        Object.keys(event).every((key) => ALLOWED_EVENT_KEYS.has(key)) &&
        event.schema_version === 'behavior_event_v0.1' &&
        ALLOWED_EVENT_TYPES.has(String(event.event_type)) &&
        event.raw_input_stored === false,
    );

    if (!validRecords || !validEvents) {
      return null;
    }

    return {
      version: HISTORY_ARCHIVE_VERSION,
      records: parsed.records.map((record) => ({
        ...(record as unknown as HistoryRecord),
        proofPhoto:
          isObject(record) && isLocalProofPhoto(record.proofPhoto)
            ? record.proofPhoto
            : null,
        plannedDurationSeconds:
          typeof record.plannedDurationSeconds === 'number'
            ? record.plannedDurationSeconds
            : null,
        activeDurationSeconds:
          typeof record.activeDurationSeconds === 'number'
            ? record.activeDurationSeconds
            : null,
        overtimeSeconds:
          typeof record.overtimeSeconds === 'number'
            ? record.overtimeSeconds
            : null,
        savedSeconds:
          typeof record.savedSeconds === 'number'
            ? record.savedSeconds
            : null,
      })),
      events: parsed.events as BehaviorEvent[],
    };
  } catch {
    return null;
  }
}

function findStartLatencySeconds(
  events: readonly BehaviorEvent[],
  planId: string,
): number | null {
  const planCreatedAt = events.find(
    (event) => event.plan_id === planId && event.event_type === 'plan_generated',
  )?.created_at;
  const timerStartedAt = events.find(
    (event) => event.plan_id === planId && event.event_type === 'timer_started',
  )?.created_at;
  if (!planCreatedAt || !timerStartedAt) {
    return null;
  }

  return Math.max(
    0,
    Math.round((Date.parse(timerStartedAt) - Date.parse(planCreatedAt)) / 1000),
  );
}

export function createHistoryRecord(input: {
  sessionId: string;
  plan: ActionPlan;
  timerState: TimerState;
  completion: CompletionRecord;
  events: readonly BehaviorEvent[];
}): HistoryRecord | null {
  if (
    input.timerState.status !== 'completed' ||
    input.timerState.completedStepCount !== 3
  ) {
    return null;
  }

  const stepTimings = input.timerState.stepTimings ?? [];
  const hasCompleteTiming = stepTimings.length === 3;
  const plannedDurationSeconds = hasCompleteTiming
    ? Math.round(
        stepTimings.reduce((total, timing) => total + timing.plannedMs, 0) /
          1000,
      )
    : null;
  const activeDurationSeconds = hasCompleteTiming
    ? Math.round(
        stepTimings.reduce((total, timing) => total + timing.activeMs, 0) /
          1000,
      )
    : null;
  const overtimeSeconds = hasCompleteTiming
    ? Math.round(
        stepTimings.reduce(
          (total, timing) => total + Math.max(0, timing.varianceMs),
          0,
        ) / 1000,
      )
    : null;
  const savedSeconds = hasCompleteTiming
    ? Math.round(
        stepTimings.reduce(
          (total, timing) => total + Math.max(0, -timing.varianceMs),
          0,
        ) / 1000,
      )
    : null;

  return {
    completionKey: input.completion.completionKey,
    sessionId: input.sessionId,
    taskId: input.plan.taskId,
    planId: input.plan.planId,
    taskTitle: input.plan.taskTitle,
    completedStepCount: 3,
    completedAt: input.completion.sessionEndedAt,
    expGranted: input.completion.reward.amount,
    startLatencySeconds: findStartLatencySeconds(input.events, input.plan.planId),
    plannedDurationSeconds,
    activeDurationSeconds,
    overtimeSeconds,
    savedSeconds,
    proofPhoto: input.completion.proof.photo,
  };
}

export function appendHistory(
  archive: HistoryArchive,
  record: HistoryRecord,
  events: readonly BehaviorEvent[],
): HistoryArchive {
  const existingRecord = archive.records.some(
    (candidate) => candidate.completionKey === record.completionKey,
  );
  const withEvents = appendHistoryEvents(archive, events);

  return {
    version: HISTORY_ARCHIVE_VERSION,
    records: existingRecord ? archive.records : [record, ...archive.records],
    events: withEvents.events,
  };
}

export function appendHistoryEvents(
  archive: HistoryArchive,
  events: readonly BehaviorEvent[],
): HistoryArchive {
  const existingEventKeys = new Set(
    archive.events.map(
      (event) =>
        `${event.session_id}:${event.event_type}:${event.step_id ?? ''}:${event.created_at}`,
    ),
  );
  const newEvents = events.filter(
    (event) =>
      !existingEventKeys.has(
        `${event.session_id}:${event.event_type}:${event.step_id ?? ''}:${event.created_at}`,
      ),
  );

  return {
    version: HISTORY_ARCHIVE_VERSION,
    records: archive.records,
    events: [...archive.events, ...newEvents],
  };
}
