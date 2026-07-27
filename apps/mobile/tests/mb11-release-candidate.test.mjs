import assert from 'node:assert/strict';
import test from 'node:test';

import { createFallbackPlan } from '../src/core/coaching/fallback.ts';
import {
  completeWithCheck,
  createCompletionState,
} from '../src/core/session/completion.ts';
import { resolveFlowRoute } from '../src/core/session/routeGuard.ts';
import {
  createSessionSnapshot,
  normalizeRestoredTimerState,
  parseSessionSnapshot,
} from '../src/core/session/session.ts';
import {
  completeCurrentStep,
  createTimerState,
  startTimer,
} from '../src/core/session/timerMachine.ts';

const allowed = createFallbackPlan('발표 자료 시작하기');

test('cold deep links wait for hydration instead of racing back to home', () => {
  assert.deepEqual(
    resolveFlowRoute({
      target: '/timer',
      isHydrated: false,
      result: null,
      timerState: null,
    }),
    { kind: 'pending' },
  );
});

test('deep links without an active plan are guarded to home', () => {
  for (const target of ['/plan', '/timer', '/done']) {
    assert.deepEqual(
      resolveFlowRoute({
        target,
        isHydrated: true,
        result: null,
        timerState: null,
      }),
      { kind: 'redirect', href: '/' },
    );
  }
});

test('active and completed sessions have a single canonical route', () => {
  const running = startTimer(createTimerState(), 1_000);
  const completed = {
    ...running,
    status: 'completed',
    completedStepCount: 3,
    currentStepOrder: 3,
    completedAt: 10_000,
  };

  assert.deepEqual(
    resolveFlowRoute({
      target: '/plan',
      isHydrated: true,
      result: allowed,
      timerState: running,
    }),
    { kind: 'redirect', href: '/timer' },
  );
  assert.deepEqual(
    resolveFlowRoute({
      target: '/timer',
      isHydrated: true,
      result: allowed,
      timerState: completed,
    }),
    { kind: 'redirect', href: '/done' },
  );
  assert.deepEqual(
    resolveFlowRoute({
      target: '/done',
      isHydrated: true,
      result: allowed,
      timerState: completed,
    }),
    { kind: 'allow' },
  );
});

test('process restore pauses the current step and preserves one EXP grant', () => {
  let timerState = createTimerState();
  let now = 1_000;

  for (const step of allowed.plan.steps) {
    timerState = startTimer(timerState, now);
    now += step.timerSeconds * 1_000;
    timerState = completeCurrentStep(timerState, allowed.plan, now);
    now += 1_000;
  }

  const first = completeWithCheck({
    state: createCompletionState(),
    plan: allowed.plan,
    timerState,
    completedAt: new Date('2026-07-27T00:00:00.000Z'),
  });
  assert.equal(first.outcome, 'completed');

  const snapshot = createSessionSnapshot({
    sessionId: 'session_mb11',
    result: allowed,
    timerState,
    completionState: first.state,
    events: [],
  });
  const restored = parseSessionSnapshot(JSON.stringify(snapshot));
  assert.ok(restored);
  assert.equal(
    normalizeRestoredTimerState(restored.product.timerState, now).status,
    'completed',
  );

  const duplicate = completeWithCheck({
    state: restored.product.completionState,
    plan: restored.product.result.plan,
    timerState: restored.product.timerState,
  });
  assert.equal(duplicate.outcome, 'already_completed');
  assert.equal(duplicate.state.records.length, 1);
  assert.equal(duplicate.record.reward.amount, 30);
});

test('privacy manifest draft discloses consented task processing without tracking', async () => {
  const { readFile } = await import('node:fs/promises');
  const appConfig = JSON.parse(
    await readFile(new URL('../app.json', import.meta.url), 'utf8'),
  );
  const manifest = appConfig.expo.ios.privacyManifests;

  assert.equal(manifest.NSPrivacyTracking, false);
  assert.deepEqual(manifest.NSPrivacyTrackingDomains, []);
  assert.deepEqual(manifest.NSPrivacyCollectedDataTypes, [
    {
      NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeOtherUserContent',
      NSPrivacyCollectedDataTypeLinked: false,
      NSPrivacyCollectedDataTypeTracking: false,
      NSPrivacyCollectedDataTypePurposes: [
        'NSPrivacyCollectedDataTypePurposeAppFunctionality',
      ],
    },
  ]);
  assert.match(
    appConfig.expo.plugins[1][1].photosPermission,
    /이 기기에만 저장/,
  );
  assert.match(
    appConfig.expo.plugins[1][1].cameraPermission,
    /카메라를 사용/,
  );
  assert.equal(appConfig.expo.plugins[1][1].microphonePermission, false);
});
