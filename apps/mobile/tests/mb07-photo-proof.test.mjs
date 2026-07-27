import assert from 'node:assert/strict';
import test from 'node:test';

import { createFallbackPlan } from '../src/core/coaching/fallback.ts';
import { createEventLedger } from '../src/core/events/event.ts';
import {
  appendHistory,
  createHistoryArchive,
  createHistoryRecord,
  parseHistoryArchive,
} from '../src/core/events/historyProjection.ts';
import {
  completeWithCheck,
  createCompletionState,
} from '../src/core/session/completion.ts';
import {
  createSessionSnapshot,
  parseSessionSnapshot,
} from '../src/core/session/session.ts';
import { createTimerState } from '../src/core/session/timerMachine.ts';
import { createProofFileRepository } from '../src/core/storage/proofFileRepository.ts';

const SOURCE_URI = 'file:///private/imports/IMG_3718.PNG';
const OWNED_URI = 'file:///documents/startio-proof/proof-photo-01.png';

function createCompletedTimer() {
  return {
    ...createTimerState(),
    status: 'completed',
    currentStepOrder: 3,
    completedStepCount: 3,
    completedAt: Date.parse('2026-07-24T05:00:00.000Z'),
  };
}

function createStorageDouble() {
  const calls = {
    copied: [],
    deleted: [],
    cleared: 0,
  };

  return {
    calls,
    storage: {
      async copyToOwnedFile(sourceUri, fileName) {
        calls.copied.push({ sourceUri, fileName });
        return `file:///documents/startio-proof/${fileName}`;
      },
      async deleteOwnedFile(uri) {
        calls.deleted.push(uri);
      },
      async deleteAllOwnedFiles() {
        calls.cleared += 1;
      },
    },
  };
}

async function createSavedPhoto() {
  const { storage } = createStorageDouble();
  const repository = createProofFileRepository(storage, {
    createId: () => 'photo-01',
    now: () => new Date('2026-07-24T05:00:00.000Z'),
  });

  return repository.save({
    uri: SOURCE_URI,
    mimeType: 'image/png',
    width: 1200,
    height: 900,
  });
}

test('photo is copied into app-owned storage with a generated name', async () => {
  const { calls, storage } = createStorageDouble();
  const repository = createProofFileRepository(storage, {
    createId: () => 'photo-01',
    now: () => new Date('2026-07-24T05:00:00.000Z'),
  });

  const photo = await repository.save({
    uri: SOURCE_URI,
    mimeType: 'image/png',
    width: 1200,
    height: 900,
  });

  assert.deepEqual(calls.copied, [
    {
      sourceUri: SOURCE_URI,
      fileName: 'proof-photo-01.png',
    },
  ]);
  assert.equal(photo.uri, OWNED_URI);
  assert.equal(photo.uri.includes('IMG_3718'), false);
});

test('single-photo and full-data deletion delegate to local file storage', async () => {
  const { calls, storage } = createStorageDouble();
  const repository = createProofFileRepository(storage);
  const photo = await createSavedPhoto();

  await repository.delete(photo);
  await repository.clear();

  assert.deepEqual(calls.deleted, [OWNED_URI]);
  assert.equal(calls.cleared, 1);
});

test('photo remains optional when check completion is stored', () => {
  const result = createFallbackPlan('발표 자료 시작하기');
  const completion = completeWithCheck({
    state: createCompletionState(),
    plan: result.plan,
    timerState: createCompletedTimer(),
    completedAt: new Date('2026-07-24T05:00:00.000Z'),
  });

  assert.equal(completion.outcome, 'completed');
  assert.equal(completion.record.proof.photo, null);
});

test('owned photo survives session and local history serialization', async () => {
  const result = createFallbackPlan('발표 자료 시작하기');
  const photo = await createSavedPhoto();
  const timerState = createCompletedTimer();
  const completion = completeWithCheck({
    state: createCompletionState(),
    plan: result.plan,
    timerState,
    photo,
    completedAt: new Date('2026-07-24T05:00:00.000Z'),
  });
  const ledger = createEventLedger(
    () => new Date('2026-07-24T05:00:00.000Z'),
  );
  ledger.appendCompletionEvents('session_photo', result.plan);
  const snapshot = createSessionSnapshot({
    sessionId: 'session_photo',
    result,
    timerState,
    completionState: completion.state,
    events: ledger.readAll(),
    savedAt: new Date('2026-07-24T05:00:00.000Z'),
  });
  const historyRecord = createHistoryRecord({
    sessionId: 'session_photo',
    plan: result.plan,
    timerState,
    completion: completion.record,
    events: ledger.readAll(),
  });
  const history = appendHistory(
    createHistoryArchive(),
    historyRecord,
    ledger.readAll(),
  );

  assert.equal(
    parseSessionSnapshot(JSON.stringify(snapshot))?.product.completionState
      .records[0].proof.photo?.uri,
    OWNED_URI,
  );
  assert.equal(
    parseHistoryArchive(JSON.stringify(history))?.records[0].proofPhoto?.uri,
    OWNED_URI,
  );
});

test('photo URI and path never enter behavior analytics events', async () => {
  const result = createFallbackPlan('발표 자료 시작하기');
  const photo = await createSavedPhoto();
  const completion = completeWithCheck({
    state: createCompletionState(),
    plan: result.plan,
    timerState: createCompletedTimer(),
    photo,
  });
  const ledger = createEventLedger();
  ledger.appendCompletionEvents('session_photo', result.plan);
  const serializedEvents = JSON.stringify(ledger.readAll());

  assert.equal(completion.record.proof.photo?.uri, OWNED_URI);
  assert.equal(serializedEvents.includes(OWNED_URI), false);
  assert.equal(serializedEvents.includes('photo-01'), false);
  assert.equal(serializedEvents.includes('photo_uri'), false);
});

test('parsers reject non-local or malformed proof photo references', async () => {
  const result = createFallbackPlan('발표 자료 시작하기');
  const photo = await createSavedPhoto();
  const completion = completeWithCheck({
    state: createCompletionState(),
    plan: result.plan,
    timerState: createCompletedTimer(),
    photo,
  });
  const snapshot = createSessionSnapshot({
    sessionId: 'session_photo',
    result,
    timerState: createCompletedTimer(),
    completionState: completion.state,
    events: [],
  });
  snapshot.product.completionState.records[0].proof.photo.uri =
    'https://example.com/photo.png';

  assert.equal(parseSessionSnapshot(JSON.stringify(snapshot)), null);
});

test('pre-photo session and history archives migrate with a null photo', () => {
  const result = createFallbackPlan('발표 자료 시작하기');
  const completion = completeWithCheck({
    state: createCompletionState(),
    plan: result.plan,
    timerState: createCompletedTimer(),
  });
  const legacySnapshot = createSessionSnapshot({
    sessionId: 'session_legacy',
    result,
    timerState: createCompletedTimer(),
    completionState: completion.state,
    events: [],
  });
  legacySnapshot.version = 'session_snapshot_v0.2';
  delete legacySnapshot.product.completionState.records[0].proof.photo;

  const historyRecord = createHistoryRecord({
    sessionId: 'session_legacy',
    plan: result.plan,
    timerState: createCompletedTimer(),
    completion: completion.record,
    events: [],
  });
  const legacyHistory = appendHistory(
    createHistoryArchive(),
    historyRecord,
    [],
  );
  legacyHistory.version = 'history_archive_v0.1';
  delete legacyHistory.records[0].proofPhoto;

  assert.equal(
    parseSessionSnapshot(JSON.stringify(legacySnapshot))?.product
      .completionState.records[0].proof.photo,
    null,
  );
  assert.equal(
    parseHistoryArchive(JSON.stringify(legacyHistory))?.records[0].proofPhoto,
    null,
  );
});
