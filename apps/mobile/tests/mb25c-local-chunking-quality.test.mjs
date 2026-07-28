import assert from 'node:assert/strict';
import test from 'node:test';

import { createLocalPlan } from '../src/core/coaching/createPlan.ts';
import {
  runLocalChunkingPolicy,
  validatePlanCandidate,
} from '../src/core/coaching/localChunkingEngine.ts';
import {
  AMBIGUOUS_STANDALONE_VERBS,
  STEP_ROLES,
} from '../src/core/coaching/localChunkingPolicy.ts';
import {
  GOLDEN_FIXTURE_IDS,
  LOCAL_CHUNKING_FIXTURES,
  SAFETY_FIXTURES,
} from './fixtures/local-chunking-v0.2.fixtures.mjs';

const BUNDLED_ACTION_PATTERN =
  /그리고|그다음|한 뒤|후에|동시에|\S+(?:고|해서)\s+\S+/;

test('fixture suite contains 36 plan inputs with at least five per barrier', () => {
  assert.equal(LOCAL_CHUNKING_FIXTURES.length, 36);
  const counts = Object.groupBy(
    LOCAL_CHUNKING_FIXTURES,
    (fixture) => fixture.expectedBarrier,
  );

  for (const barrier of [
    'task_overwhelm',
    'sequence_uncertainty',
    'choice_paralysis',
    'activation_low',
    'completion_pressure',
    'unknown',
  ]) {
    assert.equal((counts[barrier] ?? []).length >= 5, true);
  }
});

test('all plan fixtures classify as expected and return deterministic candidates', () => {
  for (const fixture of LOCAL_CHUNKING_FIXTURES) {
    const first = runLocalChunkingPolicy(fixture.input);
    const second = runLocalChunkingPolicy(fixture.input);

    assert.deepEqual(first, second, fixture.id);
    assert.equal(first.kind, 'chunking_decision', fixture.id);
    if (first.kind !== 'chunking_decision') {
      continue;
    }

    assert.equal(
      first.decision.barrierType,
      fixture.expectedBarrier,
      fixture.id,
    );
    assert.equal(
      first.decision.candidates.length >= 2 &&
        first.decision.candidates.length <= 4,
      true,
      fixture.id,
    );
    assert.equal(
      first.decision.descriptor.fallbackUsed,
      fixture.expectedFallback ?? false,
      fixture.id,
    );
    assert.equal(
      JSON.stringify(first.decision.descriptor).includes(fixture.input),
      false,
      fixture.id,
    );
  }
});

test('selected plans satisfy the structural quality contract', () => {
  for (const fixture of LOCAL_CHUNKING_FIXTURES.filter(
    (candidate) => !candidate.expectedFallback,
  )) {
    const resolution = runLocalChunkingPolicy(fixture.input);
    assert.equal(resolution.kind, 'chunking_decision', fixture.id);
    if (resolution.kind !== 'chunking_decision') {
      continue;
    }

    const selected = resolution.decision.selectedCandidate;
    assert.notEqual(selected, null, fixture.id);
    if (selected === null) {
      continue;
    }

    assert.equal(validatePlanCandidate(selected).passed, true, fixture.id);
    assert.deepEqual(
      selected.steps.map((step) => step.role),
      STEP_ROLES,
      fixture.id,
    );
    assert.deepEqual(
      selected.steps.map((step) => step.timerSeconds),
      [15, 60, 120],
      fixture.id,
    );
    assert.equal(
      ['OPEN_TARGET', 'RESTORE_LAST_POSITION'].includes(
        selected.steps[0].primitive,
      ),
      true,
      fixture.id,
    );
    assert.equal(
      selected.steps[2].primitive,
      'CREATE_FIRST_OUTPUT',
      fixture.id,
    );
    assert.equal(
      new Set(selected.steps.map((step) => step.action)).size,
      3,
      fixture.id,
    );
    assert.equal(
      new Set(selected.steps.map((step) => step.primitive)).size,
      3,
      fixture.id,
    );

    for (const step of selected.steps) {
      assert.equal(
        AMBIGUOUS_STANDALONE_VERBS.includes(step.action),
        false,
        fixture.id,
      );
      assert.doesNotMatch(step.action, BUNDLED_ACTION_PATTERN, fixture.id);
      assert.equal(
        step.completionCondition.endsWith('끝'),
        true,
        fixture.id,
      );
    }
  }
});

test('runtime output preserves exact steps and low-confidence general fallback', () => {
  for (const fixture of LOCAL_CHUNKING_FIXTURES) {
    const result = createLocalPlan(fixture.input);
    assert.equal(result.kind, 'plan_allowed', fixture.id);
    if (result.kind !== 'plan_allowed') {
      continue;
    }

    assert.equal(result.plan.steps.length, 3, fixture.id);
    assert.deepEqual(
      result.plan.steps.map((step) => step.timerSeconds),
      [15, 60, 120],
      fixture.id,
    );
    if (fixture.expectedFallback) {
      assert.equal(result.plan.taskCategory, 'general', fixture.id);
      assert.equal(result.plan.barrierType, 'unknown', fixture.id);
    }
  }
});

test('safety fixtures never create candidates or allowed plans', () => {
  assert.equal(SAFETY_FIXTURES.length >= 3, true);

  for (const fixture of SAFETY_FIXTURES) {
    const resolution = runLocalChunkingPolicy(fixture.input);
    const result = createLocalPlan(fixture.input);

    assert.equal(resolution.kind, 'safe_redirect', fixture.id);
    assert.equal(result.kind, 'safe_redirect', fixture.id);
    if (resolution.kind === 'safe_redirect') {
      assert.equal(
        resolution.result.reasonCode,
        fixture.expectedReason,
        fixture.id,
      );
    }
  }
});

test('golden set has 12 unique cases and compares v0.1 with v0.2', () => {
  assert.equal(GOLDEN_FIXTURE_IDS.length, 12);
  assert.equal(new Set(GOLDEN_FIXTURE_IDS).size, 12);

  for (const fixtureId of GOLDEN_FIXTURE_IDS) {
    const fixture = LOCAL_CHUNKING_FIXTURES.find(
      (candidate) => candidate.id === fixtureId,
    );
    assert.notEqual(fixture, undefined, fixtureId);
    if (!fixture) {
      continue;
    }

    const legacy = createLocalPlan(fixture.input, {
      policyVersion: 'local_chunking_policy_v0.1',
    });
    const current = createLocalPlan(fixture.input);
    assert.equal(legacy.kind, 'plan_allowed', fixtureId);
    assert.equal(current.kind, 'plan_allowed', fixtureId);
  }
});
