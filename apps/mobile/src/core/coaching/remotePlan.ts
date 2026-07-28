import {
  createFallbackPlan,
  createPlanId,
  createStep,
} from './fallback.ts';
import { validateTaskInput } from './input.ts';
import type {
  ActionPlan,
  BarrierType,
  PlanAllowed,
  PlanResult,
  SafeRedirectReason,
  TaskCategory,
} from './result.ts';
import { classifySafety } from './safety.ts';
import type { AiConsentDecision } from './aiConsent.ts';

const TASK_CATEGORIES = new Set<TaskCategory>([
  'writing',
  'studying',
  'administrative',
  'cleaning',
  'communication',
  'planning',
  'physical_action',
  'general',
]);
const BARRIER_TYPES = new Set<BarrierType>([
  'task_overwhelm',
  'sequence_uncertainty',
  'choice_paralysis',
  'activation_low',
  'avoidance_emotion',
  'environment_friction',
  'completion_pressure',
  'unknown',
]);
const SAFE_REDIRECT_REASONS = new Set<SafeRedirectReason>([
  'clinical_advice_request',
  'crisis_or_self_harm',
  'dangerous_or_illegal_request',
]);
const ABSTRACT_ACTION_PATTERNS = [
  /생각/,
  /고민/,
  /정리해보기/,
  /잘하기/,
  /완성/,
  /이해/,
  /분석/,
  /준비하기$/,
];
const BUNDLED_ACTION_PATTERNS = [
  /그리고/,
  /그다음/,
  /한 뒤/,
  /후에/,
  /동시에/,
  /\S+(?:고|해서)\s+\S+/,
  /\band then\b/i,
  /\bafter that\b/i,
];

export type RemoteFailure = 'remote_timeout' | 'api_error';

export interface PlanResolution {
  result: PlanResult;
  remoteAttempted: boolean;
  failure?: RemoteFailure;
}

export interface PlanClient {
  createPlan(task: string, signal: AbortSignal): Promise<unknown>;
}

export class PlanClientError extends Error {
  readonly code: 'http_error' | 'malformed_response';
  readonly status?: number;

  constructor(
    code: 'http_error' | 'malformed_response',
    status?: number,
  ) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

export function createHttpPlanClient(input: {
  endpoint: string;
  fetchImpl?: typeof fetch;
}): PlanClient {
  const fetchImpl = input.fetchImpl ?? fetch;

  return {
    async createPlan(task, signal) {
      const response = await fetchImpl(input.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ task }),
        signal,
      });
      if (!response.ok) {
        throw new PlanClientError('http_error', response.status);
      }
      try {
        return await response.json();
      } catch {
        throw new PlanClientError('malformed_response');
      }
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBoundedText(
  value: unknown,
  maxLength: number,
): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
}

function isConcreteAction(value: unknown): value is string {
  if (!isBoundedText(value, 44)) {
    return false;
  }

  const action = value.replace(/\s+/g, ' ').trim();
  return (
    !ABSTRACT_ACTION_PATTERNS.some((pattern) => pattern.test(action)) &&
    !BUNDLED_ACTION_PATTERNS.some((pattern) => pattern.test(action))
  );
}

export function parseRemotePlan(value: unknown): PlanResult | null {
  if (!isRecord(value)) {
    return null;
  }

  if (value.kind === 'safe_redirect') {
    if (
      value.do_not_chunk !== true ||
      !SAFE_REDIRECT_REASONS.has(value.reason_code as SafeRedirectReason) ||
      !isBoundedText(value.message, 240) ||
      !Array.isArray(value.support_actions) ||
      value.support_actions.length < 1 ||
      value.support_actions.length > 3 ||
      !value.support_actions.every((action) => isBoundedText(action, 160))
    ) {
      return null;
    }
    return {
      kind: 'safe_redirect',
      doNotChunk: true,
      reasonCode: value.reason_code as SafeRedirectReason,
      message: value.message.trim(),
      supportActions: value.support_actions.map((action) =>
        String(action).trim(),
      ),
    };
  }

  if (
    value.kind !== 'plan_allowed' ||
    value.do_not_chunk !== false ||
    !isBoundedText(value.task_title, 120) ||
    !TASK_CATEGORIES.has(value.task_category as TaskCategory) ||
    !BARRIER_TYPES.has(value.barrier_type as BarrierType) ||
    !isBoundedText(value.coach_message, 180) ||
    !Array.isArray(value.steps) ||
    value.steps.length !== 3
  ) {
    return null;
  }

  const validSteps = value.steps.every(
    (step, index) =>
      isRecord(step) &&
      step.step_order === index + 1 &&
      isConcreteAction(step.action) &&
      Number.isInteger(step.timer_seconds) &&
      Number(step.timer_seconds) >= 15 &&
      Number(step.timer_seconds) <= 180 &&
      isBoundedText(step.completion_condition, 160),
  );
  if (!validSteps) {
    return null;
  }

  const taskId = createPlanId('task');
  const planId = `plan_${taskId}`;
  const steps = value.steps.map((step) => {
    const record = step as Record<string, unknown>;
    return createStep(
      planId,
      record.step_order as 1 | 2 | 3,
      String(record.action).trim(),
      Number(record.timer_seconds),
      String(record.completion_condition).trim(),
    );
  }) as unknown as ActionPlan['steps'];

  return {
    kind: 'plan_allowed',
    doNotChunk: false,
    source: 'openai',
    plan: {
      taskId,
      planId,
      taskTitle: value.task_title.trim(),
      taskCategory: value.task_category as TaskCategory,
      barrierType: value.barrier_type as BarrierType,
      steps,
      coachMessage: value.coach_message.trim(),
    },
  } satisfies PlanAllowed;
}

export async function resolvePlan(input: {
  rawInput: string;
  consentDecision: AiConsentDecision;
  client: PlanClient | null;
  timeoutMs?: number;
}): Promise<PlanResolution> {
  const validation = validateTaskInput(input.rawInput);
  if (!validation.isValid) {
    throw new Error(`Invalid task input: ${validation.error ?? 'unknown'}`);
  }

  const safeRedirect = classifySafety(validation.value);
  if (safeRedirect) {
    return { result: safeRedirect, remoteAttempted: false };
  }

  if (input.consentDecision !== 'accepted' || input.client === null) {
    return {
      result: createFallbackPlan(validation.value),
      remoteAttempted: false,
    };
  }

  const controller = new AbortController();
  let didTimeout = false;
  const timeout = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, input.timeoutMs ?? 8_000);

  try {
    const remoteValue = await input.client.createPlan(
      validation.value,
      controller.signal,
    );
    const remoteResult = parseRemotePlan(remoteValue);
    if (!remoteResult) {
      return {
        result: createFallbackPlan(validation.value),
        remoteAttempted: true,
        failure: 'api_error',
      };
    }
    return { result: remoteResult, remoteAttempted: true };
  } catch {
    return {
      result: createFallbackPlan(validation.value),
      remoteAttempted: true,
      failure: didTimeout ? 'remote_timeout' : 'api_error',
    };
  } finally {
    clearTimeout(timeout);
  }
}
