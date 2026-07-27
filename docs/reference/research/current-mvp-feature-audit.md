# Startio Research v0.1 Current MVP Feature Audit

- 기준일: 2026-06-03
- 단계: Phase 0 Scope Lock
- 목적: 기존 Startio P0 MVP에서 Research v0.1 Freeze Candidate에 재사용할 기능, 보강할 기능, 2026-07-31 전 제외할 기능을 구분한다.
- 기준 문서: `docs/product/01-mvp-core.md`, `docs/product/02-user-flow.md`, `docs/product/03-feature-spec.md`, `docs/ai/04-coaching-engine.md`, `docs/data/05-behavior-event-schema.md`, `docs/dev/research-v0.1-freeze-candidate-plan.md`, `docs/research/fallback-qa-history.md`
- 문서 구조: `docs/research/README.md`

## 1. 한 줄 결론

현재 MVP는 연구계획서의 핵심 앱 개입 구조인 `과업 입력 -> 실행 장벽 분석 -> 3단계 행동 분해 -> 즉시 타이머 -> proof/EXP -> history/KPI`를 대부분 재사용할 수 있다.

단, native fallback이 자주 발생했다는 human-in-the-loop QA 보고는 확인되지만 당시 앱 event payload 원시 로그는 발견하지 못했다. 따라서 coach/API/native fallback 영역은 "구조 재사용 가능"으로 보되, Research v0.1 재사용 확정 전에는 새 QA 로그와 fallback event 검증으로 다시 증명해야 한다.

2026-06-09 사용자 피드백 기준으로 UX 재사용 판단은 조정한다. 기존 P0 loop는 재사용하지만, 대화형 coach-first 진입과 카드형 홈 대시보드는 사용자가 첫 행동에 들어가기 전의 마찰을 키우므로 primary UX로 재사용하지 않는다. Miruny PoC처럼 "바로 할 일 입력창"을 먼저 보여주는 방향을 우선한다.

다만 Research v0.1 Freeze Candidate로 잠그려면 기능 추가보다 아래 네 가지가 먼저 필요하다.

1. 이벤트 로그에 연구용 식별 계약을 보강한다: `session_id`, `task_id`, `plan_id`, `step_id`, `step_index`, `assigned_step_count`.
2. 앱 lifecycle 이벤트를 추가한다: `app_opened`, `session_started`, `session_resumed`, `session_ended`.
3. 중단/복귀와 시간 지표를 연구 KPI로 계산 가능하게 고정한다: `abandon_reason`, `last_completed_step_index`, `active_timer_seconds`, `task_elapsed_seconds`, `session_duration_seconds`, `reentry_latency_seconds`.
4. 비식별성, 이벤트 순서, proof/EXP 중복 방지, export 샘플을 자동 검증한다.

## 2. 현재 재사용 가능한 P0 기능

| 기능 | 현재 상태 | 근거 파일 | Research v0.1 재사용 판단 |
| --- | --- | --- | --- |
| 모바일 앱 shell / route | 구현됨 | `app/start/page.tsx`, `app/plan/page.tsx`, `app/timer/page.tsx`, `app/done/page.tsx`, `app/history/page.tsx`, `components/MobileShell.tsx` | 재사용. 모바일 QA 대상 |
| Task input | 구현됨 | `components/StartScreen.tsx`, `components/TaskInputBubble.tsx` | 재사용. Miruny식 direct input이 primary path. 원문 과업 입력을 이벤트에 저장하지 않는 guard 검증 필요 |
| Coach/chat fallback | 구현됨 | `components/StartScreen.tsx`, `app/api/coach/chat/route.ts`, `lib/coaching.ts` | primary UX에서는 제외. fallback/reliability 연구 대상으로 조건부 재사용 |
| Barrier analysis | 구현됨 | `lib/domain.ts`, `lib/coaching.ts`, `lib/coaching-contract.ts` | 재사용. `barrier_type` enum freeze 필요 |
| 3-step action plan | 구현됨 | `lib/coaching.ts`, `lib/coaching-contract.ts`, `components/PlanScreen.tsx`, `components/ActionStepCard.tsx` | 재사용. 항상 3단계, step 1 15초 기준 테스트 유지 필요 |
| Immediate timer | 구현됨 | `components/TimerScreen.tsx`, `components/TimerRing.tsx` | 재사용. 1~3단계 각각의 timer event와 step metadata 보강 필요 |
| Pause/abandon | 일부 구현됨 | `components/TimerScreen.tsx` | 재사용하되 보강. `timer_abandoned`, `reentry_prompt_created`는 있으나 `abandon_reason`, `last_completed_step_index`가 없음 |
| Proof check | 구현됨 | `components/DoneScreen.tsx`, `components/ProofCard.tsx` | 재사용. timer 완료 전 접근 방어와 중복 proof 방지 로직 존재 |
| EXP reward | 구현됨 | `components/DoneScreen.tsx`, `components/ExpReward.tsx`, `lib/kpi.ts` | 재사용. 보상 피드백으로만 설명하고 치료 효과 표현 금지 |
| History / basic KPI | 구현됨 | `components/HistoryScreen.tsx`, `lib/kpi.ts` | 재사용. 연구 지표용 Task Start Rate, Engagement, Drop-off, Recovery 보강 필요 |
| Behavior events | 구현됨 | `lib/events.ts`, `lib/domain.ts`, `docs/data/05-behavior-event-schema.md` | 재사용하되 schema 확장 필요 |
| Local storage snapshot | 구현됨 | `lib/storage.ts`, `components/StartioSessionProvider.tsx`, `lib/session-seed.ts` | 7.31 검수 후보에는 재사용. 실제 운영 수집은 8월/IRB 이후 결정 |
| P0 regression scripts | 구현됨 | `scripts/run-p0-smoke-tests.mjs`, `scripts/verify-p0-loop.mjs` | 재사용. research validator로 확장 필요 |

## 2.1 UX 재사용 판단 업데이트

| 영역 | 기존 판단 | 2026-06-09 피드백 반영 |
| --- | --- | --- |
| Home dashboard | 조건부 재사용 | 기본 진입으로 재사용하지 않음. active task 복귀 외에는 direct input 우선 |
| Conversation-first Start | 조건부 재사용 | primary path에서 제외. 대화형 UX가 미룸을 늘릴 수 있음 |
| Direct task input | 재사용 | P0 primary entry로 승격 |
| History numeric cards | 재사용 | 숫자 단독으로는 약함. calendar/heatmap visual을 먼저 보여줘야 함 |
| EXP/reward summary | 재사용 | 보조 피드백으로만 사용. 홈의 핵심 정보 카드로 과대 사용하지 않음 |

## 3. 연구용 Freeze Candidate에 필요한 보강

| 영역 | 현재 격차 | 먼저 해야 할 보강 |
| --- | --- | --- |
| Scope lock | 연구 계획 문서 2개가 존재하지만 아직 untracked 상태 | 본 감사 문서와 함께 Phase 0 문서 패키지로 확정 |
| Safety copy | 앱 문구는 대체로 비임상적이나 전수 audit 증거가 없음 | `safety-copy-boundary.md` 작성 및 UI/coach copy grep audit |
| Participant identifier | `user_hash`는 있으나 연구용 `participant_code_hash` 정책은 문서 수준 | IRB 전에는 직접 입력 기능을 만들지 않고 외부 매핑표 분리 원칙 문서화 |
| Session lifecycle | snapshot에는 session meta가 있으나 behavior event로 `app_opened/session_started/session_resumed/session_ended`가 없음 | behavior event enum과 session provider logging 설계 |
| Task/plan/step contract | domain에는 `CurrentTask.id`, `ActionPlan.id`, `TimerSession.stepOrder`가 있으나 event payload에 명시 필드 없음 | event schema에 `task_id`, `plan_id`, `step_id`, `step_index`, `assigned_step_count=3` 추가 |
| Abandon/reentry | `timer_abandoned`, `reentry_prompt_created`, reduced timer는 있음 | `abandon_reason`, `last_completed_step_index`, `reentry_latency_seconds`, `task_restarted` 여부 결정 |
| Time metrics | `start_latency_seconds`만 계산됨 | `active_timer_seconds`, `task_elapsed_seconds`, `session_duration_seconds` 산식 고정 |
| KPI | 평균 착수 시간, completion rate, EXP는 있음 | Task Start Rate, Engagement, Drop-off summary, Recovery Rate 계산 utility 추가 |
| Privacy guard | `raw_input_stored=false` 테스트는 있음 | localStorage/export 금지 패턴 검사와 debug field raw text 검사 추가 |
| Export | 없음 | 비식별 `sample-events.json`, `sample-events.csv`, `sample-metrics.json` 생성 스크립트 추가 |
| Mobile/Vercel QA | 과거 스크린샷/스모크 흔적은 있으나 Research v0.1 QA 문서가 없음 | 390px viewport happy/abandon/reentry/reload QA 결과 문서화 |
| Native fallback evidence gap | human-in-the-loop 보고와 문서 흔적은 있으나 실제 앱 behavior event payload 로그를 찾지 못함 | `fallback_used`, `remote_timeout`, `api_error` 재현 테스트와 QA 결과 로그를 새로 남김 |

## 3.1 Native fallback 관련 재사용 판단 주의점

과거 시연용 MVP에서 native fallback이 자주 발생했다는 사실은 설계 리스크로 취급한다. 다만 현재 발견된 근거는 문서와 human-in-the-loop 대화 로그 중심이며, 당시 실제 앱에서 생성된 behavior event payload 또는 QA 결과 파일은 확인되지 않았다.

따라서 fallback 관련 영역은 아래처럼 나누어 판단한다.

| 판단 대상 | 현재 판단 | 이유 |
| --- | --- | --- |
| P0 화면 흐름 | 재사용 가능 | task input, plan, timer, proof, EXP, history 흐름은 코드와 문서 근거가 있음 |
| fallback UX 방향 | 부분 재사용 | 실패 시 앱을 멈추지 않고 local coaching으로 이어가는 방향은 맞음 |
| fallback 안정성 | 재검증 필요 | 과거 빈발 이슈의 원인, 빈도, payload가 남아 있지 않아 현재 코드만으로 운영 안정성을 단정할 수 없음 |
| fallback event schema | 재사용하되 확장 | `fallback_used`, `remote_timeout`, `api_error`는 있으나 session/task/plan/step metadata와 비식별 debug guard가 더 필요 |
| native 구현 baseline | 보수적 재사용 | native README와 runbook은 근거가 되지만, Research v0.1 기준에서는 새 simulator/manual QA 로그가 필요 |

P0 체크 시에는 "fallback이 있었다"를 곧바로 "fallback 설계가 검증됐다"로 해석하지 않는다. 지금 재사용할 수 있는 것은 fallback이라는 안전장치의 방향과 일부 event vocabulary이며, 검증 없이 재사용하면 연구 로그의 결측, 원인 불명 timeout, local fallback 남용을 구분하지 못할 수 있다.

## 4. 2026-07-31 전 제외할 것

아래 항목은 현재 MVP 감사 기준으로 Research v0.1 Freeze Candidate 범위 밖이다.

| 제외 항목 | 이유 |
| --- | --- |
| ADHD 진단/치료/CBT 치료 제공 문구 | 앱은 비임상 실행 코치여야 함 |
| 실참여자 원격 데이터 수집 운영 | IRB/운영 정책 확정 전에는 검수용 샘플 export가 우선 |
| 연구자/기관 dashboard | P2 범위. 7.31 전에는 event viewer/export 문서가 우선 |
| 고도화된 개인화 엔진 | 연구 변수 오염 가능 |
| sLLM/RAG 고도화 | P0 연구 검수와 직접 관련 낮음 |
| 결제/구독 | 연구용 앱 범위 밖 |
| 캘린더 연동 | 7.31 Freeze Candidate 범위 밖 |
| 푸시 알림 고도화 | 8월 이후 안정화 또는 후속 범위 |
| 사진 인증 고도화 | 개인정보/IRB 리스크가 큼 |
| 대규모 백엔드 전환 | 7.31 전에는 검수 가능한 로그·QA 증거가 우선 |

## 5. 관련 문서 위치

이 감사 문서는 P0 재사용 판단만 담당한다. 연구 절차 매핑, 로그 요구, event schema, safety/privacy, fallback 이력은 아래 문서가 canonical이다.

| 주제 | 문서 |
| --- | --- |
| 연구계획서와 앱 기능 연결 | `docs/research/protocol-app-mapping.md` |
| 연구자/KAIST 로그 요구 | `docs/research/kaist-feedback-log-mapping.md` |
| safety/privacy boundary | `docs/research/safety-copy-boundary.md` |
| event/data dictionary | `docs/research/behavior-event-data-dictionary.md` |
| native fallback 이력/로그 부재 리스크 | `docs/research/fallback-qa-history.md` |

## 6. 현재 검증 상태

2026-06-03 기준으로 아래 검증은 통과했다.

```text
npm test
npm run test:p0-loop
npm run typecheck
```

검증이 아직 부족한 부분:
- 실제 브라우저 기반 happy path / abandon path / reload path
- session lifecycle event
- task/plan/step ID event field
- 비식별 export sample
- privacy validator
- research KPI utility

## 7. 감사 결론

현재 MVP는 Research v0.1의 앱 개입 구조를 새로 만들 필요 없이 재사용할 수 있다. 지금 가장 중요한 작업은 기능 개발을 넓히는 것이 아니라, 현재 P0 loop가 연구자/IRB 검수에서 설명 가능한 데이터 계약과 QA 증거를 갖도록 잠그는 것이다.

따라서 다음 구현 전에는 `protocol-app-mapping`, `safety-copy-boundary`, `behavior-event-data-dictionary`를 먼저 작성하고, 그 문서에서 확정된 필드만 코드에 반영한다.
