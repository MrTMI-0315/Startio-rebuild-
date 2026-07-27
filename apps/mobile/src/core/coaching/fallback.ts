import type {
  ActionPlan,
  ActionStep,
  PlanAllowed,
  StepOrder,
  TaskCategory,
} from './result.ts';

type StepTemplate = readonly [
  action: string,
  timerSeconds: number,
  completionCondition: string,
];

const FALLBACK_STEPS: Record<TaskCategory, readonly [
  StepTemplate,
  StepTemplate,
  StepTemplate,
]> = {
  writing: [
    ['쓸 문서 열기', 15, '문서가 열리면 끝'],
    ['첫 문장에 넣을 단어 세 개 적기', 60, '단어 세 개가 보이면 끝'],
    ['첫 문장 하나 쓰기', 120, '문장 하나가 생기면 끝'],
  ],
  studying: [
    ['볼 자료 펼치기', 15, '첫 페이지가 보이면 끝'],
    ['오늘 볼 범위 한 곳 표시하기', 60, '시작할 곳을 표시하면 끝'],
    ['첫 부분을 읽고 한 줄 남기기', 120, '한 줄을 적으면 끝'],
  ],
  administrative: [
    ['필요한 페이지나 서류 열기', 15, '작성 화면이 보이면 끝'],
    ['먼저 필요한 항목 하나 찾기', 60, '항목 하나를 찾으면 끝'],
    ['첫 칸 하나 채우기', 120, '한 칸이 채워지면 끝'],
  ],
  cleaning: [
    ['치울 곳 한 군데 정하기', 15, '한 곳을 고르면 끝'],
    ['눈에 띄는 물건 하나 제자리 놓기', 60, '물건 하나를 옮기면 끝'],
    ['같은 종류만 모아 정리하기', 120, '정리 전보다 한 칸 비면 끝'],
  ],
  communication: [
    ['연락할 사람과 대화창 열기', 15, '대화창이 열리면 끝'],
    ['전할 핵심 한 줄 적기', 60, '한 줄이 적히면 끝'],
    ['짧게 다듬어 보내기', 120, '메시지를 보내면 끝'],
  ],
  planning: [
    ['메모장이나 일정 화면 열기', 15, '적을 곳이 열리면 끝'],
    ['가장 중요한 일 하나 적기', 60, '한 가지가 적히면 끝'],
    ['언제 시작할지 정하기', 120, '시작 시간이 정해지면 끝'],
  ],
  physical_action: [
    ['바로 움직일 자리 만들기', 15, '몸을 움직일 공간이 생기면 끝'],
    ['필요한 물건 하나 준비하기', 60, '준비물이 손에 닿으면 끝'],
    ['가장 쉬운 동작부터 시작하기', 120, '동작을 한 번 하면 끝'],
  ],
  general: [
    ['할 일을 시작할 화면 열기', 15, '시작할 곳이 보이면 끝'],
    ['지금 할 한 가지 고르기', 60, '한 가지를 고르면 끝'],
    ['고른 일에 2분만 손대기', 120, '작은 변화 하나가 생기면 끝'],
  ],
};

export function inferTaskCategory(taskTitle: string): TaskCategory {
  if (/청소|정리|치우|설거지|빨래/.test(taskTitle)) {
    return 'cleaning';
  }
  if (/공부|학습|시험|복습|강의|책|논문 읽/.test(taskTitle)) {
    return 'studying';
  }
  if (/글|문서|발표|보고서|기획서|논문 쓰|원고/.test(taskTitle)) {
    return 'writing';
  }
  if (/메일|연락|답장|전화|메시지|대화/.test(taskTitle)) {
    return 'communication';
  }
  if (/신청|예약|제출|서류|결제|정산/.test(taskTitle)) {
    return 'administrative';
  }
  if (/계획|일정|할 일|우선순위/.test(taskTitle)) {
    return 'planning';
  }
  if (/운동|산책|스트레칭|씻|샤워|외출/.test(taskTitle)) {
    return 'physical_action';
  }
  return 'general';
}

export function createPlanId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

export function createStep(
  planId: string,
  stepOrder: StepOrder,
  action: string,
  timerSeconds: number,
  completionCondition: string,
): ActionStep {
  return {
    stepId: `step_${planId}_${stepOrder}`,
    stepOrder,
    action,
    timerSeconds,
    completionCondition,
  };
}

export function createFallbackPlan(taskTitle: string): PlanAllowed {
  const taskId = createPlanId('task');
  const planId = `plan_${taskId}`;
  const taskCategory = inferTaskCategory(taskTitle);
  const stepTemplates = FALLBACK_STEPS[taskCategory];
  const steps = stepTemplates.map((template, index) =>
    createStep(
      planId,
      (index + 1) as StepOrder,
      template[0],
      template[1],
      template[2],
    ),
  ) as unknown as ActionPlan['steps'];

  return {
    kind: 'plan_allowed',
    doNotChunk: false,
    source: 'fallback',
    plan: {
      taskId,
      planId,
      taskTitle,
      taskCategory,
      barrierType: 'unknown',
      steps,
      coachMessage: '첫 단계만 시작하면 됩니다.',
    },
  };
}
