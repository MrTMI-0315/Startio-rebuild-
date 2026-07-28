import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ACTION_PRIMITIVES,
  AMBIGUOUS_STANDALONE_VERBS,
  BARRIER_TYPES,
  LOCAL_CHUNKING_POLICY_VERSION,
  QUALITY_GATE_RULES,
  QUALITY_PENALTY_WEIGHTS,
  QUALITY_SCORE_WEIGHTS,
  STEP_ROLES,
  STEP_TIMER_SECONDS,
} from '../src/core/coaching/localChunkingPolicy.ts';

test('local chunking v0.2 exposes the fixed barrier and role vocabulary', () => {
  assert.equal(LOCAL_CHUNKING_POLICY_VERSION, 'local_chunking_policy_v0.2');
  assert.deepEqual(BARRIER_TYPES, [
    'task_overwhelm',
    'sequence_uncertainty',
    'choice_paralysis',
    'activation_low',
    'completion_pressure',
    'unknown',
  ]);
  assert.deepEqual(STEP_ROLES, ['CONTACT', 'NARROW', 'PRODUCE']);
});

test('action primitives and timers preserve the three-step execution contract', () => {
  assert.deepEqual(ACTION_PRIMITIVES, [
    'OPEN_TARGET',
    'RESTORE_LAST_POSITION',
    'SELECT_ONE',
    'REDUCE_SCOPE',
    'CREATE_FIRST_OUTPUT',
    'MARK_NEXT_POINT',
  ]);
  assert.deepEqual(STEP_TIMER_SECONDS, {
    CONTACT: 15,
    NARROW: 60,
    PRODUCE: 120,
  });
});

test('quality weights total 100 and penalties stay separate', () => {
  assert.equal(
    Object.values(QUALITY_SCORE_WEIGHTS).reduce(
      (total, weight) => total + weight,
      0,
    ),
    100,
  );
  assert.deepEqual(QUALITY_PENALTY_WEIGHTS, {
    underChunking: 20,
    triviality: 15,
    repetition: 15,
    hiddenDecision: 10,
  });
});

test('hard gate includes exact role order and rejects ambiguous standalone verbs', () => {
  assert.equal(QUALITY_GATE_RULES.includes('exact_three_steps'), true);
  assert.equal(QUALITY_GATE_RULES.includes('ordered_step_roles'), true);
  assert.equal(
    QUALITY_GATE_RULES.includes('no_ambiguous_standalone_verbs'),
    true,
  );
  assert.deepEqual(AMBIGUOUS_STANDALONE_VERBS, [
    '생각해보기',
    '정리하기',
    '준비하기',
    '확인하기',
    '시작하기',
    '진행하기',
  ]);
});
