import type { BehaviorEvent } from './event.ts';

export interface BasicKpi {
  taskStartRate: number;
  taskCompletionRate: number;
  recentStartLatencySeconds: number | null;
}

function uniquePlanIds(
  events: readonly BehaviorEvent[],
  predicate: (event: BehaviorEvent) => boolean,
): Set<string> {
  return new Set(events.filter(predicate).map((event) => event.plan_id));
}

export function calculateBasicKpi(events: readonly BehaviorEvent[]): BasicKpi {
  const generatedPlanIds = uniquePlanIds(
    events,
    (event) => event.event_type === 'plan_generated',
  );
  const startedPlanIds = uniquePlanIds(
    events,
    (event) => event.event_type === 'timer_started',
  );
  const completedPlanIds = uniquePlanIds(
    events,
    (event) =>
      event.event_type === 'proof_submitted' && event.proof_submitted === true,
  );
  const firstStartByPlan = new Map<string, BehaviorEvent>();
  for (const event of events) {
    if (event.event_type !== 'timer_started') {
      continue;
    }
    const current = firstStartByPlan.get(event.plan_id);
    if (!current || event.created_at.localeCompare(current.created_at) < 0) {
      firstStartByPlan.set(event.plan_id, event);
    }
  }
  const latestStarted = [...firstStartByPlan.values()].sort((left, right) =>
    right.created_at.localeCompare(left.created_at),
  )[0];
  const planGenerated = latestStarted
    ? [...events]
        .filter(
          (event) =>
            event.event_type === 'plan_generated' &&
            event.plan_id === latestStarted.plan_id,
        )
        .sort((left, right) => left.created_at.localeCompare(right.created_at))[0]
    : undefined;

  return {
    taskStartRate:
      generatedPlanIds.size === 0 ? 0 : startedPlanIds.size / generatedPlanIds.size,
    taskCompletionRate:
      generatedPlanIds.size === 0
        ? 0
        : completedPlanIds.size / generatedPlanIds.size,
    recentStartLatencySeconds:
      latestStarted && planGenerated
        ? Math.max(
            0,
            Math.round(
              (Date.parse(latestStarted.created_at) -
                Date.parse(planGenerated.created_at)) /
                1000,
            ),
          )
        : null,
  };
}
