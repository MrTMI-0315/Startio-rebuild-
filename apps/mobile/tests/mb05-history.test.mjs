import assert from 'node:assert/strict';
import test from 'node:test';

import { createFallbackPlan } from '../src/core/coaching/fallback.ts';
import { createEventLedger } from '../src/core/events/event.ts';
import {
  appendHistory,
  appendHistoryEvents,
  createHistoryArchive,
  createHistoryRecord,
  parseHistoryArchive,
} from '../src/core/events/historyProjection.ts';
import { calculateBasicKpi } from '../src/core/events/kpi.ts';
import {
  completeWithCheck,
  createCompletionState,
} from '../src/core/session/completion.ts';
import { createTimerState } from '../src/core/session/timerMachine.ts';

function createCompletedTimer() {
  return {
    ...createTimerState(),
    status: 'completed',
    currentStepOrder: 3,
    completedStepCount: 3,
    stepTimings: [
      {
        stepOrder: 1,
        plannedMs: 15_000,
        activeMs: 10_000,
        varianceMs: -5_000,
        completedAt: Date.parse('2026-07-23T02:01:00.000Z'),
      },
      {
        stepOrder: 2,
        plannedMs: 60_000,
        activeMs: 70_000,
        varianceMs: 10_000,
        completedAt: Date.parse('2026-07-23T02:03:00.000Z'),
      },
      {
        stepOrder: 3,
        plannedMs: 120_000,
        activeMs: 100_000,
        varianceMs: -20_000,
        completedAt: Date.parse('2026-07-23T02:05:00.000Z'),
      },
    ],
    completedAt: Date.parse('2026-07-23T02:05:00.000Z'),
  };
}

function createCompletedFixture() {
  const result = createFallbackPlan('발표 자료 시작하기');
  const timestamps = [
    '2026-07-23T02:00:00.000Z',
    '2026-07-23T02:00:00.000Z',
    '2026-07-23T02:00:12.000Z',
    '2026-07-23T02:05:00.000Z',
  ];
  const ledger = createEventLedger(
    () => new Date(timestamps.shift() ?? '2026-07-23T02:05:00.000Z'),
  );
  ledger.appendPlanEvents('session_history', result.plan);
  ledger.appendLifecycleEvent('session_history', result.plan, 'session_started', 0);
  ledger.appendTimerEvent(
    'session_history',
    result.plan,
    result.plan.steps[0],
    'timer_started',
    {
      activeTimerSeconds: 0,
      lastCompletedStepIndex: 0,
      completionStatus: 'in_progress',
    },
  );
  const completion = completeWithCheck({
    state: createCompletionState(),
    plan: result.plan,
    timerState: createCompletedTimer(),
    completedAt: new Date('2026-07-23T02:05:00.000Z'),
  });
  ledger.appendCompletionEvents('session_history', result.plan);
  const record = createHistoryRecord({
    sessionId: 'session_history',
    plan: result.plan,
    timerState: createCompletedTimer(),
    completion: completion.record,
    events: ledger.readAll(),
  });

  return { result, ledger, record };
}

test('empty history produces zero rates without fake latency data', () => {
  assert.deepEqual(calculateBasicKpi([]), {
    taskStartRate: 0,
    taskCompletionRate: 0,
    recentStartLatencySeconds: null,
  });
});

test('a generated plan without a timer remains in the KPI denominator', () => {
  const result = createFallbackPlan('책상 정리 시작하기');
  const ledger = createEventLedger(() => new Date('2026-07-23T03:00:00.000Z'));
  ledger.appendPlanEvents('session_not_started', result.plan);
  const archive = appendHistoryEvents(createHistoryArchive(), ledger.readAll());
  const kpi = calculateBasicKpi(archive.events);

  assert.equal(archive.records.length, 0);
  assert.equal(kpi.taskStartRate, 0);
  assert.equal(kpi.taskCompletionRate, 0);
});

test('only the first timer start per plan contributes to task start rate', () => {
  const { result, ledger } = createCompletedFixture();
  ledger.appendTimerEvent(
    'session_history',
    result.plan,
    result.plan.steps[1],
    'timer_started',
    {
      activeTimerSeconds: 0,
      lastCompletedStepIndex: 1,
      completionStatus: 'in_progress',
    },
  );

  const kpi = calculateBasicKpi(ledger.readAll());

  assert.equal(kpi.taskStartRate, 1);
  assert.equal(kpi.taskCompletionRate, 1);
  assert.equal(kpi.recentStartLatencySeconds, 12);
});

test('history projection keeps local display copy separate from analytics events', () => {
  const { result, ledger, record } = createCompletedFixture();

  assert.ok(record);
  assert.equal(record.taskTitle, result.plan.taskTitle);
  assert.equal(record.completedStepCount, 3);
  assert.equal(record.expGranted, 30);
  assert.equal(record.startLatencySeconds, 12);
  assert.equal(record.plannedDurationSeconds, 195);
  assert.equal(record.activeDurationSeconds, 180);
  assert.equal(record.overtimeSeconds, 10);
  assert.equal(record.savedSeconds, 25);
  assert.equal('barrierType' in record, false);
  assert.equal(JSON.stringify(ledger.readAll()).includes(result.plan.taskTitle), false);
  assert.equal(
    JSON.stringify(ledger.readAll()).includes(result.plan.steps[0].action),
    false,
  );
});

test('adding the same completed task twice keeps one history record', () => {
  const { ledger, record } = createCompletedFixture();
  const first = appendHistory(createHistoryArchive(), record, ledger.readAll());
  const second = appendHistory(first, record, ledger.readAll());

  assert.equal(second.records.length, 1);
  assert.equal(second.events.length, first.events.length);
});

test('history parser rejects raw task, generated copy, photo path, and free text fields', () => {
  const { ledger, record } = createCompletedFixture();
  const archive = appendHistory(createHistoryArchive(), record, ledger.readAll());
  const forbiddenFields = [
    ['raw_input', '발표 자료 시작하기'],
    ['action', '관련 파일 열기'],
    ['photo_uri', 'file:///private/photo.jpg'],
    ['path', '/private/photo.jpg'],
    ['email', 'person@example.com'],
    ['free_text', '사용자 메모'],
  ];

  for (const [key, value] of forbiddenFields) {
    const unsafe = structuredClone(archive);
    unsafe.events[0][key] = value;
    assert.equal(parseHistoryArchive(JSON.stringify(unsafe)), null);
  }

  const unsafeRecord = structuredClone(archive);
  unsafeRecord.records[0].barrierType = 'avoidance_emotion';
  assert.equal(parseHistoryArchive(JSON.stringify(unsafeRecord)), null);
});

test('valid history archive survives serialization', () => {
  const { ledger, record } = createCompletedFixture();
  const archive = appendHistory(createHistoryArchive(), record, ledger.readAll());
  const restored = parseHistoryArchive(JSON.stringify(archive));

  assert.equal(restored?.records.length, 1);
  assert.equal(restored?.records[0].taskTitle, record.taskTitle);
  assert.equal(restored?.events.every((event) => event.raw_input_stored === false), true);
});
