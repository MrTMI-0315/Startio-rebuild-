# 로컬 Chunking 품질 계약 v0.2

- status: canonical
- policy_version: `local_chunking_policy_v0.2`
- scope: deterministic local coaching
- updated: 2026-07-28

## 1. 목적과 범위

로컬 coaching은 범주별 문구 하나를 고르는 방식에서 다음 결정론적 흐름으로
전환한다.

```text
입력 구조화
→ 실행 장벽 분류
→ 복수의 3단계 계획 후보 생성
→ 품질 Gate 검증
→ 고정 평가함수로 ranking
→ 가장 높은 후보 선택
→ 낮은 확신에서는 기존 general fallback
```

같은 정규화 입력과 같은 policy version은 항상 같은 결과를 반환한다.
온라인 학습, 사용자별 개인화, A/B 테스트는 이 버전의 범위가 아니다.

기존 `plan_allowed | safe_redirect` 안전 선판정, raw-input privacy,
behavior event 의미, 정확히 3단계 계약을 유지한다. 원격 계획 경로, consent
gate, 8초 timeout, remote response validator도 변경하지 않는다.

## 2. 실행 장벽

로컬 v0.2가 새 계획을 생성할 때 사용하는 `BarrierType`은 다음 여섯 값이다.

```text
task_overwhelm
sequence_uncertainty
choice_paralysis
activation_low
completion_pressure
unknown
```

이 분류는 진단이나 사용자 성향이 아니다. 사용자 화면과 행동 이벤트의 새
필드로 노출하지 않는다.

기존 v0.1 원격 응답과 저장 데이터가 가진 `avoidance_emotion`,
`environment_friction` 값은 호환성을 위해 기존 결과 타입에서 즉시
삭제하지 않는다. 로컬 v0.2는 두 값을 새로 산출하지 않으며, 과거 event
semantics도 재작성하지 않는다.

## 3. 단계 역할과 행동 primitive

모든 후보는 다음 역할 순서를 정확히 따른다.

| 순서 | `StepRole` | 의미 | 시간 |
| --- | --- | --- | --- |
| 1 | `CONTACT` | 과업 대상에 직접 접촉 | 15초 |
| 2 | `NARROW` | 범위 또는 선택지를 하나로 축소 | 60초 |
| 3 | `PRODUCE` | 눈에 보이는 첫 산출물을 생성 | 120초 |

허용하는 `ActionPrimitive` 초안은 다음과 같다.

```text
OPEN_TARGET
RESTORE_LAST_POSITION
SELECT_ONE
REDUCE_SCOPE
CREATE_FIRST_OUTPUT
MARK_NEXT_POINT
```

primitive는 내부 계획 설명자다. 사용자에게 enum 이름을 노출하지 않는다.

## 4. Hard Gate

후보 계획은 다음 조건을 모두 만족해야 ranking 대상이 된다.

1. 정확히 3단계다.
2. 각 단계에는 하나의 주요 행동만 있다.
3. 각 단계의 대상과 동작이 명확하다.
4. 완료 여부를 관찰할 수 있다.
5. 단계 간 의미가 중복되지 않는다.
6. 원래 과업과 직접 연결된다.
7. 진단·치료·비난·압박 표현이 없다.
8. `CONTACT → NARROW → PRODUCE` 순서를 따른다.
9. 대상과 완료 조건 없는 모호한 단독 동사를 사용하지 않는다.

모호한 단독 동사에는 `생각해보기`, `정리하기`, `준비하기`, `확인하기`,
`시작하기`, `진행하기`가 포함된다. 이 단어 자체를 전면 금지하는 것이
아니라 대상과 관찰 가능한 완료 조건 없이 단독 행동으로 사용하는 것을
금지한다.

## 5. Static Evaluation

Gate를 통과한 후보는 다음 고정 기준으로 평가한다.

| 기준 | 최대 점수 |
| --- | ---: |
| Barrier Fit | 30 |
| Immediate Startability | 25 |
| Meaningful Progress | 20 |
| Decision Removal | 10 |
| Step Coherence | 10 |
| Tone/Safety | 5 |
| 합계 | 100 |

다음 penalty는 기준 점수 합계에서 별도로 차감한다.

| penalty | 차감 |
| --- | ---: |
| under-chunking | 20 |
| triviality | 15 |
| repetition | 15 |
| hidden decision | 10 |

동점은 후보 생성 순서와 stable `strategyId` 순서로 결정한다. 확신이 낮거나
Gate를 통과한 후보가 없으면 기존 검증된 `general + unknown` fallback을
반환한다.

이 가중치와 penalty는 `local_chunking_policy_v0.2`의 초기 제품 가설이다.
온라인 학습으로 자동 조정하지 않으며 변경 시 policy version과 fixture
근거를 함께 갱신한다.

## 6. 내부 descriptor와 개인정보

debug와 fixture report에서 다음 구조만 확인할 수 있다.

```text
policyVersion
barrierType
confidenceBand
candidateCount
selectedStrategy
stepPrimitives
fallbackUsed
```

raw task text는 analytics, behavior event export, descriptor, fixture 결과
파일에 저장하지 않는다. `behavior_event_v0.1` 필드는 이 정책을 위해
확장하지 않는다.

## 7. 변경 경계

MB-25A는 문서와 TypeScript 계약만 고정한다. 실제 로컬 선택 결과는
MB-25B에서 policy version 경계 뒤에 연결한다. MB-25C는 실제 한국어 fixture와
golden 비교 보고서로 이 계약을 검증한다.
