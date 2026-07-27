# STARTIO REBUILD 에이전트 지침

## 기준 문서

작업 전 다음 순서로 읽는다.

1. `docs/README.md`
2. `docs/canonical/00-startio-dev-replan-v0.1.md`
3. `docs/canonical/product/09-mobile-v1-reset.md`
4. `docs/canonical/product/10-visual-direction-2026-07-23.md`
5. `docs/canonical/product/01-mvp-core.md`
6. `docs/canonical/product/02-user-flow.md`
7. `docs/canonical/product/03-feature-spec.md`
8. `docs/canonical/ai/04-coaching-engine.md`
9. `docs/canonical/data/05-behavior-event-schema.md`
10. `DESIGN.md`

## 제품·기술 계약

- React Native + Expo 개발 빌드 + TypeScript를 사용한다.
- iOS와 Android의 P0 의미를 동일하게 유지한다.
- 화면 단위로 390×844 iOS 설계·구현을 먼저 교정한 뒤 같은 수직 기능 안에서 360×800 Android 동등성을 통과해야 다음 화면으로 진행한다. iOS 앱 전체를 먼저 완성하거나 별도 제품 흐름으로 포크하지 않는다.
- 한 줄 할 일 직접 입력 뒤 필수 추가 질문 없이 정확히 3단계를 제공한다.
- `plan_allowed | safe_redirect` 안전 계약을 행동 계획보다 먼저 적용한다.
- 로컬 이벤트가 기준 원천이며 원문 할 일, 생성 문구, 사진·경로, 이메일, 의료·자유 입력 데이터는 행동 분석에 포함하지 않는다.
- 근거가 있는 파스텔 오렌지 중심 시각 방향을 사용하되 원색·단색 위계·넓은 주황 배경·그라디언트·레거시 오렌지 카드 화면은 사용하지 않고, 화면마다 핵심 실행 버튼 하나만 둔다.
- 기존 `../startio`는 서버·회귀 참고 자료다. 레거시 UI와 SwiftUI를 활성 소스로 복사하지 않는다.
- 계정, 결제, 동기화, 캘린더, 푸시, 서버 사진, 고급 개인화는 명시적 결정 없이 구현하지 않는다.

## 변경 규칙

- 변경 범위를 작게 유지한다.
- 새 의존성은 필요성과 개인정보 영향을 기록한다.
- 비밀값과 운영 식별자를 코드에 넣지 않는다.
- 안전 계약과 개인정보 테스트를 기능 구현보다 먼저 작성한다.

## 보고 형식

```text
변경 요약:
- ...

수정 파일:
- ...

테스트 결과:
- ...

다음 작업:
- ...
```
