export type TaskCategory =
  | 'writing'
  | 'studying'
  | 'administrative'
  | 'cleaning'
  | 'communication'
  | 'planning'
  | 'physical_action'
  | 'general';

export type BarrierType =
  | 'task_overwhelm'
  | 'sequence_uncertainty'
  | 'choice_paralysis'
  | 'activation_low'
  | 'avoidance_emotion'
  | 'environment_friction'
  | 'completion_pressure'
  | 'unknown';

export type SafeRedirectReason =
  | 'clinical_advice_request'
  | 'crisis_or_self_harm'
  | 'dangerous_or_illegal_request';

export type StepOrder = 1 | 2 | 3;

export interface ActionStep {
  stepId: string;
  stepOrder: StepOrder;
  action: string;
  timerSeconds: number;
  completionCondition: string;
}

export interface ActionPlan {
  taskId: string;
  planId: string;
  taskTitle: string;
  taskCategory: TaskCategory;
  barrierType: BarrierType;
  steps: readonly [ActionStep, ActionStep, ActionStep];
  coachMessage: string;
}

export interface PlanAllowed {
  kind: 'plan_allowed';
  doNotChunk: false;
  plan: ActionPlan;
  source: 'fallback' | 'openai';
}

export interface SafeRedirect {
  kind: 'safe_redirect';
  doNotChunk: true;
  reasonCode: SafeRedirectReason;
  message: string;
  supportActions: readonly string[];
}

export type PlanResult = PlanAllowed | SafeRedirect;
