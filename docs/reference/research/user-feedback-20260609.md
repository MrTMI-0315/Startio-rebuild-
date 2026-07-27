# Startio User Feedback 2026-06-09

- 수집일: 2026-06-09
- 성격: PoC MVP Miruny 대비 사용성 피드백
- 연결 문서:
  - `docs/product/01-mvp-core.md`
  - `docs/product/02-user-flow.md`
  - `docs/ux/06-ui-direction.md`
  - `docs/research/current-mvp-feature-audit.md`
  - `docs/research/fallback-qa-history.md`

## 1. 핵심 결론

Startio P0의 문제는 3-step/timer/proof loop 자체가 아니라, 사용자가 그 loop에 들어가기 전의 진입 마찰이다.

따라서 Research v0.1의 UX 방향은 "대화형 시연 UX"가 아니라 "Miruny식 즉시 입력 -> 바로 첫 행동 생성"으로 되돌린다.

## 2. Feedback Summary

| 피드백 | 해석 | 처리 방향 |
| --- | --- | --- |
| Miruny PoC MVP보다 사용성이 낮다 | 현재 Startio가 행동 시작 전에 읽고 선택할 것이 많음 | Home과 Start를 direct task input 중심으로 단순화 |
| 대화형 UX는 시연용으로는 좋지만 실제 사용에는 느리다 | 사용자는 이미 미루는 중이므로 대화 자체가 추가 미룸이 됨 | coaching chat round는 P0 primary path에서 제외 |
| API가 안 붙고 native fallback이 계속 발생했다 | fallback은 안전장치지만 사용자 경험과 QA 로그를 오염시킬 수 있음 | forced timeout/API error QA와 fallback reason code 검증 필요 |
| 홈화면 CTA 간격이 넓고 정보가 잘 안 들어온다 | "오늘의 미션/최근 실행/누적 보상"이 행동과 연결되지 않음 | 카드형 홈을 기본 진입으로 쓰지 않음 |
| 기록이 내가 얼마나 해냈는지 알려주지 못한다 | 숫자보다 시각화가 필요함 | 최근 실행 횟수 calendar/heatmap 우선 |
| 글자가 너무 많다 | 코칭 설명보다 즉시 행동/시각적 상태가 우선 | 화면 copy를 줄이고 시각적 evidence를 늘림 |

## 3. Product Decisions

1. P0 primary entry는 `Home -> direct task input -> plan`이다.
2. `/start`에서도 대화형 coach round를 요구하지 않는다.
3. Coach/chat API는 보조 실험 경로 또는 fallback 연구 대상으로 남기되, 사용자의 기본 루프에 끼우지 않는다.
4. Home의 "오늘의 미션", "최근 실행", "누적 보상" 카드는 상호작용 없는 정보 카드라면 P0 기본 홈에서 제외한다.
5. History는 숫자 카드보다 먼저 "최근 며칠 동안 몇 번 시작했는지"를 시각적으로 보여준다.
6. 긴 설명, generic coaching copy, 내부 fallback/provider 문구는 사용자의 행동 시작을 늦추므로 줄인다.

## 4. Immediate Implementation Notes

2026-06-09 1차 반영:

- `/`에서 활성 과업이 없으면 즉시 `StartScreen` 입력 화면을 보여준다.
- `/start`의 `coach/chat` 대화 버튼과 suggested reply loop를 제거했다.
- task input은 말풍선형 orange bubble이 아니라 full-width input card로 바꿨다.
- `/history` 상단에 최근 14일 실행 calendar visualization을 추가했다.

## 5. Remaining UX QA

| 항목 | 상태 | 다음 검증 |
| --- | --- | --- |
| Miruny 대비 홈 진입 속도 | 부분 반영 | 실제 사용자에게 첫 입력까지 걸리는 시간 비교 |
| fallback 빈발 이슈 | 미해결 | timeout/non-2xx 강제 주입 QA |
| 홈 CTA 간격/시인성 | 부분 반영 | 390px screenshot QA |
| 기록 시각화 | 1차 반영 | 완료 기록이 여러 날 쌓인 fixture로 visual QA |
| 글자량 감소 | 부분 반영 | `/start`, `/`, `/history` copy audit |
