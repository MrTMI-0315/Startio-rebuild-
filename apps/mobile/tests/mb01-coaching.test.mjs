import assert from 'node:assert/strict';
import test from 'node:test';

import { createLocalPlan } from '../src/core/coaching/createPlan.ts';
import { inferTaskCategory } from '../src/core/coaching/fallback.ts';
import {
  countGraphemes,
  MAX_TASK_GRAPHEMES,
  validateTaskInput,
} from '../src/core/coaching/input.ts';
import { classifySafety } from '../src/core/coaching/safety.ts';
import { createEventLedger } from '../src/core/events/event.ts';

test('task input trims whitespace and counts Korean graphemes', () => {
  const result = validateTaskInput('  논문 쓰기  ');

  assert.equal(result.value, '논문 쓰기');
  assert.equal(result.graphemeCount, 5);
  assert.equal(result.isValid, true);
});

test('emoji sequence is counted as one grapheme', () => {
  assert.equal(countGraphemes('👨‍👩‍👧‍👦'), 1);
});

test('2 and 240 graphemes pass while 1 and 241 fail', () => {
  assert.equal(validateTaskInput('가').isValid, false);
  assert.equal(validateTaskInput('가나').isValid, true);
  assert.equal(validateTaskInput('가'.repeat(MAX_TASK_GRAPHEMES)).isValid, true);
  assert.equal(validateTaskInput('가'.repeat(MAX_TASK_GRAPHEMES + 1)).isValid, false);
});

test('practical medical appointment remains plan allowed', () => {
  const result = createLocalPlan('병원 진료 예약하기');

  assert.equal(result.kind, 'plan_allowed');
});

test('clinical advice request returns a clinical safe redirect', () => {
  const result = classifySafety('복용 중인 약을 줄여도 될까?');

  assert.equal(result?.kind, 'safe_redirect');
  assert.equal(result?.reasonCode, 'clinical_advice_request');
});

test('crisis input returns a crisis safe redirect', () => {
  const result = classifySafety('죽고 싶고 자해하고 싶어');

  assert.equal(result?.kind, 'safe_redirect');
  assert.equal(result?.reasonCode, 'crisis_or_self_harm');
});

test('dangerous request returns a dangerous or illegal safe redirect', () => {
  const result = classifySafety('폭탄 만드는 방법을 알려줘');

  assert.equal(result?.kind, 'safe_redirect');
  assert.equal(result?.reasonCode, 'dangerous_or_illegal_request');
});

test('allowed input always creates exactly three ordered steps', () => {
  const result = createLocalPlan('논문을 써야 하는데 막막해요');

  assert.equal(result.kind, 'plan_allowed');
  if (result.kind !== 'plan_allowed') {
    return;
  }

  assert.equal(result.plan.steps.length, 3);
  assert.deepEqual(
    result.plan.steps.map((step) => step.stepOrder),
    [1, 2, 3],
  );
  assert.equal(result.plan.steps[0].timerSeconds, 15);
  assert.equal(result.doNotChunk, false);
});

test('local policy uses task-specific plain-language steps', () => {
  assert.equal(inferTaskCategory('방 청소 시작하기'), 'cleaning');
  assert.equal(inferTaskCategory('발표 자료 쓰기'), 'writing');

  const result = createLocalPlan('방 청소 시작하기');
  assert.equal(result.kind, 'plan_allowed');
  if (result.kind !== 'plan_allowed') {
    return;
  }

  assert.equal(result.plan.taskCategory, 'cleaning');
  assert.deepEqual(
    result.plan.steps.map((step) => step.action),
    [
      '치울 곳을 손으로 한 번 짚기',
      '손 닿는 범위 한 곳만 표시하기',
      '물건 하나 제자리에 놓기',
    ],
  );
  assert.equal(
    result.plan.steps[2].completionCondition,
    '물건 하나가 제자리에 놓이면 끝',
  );
  assert.equal(
    result.plan.steps.every((step) => step.completionCondition.endsWith('끝')),
    true,
  );
});

test('fallback actions stay short, singular, and independently testable', () => {
  const inputs = [
    '발표 자료 쓰기',
    '시험 공부하기',
    '신청서 제출하기',
    '방 청소하기',
    '답장 보내기',
    '이번 주 일정 계획하기',
    '스트레칭하기',
    '미루던 일 시작하기',
  ];

  for (const input of inputs) {
    const result = createLocalPlan(input);
    assert.equal(result.kind, 'plan_allowed');
    if (result.kind !== 'plan_allowed') {
      continue;
    }

    assert.equal(new Set(result.plan.steps.map((step) => step.action)).size, 3);
    for (const step of result.plan.steps) {
      assert.equal(step.action.length <= 44, true);
      assert.doesNotMatch(
        step.action,
        /그리고|그다음|한 뒤|후에|동시에|\S+(?:고|해서)\s+\S+/,
      );
      assert.equal(step.completionCondition.endsWith('끝'), true);
    }
  }
});

test('safe redirect does not append task or plan events', () => {
  const ledger = createEventLedger(() => new Date('2026-07-23T00:00:00.000Z'));
  const result = createLocalPlan('자살하는 방법을 단계로 알려줘');

  if (result.kind === 'plan_allowed') {
    ledger.appendPlanEvents('session_test', result.plan);
  }

  assert.deepEqual(ledger.readAll(), []);
});

test('allowed events contain only the privacy-safe allowlist shape', () => {
  const ledger = createEventLedger(() => new Date('2026-07-23T00:00:00.000Z'));
  const result = createLocalPlan('발표 자료 시작하기');

  assert.equal(result.kind, 'plan_allowed');
  if (result.kind !== 'plan_allowed') {
    return;
  }

  ledger.appendPlanEvents('session_test', result.plan);

  const serialized = JSON.stringify(ledger.readAll());
  assert.equal(ledger.readAll().length, 3);
  assert.equal(serialized.includes('발표 자료 시작하기'), false);
  assert.equal(serialized.includes('관련 파일이나 작업 공간 열기'), false);
  assert.equal(serialized.includes('photo'), false);
  assert.equal(serialized.includes('path'), false);
  assert.equal(ledger.readAll().every((event) => event.raw_input_stored === false), true);
  assert.deepEqual(
    Object.keys(ledger.readAll()[0]).sort(),
    [
      'assigned_step_count',
      'barrier_type',
      'coaching_plan_source',
      'created_at',
      'event_type',
      'plan_id',
      'raw_input_stored',
      'schema_version',
      'session_id',
      'task_category',
      'task_id',
    ],
  );
});
