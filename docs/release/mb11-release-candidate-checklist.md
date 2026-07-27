# MB-11 릴리스 후보 체크포인트

상태: iOS 코드·정적 검증 통과 / Android 실기 검증 보류  
기준일: 2026-07-27

## 동일 소스 흐름

- 입력 → 로컬 안전 선판정 → 정확히 3단계 계획
- AI 동의 수락·거절과 원격 실패·제한시간의 로컬 대체 계획
- 1→2→3단계 순차 타이머, 포기·복귀, background 저장
- process restore 시 진행 중 타이머 일시정지 복구
- 체크 인증, 선택적 로컬 사진, EXP 30 멱등 지급
- History·KPI, 전체 로컬 데이터 삭제

## 릴리스 실패 경로와 자동 증거

| 실패 경로 | 고정 증거 |
| --- | --- |
| cold deep link hydration race | `mb11-release-candidate.test.mjs` |
| 잘못된 plan/timer/done deep link | `mb11-release-candidate.test.mjs` |
| process kill·restore와 EXP 중복 | `mb03-session.test.mjs`, `mb04-completion.test.mjs`, `mb11-release-candidate.test.mjs` |
| 저장 최신본 손상 | `mb03-session.test.mjs` |
| safe redirect | `mb01-coaching.test.mjs`, `mb08-remote-plan.test.mjs` |
| AI 동의 거절 | `mb08-remote-plan.test.mjs` |
| timeout·API 오류·잘못된 원격 계약 | `mb08-remote-plan.test.mjs` |
| 포기·복귀 | `mb02-timer.test.mjs`, `mb03-session.test.mjs` |
| 중복 proof·EXP | `mb04-completion.test.mjs`, `mb11-release-candidate.test.mjs` |
| 사진 권한 거부 | 사진 없이 체크 완료 가능한 UI 계약과 `mb07-photo-proof.test.mjs` |
| 전체 삭제·부분 실패 | `mb09-settings-privacy.test.mjs` |
| privacy forbidden keys | `mb01`, `mb03`, `mb05`, `mb07`, `mb08` 테스트 |

## 개인정보·권한 초안

- 추적: 없음
- 추적 도메인: 없음
- 원격 행동 telemetry: 비활성
- 원격 행동 계획: 사용자 AI 처리 동의 뒤 원문 할 일을 앱 기능 목적으로 전송 가능
- 선언 초안: `Other User Content`, 사용자 신원과 연결하지 않음, 추적하지 않음,
  `App Functionality`
- 사진: 사용자가 선택한 시점에만 보관함 권한 요청, 앱 Documents에 한 장 복사,
  원격 전송·행동 이벤트 기록 없음

## 재현 명령

```bash
npm run typecheck
node --test apps/mobile/tests/*.test.mjs
npm --workspace @startio/mobile exec -- expo export --platform ios --output-dir /tmp/startio-mb11-export
```

## 보류

- Android 360×800, TalkBack, background/process restore 실기 검증
- 실제 iPhone에서 사진 권한 거부·제한 접근·백업 동작 검증
- App Store Connect 개인정보 답변, AI 제공자 보관 정책, privacy manifest 최종 승인
- 실제 서명, TestFlight/Play Console 업로드, 운영 credential, 5인 시험
