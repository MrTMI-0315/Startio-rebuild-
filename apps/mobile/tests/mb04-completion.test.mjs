import assert from 'node:assert/strict';
import test from 'node:test';

import { createFallbackPlan } from '../src/core/coaching/fallback.ts';
import { createEventLedger } from '../src/core/events/event.ts';
import {
  completeWithCheck,
  createCompletionState,
} from '../src/core/session/completion.ts';
import { createSessionSnapshot, parseSessionSnapshot } from '../src/core/session/session.ts';
import { createTimerState } from '../src/core/session/timerMachine.ts';

function createPlan() {
  return createFallbackPlan('발표 자료 시작하기');
}

function createCompletedTimer() {
  return {
    ...createTimerState(),
    status: 'completed',
    currentStepOrder: 3,
    completedStepCount: 3,
    completedAt: 10_000,
  };
}

test('check completion is blocked until all three timer steps are complete', () => {
  const result = createPlan();
  const transaction = completeWithCheck({
    state: createCompletionState(),
    plan: result.plan,
    timerState: createTimerState(),
    completedAt: new Date('2026-07-23T01:00:00.000Z'),
  });

  assert.equal(transaction.outcome, 'not_eligible');
  assert.equal(transaction.record, null);
  assert.deepEqual(transaction.state.records, []);
});

test('completed timer creates one check proof and one EXP 30 grant atomically', () => {
  const result = createPlan();
  const transaction = completeWithCheck({
    state: createCompletionState(),
    plan: result.plan,
    timerState: createCompletedTimer(),
    completedAt: new Date('2026-07-23T01:00:00.000Z'),
  });

  assert.equal(transaction.outcome, 'completed');
  assert.equal(transaction.state.records.length, 1);
  assert.equal(transaction.record?.proof.proofType, 'check');
  assert.equal(transaction.record?.reward.amount, 30);
  assert.equal(
    transaction.record?.completionKey,
    `${result.plan.taskId}:${result.plan.planId}`,
  );
});

test('repeated completion for the same task and plan cannot grant EXP twice', () => {
  const result = createPlan();
  const first = completeWithCheck({
    state: createCompletionState(),
    plan: result.plan,
    timerState: createCompletedTimer(),
    completedAt: new Date('2026-07-23T01:00:00.000Z'),
  });
  const second = completeWithCheck({
    state: first.state,
    plan: result.plan,
    timerState: createCompletedTimer(),
    completedAt: new Date('2026-07-23T01:01:00.000Z'),
  });

  assert.equal(second.outcome, 'already_completed');
  assert.equal(second.state, first.state);
  assert.equal(second.state.records.length, 1);
  assert.equal(second.state.records[0].reward.amount, 30);
});

test('completion events are deduplicated and contain no task or generated copy', () => {
  const result = createPlan();
  const ledger = createEventLedger(() => new Date('2026-07-23T01:00:00.000Z'));

  ledger.appendCompletionEvents('session_complete', result.plan);
  ledger.appendCompletionEvents('session_complete', result.plan);

  const completionEvents = ledger.readAll();
  const serialized = JSON.stringify(completionEvents);
  assert.deepEqual(
    completionEvents.map((event) => event.event_type),
    ['proof_submitted', 'exp_granted', 'session_ended'],
  );
  assert.equal(completionEvents[0].proof_submitted, true);
  assert.equal(completionEvents[1].exp_granted, 30);
  assert.equal(serialized.includes(result.plan.taskTitle), false);
  assert.equal(serialized.includes(result.plan.steps[0].action), false);
});

test('snapshot stores proof and reward in the same completion record', () => {
  const result = createPlan();
  const transaction = completeWithCheck({
    state: createCompletionState(),
    plan: result.plan,
    timerState: createCompletedTimer(),
    completedAt: new Date('2026-07-23T01:00:00.000Z'),
  });
  const ledger = createEventLedger(() => new Date('2026-07-23T01:00:00.000Z'));
  ledger.appendCompletionEvents('session_complete', result.plan);
  const snapshot = createSessionSnapshot({
    sessionId: 'session_complete',
    result,
    timerState: createCompletedTimer(),
    completionState: transaction.state,
    events: ledger.readAll(),
    savedAt: new Date('2026-07-23T01:00:00.000Z'),
  });
  const restored = parseSessionSnapshot(JSON.stringify(snapshot));

  assert.equal(restored?.product.completionState.records.length, 1);
  assert.equal(restored?.product.completionState.records[0].proof.proofType, 'check');
  assert.equal(restored?.product.completionState.records[0].reward.amount, 30);
});

test('snapshot rejects an incomplete proof-only completion record', () => {
  const result = createPlan();
  const unsafeSnapshot = {
    version: 'session_snapshot_v0.2',
    sessionId: 'session_complete',
    savedAt: '2026-07-23T01:00:00.000Z',
    product: {
      result,
      timerState: createCompletedTimer(),
      completionState: {
        records: [
          {
            completionKey: `${result.plan.taskId}:${result.plan.planId}`,
            taskId: result.plan.taskId,
            planId: result.plan.planId,
            proof: {
              proofType: 'check',
              submittedAt: '2026-07-23T01:00:00.000Z',
            },
            sessionEndedAt: '2026-07-23T01:00:00.000Z',
          },
        ],
      },
    },
    analytics: { events: [] },
  };

  assert.equal(parseSessionSnapshot(JSON.stringify(unsafeSnapshot)), null);
});
