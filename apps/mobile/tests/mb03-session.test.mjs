import assert from 'node:assert/strict';
import test from 'node:test';

import { createFallbackPlan } from '../src/core/coaching/fallback.ts';
import { createEventLedger } from '../src/core/events/event.ts';
import { createCompletionState } from '../src/core/session/completion.ts';
import {
  createSessionSnapshot,
  normalizeRestoredTimerState,
  parseSessionSnapshot,
} from '../src/core/session/session.ts';
import {
  abandonTimer,
  createTimerState,
  restartAbandonedTimer,
  startTimer,
} from '../src/core/session/timerMachine.ts';
import { createSessionRepository } from '../src/core/storage/sessionRepository.ts';

function createFixture() {
  const plan = createFallbackPlan('발표 자료 시작하기');
  const ledger = createEventLedger(() => new Date('2026-07-23T00:00:00.000Z'));
  ledger.appendPlanEvents('session_stable', plan.plan);
  ledger.appendLifecycleEvent('session_stable', plan.plan, 'session_started', 0);

  return createSessionSnapshot({
    sessionId: 'session_stable',
    result: plan,
    timerState: startTimer(createTimerState(), 1_000),
    completionState: createCompletionState(),
    events: ledger.readAll(),
    savedAt: new Date('2026-07-23T00:00:01.000Z'),
  });
}

test('repository falls back to the previous valid snapshot when newest is corrupt', async () => {
  const snapshot = createFixture();
  const storage = {
    async readCandidates() {
      return ['{"partial":', JSON.stringify(snapshot)];
    },
    async write() {},
    async clear() {},
  };

  const restored = await createSessionRepository(storage).load();

  assert.equal(restored?.sessionId, 'session_stable');
  assert.equal(restored?.product.result.plan.taskId, snapshot.product.result.plan.taskId);
  assert.equal(restored?.product.result.plan.planId, snapshot.product.result.plan.planId);
});

test('missing or corrupt local data safely returns no session', async () => {
  const emptyStorage = {
    async readCandidates() {
      return [];
    },
    async write() {},
    async clear() {},
  };
  const corruptStorage = {
    ...emptyStorage,
    async readCandidates() {
      return ['not-json', '{"version":"unknown"}'];
    },
  };

  assert.equal(await createSessionRepository(emptyStorage).load(), null);
  assert.equal(await createSessionRepository(corruptStorage).load(), null);
});

test('restoring a running timer pauses at reentry without completing it', () => {
  const snapshot = createFixture();
  const restored = normalizeRestoredTimerState(snapshot.product.timerState, 9_000);

  assert.equal(restored.status, 'paused');
  assert.equal(restored.pausedAt, 9_000);
  assert.equal(restored.completedStepCount, 0);
  assert.equal(
    snapshot.analytics.events.some((event) => event.event_type === 'timer_completed'),
    false,
  );
});

test('abandoned work restarts the same current step and keeps completed progress', () => {
  const abandoned = abandonTimer(
    {
      ...createTimerState(),
      currentStepOrder: 2,
      completedStepCount: 1,
    },
    5_000,
  );
  const restarted = restartAbandonedTimer(abandoned);

  assert.equal(restarted.status, 'idle');
  assert.equal(restarted.currentStepOrder, 2);
  assert.equal(restarted.completedStepCount, 1);
  assert.equal(restarted.abandonedAt, null);
});

test('local task copy stays in product state and never enters analytics events', () => {
  const snapshot = createFixture();
  const productSerialized = JSON.stringify(snapshot.product);
  const analyticsSerialized = JSON.stringify(snapshot.analytics);

  assert.equal(productSerialized.includes('발표 자료 시작하기'), true);
  assert.equal(analyticsSerialized.includes('발표 자료 시작하기'), false);
  assert.equal(analyticsSerialized.includes('관련 파일이나 작업 공간 열기'), false);
});

test('snapshot parser rejects analytics fields outside the privacy allowlist', () => {
  const snapshot = createFixture();
  const unsafe = structuredClone(snapshot);
  unsafe.analytics.events[0].raw_input = '발표 자료 시작하기';

  assert.equal(parseSessionSnapshot(JSON.stringify(unsafe)), null);
});

test('v0.1 snapshots migrate to an empty completion state', () => {
  const snapshot = createFixture();
  const legacy = structuredClone(snapshot);
  legacy.version = 'session_snapshot_v0.1';
  delete legacy.product.completionState;

  const restored = parseSessionSnapshot(JSON.stringify(legacy));

  assert.deepEqual(restored?.product.completionState, { records: [] });
  assert.equal(restored?.version, 'session_snapshot_v0.3');
});

test('lifecycle events preserve stable ids and contain no task copy', () => {
  const snapshot = createFixture();
  const plan = snapshot.product.result.plan;
  const ledger = createEventLedger(() => new Date('2026-07-23T00:01:00.000Z'));
  ledger.hydrate(snapshot.analytics.events);
  ledger.appendLifecycleEvent(
    snapshot.sessionId,
    plan,
    'session_resumed',
    snapshot.product.timerState.completedStepCount,
  );
  ledger.appendLifecycleEvent(
    snapshot.sessionId,
    plan,
    'reentry_prompt_created',
    snapshot.product.timerState.completedStepCount,
  );

  const events = ledger.readAll();
  const latest = events.at(-1);
  const serialized = JSON.stringify(events);

  assert.equal(latest?.session_id, snapshot.sessionId);
  assert.equal(latest?.task_id, plan.taskId);
  assert.equal(latest?.plan_id, plan.planId);
  assert.equal(serialized.includes(plan.taskTitle), false);
});

test('each restored app entry records a new opened and reentry event', () => {
  const snapshot = createFixture();
  const ledger = createEventLedger(() => new Date('2026-07-23T00:02:00.000Z'));
  ledger.hydrate(snapshot.analytics.events);

  ledger.appendLifecycleEvent(snapshot.sessionId, snapshot.product.result.plan, 'app_opened', 0);
  ledger.appendLifecycleEvent(snapshot.sessionId, snapshot.product.result.plan, 'app_opened', 0);
  ledger.appendLifecycleEvent(
    snapshot.sessionId,
    snapshot.product.result.plan,
    'reentry_prompt_created',
    0,
  );
  ledger.appendLifecycleEvent(
    snapshot.sessionId,
    snapshot.product.result.plan,
    'reentry_prompt_created',
    0,
  );

  assert.equal(
    ledger.readAll().filter((event) => event.event_type === 'app_opened').length,
    2,
  );
  assert.equal(
    ledger.readAll().filter((event) => event.event_type === 'reentry_prompt_created').length,
    2,
  );
});

test('a failed write does not poison later session saves', async () => {
  const writes = [];
  let attempt = 0;
  const storage = {
    async readCandidates() {
      return [];
    },
    async write(value) {
      attempt += 1;
      if (attempt === 1) {
        throw new Error('disk unavailable');
      }
      writes.push(value);
    },
    async clear() {},
  };
  const repository = createSessionRepository(storage);
  const snapshot = createFixture();

  await assert.rejects(repository.save(snapshot));
  await repository.save(snapshot);

  assert.equal(writes.length, 1);
});
