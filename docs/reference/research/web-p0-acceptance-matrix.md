---
status: reference
source_repository: ../startio
source_path: docs/product/08-p0-acceptance-matrix.md
source_commit: 055a8a2
source_last_commit_date: 2026-05-24
imported_at: 2026-07-22
authority: 기존 웹 P0 회귀·이전 대상 참고 자료
---

# Startio 웹 P0 인수 행렬

이 문서는 기존 `../startio` 웹 구현의 P0 상태를 기록한 참고 자료다. 모바일 V1 완료표나 현재 제품 범위를 정의하지 않는다. 충돌 시 [통합 개발 재계획](../../canonical/00-startio-dev-replan-v0.1.md), [모바일 V1 계약](../../canonical/product/09-mobile-v1-reset.md), 영역별 canonical 문서가 우선한다.

## 상태 범례

- `Done`: 기존 웹 구현과 당시 검사에서 완료로 판정
- `Stabilize`: 구현되어 있으나 사용자 경험·이벤트·테스트 보강 필요
- `Deferred`: 당시 웹 P0 범위 밖

## 기존 웹 P0 핵심 순환

| 순환 단계 | 당시 요구 동작 | 당시 상태 | 원본 저장소 증거 | 당시 다음 작업 |
| --- | --- | --- | --- | --- |
| 할 일 입력 | 백엔드 인증 없이 자연어 할 일을 제출하고 분석으로 이동 | Stabilize | `../startio/components/StartScreen.tsx`, `../startio/app/api/coach/plan/route.ts` | MB-03 |
| 실행 장벽 분석 | 할 일·감정·상황·정의된 실행 장벽 유형 출력 | Done | `../startio/lib/coaching.ts`, `../startio/lib/domain.ts` | MB-04 |
| 3단계 분해 | 정확히 3개의 구체적 단계, 1단계 15~20초 | Done | `../startio/lib/coaching.ts`, `../startio/lib/coaching-contract.ts` | MB-04 |
| 즉시 타이머 | 선택 단계 시작·일시정지·완료·포기 | Done | `../startio/components/TimerScreen.tsx` | MB-06 |
| 완료 인증·EXP | 체크 인증으로 EXP 30 지급, 중복 지급 방지 | Done | `../startio/components/DoneScreen.tsx`, `../startio/lib/kpi.ts` | MB-07 |
| 행동 이벤트 | 원문 사용자 입력 없이 주요 행동 이벤트 생성 | Stabilize | `../startio/lib/events.ts`, `../startio/lib/domain.ts` | MB-05 |
| 기본 KPI | 완료 할 일·EXP·평균 시작 지연시간·완료율 표시 | Done | `../startio/lib/kpi.ts`, `../startio/components/HistoryScreen.tsx` | MB-07 |
| 완료 기록 | 빈 상태와 완료 기록 상태 표시 | Done | `../startio/components/HistoryScreen.tsx` | MB-10 |

## 당시 안정화 공백

1. 추가 코칭 대화 없이 첫 할 일 제출에서 행동 계획을 생성한다.
2. 기존 시연 이벤트명과 P0 안정화 별칭을 필요할 때 함께 검사할 수 있게 한다.
3. 이벤트 별칭이 할 일 단위 KPI를 부풀리지 않음을 테스트한다.
4. 포기·재진입은 `timer_abandoned`와 `reentry_prompt_created`를 중심으로 작게 유지한다.
5. 로컬 개발 서버를 사용할 수 있을 때 브라우저 연기 검증을 실행한다.

## 모바일 V1과 달라진 결정

원본 문서는 사진 인증을 당시 웹 P0에서 제외했지만, 현재 모바일 V1은 **필수 체크 인증과 선택적 로컬 전용 사진 첨부를 P0에 포함**한다. 계정·결제·동기화·캘린더·푸시·서버 사진·고급 개인화는 계속 출시 이후 범위다.

