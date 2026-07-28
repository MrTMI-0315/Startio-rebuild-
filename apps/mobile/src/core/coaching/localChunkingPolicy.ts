export const LOCAL_CHUNKING_POLICY_VERSION =
  'local_chunking_policy_v0.2' as const;

export const BARRIER_TYPES = [
  'task_overwhelm',
  'sequence_uncertainty',
  'choice_paralysis',
  'activation_low',
  'completion_pressure',
  'unknown',
] as const;

export type BarrierType = (typeof BARRIER_TYPES)[number];

export const STEP_ROLES = ['CONTACT', 'NARROW', 'PRODUCE'] as const;

export type StepRole = (typeof STEP_ROLES)[number];

export const ACTION_PRIMITIVES = [
  'OPEN_TARGET',
  'RESTORE_LAST_POSITION',
  'SELECT_ONE',
  'REDUCE_SCOPE',
  'CREATE_FIRST_OUTPUT',
  'MARK_NEXT_POINT',
] as const;

export type ActionPrimitive = (typeof ACTION_PRIMITIVES)[number];

export const STEP_TIMER_SECONDS: Readonly<Record<StepRole, number>> = {
  CONTACT: 15,
  NARROW: 60,
  PRODUCE: 120,
};

export const AMBIGUOUS_STANDALONE_VERBS = [
  '생각해보기',
  '정리하기',
  '준비하기',
  '확인하기',
  '시작하기',
  '진행하기',
] as const;

export const QUALITY_GATE_RULES = [
  'exact_three_steps',
  'one_primary_action_per_step',
  'explicit_target_and_action',
  'observable_completion',
  'no_semantic_overlap',
  'direct_task_connection',
  'safe_non_pressuring_tone',
  'ordered_step_roles',
  'no_ambiguous_standalone_verbs',
] as const;

export type QualityGateRule = (typeof QUALITY_GATE_RULES)[number];

export const QUALITY_SCORE_WEIGHTS = {
  barrierFit: 30,
  immediateStartability: 25,
  meaningfulProgress: 20,
  decisionRemoval: 10,
  stepCoherence: 10,
  toneSafety: 5,
} as const;

export type QualityScoreCriterion = keyof typeof QUALITY_SCORE_WEIGHTS;

export const QUALITY_PENALTY_WEIGHTS = {
  underChunking: 20,
  triviality: 15,
  repetition: 15,
  hiddenDecision: 10,
} as const;

export type QualityPenalty = keyof typeof QUALITY_PENALTY_WEIGHTS;

export type ConfidenceBand = 'high' | 'medium' | 'low';

export interface PlanStepCandidate {
  role: StepRole;
  primitive: ActionPrimitive;
  action: string;
  timerSeconds: number;
  completionCondition: string;
}

export type ThreeStepCandidate = readonly [
  PlanStepCandidate,
  PlanStepCandidate,
  PlanStepCandidate,
];

export interface PlanCandidate {
  strategyId: string;
  steps: ThreeStepCandidate;
}

export interface PlanGateResult {
  passed: boolean;
  failures: readonly QualityGateRule[];
}

export interface PlanScoreBreakdown {
  criteria: Readonly<Record<QualityScoreCriterion, number>>;
  penalties: Readonly<Partial<Record<QualityPenalty, number>>>;
  total: number;
}

export interface LocalChunkingDescriptor {
  policyVersion: typeof LOCAL_CHUNKING_POLICY_VERSION;
  barrierType: BarrierType;
  confidenceBand: ConfidenceBand;
  candidateCount: number;
  selectedStrategy: string | null;
  stepPrimitives: readonly ActionPrimitive[];
  fallbackUsed: boolean;
}
