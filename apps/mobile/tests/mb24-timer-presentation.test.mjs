import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatTimerStartLabel,
  getElapsedSegmentCount,
  getRemainingPercent,
  TIMER_DIAL_SEGMENT_COUNT,
} from '../src/features/timer/timerPresentation.ts';

test('timer dial uses 24 deterministic remaining-time segments', () => {
  assert.equal(TIMER_DIAL_SEGMENT_COUNT, 24);
  assert.equal(getElapsedSegmentCount(0), 0);
  assert.equal(getElapsedSegmentCount(0.5), 12);
  assert.equal(getElapsedSegmentCount(1), 24);
});

test('timer presentation clamps progress before deriving remaining time', () => {
  assert.equal(getElapsedSegmentCount(-1), 0);
  assert.equal(getElapsedSegmentCount(2), 24);
  assert.equal(getRemainingPercent(-1), 100);
  assert.equal(getRemainingPercent(0.25), 75);
  assert.equal(getRemainingPercent(2), 0);
});

test('idle CTA states the actual duration without changing timer policy', () => {
  assert.equal(formatTimerStartLabel(15), '15초 시작');
  assert.equal(formatTimerStartLabel(60), '1분 시작');
  assert.equal(formatTimerStartLabel(120), '2분 시작');
  assert.equal(formatTimerStartLabel(75), '1분 15초 시작');
});
