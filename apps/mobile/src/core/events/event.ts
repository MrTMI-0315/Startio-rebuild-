import type { ActionPlan, ActionStep } from '../coaching/result.ts';

export type BehaviorEventType =
  | 'task_submitted'
  | 'plan_generated'
  | 'fallback_used'
  | 'remote_timeout'
  | 'api_error'
  | 'timer_started'
  | 'timer_paused'
  | 'timer_completed'
  | 'timer_abandoned'
  | 'app_opened'
  | 'session_started'
  | 'session_resumed'
  | 'task_restarted'
  | 'reentry_prompt_created'
  | 'proof_submitted'
  | 'exp_granted'
  | 'session_ended';

export interface BehaviorEvent {
  schema_version: 'behavior_event_v0.1';
  event_type: BehaviorEventType;
  raw_input_stored: false;
  session_id: string;
  task_id: string;
  plan_id: string;
  assigned_step_count: 3;
  task_category: ActionPlan['taskCategory'];
  barrier_type: ActionPlan['barrierType'];
  coaching_plan_source: 'fallback' | 'openai';
  step_id?: string;
  step_index?: ActionStep['stepOrder'];
  timer_seconds?: number;
  active_timer_seconds?: number;
  task_elapsed_seconds?: number;
  last_completed_step_index?: 0 | 1 | 2 | 3;
  completion_status?: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  proof_submitted?: boolean;
  exp_granted?: number;
  created_at: string;
}

export interface EventLedger {
  appendPlanEvents(
    sessionId: string,
    plan: ActionPlan,
    source?: BehaviorEvent['coaching_plan_source'],
    failure?: Extract<BehaviorEventType, 'remote_timeout' | 'api_error'>,
  ): void;
  appendTimerEvent(
    sessionId: string,
    plan: ActionPlan,
    step: ActionStep,
    eventType: Extract<
      BehaviorEventType,
      'timer_started' | 'timer_paused' | 'timer_completed' | 'timer_abandoned'
    >,
    details: {
      activeTimerSeconds: number;
      lastCompletedStepIndex: 0 | 1 | 2 | 3;
      completionStatus: 'in_progress' | 'completed' | 'abandoned';
    },
  ): void;
  appendLifecycleEvent(
    sessionId: string,
    plan: ActionPlan,
    eventType: Extract<
      BehaviorEventType,
      | 'app_opened'
      | 'session_started'
      | 'session_resumed'
      | 'task_restarted'
      | 'reentry_prompt_created'
    >,
    lastCompletedStepIndex: 0 | 1 | 2 | 3,
  ): void;
  appendCompletionEvents(sessionId: string, plan: ActionPlan): void;
  hydrate(hydratedEvents: readonly BehaviorEvent[]): void;
  readAll(): readonly BehaviorEvent[];
  clear(): void;
}

export function createEventLedger(now: () => Date = () => new Date()): EventLedger {
  let events: BehaviorEvent[] = [];
  const sourceFor = (planId: string): BehaviorEvent['coaching_plan_source'] =>
    events.find(
      (event) =>
        event.plan_id === planId && event.event_type === 'plan_generated',
    )?.coaching_plan_source ?? 'fallback';

  return {
    appendPlanEvents(sessionId, plan, source = 'fallback', failure) {
      const createdAt = now().toISOString();
      const shared = {
        schema_version: 'behavior_event_v0.1' as const,
        raw_input_stored: false as const,
        session_id: sessionId,
        task_id: plan.taskId,
        plan_id: plan.planId,
        assigned_step_count: 3 as const,
        task_category: plan.taskCategory,
        barrier_type: plan.barrierType,
        coaching_plan_source: source,
        created_at: createdAt,
      };

      const planEvents: BehaviorEvent[] = [
        ...events,
        { ...shared, event_type: 'task_submitted' },
        { ...shared, event_type: 'plan_generated' },
      ];
      if (source === 'fallback') {
        planEvents.push({ ...shared, event_type: 'fallback_used' });
      }
      if (failure) {
        planEvents.push({ ...shared, event_type: failure });
      }
      events = planEvents;
    },
    appendTimerEvent(sessionId, plan, step, eventType, details) {
      const event: BehaviorEvent = {
        schema_version: 'behavior_event_v0.1',
        event_type: eventType,
        raw_input_stored: false,
        session_id: sessionId,
        task_id: plan.taskId,
        plan_id: plan.planId,
        assigned_step_count: 3,
        task_category: plan.taskCategory,
        barrier_type: plan.barrierType,
        coaching_plan_source: sourceFor(plan.planId),
        step_id: step.stepId,
        step_index: step.stepOrder,
        timer_seconds: step.timerSeconds,
        active_timer_seconds: details.activeTimerSeconds,
        last_completed_step_index: details.lastCompletedStepIndex,
        completion_status: details.completionStatus,
        created_at: now().toISOString(),
      };

      const isTerminalDuplicate =
        (eventType === 'timer_completed' || eventType === 'timer_abandoned') &&
        events.some(
          (candidate) =>
            candidate.event_type === eventType &&
            candidate.session_id === sessionId &&
            candidate.step_id === step.stepId,
        );

      if (!isTerminalDuplicate) {
        events = [...events, event];
      }
    },
    appendLifecycleEvent(sessionId, plan, eventType, lastCompletedStepIndex) {
      const oneTimeEvent = eventType === 'session_started';
      const isDuplicate =
        oneTimeEvent &&
        events.some(
          (candidate) =>
            candidate.event_type === eventType && candidate.session_id === sessionId,
        );

      if (isDuplicate) {
        return;
      }

      events = [
        ...events,
        {
          schema_version: 'behavior_event_v0.1',
          event_type: eventType,
          raw_input_stored: false,
          session_id: sessionId,
          task_id: plan.taskId,
          plan_id: plan.planId,
          assigned_step_count: 3,
          task_category: plan.taskCategory,
          barrier_type: plan.barrierType,
          coaching_plan_source: sourceFor(plan.planId),
          last_completed_step_index: lastCompletedStepIndex,
          completion_status:
            lastCompletedStepIndex === 3
              ? 'completed'
              : lastCompletedStepIndex > 0
                ? 'in_progress'
                : 'not_started',
          created_at: now().toISOString(),
        },
      ];
    },
    appendCompletionEvents(sessionId, plan) {
      const createdAt = now().toISOString();
      const taskSubmittedAt = events.find(
        (event) =>
          event.event_type === 'task_submitted' &&
          event.session_id === sessionId &&
          event.task_id === plan.taskId,
      )?.created_at;
      const taskElapsedSeconds = taskSubmittedAt
        ? Math.max(
            0,
            Math.round(
              (Date.parse(createdAt) - Date.parse(taskSubmittedAt)) / 1000,
            ),
          )
        : 0;
      const shared = {
        schema_version: 'behavior_event_v0.1' as const,
        raw_input_stored: false as const,
        session_id: sessionId,
        task_id: plan.taskId,
        plan_id: plan.planId,
        assigned_step_count: 3 as const,
        task_category: plan.taskCategory,
        barrier_type: plan.barrierType,
        coaching_plan_source: sourceFor(plan.planId),
        last_completed_step_index: 3 as const,
        completion_status: 'completed' as const,
        created_at: createdAt,
      };
      const completionEvents: BehaviorEvent[] = [
        {
          ...shared,
          event_type: 'proof_submitted',
          proof_submitted: true,
          task_elapsed_seconds: taskElapsedSeconds,
        },
        { ...shared, event_type: 'exp_granted', exp_granted: 30 },
        {
          ...shared,
          event_type: 'session_ended',
          task_elapsed_seconds: taskElapsedSeconds,
        },
      ];

      for (const event of completionEvents) {
        const duplicate = events.some(
          (candidate) =>
            candidate.event_type === event.event_type &&
            candidate.task_id === plan.taskId &&
            candidate.plan_id === plan.planId,
        );
        if (!duplicate) {
          events = [...events, event];
        }
      }
    },
    hydrate(hydratedEvents) {
      events = [...hydratedEvents];
    },
    readAll() {
      return events;
    },
    clear() {
      events = [];
    },
  };
}
