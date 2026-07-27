import type { ActionPlan } from '../coaching/result.ts';
import type { TimerState } from './timerMachine.ts';
import type { LocalProofPhoto } from '../storage/proofFileRepository.ts';
import {
  createCompletionReward,
  createRewardKey,
  type ExpGrant,
} from './reward.ts';

export interface CheckProof {
  proofType: 'check';
  submittedAt: string;
  photo: LocalProofPhoto | null;
}

export interface CompletionRecord {
  completionKey: string;
  taskId: string;
  planId: string;
  proof: CheckProof;
  reward: ExpGrant;
  sessionEndedAt: string;
}

export interface CompletionState {
  records: readonly CompletionRecord[];
}

export type CompletionTransactionResult =
  | {
      outcome: 'not_eligible';
      state: CompletionState;
      record: null;
    }
  | {
      outcome: 'already_completed' | 'completed';
      state: CompletionState;
      record: CompletionRecord;
    };

export function createCompletionState(): CompletionState {
  return { records: [] };
}

export function findCompletionRecord(
  state: CompletionState,
  plan: ActionPlan,
): CompletionRecord | null {
  const completionKey = createRewardKey(plan);
  return state.records.find((record) => record.completionKey === completionKey) ?? null;
}

export function completeWithCheck(input: {
  state: CompletionState;
  plan: ActionPlan;
  timerState: TimerState;
  photo?: LocalProofPhoto | null;
  completedAt?: Date;
}): CompletionTransactionResult {
  if (
    input.timerState.status !== 'completed' ||
    input.timerState.completedStepCount !== 3
  ) {
    return {
      outcome: 'not_eligible',
      state: input.state,
      record: null,
    };
  }

  const existing = findCompletionRecord(input.state, input.plan);
  if (existing) {
    return {
      outcome: 'already_completed',
      state: input.state,
      record: existing,
    };
  }

  const completedAt = input.completedAt ?? new Date();
  const completionKey = createRewardKey(input.plan);
  const record: CompletionRecord = {
    completionKey,
    taskId: input.plan.taskId,
    planId: input.plan.planId,
    proof: {
      proofType: 'check',
      submittedAt: completedAt.toISOString(),
      photo: input.photo ?? null,
    },
    reward: createCompletionReward(input.plan, completedAt),
    sessionEndedAt: completedAt.toISOString(),
  };

  return {
    outcome: 'completed',
    state: {
      records: [...input.state.records, record],
    },
    record,
  };
}
