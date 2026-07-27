import assert from 'node:assert/strict';
import test from 'node:test';

import { decideAiProcessingConsent } from '../src/core/coaching/aiConsent.ts';
import {
  createLocalDataClearer,
  LocalDataClearError,
} from '../src/core/storage/clearAll.ts';
import { createAiConsentRepository } from '../src/core/storage/aiConsentRepository.ts';

test('AI consent repository clears the persisted decision', async () => {
  let stored = null;
  const repository = createAiConsentRepository({
    async read() {
      return stored;
    },
    async write(value) {
      stored = value;
    },
    async clear() {
      stored = null;
    },
  });

  await repository.save(decideAiProcessingConsent('accepted'));
  assert.equal((await repository.load()).decision, 'accepted');

  await repository.clear();
  assert.equal(await repository.load(), null);
});

test('local data clear transaction removes every registered local store', async () => {
  const cleared = [];
  const clearer = createLocalDataClearer(
    ['session', 'history', 'proof_files', 'ai_consent'].map((name) => ({
      name,
      async clear() {
        cleared.push(name);
      },
    })),
  );

  await clearer.clearAll();

  assert.deepEqual(cleared, [
    'session',
    'history',
    'proof_files',
    'ai_consent',
  ]);
});

test('a failed clear is not reported as completion and remaining stores are attempted', async () => {
  const attempted = [];
  const clearer = createLocalDataClearer([
    {
      name: 'session',
      async clear() {
        attempted.push('session');
      },
    },
    {
      name: 'history',
      async clear() {
        attempted.push('history');
        throw new Error('disk_failure');
      },
    },
    {
      name: 'proof_files',
      async clear() {
        attempted.push('proof_files');
      },
    },
    {
      name: 'ai_consent',
      async clear() {
        attempted.push('ai_consent');
      },
    },
  ]);

  await assert.rejects(
    clearer.clearAll(),
    (error) =>
      error instanceof LocalDataClearError &&
      error.failedTargets.length === 1 &&
      error.failedTargets[0] === 'history',
  );
  assert.deepEqual(attempted, [
    'session',
    'history',
    'proof_files',
    'ai_consent',
  ]);
});

test('local data clear is idempotent when stores are already empty', async () => {
  let calls = 0;
  const clearer = createLocalDataClearer([
    {
      name: 'empty_store',
      async clear() {
        calls += 1;
      },
    },
  ]);

  await clearer.clearAll();
  await clearer.clearAll();

  assert.equal(calls, 2);
});
