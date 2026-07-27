import assert from 'node:assert/strict';
import test from 'node:test';

import { createFallbackPlan } from '../src/core/coaching/fallback.ts';
import { createEventLedger } from '../src/core/events/event.ts';
import {
  abandonTimer,
  completeCurrentStep,
  createTimerState,
  getActiveElapsedMs,
  getOvertimeMs,
  getRemainingMs,
  getStepProgress,
  pauseTimer,
  resumeTimer,
  startTimer,
} from '../src/core/session/timerMachine.ts';

function createPlan() {
  return createFallbackPlan('발표 자료 시작하기').plan;
}

test('timer derives remaining time from timestamps instead of interval accumulation', () => {
  const plan = createPlan();
  const started = startTimer(createTimerState(), 1_000);

  assert.equal(getRemainingMs(started, plan, 6_000), 10_000);
});

test('paused time does not reduce remaining time', () => {
  const plan = createPlan();
  const started = startTimer(createTimerState(), 1_000);
  const paused = pauseTimer(started, 6_000);

  assert.equal(getRemainingMs(paused, plan, 16_000), 10_000);

  const resumed = resumeTimer(paused, 16_000);
  assert.equal(getRemainingMs(resumed, plan, 21_000), 5_000);
});

test('a running step can complete early and records the saved time', () => {
  const plan = createPlan();
  const started = startTimer(createTimerState(), 1_000);
  const completed = completeCurrentStep(started, plan, 6_000);

  assert.equal(completed.status, 'idle');
  assert.equal(completed.currentStepOrder, 2);
  assert.equal(completed.stepTimings[0].activeMs, 5_000);
  assert.equal(completed.stepTimings[0].varianceMs, -10_000);
});

test('timer keeps running after the target and reports overtime', () => {
  const plan = createPlan();
  const started = startTimer(createTimerState(), 1_000);

  assert.equal(getRemainingMs(started, plan, 18_000), 0);
  assert.equal(getActiveElapsedMs(started, 18_000), 17_000);
  assert.equal(getOvertimeMs(started, plan, 18_000), 2_000);
  assert.equal(getStepProgress(started, plan, 18_000), 1);
});

test('steps can only advance in the order 1 then 2 then 3', () => {
  const plan = createPlan();
  const stepOneRunning = startTimer(createTimerState(), 0);
  const stepTwoIdle = completeCurrentStep(stepOneRunning, plan, 15_000);

  assert.equal(stepTwoIdle.status, 'idle');
  assert.equal(stepTwoIdle.currentStepOrder, 2);
  assert.equal(stepTwoIdle.completedStepCount, 1);

  const stepTwoRunning = startTimer(stepTwoIdle, 20_000);
  const stepThreeIdle = completeCurrentStep(stepTwoRunning, plan, 80_000);

  assert.equal(stepThreeIdle.status, 'idle');
  assert.equal(stepThreeIdle.currentStepOrder, 3);
  assert.equal(stepThreeIdle.completedStepCount, 2);

  const stepThreeRunning = startTimer(stepThreeIdle, 90_000);
  const completed = completeCurrentStep(stepThreeRunning, plan, 210_000);

  assert.equal(completed.status, 'completed');
  assert.equal(completed.currentStepOrder, 3);
  assert.equal(completed.completedStepCount, 3);
});

test('invalid repeated controls return the same state', () => {
  const idle = createTimerState();
  const running = startTimer(idle, 0);
  const paused = pauseTimer(running, 1_000);

  assert.equal(startTimer(running, 2_000), running);
  assert.equal(pauseTimer(paused, 2_000), paused);
  assert.equal(resumeTimer(running, 2_000), running);
});

test('abandon is terminal and idempotent', () => {
  const abandoned = abandonTimer(startTimer(createTimerState(), 0), 1_000);

  assert.equal(abandoned.status, 'abandoned');
  assert.equal(abandonTimer(abandoned, 2_000), abandoned);
});

test('terminal timer events are deduplicated and contain no task copy', () => {
  const plan = createPlan();
  const ledger = createEventLedger(() => new Date('2026-07-23T00:00:00.000Z'));
  const step = plan.steps[0];
  const details = {
    activeTimerSeconds: 15,
    lastCompletedStepIndex: 1,
    completionStatus: 'in_progress',
  };

  ledger.appendTimerEvent('session_test', plan, step, 'timer_completed', details);
  ledger.appendTimerEvent('session_test', plan, step, 'timer_completed', details);

  const events = ledger.readAll();
  const serialized = JSON.stringify(events);

  assert.equal(events.length, 1);
  assert.equal(events[0].step_id, step.stepId);
  assert.equal(events[0].step_index, 1);
  assert.equal(events[0].assigned_step_count, 3);
  assert.equal(events[0].raw_input_stored, false);
  assert.equal(serialized.includes('발표 자료 시작하기'), false);
  assert.equal(serialized.includes(step.action), false);
});
