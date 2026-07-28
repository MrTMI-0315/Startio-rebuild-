import {
  createGeneralFallbackPlan,
  createPlanId,
  createStep,
  inferTaskCategory,
} from './fallback.ts';
import {
  AMBIGUOUS_STANDALONE_VERBS,
  LOCAL_CHUNKING_POLICY_VERSION,
  QUALITY_PENALTY_WEIGHTS,
  QUALITY_SCORE_WEIGHTS,
  STEP_ROLES,
  STEP_TIMER_SECONDS,
  type ActionPrimitive,
  type BarrierType,
  type ConfidenceBand,
  type EvaluatedPlanCandidate,
  type LocalChunkingDescriptor,
  type PlanCandidate,
  type PlanGateResult,
  type PlanScoreBreakdown,
  type PlanStepCandidate,
  type QualityGateRule,
  type QualityPenalty,
  type ThreeStepCandidate,
} from './localChunkingPolicy.ts';
import type {
  ActionPlan,
  PlanAllowed,
  SafeRedirect,
  TaskCategory,
} from './result.ts';
import { classifySafety as classifyExistingSafety } from './safety.ts';

export type LocalCoachingPolicyVersion =
  | 'local_chunking_policy_v0.1'
  | typeof LOCAL_CHUNKING_POLICY_VERSION;

export const DEFAULT_LOCAL_COACHING_POLICY_VERSION =
  LOCAL_CHUNKING_POLICY_VERSION;

type TargetKind =
  | 'document'
  | 'study_material'
  | 'form'
  | 'space'
  | 'conversation'
  | 'schedule'
  | 'body'
  | 'generic';

export interface LimitedTaskSignals {
  taskCategory: TaskCategory;
  targetKind: TargetKind;
  barrierCueCount: number;
}

export interface BarrierClassification {
  barrierType: BarrierType;
  confidenceBand: ConfidenceBand;
}

type StepCopy = readonly [action: string, completionCondition: string];

interface TaskProfile {
  open: StepCopy;
  restore: StepCopy;
  select: StepCopy;
  reduce: StepCopy;
  create: StepCopy;
  mark: StepCopy;
}

export interface LocalChunkingDecision {
  taskCategory: TaskCategory;
  barrierType: BarrierType;
  confidenceBand: ConfidenceBand;
  candidates: readonly EvaluatedPlanCandidate[];
  selectedCandidate: PlanCandidate | null;
  descriptor: LocalChunkingDescriptor;
}

export type LocalChunkingResolution =
  | { kind: 'safe_redirect'; result: SafeRedirect }
  | { kind: 'chunking_decision'; decision: LocalChunkingDecision };

const BARRIER_PATTERNS: Readonly<
  Record<Exclude<BarrierType, 'unknown'>, readonly RegExp[]>
> = {
  completion_pressure: [
    /완벽/,
    /잘\s*해야/,
    /제대로/,
    /실수.*(?:걱정|무서)/,
    /완성.*부담/,
    /못\s*보내/,
  ],
  choice_paralysis: [
    /(?:고르|선택).*(?:어렵|못|모르)/,
    /뭘?\s*(?:고르|선택)/,
    /어느.*(?:좋|나을)/,
    /디자인.*(?:고르|선택)/,
  ],
  sequence_uncertainty: [
    /뭐부터/,
    /어디부터/,
    /무엇부터/,
    /순서.*(?:모르|헷갈)/,
    /어디까지.*(?:기억|모르)/,
    /기억나지/,
    /이어서.*(?:모르|막막)/,
  ],
  task_overwhelm: [
    /막막/,
    /너무\s*(?:많|크|커)/,
    /벅차/,
    /산더미/,
    /엄두/,
  ],
  activation_low: [
    /귀찮/,
    /몸이\s*안\s*움직/,
    /하기\s*싫/,
    /손이\s*안\s*가/,
    /미루/,
    /움직이기\s*싫/,
  ],
};

const TARGET_KIND_BY_CATEGORY: Readonly<Record<TaskCategory, TargetKind>> = {
  writing: 'document',
  studying: 'study_material',
  administrative: 'form',
  cleaning: 'space',
  communication: 'conversation',
  planning: 'schedule',
  physical_action: 'body',
  general: 'generic',
};

const TASK_PROFILES: Readonly<Record<TaskCategory, TaskProfile>> = {
  writing: {
    open: ['쓸 문서 열기', '문서가 열리면 끝'],
    restore: ['문서에서 마지막 작성 위치 열기', '마지막 작성 위치가 보이면 끝'],
    select: ['첫 문장에 넣을 핵심 단어 하나 고르기', '핵심 단어 하나를 고르면 끝'],
    reduce: ['첫 문장 한 줄만 쓸 범위로 표시하기', '한 줄 범위를 표시하면 끝'],
    create: ['첫 문장 한 줄 쓰기', '문장 한 줄이 생기면 끝'],
    mark: ['다음에 쓸 문장 위치에 표시 남기기', '다음 문장 위치에 표시가 생기면 끝'],
  },
  studying: {
    open: ['볼 자료 펼치기', '첫 페이지가 보이면 끝'],
    restore: ['자료에서 마지막으로 본 위치 열기', '마지막으로 본 위치가 보이면 끝'],
    select: ['지금 볼 소제목 하나 고르기', '소제목 하나를 고르면 끝'],
    reduce: ['읽을 문단 하나에 표시하기', '문단 하나를 표시하면 끝'],
    create: ['표시한 문단의 핵심 한 줄 적기', '핵심 한 줄이 적히면 끝'],
    mark: ['다음에 볼 문단에 표시 남기기', '다음 문단에 표시가 생기면 끝'],
  },
  administrative: {
    open: ['작성할 페이지나 서류 열기', '첫 입력 칸이 보이면 끝'],
    restore: ['마지막으로 작성한 칸 열기', '마지막 작성 칸이 보이면 끝'],
    select: ['지금 채울 입력 칸 하나 고르기', '입력 칸 하나를 고르면 끝'],
    reduce: ['필요한 정보 한 가지만 옆에 적기', '정보 한 가지가 적히면 끝'],
    create: ['첫 입력 칸 하나 채우기', '입력 칸 하나가 채워지면 끝'],
    mark: ['다음에 채울 칸에 표시 남기기', '다음 입력 칸에 표시가 생기면 끝'],
  },
  cleaning: {
    open: ['치울 곳을 손으로 한 번 짚기', '치울 곳을 한 번 짚으면 끝'],
    restore: ['마지막으로 치우던 위치를 손으로 짚기', '마지막 위치를 한 번 짚으면 끝'],
    select: ['눈에 띄는 물건 하나 고르기', '물건 하나를 고르면 끝'],
    reduce: ['손 닿는 범위 한 곳만 표시하기', '한 곳의 범위를 표시하면 끝'],
    create: ['물건 하나 제자리에 놓기', '물건 하나가 제자리에 놓이면 끝'],
    mark: ['다음에 치울 물건 하나를 앞으로 빼기', '다음 물건 하나가 앞으로 나오면 끝'],
  },
  communication: {
    open: ['연락할 사람의 대화창 열기', '대화창이 열리면 끝'],
    restore: ['마지막 대화 위치 열기', '마지막 메시지가 보이면 끝'],
    select: ['전할 핵심 한 가지 고르기', '핵심 한 가지를 고르면 끝'],
    reduce: ['보낼 내용을 한 문장 범위로 줄이기', '한 문장 범위가 정해지면 끝'],
    create: ['핵심 문장 한 줄 입력하기', '메시지 한 줄이 입력되면 끝'],
    mark: ['다음에 답할 메시지에 표시 남기기', '답할 메시지에 표시가 생기면 끝'],
  },
  planning: {
    open: ['메모장이나 일정 화면 열기', '적을 화면이 열리면 끝'],
    restore: ['마지막 계획 메모 위치 열기', '마지막 메모가 보이면 끝'],
    select: ['가장 먼저 다룰 일 하나 고르기', '일 하나를 고르면 끝'],
    reduce: ['가장 작은 일 하나를 한 번의 행동으로 줄여 적기', '한 행동이 적히면 끝'],
    create: ['적은 행동의 시작 시각 하나 적기', '시작 시각 하나가 적히면 끝'],
    mark: ['다음에 정할 일에 표시 남기기', '다음 일에 표시가 생기면 끝'],
  },
  physical_action: {
    open: ['몸을 움직일 자리 한 곳 짚기', '움직일 자리를 한 번 짚으면 끝'],
    restore: ['마지막으로 멈춘 동작 자세 잡기', '멈춘 동작 자세가 만들어지면 끝'],
    select: ['지금 할 동작 하나 고르기', '동작 하나를 고르면 끝'],
    reduce: ['가장 쉬운 동작을 한 번만 하기로 정하기', '한 번의 동작으로 범위가 줄면 끝'],
    create: ['정한 동작 한 번 하기', '동작 한 번을 마치면 끝'],
    mark: ['다음 동작에 쓸 물건 하나 꺼내기', '물건 하나가 손에 닿으면 끝'],
  },
  general: {
    open: ['할 일을 시작할 화면이나 물건 열기', '시작할 대상이 보이면 끝'],
    restore: ['마지막으로 멈춘 위치 찾기', '마지막 위치가 보이면 끝'],
    select: ['지금 손댈 한 가지 고르기', '한 가지를 고르면 끝'],
    reduce: ['할 일을 한 번의 행동으로 줄여 적기', '한 행동이 적히면 끝'],
    create: ['적은 행동의 첫 결과 하나 만들기', '첫 결과 하나가 보이면 끝'],
    mark: ['다음에 손댈 위치에 표시 남기기', '다음 위치에 표시가 생기면 끝'],
  },
};

const STRATEGY_PRIMITIVES: Readonly<
  Record<string, readonly [ActionPrimitive, ActionPrimitive, ActionPrimitive]>
> = {
  scope_first: ['OPEN_TARGET', 'REDUCE_SCOPE', 'CREATE_FIRST_OUTPUT'],
  restore_then_make: [
    'RESTORE_LAST_POSITION',
    'SELECT_ONE',
    'CREATE_FIRST_OUTPUT',
  ],
  choose_then_make: ['OPEN_TARGET', 'SELECT_ONE', 'CREATE_FIRST_OUTPUT'],
  mark_continuation: [
    'RESTORE_LAST_POSITION',
    'REDUCE_SCOPE',
    'MARK_NEXT_POINT',
  ],
};

const STRATEGIES_BY_BARRIER: Readonly<Record<BarrierType, readonly string[]>> = {
  task_overwhelm: ['scope_first', 'choose_then_make', 'restore_then_make'],
  sequence_uncertainty: [
    'restore_then_make',
    'mark_continuation',
    'scope_first',
  ],
  choice_paralysis: ['choose_then_make', 'scope_first'],
  activation_low: ['scope_first', 'restore_then_make'],
  completion_pressure: [
    'scope_first',
    'choose_then_make',
    'mark_continuation',
  ],
  unknown: ['scope_first', 'choose_then_make'],
};

const BUNDLED_ACTION_PATTERN =
  /그리고|그다음|한 뒤|후에|동시에|\S+(?:고|해서)\s+\S+/;
const UNSAFE_TONE_PATTERN =
  /진단|치료|약을|게으르|의지\s*부족|반드시|무조건|실패/;
const BROAD_ACTION_PATTERN = /전체|모두|완성|끝내기/;

function profileCopyFor(
  profile: TaskProfile,
  primitive: ActionPrimitive,
): StepCopy {
  switch (primitive) {
    case 'OPEN_TARGET':
      return profile.open;
    case 'RESTORE_LAST_POSITION':
      return profile.restore;
    case 'SELECT_ONE':
      return profile.select;
    case 'REDUCE_SCOPE':
      return profile.reduce;
    case 'CREATE_FIRST_OUTPUT':
      return profile.create;
    case 'MARK_NEXT_POINT':
      return profile.mark;
  }
}

function createCandidateStep(
  profile: TaskProfile,
  role: PlanStepCandidate['role'],
  primitive: ActionPrimitive,
): PlanStepCandidate {
  const [action, completionCondition] = profileCopyFor(profile, primitive);
  return {
    role,
    primitive,
    action,
    timerSeconds: STEP_TIMER_SECONDS[role],
    completionCondition,
  };
}

export function normalizeInput(rawInput: string): string {
  return rawInput.normalize('NFC').replace(/\s+/g, ' ').trim();
}

export function classifySafety(normalizedInput: string): SafeRedirect | null {
  return classifyExistingSafety(normalizedInput);
}

export function extractLimitedTaskSignals(
  normalizedInput: string,
): LimitedTaskSignals {
  const inferredCategory = inferTaskCategory(normalizedInput);
  const taskCategory =
    /연구\s*계획서|이력서|발표\s*자료|논문\s*(?:쓰|써)|이메일/.test(
      normalizedInput,
    )
      ? /이메일/.test(normalizedInput)
        ? 'communication'
        : 'writing'
      : inferredCategory;
  const barrierCueCount = Object.values(BARRIER_PATTERNS)
    .flat()
    .filter((pattern) => pattern.test(normalizedInput)).length;

  return {
    taskCategory,
    targetKind: TARGET_KIND_BY_CATEGORY[taskCategory],
    barrierCueCount,
  };
}

export function classifyBarrier(
  normalizedInput: string,
  signals: LimitedTaskSignals,
): BarrierClassification {
  const barrierOrder: readonly Exclude<BarrierType, 'unknown'>[] = [
    'completion_pressure',
    'choice_paralysis',
    'sequence_uncertainty',
    'task_overwhelm',
    'activation_low',
  ];
  const barrierType =
    barrierOrder.find((candidate) =>
      BARRIER_PATTERNS[candidate].some((pattern) =>
        pattern.test(normalizedInput),
      ),
    ) ?? 'unknown';

  return {
    barrierType,
    confidenceBand:
      barrierType !== 'unknown'
        ? signals.barrierCueCount > 1
          ? 'high'
          : 'medium'
        : signals.taskCategory === 'general'
          ? 'low'
          : 'medium',
  };
}

export function generateCandidatePlans(
  signals: LimitedTaskSignals,
  barrierType: BarrierType,
): readonly PlanCandidate[] {
  const profile = TASK_PROFILES[signals.taskCategory];

  return STRATEGIES_BY_BARRIER[barrierType].map((strategyName) => {
    const primitives = STRATEGY_PRIMITIVES[strategyName];
    const steps = STEP_ROLES.map((role, index) =>
      createCandidateStep(profile, role, primitives[index]),
    ) as unknown as ThreeStepCandidate;

    return {
      strategyId: `${barrierType}:${signals.taskCategory}:${strategyName}`,
      steps,
    };
  });
}

function hasObservableCompletion(step: PlanStepCandidate): boolean {
  return (
    step.completionCondition.endsWith('끝') &&
    /보이|열리|고르|표시|적히|생기|채워|놓이|나오|입력|정해|마치|짚|찾|만들|줄|꺼내|손에\s*닿/.test(
      step.completionCondition,
    )
  );
}

export function validatePlanCandidate(
  candidate: PlanCandidate,
): PlanGateResult {
  const failures: QualityGateRule[] = [];
  const steps = candidate.steps;

  if (steps.length !== 3) {
    failures.push('exact_three_steps');
  }
  if (steps.some((step) => BUNDLED_ACTION_PATTERN.test(step.action))) {
    failures.push('one_primary_action_per_step');
  }
  if (
    steps.some(
      (step) =>
        step.action.trim().length < 4 ||
        !/[가-힣A-Za-z0-9]/.test(step.action),
    )
  ) {
    failures.push('explicit_target_and_action');
  }
  if (steps.some((step) => !hasObservableCompletion(step))) {
    failures.push('observable_completion');
  }
  if (
    new Set(steps.map((step) => step.action.replace(/\s+/g, ' ').trim()))
      .size !== steps.length ||
    new Set(steps.map((step) => step.primitive)).size !== steps.length
  ) {
    failures.push('no_semantic_overlap');
  }
  if (
    steps.every((step) =>
      /할\s*일|한\s*가지|행동|대상/.test(step.action),
    )
  ) {
    failures.push('direct_task_connection');
  }
  if (
    steps.some(
      (step) =>
        UNSAFE_TONE_PATTERN.test(step.action) ||
        UNSAFE_TONE_PATTERN.test(step.completionCondition),
    )
  ) {
    failures.push('safe_non_pressuring_tone');
  }
  if (
    steps.some((step, index) => step.role !== STEP_ROLES[index])
  ) {
    failures.push('ordered_step_roles');
  }
  if (
    steps.some((step) =>
      AMBIGUOUS_STANDALONE_VERBS.includes(
        step.action.trim() as (typeof AMBIGUOUS_STANDALONE_VERBS)[number],
      ),
    )
  ) {
    failures.push('no_ambiguous_standalone_verbs');
  }

  return { passed: failures.length === 0, failures };
}

function appliedPenalties(
  candidate: PlanCandidate,
): Partial<Record<QualityPenalty, number>> {
  const penalties: Partial<Record<QualityPenalty, number>> = {};
  const actions = candidate.steps.map((step) => step.action);

  if (actions.some((action) => BROAD_ACTION_PATTERN.test(action))) {
    penalties.underChunking = QUALITY_PENALTY_WEIGHTS.underChunking;
  }
  if (candidate.steps[2].primitive === 'MARK_NEXT_POINT') {
    penalties.triviality = QUALITY_PENALTY_WEIGHTS.triviality;
  }
  if (
    new Set(candidate.steps.map((step) => step.primitive)).size !==
    candidate.steps.length
  ) {
    penalties.repetition = QUALITY_PENALTY_WEIGHTS.repetition;
  }
  if (
    candidate.steps.some(
      (step) =>
        step.role !== 'NARROW' &&
        /고르기|선택하기|정하기/.test(step.action),
    )
    || (
      candidate.steps[1].primitive !== 'SELECT_ONE' &&
      /고른|선택한/.test(candidate.steps[2].action)
    )
  ) {
    penalties.hiddenDecision = QUALITY_PENALTY_WEIGHTS.hiddenDecision;
  }

  return penalties;
}

export function scorePlanCandidate(
  candidate: PlanCandidate,
  barrierType: BarrierType,
): PlanScoreBreakdown {
  const strategyName = candidate.strategyId.split(':').at(-1);
  const criteria = {
    barrierFit:
      candidate.strategyId.startsWith(`${barrierType}:`) &&
      !(
        barrierType === 'sequence_uncertainty' &&
        strategyName === 'scope_first'
      )
        ? QUALITY_SCORE_WEIGHTS.barrierFit
        : 20,
    immediateStartability:
      candidate.steps[0].primitive === 'OPEN_TARGET'
        ? QUALITY_SCORE_WEIGHTS.immediateStartability
        : 22,
    meaningfulProgress:
      candidate.steps[2].primitive === 'CREATE_FIRST_OUTPUT'
        ? QUALITY_SCORE_WEIGHTS.meaningfulProgress
        : 14,
    decisionRemoval:
      candidate.steps[1].primitive === 'SELECT_ONE' ||
      candidate.steps[1].primitive === 'REDUCE_SCOPE'
        ? QUALITY_SCORE_WEIGHTS.decisionRemoval
        : 6,
    stepCoherence: QUALITY_SCORE_WEIGHTS.stepCoherence,
    toneSafety: QUALITY_SCORE_WEIGHTS.toneSafety,
  };
  const penalties = appliedPenalties(candidate);
  const total =
    Object.values(criteria).reduce((sum, score) => sum + score, 0) -
    Object.values(penalties).reduce(
      (sum, penalty) => sum + (penalty ?? 0),
      0,
    );

  return { criteria, penalties, total };
}

export function selectBestCandidate(
  evaluatedCandidates: readonly EvaluatedPlanCandidate[],
  confidenceBand: ConfidenceBand,
): EvaluatedPlanCandidate | null {
  if (confidenceBand === 'low') {
    return null;
  }

  let selected: EvaluatedPlanCandidate | null = null;
  for (const evaluated of evaluatedCandidates) {
    if (!evaluated.gate.passed || evaluated.score === null) {
      continue;
    }
    if (
      selected === null ||
      evaluated.score.total > (selected.score?.total ?? -Infinity)
    ) {
      selected = evaluated;
    }
  }

  return selected && (selected.score?.total ?? 0) >= 70 ? selected : null;
}

export function runLocalChunkingPolicy(
  rawInput: string,
): LocalChunkingResolution {
  const normalizedInput = normalizeInput(rawInput);
  const safeRedirect = classifySafety(normalizedInput);
  if (safeRedirect) {
    return { kind: 'safe_redirect', result: safeRedirect };
  }

  const signals = extractLimitedTaskSignals(normalizedInput);
  const barrier = classifyBarrier(normalizedInput, signals);
  const candidates = generateCandidatePlans(signals, barrier.barrierType);
  const evaluatedCandidates = candidates.map((candidate) => {
    const gate = validatePlanCandidate(candidate);
    return {
      candidate,
      gate,
      score: gate.passed
        ? scorePlanCandidate(candidate, barrier.barrierType)
        : null,
    };
  });
  const selected = selectBestCandidate(
    evaluatedCandidates,
    barrier.confidenceBand,
  );
  const selectedCandidate = selected?.candidate ?? null;

  return {
    kind: 'chunking_decision',
    decision: {
      taskCategory: signals.taskCategory,
      barrierType: barrier.barrierType,
      confidenceBand: barrier.confidenceBand,
      candidates: evaluatedCandidates,
      selectedCandidate,
      descriptor: {
        policyVersion: LOCAL_CHUNKING_POLICY_VERSION,
        barrierType: barrier.barrierType,
        confidenceBand: barrier.confidenceBand,
        candidateCount: candidates.length,
        selectedStrategy: selectedCandidate?.strategyId ?? null,
        stepPrimitives:
          selectedCandidate?.steps.map((step) => step.primitive) ?? [],
        fallbackUsed: selectedCandidate === null,
      },
    },
  };
}

export function createV02LocalPlan(taskTitle: string): PlanAllowed {
  const resolution = runLocalChunkingPolicy(taskTitle);
  if (resolution.kind === 'safe_redirect') {
    throw new Error('Safe redirect cannot be converted to an allowed plan.');
  }

  const { decision } = resolution;
  if (decision.selectedCandidate === null) {
    return createGeneralFallbackPlan(normalizeInput(taskTitle));
  }

  const taskId = createPlanId('task');
  const planId = `plan_${taskId}`;
  const steps = decision.selectedCandidate.steps.map((step, index) =>
    createStep(
      planId,
      (index + 1) as 1 | 2 | 3,
      step.action,
      step.timerSeconds,
      step.completionCondition,
    ),
  ) as unknown as ActionPlan['steps'];

  return {
    kind: 'plan_allowed',
    doNotChunk: false,
    source: 'fallback',
    plan: {
      taskId,
      planId,
      taskTitle: normalizeInput(taskTitle),
      taskCategory: decision.taskCategory,
      barrierType: decision.barrierType,
      steps,
      coachMessage: '첫 단계만 시작하면 됩니다.',
    },
  };
}
