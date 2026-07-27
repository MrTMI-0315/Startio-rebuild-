# Startio 행동 이벤트 스키마

## 1. 데이터 원칙

Startio는 민감한 개인 서사가 아니라 행동 이벤트를 저장한다.

핵심 질문은 다음과 같다.

```text
사용자는 언제 시작했는가?
사용자는 어디에서 멈췄는가?
사용자는 첫 행동을 완료했는가?
사용자는 멈춘 뒤 다시 돌아왔는가?
```

## 2. 저장 금지 항목

P0와 P1은 다음을 저장하지 않는다.

- 실명
- 전화번호
- 이벤트 기록의 원문 이메일
- 진단
- 치료 기록
- 약물 정보
- 상담 원문 전체
- 자유 입력 원문 전체
- 의료 문서
- 원격 행동 분석의 생성 행동·코치 문구
- 모든 행동 이벤트의 인증 사진 또는 로컬 파일 경로
- 원격 행동 분석의 자유 입력 의견 또는 디버그 문구

## 3. 저장 가능 항목

제품은 다음을 저장할 수 있다.

- 설치 범위 가명 해시
- 이벤트 유형
- 할 일 범주
- 실행 장벽 유형
- 타이머 초
- 시작 지연시간 초
- 완료 상태
- 완료 인증 제출 상태
- 지급 경험치
- 이탈 지점
- 복귀 이벤트

## 4. 이벤트 유형

```text
app_opened
session_started
session_resumed
session_ended
task_created
barrier_analyzed
action_plan_generated
task_submitted
barrier_detected
plan_generated
timer_started
timer_paused
timer_completed
timer_abandoned
proof_submitted
exp_granted
session_abandoned
fallback_used
remote_timeout
api_error
task_restarted
reentry_prompt_created
```

### P0 안정화 이벤트 별칭

웹 최소 기능 제품은 호환성을 위해 기존 시연 이벤트명(`task_created`, `barrier_analyzed`, `action_plan_generated`)을 유지한다. 새 P0 안정화 코드는 기록에서 읽기 쉬운 다음 별칭·디버그 이벤트도 만들 수 있다.

```text
task_submitted ~= task_created
barrier_detected ~= barrier_analyzed
plan_generated ~= action_plan_generated
fallback_used = 로컬 대체 응답 사용
remote_timeout = 대체 계획 전 원격 인공지능 응답 제한시간 초과
api_error = 원격·API 응답 검증 실패 또는 요청 실패
session_abandoned = 완료 인증 전 세션 이탈
```

디버그 필드(`coaching_plan_source`, `ai_state`, `debug_reason`, `http_status`)는 가볍게 유지하고 사용자 원문을 포함하지 않는다.

### P0 식별자·앱 수명 주기 규칙

- `session_id`는 `createInitialSessionSnapshot()`이 새 상태 저장본을 만들 때 생성한다.
- 로컬 전용 모바일 V1에는 원격 `install_scoped_id`가 필요하지 않다. 재계획 M25·M30이 이후 베타 원격 행동 데이터를 승인하면 모바일은 IDFA·광고 식별자, IDFV, 이메일, 기기 계정 식별자와 무관한 무작위 앱 범위 식별자를 만든다. 로컬 `behavior_event_v0.1.user_hash`에는 어댑터에서 안전한 가명값을 넣을 수 있다. 승인된 원격 투영만 `install_scoped_id`라는 필드명을 직렬화한다.
- 다시 불러오기·상태 복원은 기존 `session_id`를 유지하고 `resetSession()`은 새 값을 만든다.
- `StartioSessionProvider`는 상태 복원마다 `app_opened`를 한 번 기록한다. 저장된 상태가 없으면 `session_started`, 저장된 상태를 불러오면 `session_resumed`를 기록한다.
- 현재 P0 흐름에서 완료 인증·경험치 지급 뒤 `session_ended`를 만든다. 유휴 제한시간은 아직 클라이언트 이벤트가 아니라 검증기·내보내기의 파생 판단으로 처리한다.
- `step_id`는 `step_${planId}_${stepIndex}` 방식으로 결정론적으로 만든다.
- 타이머 이벤트는 `session_id`, `task_id`, `plan_id`, `step_id`, `step_index`, `assigned_step_count=3`을 포함해야 한다.
- `timer_started`는 `active_timer_seconds=0`을 기록한다. `timer_completed`, `timer_paused`, `timer_abandoned`는 배정된 타이머 길이를 상한으로 실제 활성 경과시간을 기록한다.
- `timer_abandoned`, `proof_submitted`, `session_ended`는 할 일 생성부터 종료 이벤트까지의 `task_elapsed_seconds`를 기록한다.
- 완료 인증·경험치 이벤트는 `task_id + plan_id`로 중복 제거한다.
- 타이머 이벤트는 단계 단위다. 최종 인증과 경험치 30 한 번 지급은 세 단계 타이머를 모두 완료한 뒤에만 발생한다.
- 포기·재진입은 같은 `task_id`와 `plan_id`를 사용한다. 흐름은 `timer_abandoned` → `reentry_prompt_created` → `task_restarted` → 다음 `timer_started`다.
- `timer_abandoned`와 `reentry_prompt_created`는 `abandon_reason`과 `last_completed_step_index`를 기록한다.

## 5. 이벤트 스키마 v0.1

```json
{
  "schema_version": "behavior_event_v0.1",
  "user_hash": "u_8f3a92",
  "event_type": "timer_started",
  "raw_input_stored": false,
  "session_id": "session_20260609054125000_a1b2c3d4",
  "task_id": "task_20260609054125000_e5f6g7h8",
  "plan_id": "plan_task_20260609054125000_e5f6g7h8",
  "step_id": "step_plan_task_20260609054125000_e5f6g7h8_1",
  "step_index": 1,
  "assigned_step_count": 3,
  "task_category": "studying",
  "barrier_type": "task_overwhelm",
  "first_action": "open_document_folder",
  "timer_seconds": 120,
  "start_latency_seconds": 260,
  "active_timer_seconds": 0,
  "task_elapsed_seconds": null,
  "session_duration_seconds": null,
  "reentry_latency_seconds": null,
  "abandon_reason": null,
  "last_completed_step_index": null,
  "completion_status": "in_progress",
  "proof_submitted": false,
  "exp_granted": 0,
  "drop_off_point": null,
  "created_at": "2026-05-05T10:00:00+09:00"
}
```

## 6. 권장 TypeScript 자료형

```ts
export type BehaviorEventType =
  | 'app_opened'
  | 'session_started'
  | 'session_resumed'
  | 'session_ended'
  | 'task_created'
  | 'barrier_analyzed'
  | 'action_plan_generated'
  | 'task_submitted'
  | 'barrier_detected'
  | 'plan_generated'
  | 'timer_started'
  | 'timer_paused'
  | 'timer_completed'
  | 'timer_abandoned'
  | 'proof_submitted'
  | 'exp_granted'
  | 'session_abandoned'
  | 'fallback_used'
  | 'remote_timeout'
  | 'api_error'
  | 'task_restarted'
  | 'reentry_prompt_created'

export type BarrierType =
  | 'task_overwhelm'
  | 'sequence_uncertainty'
  | 'choice_paralysis'
  | 'activation_low'
  | 'avoidance_emotion'
  | 'environment_friction'
  | 'completion_pressure'
  | 'unknown'

export type TaskCategory =
  | 'writing'
  | 'studying'
  | 'administrative'
  | 'cleaning'
  | 'communication'
  | 'planning'
  | 'physical_action'
  | 'general'

export type DropOffPoint =
  | 'input'
  | 'analysis'
  | 'action_plan'
  | 'timer'
  | 'proof'
  | 'reward'
  | 'reentry'

export type AbandonReason =
  | 'user_tapped_abandon'
  | 'idle_timeout'
  | 'navigation_exit'
  | 'unknown'

export interface BehaviorEvent {
  schema_version: 'behavior_event_v0.1'
  user_hash: string
  event_type: BehaviorEventType
  raw_input_stored: false
  session_id?: string
  task_id?: string
  plan_id?: string
  step_id?: string
  step_index?: 1 | 2 | 3
  assigned_step_count?: 3
  task_category?: TaskCategory
  barrier_type?: BarrierType
  first_action?: string
  timer_seconds?: number
  start_latency_seconds?: number
  active_timer_seconds?: number
  task_elapsed_seconds?: number
  session_duration_seconds?: number
  reentry_latency_seconds?: number
  abandon_reason?: AbandonReason
  last_completed_step_index?: 0 | 1 | 2 | 3
  completion_status?: 'not_started' | 'in_progress' | 'completed' | 'abandoned'
  proof_submitted?: boolean
  exp_granted?: number
  drop_off_point?: DropOffPoint | null
  coaching_plan_source?: 'openai' | 'fallback'
  ai_state?: 'remote_success' | 'remote_timeout' | 'local_fallback' | 'api_error'
  debug_reason?: string
  http_status?: number
  created_at: string
}
```

`proof_type`과 로컬 사진 참조는 `BehaviorEvent`가 아니라 버전이 있는 로컬 완료 인증·실행 기록에 속한다. 허용되는 로컬 인증값은 `check`와 `check_with_local_photo`다. 사진과 경로는 이 스키마에 들어가지 않는다.

### 6.1 원격 베타 행동 데이터 투영

위 로컬 이벤트 기록은 실행 기록·핵심 성과 지표의 기준 원천이다. 2026년 7월 15일 결정 회의에서 재계획 M25·M30은 베타 원격 행동 데이터와 설치 식별자·삭제 계약을 `MORE(추가 결정 필요)`로 분류했으므로 전송은 비활성이다. 아래 투영은 수집 활성화를 승인하는 내용이 아니라 비활성 상태의 기본 차단 계약이다. 추후 승인되더라도 별도의 명시적이고 버전이 있는 동의를 한 베타 참여자에게만 적용할 수 있다. 인공지능 처리 동의가 원격 행동 데이터 동의를 뜻하지 않는다.

허용되는 원격 단일값 필드:

```text
install_scoped_id
app_version
platform
event_name
timestamp
session_id
task_id
plan_id
step_id
step_index
duration
completion_state
fallback_code
error_code
```

그 밖의 모든 필드는 기본으로 거부한다. 특히 원문 할 일·제목, `first_action`, 생성 행동·코치 문구, 인공지능 제공자 요청·응답, 사진·경로, 이메일, 진단·의료 데이터, 토큰, 자유 입력 의견 또는 `debug_reason`을 거부해야 한다. 중첩된 금지 필드도 기본 차단한다. `safe_redirect`는 할 일, 행동 계획, 타이머, 완료 인증, 경험치, 실행 장벽, 원격 행동 데이터 행을 만들지 않는다.

운영 규칙:

- 최대 원격 보관 기간: 90일
- 제한된 로컬 대기열 크기와 재시도 횟수
- 멱등적인 이벤트 업로드
- 전체 로컬 삭제 시 설치 식별자, 원격 행동 데이터 동의, 대기열을 지우고 현재 설치 식별자를 기준으로 원격 삭제 요청
- 운영 이벤트·삭제 URL, 데이터·삭제 담당자, 전송 활성화 승인은 실제 값과 명시적 제품 결정이 기록될 때까지 `MORE(추가 결정 필요)`
- `participant_code_hash`는 별도 승인된 연구 방식으로 미룸

현재 네 값 범주는 과거 입력에만 사용한다. 버전이 있는 행 이전은 결정론적으로 `study → studying`, `work → general`, `home → general`, `personal → general`을 적용한다. 이 변환을 세분화하기 위해 과거 원문 할 일을 확인하지 않는다. 네 가지 고정 시험 데이터는 필수다. 새 원격 결과의 잘못된 범주는 과거 이전표로 바꾸지 않고 응답 전체를 무효화한다.

## 7. 핵심 성과 지표 정의

### 7.1 시작 지연시간

할 일 생성부터 타이머 시작까지의 시간이다.

```text
start_latency_seconds = timer_started_at - task_created_at
```

### 7.2 할 일 시작률

생성된 행동 계획 중 타이머 시작으로 이어진 비율이다.

```text
task_start_rate = timer_started_count / action_plan_generated_count
```

네이티브 P0 최소 기능 제품에서 행동 계획 하나는 타이머 시작 세 번을 만들 수 있다. 할 일 시작률은 각 `action_plan_generated` 이벤트 뒤 첫 번째 타이머 시작만 계산한다.

### 7.3 완료율

시작한 타이머 중 완료 인증 제출까지 도달한 비율이다.

```text
completion_rate = proof_submitted_count / timer_started_count
```

네이티브 P0 최소 기능 제품의 3단계 완료 인증 흐름에서는 세 행동 타이머를 모두 완료한 뒤 인증을 제출한다. 이 흐름에서 사용자 화면에 표시하는 할 일 단위 완료율은 다음과 같다.

```text
task_completion_rate = proof_submitted_count / action_plan_generated_count
```

단계 단위 타이머 완료율은 별도로 계산할 수 있다.

```text
step_completion_rate = timer_completed_count / timer_started_count
```

### 7.4 이탈 지점

사용자가 흐름을 떠난 단계다.

```text
input
analysis
action_plan
timer
proof
reward
reentry
```

### 7.5 복귀율

포기한 할 일 중 나중에 다시 시작한 비율이다.

```text
recovery_rate = recovered_task_count / abandoned_task_count
```

## 8. 코칭 정책 갱신 v0.1

P0는 기본 정책 로직을 구현할 수 있다.

### 규칙 1. 시작 지연시간

시작 지연시간이 길면:

```text
다음 첫 행동을 더 작게 만든다
```

### 규칙 2. 완료율

완료율이 낮으면:

```text
타이머 길이를 줄인다
```

### 규칙 3. 이탈 지점

사용자가 행동 계획에서 반복적으로 이탈하면:

```text
글을 줄인다
핵심 실행 버튼을 더 분명하게 만든다
타이머에 더 빨리 도달하게 한다
```

사용자가 타이머에서 반복적으로 이탈하면:

```text
첫 타이머를 줄인다
코치 문구를 바꾼다
완료 인증을 가볍게 만든다
```

### 규칙 4. 완료 인증 제출

완료 인증 제출이 낮으면:

```text
체크 인증은 필수로 유지하고 사진 첨부는 선택으로 유지한다
```

## 9. P0 저장소

P0는 로컬 저장소 또는 모의 저장소를 사용할 수 있다.

권장 키:

```text
startio.behaviorEvents
startio.currentTask
startio.actionPlans
startio.userStats
startio.proofFiles
startio.installScopedId
startio.telemetryConsent
startio.telemetryQueue
```

`startio.installScopedId`, `startio.telemetryConsent`, `startio.telemetryQueue`는 M25·M30 승인 전에는 구현하지 않는 미래 참고 키다.

## 10. 이전 참고

이 스키마는 이후 로컬 저장소에서 다음 대상으로 이전할 수 있게 작성한다.

- PostgreSQL
- Supabase
- Prisma
- 행동 분석 이벤트 처리 흐름
