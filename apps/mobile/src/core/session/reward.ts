import type { ActionPlan } from '../coaching/result.ts';

export const TASK_COMPLETION_EXP = 30 as const;

export interface ExpGrant {
  rewardKey: string;
  amount: typeof TASK_COMPLETION_EXP;
  grantedAt: string;
}

export function createRewardKey(plan: ActionPlan): string {
  return `${plan.taskId}:${plan.planId}`;
}

export function createCompletionReward(plan: ActionPlan, grantedAt: Date): ExpGrant {
  return {
    rewardKey: createRewardKey(plan),
    amount: TASK_COMPLETION_EXP,
    grantedAt: grantedAt.toISOString(),
  };
}
