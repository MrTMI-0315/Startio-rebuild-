# Startio 저장소 기반 반자동 개발 루프

- status: approved-plan
- decision_date: 2026-07-28
- trial_window: 다음 제품 작업 3회
- context: `.omx/context/repository-closed-loop-assets-20260728.md`
- review_result: Planner → Architect → Critic `APPROVE`

## 1. 결정

현재 단계에서는 작업마다 `work-brief.md`, `plan.md`, `test-spec.md`,
`handoff.md`, `questions.md`를 모두 새로 만드는 완전한 자산 세트를 도입하지
않는다. 이미 존재하는 canonical 문서, PRD, test spec, micro-build 계획,
Smoke 체크리스트와 Git Lore 커밋을 역할별 상태 원천으로 재사용하는
**Thin Repository Loop**를 다음 제품 작업 3회 동안 운영한다.

큰 하네스는 현재 1인 제품·디자인·개발·실기기 QA 단계에서 배보다 배꼽이
될 가능성이 높다. 반면 아래 얇은 루프는 문서 작업을 15분 이내로 제한하면서
재개 가능성과 검증 증거를 높이므로 지금 도입할 가치가 있다.

## 2. 원칙

1. 제품 구현과 사용자 검증이 운영 산출물보다 우선한다.
2. 상태 원천은 대화 기록이 아니라 저장소 파일과 Git 이력이다.
3. 같은 상태를 두 파일 이상에 수동 복제하지 않는다.
4. 실행하지 않은 실기기·플랫폼 검증은 통과가 아니라 명시적 공백이다.
5. safety·privacy·data·P0 계약 변경만 정식 PRD/test spec 갱신을 요구한다.
6. 자동화는 세 번의 실제 루프에서 반복 병목이 확인된 뒤에만 추가한다.

## 3. 핵심 결정 요인

1. **개발 속도**: 다음 P0 실기기 판정과 P1 시각 밀도 교정을 막지 않는다.
2. **재개 가능성**: 5분 안에 현재 목표, 완료 상태, 다음 검증, 열린 질문을
   찾을 수 있어야 한다.
3. **검증 증거**: commit 전에 실행한 검증과 미검증 항목이 revision에
   연결되어야 한다.

## 4. 선택지 비교

### A. 현재 방식 유지

필요할 때마다 기존 문서 일부를 갱신하고 명시적 운영 규칙은 두지 않는다.

- 장점: 즉시 드는 비용이 없다.
- 단점: 실제로 micro-build 상단의 MB-11 상태와 본문의 MB-20 완료 상태가
  충돌했다. 재개 시 대화와 기억에 다시 의존한다.
- 판정: 반복 가능한 운영 방식으로는 부족하다.

### B. 작업마다 다섯 개 자산 생성

`work-brief`, `plan`, `test-spec`, `handoff`, `questions`를 매 작업마다
분리한다.

- 장점: 여러 팀·외부 검토자가 동시에 참여할 때 책임과 인수인계가 선명하다.
- 단점: 현재 PRD·test spec·micro-build·Smoke 문서와 역할이 중복되고,
  동기화 비용이 제품 구현보다 커질 수 있다.
- 판정: 현재는 배보다 배꼽이 크다.

### C. Thin Repository Loop — 채택

기존 자산의 책임을 고정하고, 한 작업에서 하나의 운영 상태 파일만 갱신한다.

- 장점: 새 dependency·하네스 없이 15분 이내로 운영할 수 있다.
- 장점: 기존 계획과 테스트 자산을 그대로 활용한다.
- 단점: 대규모 병렬 작업이나 외부 인수인계에는 정보가 부족할 수 있다.
- 보완: 여러 작업일에 걸치거나 담당자가 바뀌는 경우에만 짧은 context
  snapshot 하나를 추가한다.

### D. 즉시 자동화 하네스 구축

상태 파일 생성, 검증, commit, handoff를 스크립트로 연결한다.

- 장점: 안정화 뒤 반복 비용을 줄일 수 있다.
- 단점: 아직 반복 병목과 실제 필수 필드가 검증되지 않아 잘못된 절차를
  자동화할 가능성이 높다.
- 판정: 세 번의 실제 루프 전에는 도입하지 않는다.

## 5. 상태 원천과 책임

| 자산 | 소유하는 정보 | 평소 변경 여부 |
| --- | --- | --- |
| `docs/canonical/`, `DESIGN.md` | 제품·안전·개인정보·시각 계약 | 계약이 바뀔 때만 |
| 모바일 PRD·test spec | 범위와 합격 기준 | 계약·합격 기준이 바뀔 때만 |
| `micro-build-startio-rebuild.md` 상단 | 현재 checkpoint, 다음 build, 열린 질문 | 제품 작업 종료 시 |
| `smoke-2-priority-checklist.md` | 실기기 관찰과 P0/P1/P2 증거 | 판정이 바뀔 때만 |
| Git Lore commit | 해당 revision의 결정·검증·미검증 | 모든 제품 commit |
| `.omx/reports/YYYY-MM-DD-<slug>.html` | 사람이 읽는 제품 작업 보고서와 milestone 설명 | 모든 제품 작업 종료 시 |
| `.omx/reports/README.md` | 보고서 비교 기준·상태·링크 index | 보고서 생성 시 |

### micro-build 필수 상단 필드

- `updated`
- `source_revision`
- `current_checkpoint`
- `next_build`
- `open_questions`

### Smoke 증거 필드

- `verified_revision`
- device model
- OS version
- build type/version
- environment
- result
- owner
- evidence path 또는 note
- 검증하지 못했을 때 `not_tested_reason`

`실기기 확인`은 pending이다. 물리 기기가 필요한 주장은 증거 필드가
채워질 때까지 통과로 바꾸지 않는다.

## 6. 작업 1회 운영 순서

0. **재개 확인**
   - `git status --short --branch`, 현재 revision, working-tree diff를 먼저
     확인하고 기존 변경을 작업 범위와 분리해 보존한다.
   - `micro-build-startio-rebuild.md` 상단과 Smoke 증거에서 현재 목표,
     pending 실기기 항목, 플랫폼 미검증 상태를 확인한다.
1. **방향 선택 — 5분 이내**
   - Smoke P0/P1 또는 명시된 next build에서 사용자 가치 한 가지를 고른다.
   - 범위가 하루를 넘거나 담당자가 바뀌면 context snapshot 하나만 만든다.
2. **제품 구현**
   - 제품 코드를 먼저 구현한다.
   - 새 환경 구축은 제품 변경을 대체하지 않는다.
   - dependency·SDK·privacy·P0 계약이 바뀌면 구현을 멈추고 정식 계획을
     다시 연다.
3. **검증**
   - 영향을 받은 기존 테스트부터 실행하고 typecheck, 전체 회귀, 필요한
     Release build·visual verdict·실기기 검증 순으로 증거를 넓힌다.
   - 실행하지 못한 물리 기기·Android 항목은 통과가 아니라
     `Not-tested` 또는 `실기기 확인`으로 남긴다.
4. **상태 기록 — 10분 이내**
   - micro-build 상단을 최신 완료 상태와 맞춘다.
   - Smoke 판정이 실제로 변한 경우에만 해당 증거를 갱신한다.
   - 한 작업에서 두 운영 파일에 같은 완료 상태를 반복 작성하지 않는다.
5. **작업 보고서**
   - 모든 제품 작업 종료 시 `$explain-diff`로 self-contained HTML 보고서를
     `.omx/reports/YYYY-MM-DD-<slug>.html`에 생성한다.
   - 비교 기준은 commit 전에는 관련 working-tree diff, commit 후에는 해당
     revision 범위로 명시한다.
   - 보고서에는 배경, 핵심 직관, 동작 순서별 코드 설명, 5문항 quiz와 함께
     실행한 검증·미검증 실기기 및 플랫폼 항목을 포함한다.
   - `.omx/reports/README.md`에 날짜, 범위, 비교 기준, 상태와 링크를 한 줄
     추가한다.
   - milestone 또는 인수인계 작업은 같은 보고서의 비교 범위를 넓혀 설명하며
     별도 중복 보고서를 만들지 않는다.
6. **commit**
   - 작업 범위의 제품 코드, 테스트, 상태 파일, 보고서와 index만 stage한다.
   - Lore 형식으로 의도와 제약을 기록하고 `Tested:`와 `Not-tested:`를
     반드시 포함한다.
   - commit 직후 새 revision과 working tree 잔여 변경을 확인한다.
7. **push**
   - 현재 branch의 upstream을 확인한 뒤 해당 branch만 push한다.
   - `git rev-list --left-right --count <upstream>...HEAD`가 `0 0`인지
     확인해 원격 반영을 증명한다.
   - 인증·네트워크로 실패하면 완료로 표현하지 않고 commit SHA와 push
     blocker를 남긴다.
8. **종료 보고**
   - 사용자 결과, 수정 파일, 테스트, 미검증, commit SHA, push 상태,
     `.omx/reports/` HTML 링크와 다음 작업을 함께 보고한다.

## 7. 정식 계획을 다시 여는 조건

다음 변경은 canonical·PRD·test spec과 `$ralplan` 검토를 다시 연다.

- 안전 분류 또는 `plan_allowed | safe_redirect` 계약
- 개인정보 저장·전송·삭제 범위
- 행동 이벤트 또는 데이터 스키마
- P0 사용자 행동과 정확히 세 단계 계약
- iOS·Android 의미 동등성 Gate
- dependency·SDK·privacy manifest
- 합격 기준 또는 출시 Gate

P1 시각 다듬기, 문구 교정, 기존 계약 안의 상태 처리와 일반 구현 진행은
micro-build 또는 Smoke 상태만 갱신한다.

## 8. 3회 시험 운영과 중단 조건

다음 제품 작업 3회 동안 이 루프를 사용한다. 아래 중 하나가 발생하면 시험을
중단하고 작은 template, script 또는 더 강한 자산 세트를 다시 검토한다.

- 문서·상태 갱신이 15분을 넘는 작업이 3회 중 2회 발생
- 상단 checkpoint와 상세 상태의 충돌이 한 번이라도 재발
- 제품 commit에 `Tested:` 또는 `Not-tested:`가 누락
- Smoke 증거를 5분 안에 찾지 못함
- 같은 상태를 두 파일 이상에 수동 복제하는 일이 재발

반대로 세 번 모두 기준을 지키면 새 자동화 없이 Thin Loop를 유지한다.

## 9. 합격 기준

- 운영 문서 작성·갱신 시간이 작업당 15분 이하다.
- 재개 시 5분 안에 목표·상태·다음 검증·열린 질문을 찾는다.
- 동일한 결정 또는 완료 상태를 두 파일 이상에 복제하지 않는다.
- 모든 제품 commit에 `Tested:`와 `Not-tested:`가 있다.
- 모든 제품 작업 종료 응답에 현재 비교 기준을 설명하는 `$explain-diff`
  HTML 링크가 있다.
- 보고서가 `.omx/reports/`에 있고 `README.md` index에서 5분 안에
  찾을 수 있다.
- 실기기·Android 미검증을 완료로 표현하지 않는다.
- 보고서 외 새 dependency, 하네스, 상시 생성 문서 세트를 추가하지 않는다.
- 다음 P0/P1 제품 작업이 이 운영안 때문에 지연되지 않는다.

## 10. Pre-mortem

| 실패 가능성 | 조기 신호 | 대응 |
| --- | --- | --- |
| checkpoint가 다시 낡음 | 상단과 본문이 다른 MB를 가리킴 | commit 전 상단 5개 필드 대조 |
| 증거 revision이 낡음 | 캡처와 현재 코드의 commit을 연결할 수 없음 | Smoke에 revision·device·OS 기록 |
| 실기기 공백을 통과로 오해 | `실기기 확인`을 완료처럼 보고함 | pending 의미 고정, evidence 전 완료 금지 |
| commit 검증 정보 누락 | 무엇을 실행했는지 재현 불가 | Lore `Tested`·`Not-tested` 필수 |
| 운영 절차가 커짐 | 15분 초과, 새 문서 반복 생성 | 3회 시험 중단 조건 적용 |

## 11. ADR

### Decision

다음 Startio 제품 작업 3회에 Thin Repository Loop를 적용한다.

### Drivers

- 제품 구현 속도 유지
- 기존 PRD·test spec·micro-build·Smoke 자산 재사용
- Git revision에 검증과 미검증 증거 연결
- 새 dependency와 섣부른 자동화 회피

### Alternatives considered

- 운영 규칙 없는 현 상태: 상태 drift가 이미 발생해 기각
- 작업별 다섯 개 문서: 현재 1인 실행 단계에 과도해 기각
- 즉시 자동화 하네스: 실제 반복 병목이 검증되지 않아 기각

### Consequences

- 기존 파일의 책임을 더 엄격하게 구분한다.
- 평소에는 새 workflow 파일을 만들지 않는다.
- formal planning은 계약·안전·개인정보·플랫폼 Gate 변경에만 사용한다.
- 제품 작업과 milestone 설명은 `.omx/reports/`의 `$explain-diff` HTML,
  불변 검증 기록은 Git Lore commit이 맡는다.

### Follow-up

세 번의 제품 루프 뒤 시간 비용, 상태 drift, 증거 검색 가능성을 검토한다.
반복된 병목만 작은 template 또는 script로 자동화한다.
