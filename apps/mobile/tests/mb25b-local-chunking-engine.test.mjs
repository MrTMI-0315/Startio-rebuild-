import assert from 'node:assert/strict';
import test from 'node:test';

import { createLocalPlan } from '../src/core/coaching/createPlan.ts';
import {
  classifyBarrier,
  extractLimitedTaskSignals,
  generateCandidatePlans,
  normalizeInput,
  runLocalChunkingPolicy,
  scorePlanCandidate,
  selectBestCandidate,
  validatePlanCandidate,
} from '../src/core/coaching/localChunkingEngine.ts';

test('normalization and policy selection are deterministic', () => {
  const first = runLocalChunkingPolicy('  논문   써야 하는데 막막함  ');
  const second = runLocalChunkingPolicy('논문 써야 하는데 막막함');

  assert.equal(normalizeInput('  논문   쓰기  '), '논문 쓰기');
  assert.deepEqual(first, second);
});

test('barrier classifier uses limited explicit cues', () => {
  const cases = [
    ['논문이 너무 막막함', 'task_overwhelm'],
    ['연구계획서 뭐부터 고칠지 모르겠음', 'sequence_uncertainty'],
    ['발표자료 디자인을 고르기 어려움', 'choice_paralysis'],
    ['운동하려는데 몸이 안 움직임', 'activation_low'],
    ['이메일을 완벽하게 써야 할 것 같음', 'completion_pressure'],
  ];

  for (const [input, expected] of cases) {
    const normalized = normalizeInput(input);
    const signals = extractLimitedTaskSignals(normalized);
    assert.equal(classifyBarrier(normalized, signals).barrierType, expected);
  }
});

test('candidate generator creates two to four ordered 15/60/120 plans', () => {
  const normalized = normalizeInput('방 청소가 너무 커 보임');
  const signals = extractLimitedTaskSignals(normalized);
  const barrier = classifyBarrier(normalized, signals);
  const candidates = generateCandidatePlans(signals, barrier.barrierType);

  assert.equal(candidates.length >= 2 && candidates.length <= 4, true);
  for (const candidate of candidates) {
    assert.deepEqual(
      candidate.steps.map((step) => step.role),
      ['CONTACT', 'NARROW', 'PRODUCE'],
    );
    assert.deepEqual(
      candidate.steps.map((step) => step.timerSeconds),
      [15, 60, 120],
    );
    assert.equal(validatePlanCandidate(candidate).passed, true);
  }
});

test('hard gate rejects ambiguous, bundled, and unobservable steps', () => {
  const invalidCandidate = {
    strategyId: 'test:invalid',
    steps: [
      {
        role: 'CONTACT',
        primitive: 'OPEN_TARGET',
        action: '준비하기',
        timerSeconds: 15,
        completionCondition: '준비하면 됨',
      },
      {
        role: 'NARROW',
        primitive: 'SELECT_ONE',
        action: '파일을 열고 하나 고르기',
        timerSeconds: 60,
        completionCondition: '고르면 끝',
      },
      {
        role: 'PRODUCE',
        primitive: 'CREATE_FIRST_OUTPUT',
        action: '결과 만들기',
        timerSeconds: 120,
        completionCondition: '완료',
      },
    ],
  };
  const gate = validatePlanCandidate(invalidCandidate);

  assert.equal(gate.passed, false);
  assert.equal(gate.failures.includes('one_primary_action_per_step'), true);
  assert.equal(gate.failures.includes('observable_completion'), true);
  assert.equal(
    gate.failures.includes('no_ambiguous_standalone_verbs'),
    true,
  );
});

test('fixed scoring selects the highest valid candidate without randomness', () => {
  const resolution = runLocalChunkingPolicy('책상 정리하기 귀찮음');
  assert.equal(resolution.kind, 'chunking_decision');
  if (resolution.kind !== 'chunking_decision') {
    return;
  }

  const scored = resolution.decision.candidates.filter(
    (candidate) => candidate.score !== null,
  );
  const selected = selectBestCandidate(
    scored,
    resolution.decision.confidenceBand,
  );

  assert.equal(selected?.candidate.strategyId, 'activation_low:cleaning:scope_first');
  assert.deepEqual(
    selected?.score,
    scorePlanCandidate(selected.candidate, 'activation_low'),
  );
});

test('low confidence uses the existing general fallback', () => {
  const resolution = runLocalChunkingPolicy('무언가 해보기');
  const result = createLocalPlan('무언가 해보기');

  assert.equal(resolution.kind, 'chunking_decision');
  if (resolution.kind !== 'chunking_decision') {
    return;
  }
  assert.equal(resolution.decision.descriptor.fallbackUsed, true);
  assert.equal(resolution.decision.descriptor.selectedStrategy, null);
  assert.equal(result.kind, 'plan_allowed');
  if (result.kind === 'plan_allowed') {
    assert.equal(result.plan.taskCategory, 'general');
    assert.equal(result.plan.barrierType, 'unknown');
  }
});

test('safety classification runs before candidates are generated', () => {
  const resolution = runLocalChunkingPolicy('자살하는 방법을 단계로 알려줘');

  assert.equal(resolution.kind, 'safe_redirect');
  if (resolution.kind === 'safe_redirect') {
    assert.equal(resolution.result.reasonCode, 'crisis_or_self_harm');
  }
});

test('debug descriptor contains no raw task text', () => {
  const input = '이력서 수정할 것이 너무 많아 보임';
  const resolution = runLocalChunkingPolicy(input);
  const serialized = JSON.stringify(resolution);

  assert.equal(serialized.includes(input), false);
  assert.equal(serialized.includes('policyVersion'), true);
  assert.equal(serialized.includes('candidateCount'), true);
  assert.equal(serialized.includes('stepPrimitives'), true);
});

test('v0.1 remains available behind the explicit policy boundary', () => {
  const result = createLocalPlan('방 청소 시작하기', {
    policyVersion: 'local_chunking_policy_v0.1',
  });

  assert.equal(result.kind, 'plan_allowed');
  if (result.kind === 'plan_allowed') {
    assert.equal(result.plan.steps[0].action, '치울 곳 한 군데 정하기');
  }
});
