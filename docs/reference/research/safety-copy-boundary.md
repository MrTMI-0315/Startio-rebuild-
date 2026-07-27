# Startio Research v0.1 Safety Copy Boundary

- 기준일: 2026-06-03
- 단계: Phase 0 Scope Lock
- 목적: Research v0.1 앱 UX, 코칭 문구, 에러/fallback 문구, 연구 검수 문서에서 지켜야 할 비임상 표현 경계와 개인정보/민감정보 저장 금지 기준을 고정한다.
- 문서 구조: `docs/research/README.md`

## 1. 원칙

Startio는 연구 맥락에서 실행기능 보조 앱으로 설명될 수 있지만, 앱 내부 UX와 AI 코칭은 비임상 실행 코치로 유지한다.

앱은 사용자의 과업 시작을 돕는 도구이지, 진단·치료·상담·약물 조언·위기 개입 도구가 아니다.

## 2. 허용되는 앱 포지셔닝

| 허용 표현 | 이유 |
| --- | --- |
| 실행 코치 | 과업 시작 행동을 돕는 역할 |
| 첫 행동을 작게 줄이기 | P0 core loop와 일치 |
| 실행 장벽 | 진단이 아닌 행동 맥락 분류 |
| 막힘 유형 | 사용자가 느끼는 시작 마찰 설명 |
| 3단계 행동 | 앱 개입 구조 |
| 타이머로 바로 시작 | Start Latency 감소를 목표로 하는 행동 설계 |
| 행동 증거/proof | 완료 인증과 기록 |
| 보상 피드백/EXP | 게임화된 feedback이며 치료 효과 주장이 아님 |

## 3. 금지되는 앱 표현

아래 표현은 앱 UX, 코칭 응답, 에러 문구, release note의 사용자-facing 영역에서 사용하지 않는다.

| 금지 범주 | 금지 예시 | 대체 방향 |
| --- | --- | --- |
| 진단 | “ADHD입니다”, “진단해볼게요”, “증상입니다” | “실행이 막힌 지점”, “시작하기 어려운 상태” |
| 치료 효과 | “ADHD를 치료합니다”, “증상이 개선됩니다”, “치료 효과가 있습니다” | “첫 행동을 작게 만들어요”, “시작 기록을 남겨요” |
| 상담 대체 | “상담을 대신합니다”, “전문가 도움 없이 충분합니다” | “비임상 실행 보조 도구입니다” |
| 약물 조언 | “약을 조절하세요”, “복용을 바꾸세요” | 앱 범위 밖으로 처리 |
| CBT 치료 제공 | “CBT 치료 앱입니다”, “치료 프로토콜을 제공합니다” | 연구 문서에서는 이론적 배경 가능, 앱 UX에서는 “행동 분해”로 표현 |
| 임상 평가 | “정상/비정상”, “위험군 판정” | 사용하지 않음 |
| 위기 개입 | “위기 상담을 해줄게요” | 즉시 지역 긴급/위기 지원 채널 안내 |
| 죄책감/훈계 | “의지가 부족합니다”, “왜 또 실패했나요” | “다시 더 작게 시작해요” |

## 4. 연구 문서와 앱 UX의 언어 분리

| 맥락 | 허용 수준 |
| --- | --- |
| 연구계획서/IRB 문서 | 연구 대상, 배경, 이론적 근거를 설명하기 위해 “성인 ADHD 성향”, “CBT 기반 요소” 같은 표현을 제한적으로 사용할 수 있음 |
| 앱 화면/AI 코치 | 진단/치료처럼 보이는 표현을 피하고 “미루기”, “실행 막힘”, “첫 행동”, “작게 시작” 중심으로 표현 |
| 데이터 딕셔너리 | `barrier_type`은 임상 분류가 아니라 앱 내 실행 장벽 enum임을 명시 |
| release note | 7.31은 운영 시작이 아니라 검수 후보임을 명시 |

## 5. 현재 코드/문서 audit 메모

2026-06-03 기준 grep audit에서 임상 관련 단어는 주로 금지 예시, manual, safety guide, contract guard에 존재한다.

| 위치 | 해석 |
| --- | --- |
| `docs/ai/04-coaching-engine.md` | forbidden claim 예시로 사용됨 |
| `docs/ux/06-ui-direction.md` | bad copy 예시로 사용됨 |
| `docs/ux/07-design-system.md` | bad copy 예시로 사용됨 |
| `docs/ai/manuals/*` | safety/forbidden/manual 기준으로 사용됨 |
| `lib/coaching-contract.ts`, `lib/coaching-chat-contract.ts` | unsafe output guard pattern으로 사용됨 |
| `lib/coaching-context.ts` | crisis/safety routing pattern으로 사용됨 |

현재 audit의 해석:
- 금지 표현이 제품 문구로 쓰인 증거는 아직 확인되지 않았다.
- 금지 예시와 guard pattern은 유지해도 된다.
- 다음 단계에서는 app/components의 사용자-facing 문구를 별도로 검토하고 QA evidence를 남긴다.

## 6. 개인정보/민감정보 저장 금지 경계

앱 behavior event, localStorage export, sample export, debug field에는 아래 정보를 저장하지 않는다.

| 금지 데이터 | 예시 |
| --- | --- |
| 원문 과업 입력 전체 | “내 학번은 ...이고 교수님께 메일을...” 같은 원문 |
| 직접 식별정보 | 이름, 이메일, 전화번호, 학번, 주소 |
| 진단/의료 정보 | ADHD 진단명, 약물명, 병원명, 의사명 |
| 상담/치료 원문 | 상담 기록, 치료 기록, 임상 평가 문항 원문 |
| 위기/자해 상세 서술 | 상세 자해 방법, 응급 상황 서술 |
| API 요청 원문 | OpenAI request payload, raw chat messages |

허용되는 구조화 정보:
- `user_hash`
- `participant_code_hash` 또는 연구용 임의 코드 해시
- `task_category`
- `barrier_type`
- `first_action`
- `timer_seconds`
- `completion_status`
- `drop_off_point`
- event timestamps
- KPI aggregate

## 7. 입력 처리 기준

사용자가 민감한 내용을 입력할 수 있으므로, 앱은 아래 기준을 따른다.

| 상황 | 처리 |
| --- | --- |
| 일반 과업 입력 | plan 생성을 위해 client/API request에 일시 사용 가능. event/export에는 원문 저장 금지 |
| 이름/연락처/학번 포함 입력 | event/export 저장 금지. 필요 시 사용자 안내 문구 추가 |
| 진단/약물/상담 관련 입력 | 앱은 진단/치료/약물 조언을 하지 않음. 실행 가능한 첫 행동으로만 축소 |
| 위기/자해 관련 입력 | 과업 코칭보다 즉시 도움 요청 안내. 원문 상세 저장 금지 |
| API 실패/fallback | `fallback_used`, `remote_timeout`, `api_error` 등 상태 이벤트만 저장 |

## 8. 권장 사용자-facing 문구

| 사용 상황 | 권장 문구 |
| --- | --- |
| 첫 입력 | “미뤄둔 일을 한 문장으로 적어주세요. 완성보다 먼저, 지금 시작할 작은 행동만 찾을게요.” |
| 과업 분해 | “막막함을 첫 행동으로 바꿔요.” |
| 실행 장벽 | “지금 막힌 지점은 시작 순서에 가까워요.” |
| 타이머 | “완성 말고, 이 행동만 해보면 됩니다.” |
| 중단 후 복귀 | “괜찮아요. 더 작은 시간으로 다시 시작해요.” |
| proof | “완료 버튼을 누른 뒤에 proof와 EXP가 기록됩니다.” |
| history | “첫 행동의 증거가 쌓입니다.” |
| 연구/검수 안내 | “이 버전은 연구자 검수용 Freeze Candidate입니다.” |

## 9. 금지 문구 체크리스트

Release Freeze 전에 아래 문자열/패턴은 사용자-facing app 영역에서 발견되면 수정한다.

```text
ADHD를 치료
치료 효과
증상이 개선
상담을 대체
약을 조절
약물 조언
진단합니다
정상/비정상 판정
CBT 치료를 제공합니다
전문가 도움 없이
의지가 부족
```

예외:
- 금지 예시 문서
- safety guide
- output validation regex
- 연구계획서/IRB 배경 설명

## 10. Validator 요구

Safety/privacy boundary는 문서만으로 충분하지 않다. 6/8 이후 아래 자동 검증을 추가한다.

| Validator | 실패 조건 |
| --- | --- |
| copy audit | app/components 사용자-facing 문구에 금지 claim이 포함됨 |
| event privacy validator | event/export에 raw input, email, phone, student number, diagnosis pattern이 포함됨 |
| debug field validator | `debug_reason`, `http_status`, `ai_state`에 raw user text가 포함됨 |
| export validator | sample JSON/CSV에 금지 필드 또는 원문 자유입력이 포함됨 |

## 11. 문서 경계

이 문서는 safety/privacy 표현과 저장 금지 기준만 담당한다. event field 상세는 `behavior-event-data-dictionary.md`, 실제 copy/validator 실행 결과는 향후 QA 결과 문서에서 관리한다.
