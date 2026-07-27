# Startio 기능 명세서

## 1. 기능: 할 일 입력과 실행 장벽 분석

### 설명

사용자는 자연어로 할 일을 입력한다. Startio는 사용자에게 설명을 요구하지 않고 내부적으로 할 일 범주와 실행 장벽을 추출한다.

### 입력

```text
논문을 써야 하는데 너무 막막하다.
```

### 실행 장벽 유형(`BarrierType`)

```text
task_overwhelm
sequence_uncertainty
choice_paralysis
activation_low
avoidance_emotion
environment_friction
completion_pressure
unknown
```

### 할 일 범주(`TaskCategory`)

```text
writing
studying
administrative
cleaning
communication
planning
physical_action
general
```

두 값은 모두 내부 데이터다. P0 UI와 실행 기록에는 실행 장벽이나 할 일 범주 이름을 표시하지 않는다.

### 출력

```json
{
  "task": "논문 쓰기",
  "task_category": "writing",
  "emotion": ["막막함", "회피하고 싶음"],
  "situation": "시작 조건이 불분명함",
  "barrier_type": "task_overwhelm"
}
```

### 대체 처리 규칙

범주·실행 장벽 대체 처리보다 안전 분류를 먼저 실행한다. 안전하지 않은 입력은 `safe_redirect`를 반환하며 행동 계획을 만들지 않는다. 허용된 입력에는 할 일 범주와 실행 장벽을 조합한 결정론적 대체 처리를 사용한다. 분류가 여전히 불분명하면 다음 값을 사용한다.

```text
general + unknown
```

`general + unknown`은 앱이 분류 반복을 멈추고 할 일을 화면에 보이는 하나의 첫 행동으로 안전하게 줄일 만큼, 허용된 할 일이라는 신호를 확보했다는 뜻이다.

### 인수 기준

- 사용자는 자연어로 할 일을 제출할 수 있다.
- 시스템은 행동 계획 생성이 허용된 입력에 유효한 내부 `task_category`와 `barrier_type`을 반환한다.
- 시스템은 사전에 정의한 실행 장벽 유형 중 하나를 사용한다.
- 빈 입력은 명확한 안내 문구와 함께 거부한다.
- 분석에 실패하면 사용자가 다시 시도할 수 있는 경로를 제공한다.

## 2. 기능: 3단계 할 일 분해

### 설명

Startio는 분석한 할 일을 작은 행동 3개로 바꾼다.

### 분해 규칙

1. 1단계는 즉시 시작할 수 있어야 한다.
2. MVP에서 1단계의 기본 시간은 약 15초로 한다.
3. 각 단계에는 구체적인 행동이 있어야 한다.
4. 각 단계에는 완료 조건이 있어야 한다.
5. 행동 계획은 사용자의 부담을 줄여야 하며, 추가 계획 작업을 만들어서는 안 된다.
6. 시스템은 추상적인 의도보다 신체로 바로 수행할 수 있는 행동을 우선한다.

### 출력

```json
{
  "task_title": "논문 쓰기",
  "task_category": "writing",
  "barrier_type": "task_overwhelm",
  "steps": [
    {
      "step_order": 1,
      "action": "논문 폴더 열기",
      "timer_seconds": 15,
      "completion_condition": "문서가 열려 있음"
    },
    {
      "step_order": 2,
      "action": "마지막 문단 읽기",
      "timer_seconds": 60,
      "completion_condition": "마지막 문단을 모두 읽음"
    },
    {
      "step_order": 3,
      "action": "문장 하나 쓰기",
      "timer_seconds": 120,
      "completion_condition": "새 문장 하나를 작성함"
    }
  ],
  "coach_message": "끝내려고 하지 마세요. 먼저 파일만 열어보세요."
}
```

### 인수 기준

- 시스템은 항상 정확히 3단계를 생성한다.
- 각 단계에는 `step_order`, `action`, `timer_seconds`, `completion_condition`이 포함된다.
- 1단계의 기본 시간은 15~20초다.
- 사용자는 1단계에서 타이머를 시작할 수 있다.
- 타이머를 시작하기 전에 행동 계획을 저장한다.

## 3. 기능: 타이머·집중 모드

### 설명

타이머는 첫 행동을 시작하게 하고 사용자가 다시 결정해야 하는 부담을 줄인다.

### 타이머 상태

```text
idle
running
paused
completed
abandoned
```

### 이벤트

- `timer_started`
- `timer_paused`
- `timer_completed`
- `timer_abandoned`

### 인수 기준

- 타이머는 현재 순차 단계에서 1단계 → 2단계 → 3단계 순서로 실행된다.
- 사용자는 타이머를 완료할 수 있다.
- 사용자는 타이머를 포기할 수 있다.
- 프로세스를 다시 실행하면 완료 처리를 하지 않은 채 현재 단계와 시각 기록 상태를 복원한다.
- 타이머 완료 시 `timer_completed` 이벤트를 생성한다.
- 타이머 포기 시 `timer_abandoned` 이벤트를 생성한다.
- 타이머 화면에는 현재 단계, 남은 시간, 핵심 조작 버튼만 표시한다.

## 4. 기능: 완료 인증과 EXP

### 설명

사용자는 3개의 단계 타이머를 모두 완료한 뒤 최종 완료 인증을 제출하고 EXP를 한 번 받는다.

### P0 완료 인증 유형

```text
check
optional_local_photo
```

### P1 완료 인증 유형

```text
text
server_synced_photo
```

### 보상 규칙 v0.1

```json
{
  "base_exp": 30,
  "proof_bonus_exp": 0,
  "streak_bonus_exp": 0
}
```

### 레벨 곡선 v0.1

- 레벨 명칭과 EXP 곡선 조정은 출시 이후로 미룬다. 아래 값은 과거 호환성 참고 자료이며 모바일 V1 UI 요구사항이 아니다.
- 누적 EXP는 계속 합산한다.
- 현재 레벨 진행도에는 비선형 다음 레벨 요구량을 사용한다.
- 초반 레벨은 빠르게 도달할 수 있어야 하며, 이후에는 필요한 완료 인증 반복 횟수를 점차 늘린다.
- 네이티브 MVP 곡선은 다음 레벨마다 `100 → 150 → 220 → 310 → 420...` EXP를 요구한다.
- 레벨 이름은 가볍고 비임상적인 표현인 `시작러`, `실행러`, `흐름러`, `루틴러`, `몰입러`를 사용할 수 있다.

### 출력

```json
{
  "proof_submitted": true,
  "proof_type": "check",
  "exp_granted": 30,
  "message": "좋아요. 계획만 세운 것이 아니라 시작하는 데 성공했어요."
}
```

### 인수 기준

- 사용자는 P0에서 체크 완료 인증을 제출할 수 있다.
- 사용자는 사진 없이 완료할 수 있다. 첨부한 사진은 앱 소유의 로컬 저장소에만 남으며 전체 삭제 시 제거된다.
- 완료 인증 제출 시 `proof_submitted` 이벤트를 생성한다.
- 3단계와 최종 완료 인증을 마친 뒤 `task_id + plan_id` 조합마다 EXP를 한 번 지급한다.
- EXP 지급 시 `exp_granted` 이벤트를 생성한다.
- 완료 화면에는 완료 피드백을 표시한다.

## 5. 기능: 실행 기록·기본 보고서

### 설명

사용자는 자신이 행동했다는 기본 증거를 확인한다.

### P0 실행 흔적

- 최근 할 일과 완료 상태
- 0~3개의 완료 단계 수
- 완료 시각 기록
- 완료 인증 상태·유형과 선택적 로컬 미리보기 이미지
- 해당 할 일에서 받은 EXP와 누적 EXP
- 최근 시작 지연시간

### P1 지표

- 시작 지연시간과 완료율 집계 차트
- 중도 이탈 지점
- 복귀율
- 주간 완료 횟수

### 인수 기준

- 사용자는 최근 시작한 할 일과 완료한 단계 수를 확인할 수 있다.
- 실행 장벽 enum·유형 이름은 표시하지 않는다.
- 사용자는 누적 EXP를 확인할 수 있다.
- 사용자는 정보가 빽빽한 비교 대시보드 없이 최근 시작 지연시간을 확인할 수 있다.
- 실행 기록이 비어 있는 상태를 명확하게 처리한다.

## 6. 기능: 로컬 모의 저장소

### 설명

실제 인증과 백엔드를 구현하기 전까지 P0는 로컬 저장소나 모의 저장소를 사용할 수 있다.

### 권장 로컬 키

```text
startio.currentTask
startio.actionPlans
startio.behaviorEvents
startio.userStats
startio.proofFiles
startio.installScopedId
startio.telemetryConsent
startio.telemetryQueue
```

### 인수 기준

- 핵심 흐름은 백엔드 없이도 동작한다.
- 의도적으로 초기화하지 않는 한 새로고침만으로 진행 중인 할 일이 즉시 삭제되지 않는다.
- 개발 중에 행동 이벤트를 확인할 수 있다.
- 저장 형식은 나중에 백엔드로 쉽게 이전할 수 있어야 한다.
- 전체 삭제 시 완료 인증 파일, 식별자, 동의 정보, 대기열, 이벤트, 실행 기록, EXP를 모두 제거한다.

## 7. 기능 우선순위

### P0

- 할 일 입력
- 실행 장벽 분석 모의 구현 또는 LLM 임시 구현
- 3단계 행동 계획
- 재진입 복원이 가능한 순차 단계 타이머
- 선택적 로컬 사진을 포함한 체크 완료 인증
- EXP
- 행동 이벤트 모의 저장소
- 기본 KPI 계산
- 실행 흔적 중심 실행 기록

### P1

- 자유 입력·서버 동기화 완료 인증
- 실행 기록 개선
- 푸시·미션 임시 구현
- 경량 개인화

### P2

- 실제 RAG
- sLLM
- 기관 대시보드
- 관리자 보고서
- 전체 6주 프로그램 엔진
