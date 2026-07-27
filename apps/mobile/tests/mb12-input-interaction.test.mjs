import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const startScreenSource = await readFile(
  new URL('../src/features/start/StartScreen.tsx', import.meta.url),
  'utf8',
);

test('input screen supports native keyboard dismissal and submit behavior', () => {
  assert.match(startScreenSource, /onPress=\{Keyboard\.dismiss\}/);
  assert.match(startScreenSource, /keyboardDismissMode=/);
  assert.match(startScreenSource, /submitBehavior="blurAndSubmit"/);
});

test('input screen enforces the product limit without persistent counter noise', () => {
  assert.match(startScreenSource, /maxLength=\{MAX_TASK_GRAPHEMES\}/);
  assert.match(
    startScreenSource,
    /validation\.graphemeCount >= MAX_TASK_GRAPHEMES - 40/,
  );
  assert.doesNotMatch(startScreenSource, /isInputFocused \? '2–240자'/);
});

test('rapid presses cannot start duplicate plan submissions', () => {
  assert.match(startScreenSource, /submissionLockRef\.current/);
  assert.match(startScreenSource, /if \(submissionLockRef\.current\)/);
});
