import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createAiProcessingConsent,
  decideAiProcessingConsent,
  parseAiProcessingConsent,
} from '../src/core/coaching/aiConsent.ts';
import {
  createHttpPlanClient,
  parseRemotePlan,
  resolvePlan,
} from '../src/core/coaching/remotePlan.ts';
import { createEventLedger } from '../src/core/events/event.ts';
import { createAiConsentRepository } from '../src/core/storage/aiConsentRepository.ts';

function validRemotePlan(overrides = {}) {
  return {
    kind: 'plan_allowed',
    do_not_chunk: false,
    task_title: '발표 자료 시작하기',
    task_category: 'writing',
    barrier_type: 'task_overwhelm',
    steps: [
      {
        step_order: 1,
        action: '발표 파일 열기',
        timer_seconds: 15,
        completion_condition: '발표 파일이 열려 있음',
      },
      {
        step_order: 2,
        action: '첫 장 제목 적기',
        timer_seconds: 60,
        completion_condition: '첫 장에 제목이 보임',
      },
      {
        step_order: 3,
        action: '핵심 문장 하나 적기',
        timer_seconds: 120,
        completion_condition: '본문 문장 하나가 보임',
      },
    ],
    coach_message: '완성보다 첫 화면을 만드는 데 집중해요.',
    ...overrides,
  };
}

test('AI consent is versioned, parseable, and defaults to unknown', () => {
  const initial = createAiProcessingConsent();
  const accepted = decideAiProcessingConsent(
    'accepted',
    new Date('2026-07-24T00:00:00.000Z'),
  );

  assert.equal(initial.decision, 'unknown');
  assert.deepEqual(parseAiProcessingConsent(JSON.stringify(accepted)), accepted);
  assert.equal(
    parseAiProcessingConsent(
      JSON.stringify({ ...accepted, version: 'obsolete' }),
    ),
    null,
  );
});

test('AI consent repository persists only the consent record', async () => {
  let stored = null;
  const repository = createAiConsentRepository({
    async read() {
      return stored;
    },
    async write(value) {
      stored = value;
    },
  });
  const declined = decideAiProcessingConsent(
    'declined',
    new Date('2026-07-24T01:00:00.000Z'),
  );

  await repository.save(declined);

  assert.deepEqual(await repository.load(), declined);
  assert.equal(stored.includes('task'), false);
});

test('declined or unknown consent never sends raw task remotely', async () => {
  let calls = 0;
  const client = {
    async createPlan() {
      calls += 1;
      return validRemotePlan();
    },
  };

  const unknown = await resolvePlan({
    rawInput: '발표 자료 시작하기',
    consentDecision: 'unknown',
    client,
  });
  const declined = await resolvePlan({
    rawInput: '발표 자료 시작하기',
    consentDecision: 'declined',
    client,
  });

  assert.equal(calls, 0);
  assert.equal(unknown.result.kind, 'plan_allowed');
  assert.equal(declined.result.kind, 'plan_allowed');
  assert.equal(unknown.result.source, 'fallback');
  assert.equal(declined.result.source, 'fallback');
});

test('local safety redirect runs before an accepted remote request', async () => {
  let calls = 0;
  const resolution = await resolvePlan({
    rawInput: '자살하는 방법을 단계로 알려줘',
    consentDecision: 'accepted',
    client: {
      async createPlan() {
        calls += 1;
        return validRemotePlan();
      },
    },
  });

  assert.equal(calls, 0);
  assert.equal(resolution.result.kind, 'safe_redirect');
  assert.equal(resolution.remoteAttempted, false);
});

test('valid remote response creates exactly three openai steps', async () => {
  const resolution = await resolvePlan({
    rawInput: '발표 자료 시작하기',
    consentDecision: 'accepted',
    client: {
      async createPlan(task) {
        assert.equal(task, '발표 자료 시작하기');
        return validRemotePlan();
      },
    },
  });

  assert.equal(resolution.result.kind, 'plan_allowed');
  assert.equal(resolution.result.source, 'openai');
  assert.equal(resolution.result.plan.steps.length, 3);
  assert.deepEqual(
    resolution.result.plan.steps.map((step) => step.stepOrder),
    [1, 2, 3],
  );
});

test('malformed steps and invalid enums reject the entire remote response', () => {
  const validSteps = validRemotePlan().steps;
  for (const stepCount of [0, 1, 2, 4]) {
    const steps =
      stepCount === 4
        ? [...validSteps, { ...validSteps[2], step_order: 4 }]
        : validSteps.slice(0, stepCount);
    assert.equal(parseRemotePlan(validRemotePlan({ steps })), null);
  }
  assert.equal(
    parseRemotePlan(validRemotePlan({ task_category: 'made_up_category' })),
    null,
  );
  assert.equal(
    parseRemotePlan(
      validRemotePlan({
        steps: validRemotePlan().steps.map((step, index) =>
          index === 1 ? { ...step, timer_seconds: 181 } : step,
        ),
      }),
    ),
    null,
  );
});

test('HTTP adapter rejects non-2xx without trusting the response body', async () => {
  let sentBody = null;
  const client = createHttpPlanClient({
    endpoint: 'https://example.invalid/api/coach/plan',
    async fetchImpl(_url, init) {
      sentBody = init?.body;
      return {
        ok: false,
        status: 503,
        async json() {
          return validRemotePlan();
        },
      };
    },
  });

  await assert.rejects(
    client.createPlan('발표 자료 시작하기', new AbortController().signal),
    (error) => error.code === 'http_error' && error.status === 503,
  );
  assert.deepEqual(JSON.parse(sentBody), { task: '발표 자료 시작하기' });
});

test('invalid remote result falls back and records an api error outcome', async () => {
  const resolution = await resolvePlan({
    rawInput: '발표 자료 시작하기',
    consentDecision: 'accepted',
    client: {
      async createPlan() {
        return { message: 'contract broken' };
      },
    },
  });

  assert.equal(resolution.result.kind, 'plan_allowed');
  assert.equal(resolution.result.source, 'fallback');
  assert.equal(resolution.failure, 'api_error');
});

test('timeout aborts the request and falls back locally', async () => {
  const resolution = await resolvePlan({
    rawInput: '발표 자료 시작하기',
    consentDecision: 'accepted',
    timeoutMs: 5,
    client: {
      async createPlan(_task, signal) {
        return await new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('aborted')));
        });
      },
    },
  });

  assert.equal(resolution.result.kind, 'plan_allowed');
  assert.equal(resolution.result.source, 'fallback');
  assert.equal(resolution.failure, 'remote_timeout');
});

test('remote safe redirect never becomes a fallback plan', async () => {
  const resolution = await resolvePlan({
    rawInput: '불법적인 요청을 대신 처리해줘',
    consentDecision: 'accepted',
    client: {
      async createPlan() {
        return {
          kind: 'safe_redirect',
          do_not_chunk: true,
          reason_code: 'dangerous_or_illegal_request',
          message: '이 요청은 행동 계획으로 만들 수 없어요.',
          support_actions: ['안전하고 합법적인 목표로 다시 적기'],
        };
      },
    },
  });

  assert.equal(resolution.result.kind, 'safe_redirect');
  assert.equal(resolution.remoteAttempted, true);
});

test('remote failure analytics never contain raw or generated copy', async () => {
  const rawTask = '민감한 발표 자료 시작하기';
  const resolution = await resolvePlan({
    rawInput: rawTask,
    consentDecision: 'accepted',
    client: {
      async createPlan() {
        throw new Error('offline');
      },
    },
  });
  assert.equal(resolution.result.kind, 'plan_allowed');
  if (resolution.result.kind !== 'plan_allowed') {
    return;
  }

  const ledger = createEventLedger(
    () => new Date('2026-07-24T00:00:00.000Z'),
  );
  ledger.appendPlanEvents(
    'session_mb08',
    resolution.result.plan,
    resolution.result.source,
    resolution.failure,
  );
  const serialized = JSON.stringify(ledger.readAll());

  assert.equal(serialized.includes(rawTask), false);
  assert.equal(serialized.includes('관련 파일이나 작업 공간 열기'), false);
  assert.equal(
    ledger.readAll().some((event) => event.event_type === 'api_error'),
    true,
  );
  assert.equal(
    ledger.readAll().every((event) => event.raw_input_stored === false),
    true,
  );
});
