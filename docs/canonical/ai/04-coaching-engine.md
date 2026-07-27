# Startio 코칭 엔진

## 1. 원칙

Startio의 인공지능(AI)은 자유 형식으로 조언하는 대화형 서비스가 아니다.

전문가 지침을 따르는 실행 코칭 엔진이다.

인공지능은 사전에 정의된 코칭 규칙 안에서 작은 행동을 생성해야 한다.

## 2. 엔진 처리 흐름

```text
사용자 입력
        ↓
상태 분석기(State Parser)
        ↓
개입 규칙 검색기(Intervention Rule Retriever)
        ↓
RAG 규칙 주입 계층
        ↓
코칭 정책 엔진
        ↓
구조화 출력 생성기
        ↓
행동 계획 + 타이머 메타데이터
```

## 3. 상태 분석기

상태 분석기(State Parser)는 다음 정보를 추출한다.

```json
{
  "task": "string",
  "task_category": "writing | studying | administrative | cleaning | communication | planning | physical_action | general",
  "emotion": ["string"],
  "situation": "string",
  "barrier_type": "string"
}
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

이 열거형(enum)은 모바일 V1에서 확정된 값이다. 내부 행동 계획과 대체 경로 선택에 사용하는 분류값일 뿐, 진단이나 사용자 유형이 아니다. P0 사용자 화면(UI) 또는 실행 기록(History)에도 표시하지 않는다.

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

위 값은 모바일 V1에서 사용하는 목표 열거형(enum)이다. 버전이 있는 과거 데이터 이전 규칙은 `study → studying`, `work | home | personal → general`로 확정한다. 원문을 다시 분석해 과거 행동 분석 값을 추론하지 않는다. 이 변환표는 저장된 과거 데이터 행에만 적용한다. 새로운 원격 응답에 유효하지 않은 범주가 있으면 전체 응답을 무효로 처리하며, 이 변환표로 강제 변환하지 않는다.

## 4. 개입 규칙 검색기

검색기는 전문가 지침서에서 관련 규칙을 찾는다.

초기 지침서 파일은 다음과 같은 마크다운 파일로 저장할 수 있다.

```text
docs/reference/research/ai-barrier-types.md
docs/reference/research/ai-task-chunking-rules.md
docs/reference/research/safety-copy-boundary.md
docs/reference/research/ai-forbidden-claims.md
docs/reference/research/ai-safety-guide.md
```

실제 검색 기능을 구현하기 전의 최우선 구현 범위(P0)에서는 정적 규칙을 사용할 수 있다.

## 5. RAG 규칙 주입 계층

RAG(검색 증강 생성) 계층은 선택한 규칙을 생성 프롬프트에 주입한다.

목적은 답변을 길게 만드는 것이 아니다.

다음 조건을 지키도록 답변을 제한하는 것이 목적이다.

- 유효한 실행 장벽 유형
- 작게 시작할 수 있는 첫 행동
- 타이머 시간
- 완료 조건
- 안전한 코치 문구

## 6. 코칭 정책 엔진

정책 엔진은 다음 규칙을 적용한다.

- 금지 주장
- 말투 규칙
- 안전 규칙
- 출력 형태 규칙
- 첫 행동 크기 규칙

### 첫 행동 규칙

- 사용자에게 여전히 실행 장벽이 있는 경우 수동 지침서 v0.1 MVP에서는 15초짜리 첫 행동을 우선한다.
- 1단계(Step 1)는 집중 시간으로 보지 않고, 행동을 시작하기 위한 시간제한 도전으로 다룬다.
- 물리적 행동을 우선한다.
- 추상적인 목표를 피한다.
- 한 단계 안에 여러 행동을 넣지 않는다.
- 시작하기 전에 계획부터 세우라고 요구하지 않는다.
- 첫 행동은 지금 바로 할 수 있어야 한다.

## 7. 구조화 출력 생성기

엔진은 JSON(구조화 데이터 형식)으로 응답해야 한다.

### 출력 형식 v0.1

```json
{
  "task": "string",
  "task_category": "writing | studying | administrative | cleaning | communication | planning | physical_action | general",
  "barrier_type": "task_overwhelm | sequence_uncertainty | choice_paralysis | activation_low | avoidance_emotion | environment_friction | completion_pressure | unknown",
  "emotion": ["string"],
  "situation": "string",
  "steps": [
    {
      "step_order": 1,
      "action": "string",
      "timer_seconds": 15,
      "completion_condition": "string"
    },
    {
      "step_order": 2,
      "action": "string",
      "timer_seconds": 60,
      "completion_condition": "string"
    },
    {
      "step_order": 3,
      "action": "string",
      "timer_seconds": 120,
      "completion_condition": "string"
    }
  ],
  "coach_message": "string"
}
```

각 단계(Step)의 타이머는 15초 이상 180초 이하의 정수여야 하며, 관찰 가능한 완료 조건을 포함해야 한다. `steps` 배열 길이는 정확히 3이어야 한다. 클라이언트는 세 단계를 모두 표시할 수 있지만 `barrier_type`이나 `task_category`를 사용자용 분류 이름으로 노출하지 않는다.

## 8. 코칭 말투

### 사용 원칙

- 짧은 문장
- 차분한 격려
- 낮은 사용자 부담
- 행동을 우선하는 표현
- 구체적인 물리 동작을 나타내는 동사
- 명확한 완료 조건

### 좋은 예시

```text
먼저 파일을 열고 2분만 시작해 보세요.
끝내려고 하지 마세요. 첫 번째 물리적 행동만 시작하세요.
목표는 완벽하게 끝내는 것이 아니라 시작하는 것입니다.
```

### 피해야 할 표현

- 치료 상담처럼 긴 답변
- 추상적인 동기 부여
- 죄책감을 유발하는 표현
- 진단
- 의료 조언
- 치료 효과 주장

## 9. 금지 주장

인공지능은 다음과 같이 말해서는 안 된다.

```text
당신은 ADHD가 있습니다.
이 기능은 ADHD를 치료합니다.
이 기능은 임상 증상을 개선합니다.
상담을 받을 필요가 없습니다.
복용 중인 약을 바꿔야 합니다.
이 기능은 치료를 대체합니다.
당신의 정신건강 상태는 ...입니다.
```

## 10. 필수 안전 기준

Startio는 비임상 실행 코칭 도구다.

다음 기능을 지원한다.

- 할 일 분해
- 행동 시작
- 타이머 기반 실행
- 완료 인증과 피드백
- 행동 기록

다음 기능은 제공하지 않는다.

- 진단
- 치료
- 약물 조언
- 위기상담
- 전문 상담 대체

## 11. P0 구현 참고사항

P0에서는 코칭 엔진을 다음과 같이 구현할 수 있다.

```text
정적 실행 장벽 분류
+ 프롬프트 서식
+ 구조화 JSON 출력
+ 대체 규칙
```

명시적으로 요청받지 않으면 P0에 전체 RAG 시스템을 구현하지 않는다.

## 12. 대체 출력

대체 경로 순서는 다음과 같이 확정한다.

```text
1. 안전 분류기를 실행한다.
2. 안전하지 않으면 `safe_redirect`(안전 경로 전환)를 반환하고 행동 계획을 생성하지 않는다.
3. 허용되면 TaskCategory와 BarrierType을 분류한다.
4. 결정론적인 범주 + 실행 장벽 규칙을 선택한다.
5. 단계가 정확히 세 개인지 검증한다. 그렇지 않으면 검증된 `general + unknown`(일반 범주 + 알 수 없음) 대체 출력을 사용한다.
```

모든 범주·실행 장벽 조합에는 결과가 항상 같은 고정 시험 데이터가 있어야 한다. 형식이 잘못된 원격 열거형(enum)이 하나라도 있으면 원격 결과 전체를 무효로 처리하고 이 로컬 경로로 진입한다. 잘못된 값을 강제 변환해서는 안 된다. 허용된 생성 요청이 실패하면 다음의 안전한 `general + unknown`(일반 범주 + 알 수 없음) 기본 출력을 반환한다.

```json
{
  "task": "할 일 시작하기",
  "task_category": "general",
  "barrier_type": "unknown",
  "emotion": ["불명확"],
  "situation": "첫 행동이 불명확합니다.",
  "steps": [
    {
      "step_order": 1,
      "action": "관련 파일이나 작업 공간 열기",
      "timer_seconds": 15,
      "completion_condition": "작업 공간을 열었습니다"
    },
    {
      "step_order": 2,
      "action": "처음 보이는 항목 하나 확인하기",
      "timer_seconds": 180,
      "completion_condition": "항목 하나를 확인했습니다"
    },
    {
      "step_order": 3,
      "action": "작은 수정이나 메모 하나 남기기",
      "timer_seconds": 120,
      "completion_condition": "작은 변경 하나를 만들었습니다"
    }
  ],
  "coach_message": "지금 보이는 가장 작은 행동부터 시작하세요."
}
```
