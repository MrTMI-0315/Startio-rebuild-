# Startio 작업 보고서 Index

이 디렉터리는 Thin Repository Loop에서 생성한 self-contained
`$explain-diff` HTML을 revision과 함께 보존한다.

## 저장 규칙

- 파일명: `YYYY-MM-DD-<product-scope>.html`
- 비교 기준: commit 전 working-tree diff 또는 commit 후 revision 범위
- 필수 내용: 배경, 핵심 직관, 코드 흐름, 검증·미검증, 5문항 quiz
- 새 보고서를 만들 때 이 index에 날짜, 범위, 비교 기준, 상태와 링크를
  추가한다.

## Reports

| 날짜 | 제품 범위 | 비교 기준 | 상태 | 보고서 |
| --- | --- | --- | --- | --- |
| 2026-07-28 | P1 완료 저장 전·후 역할, 사진 면 밀도, 진입 전환 | `0855a35` → `67019dc` | 검증 완료·push 완료 | [HTML](./2026-07-28-p1-completion-visual.html) |
| 2026-07-28 | 실기기 피드백 MB-21~23 — 완료 시간 의미, 행동 단일성, 사진 선택성 | `34abc7a` → working tree | 검증 완료 | [HTML](./2026-07-28-feedback-mb21-23.html) |

## 현재 미검증

- 물리 iPhone 카메라 촬영·로컬 저장
- 햅틱 강도와 단계별 구분
- Light·Dark·System 선택의 앱 종료 후 유지
- 실제 사진 미리보기와 큰 글자 조합
- Android 360×800·TalkBack
