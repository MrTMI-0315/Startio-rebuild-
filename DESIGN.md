# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-07-27
- Primary product surfaces: 모바일 V1 과업 입력, 행동 계획, 타이머, 완료 인증, 실행 기록, 설정
- Evidence reviewed: `docs/canonical/00-startio-dev-replan-v0.1.md`, `docs/canonical/product/09-mobile-v1-reset.md`, `docs/canonical/product/10-visual-direction-2026-07-23.md`, `docs/canonical/product/01-mvp-core.md`, `docs/canonical/product/02-user-flow.md`, `docs/canonical/product/03-feature-spec.md`, `docs/reference/design/reference-evidence-matrix-2026-07-23.md`, `docs/reference/design/`, `assets/brand/corporate/willbyte/willbyte-ci-original.jpeg`
- Decision boundary: 본 문서는 제품·사용자 경험·시각 구현 기준이다. 기능 범위와 결정 상태는 재계획 문서 14절이 우선하고, 시각 방향과 토큰 승인 상태는 `docs/canonical/product/10-visual-direction-2026-07-23.md`를 따른다.

## Brand

- Brand architecture: Startio는 사용자-facing 제품 브랜드이고 Willbyte Inc.는 Startio를 개발·운영하는 corporate endorsement brand다. 두 브랜드의 워드마크·토큰·노출 위치를 분리한다.
- Startio CI: 현재 상태는 `awaiting-design`이다. 활성 CI·헤더 마크·앱 아이콘·custom ICO geometry는 없으며, 이전 벡터 시도는 폐기했다. 다음 라운드는 `assets/brand/references/README.md`와 `docs/brand/reference-intake-checklist.md`의 승인 절차를 통과한 뒤 시작한다.
- Startio CI colors: 승인된 CI 기준색은 현재 없다. 제품 UI의 파스텔 오렌지 방향과 역사 자산의 측정색을 새 CI 색상 승인으로 해석하지 않는다.
- Startio typography: 영문·한글 제품 UI는 Noto Sans KR 400·500·600·700을 사용한다. 워드마크 서체·조합 규칙은 다음 CI 라운드에서 별도 승인한다.
- Personality: 차분함, 정확함, 실행 중심, 비임상적 신뢰, 부담 없는 단호함, engineered clarity(설계된 명료함)
- Trust signals: 사용자가 입력한 일을 다시 설명하게 하지 않음, 짧은 문구, 예측 가능한 단일 동작, 개인정보 처리 시점 명시, 설정·법적 정보에서 개발 주체를 투명하게 표시
- Corporate endorsement: Willbyte Inc. CI는 설정·앱 정보·개인정보·고객지원에서 개발 주체를 설명할 때만 사용하고 핵심 실행 흐름에서는 제품 브랜드보다 약하게 배치한다.
- Avoid: 원색 오렌지, 단일 오렌지 위계, 넓은 오렌지 페이지 배경·그라디언트, 레거시 오렌지 카드·대시보드, 게임형 과장, 둥근 카드 묶음, 강한 그림자, 긴 코칭 대화, 진단·치료 표현, 생산성 죄책감, 감정 과잉 캐릭터, 터미널·코드 미학의 장식적 남용, Willbyte CI가 Startio CTA와 경쟁하는 배치

## Product goals

- Goals: 한 줄 할 일을 즉시 입력하게 하고, 설명을 읽기 전에 `첫 행동 만들기`로 시작할 수 있음을 첫 화면에서 이해시킨다.
- Non-goals: 대시보드, 지표, 계정 생성, 장벽 선택, 감정 선택, 코치 대화, 행동 계획 편집을 첫 화면에 노출하지 않는다.
- Success signals: 최소 4/5 사용자가 3초 안에 입력을 다음 행동으로 식별, 최소 4/5가 CTA를 일반 채팅이 아닌 첫 행동 생성으로 이해, 입력부터 제출까지 한 화면·한 동작으로 완료, 390×844와 360×800에서 스크롤 없음

## Personas and jobs

- Primary personas: 해야 할 일을 알지만 시작 단계에서 멈추는 20~30대 모바일 사용자
- User jobs: 막힌 일을 빠르게 외부화하고, 계획을 다시 세우지 않은 채 가장 작은 첫 행동을 얻기
- Key contexts of use: 책상 앞에서 시작을 미루는 순간, 이동 중 떠오른 과업, 재진입 직후, 인지적 여유가 낮은 상태

## Information architecture

- Primary navigation: 시작, 실행 기록, 설정. 핵심 실행 흐름에서는 비핵심 이동을 숨긴다. Willbyte corporate signature는 설정의 앱 정보·법적 정보 영역에만 둔다.
- Core routes/screens: 과업 입력 → 행동 계획 → 단계별 타이머 → 완료 인증 → 실행 기록
- Content hierarchy: 즉시 작성 가능한 할 일 입력 → `첫 행동 만들기` 단일 핵심 실행 버튼 → 입력과 경쟁하지 않는 최소 브랜드 식별 요소. 개인정보·처리 안내는 실제 동의가 필요한 시점에 제공하고 선택적 예시·결과 약속·기능 설명은 첫 화면 위계에서 제외한다.

## Design principles

- Principle 1 — 입력이 곧 시작: 첫 화면의 가장 큰 상호작용은 과업 입력이어야 한다.
- Principle 2 — 한 화면, 한 결정: 가장 눈에 띄는 핵심 실행 버튼은 하나만 둔다.
- Principle 3 — 행동을 먼저 제안: 첫 화면에서는 결과 약속을 쌓지 않고 입력과 `첫 행동 만들기`가 제품 역할을 설명하게 한다.
- Principle 4 — 조용한 정밀함: 색상보다 위계, 여백, 글자 크기, 1픽셀 선으로 집중을 만든다.
- Principle 5 — 기술은 장식보다 동작으로 신뢰를 만든다: Willbyte CI의 기술적 인상은 터미널 장식이 아니라 빠른 입력 준비, 안정적인 상태 전이, 명확한 피드백으로 번역한다.
- Tradeoffs: 친근한 장식보다 즉시 이해를, 정보량보다 행동 속도를, 완전한 설명보다 예측 가능한 다음 단계를, corporate 일체감보다 제품 집중을 우선한다.

## Visual language

- Color: 제품 UI의 파스텔 오렌지 방향은 유지하지만 정확한 CI 기준색은 미승인이다. UI 색상 후보를 새 CI 색상으로 역추론하지 않으며, Primary Action·Focus·Pressed·Selection 역할은 접근성 검증 후 별도 승인한다. 코발트와 Willbyte Blue는 corporate·역사 후보일 뿐 제품 Primary의 기본값이 아니다.
- Color contrast: Light, Dark, Increased Contrast와 Default·Focus·Pressed·Disabled·Selected·Error·Caution·Destructive 상태별 WCAG 2.2 AA 검사를 통과한 값만 `approved`로 전환한다. 색상 외에도 선, 아이콘, 문구, 상태 속성으로 의미를 구분한다.
- Typography: 제품 UI 영문·한글은 OFL-1.1의 Noto Sans KR을 앱에 로컬 번들한다. 제목 34~44px, 본문 16~18px, 보조 12~14px, 입력 18px 이상이다. Startio 워드마크는 Noto Serif 기반 표시용 처리로 한정하며 본문·코칭 문구·CTA에 적용하지 않는다. Willbyte 워드마크의 모노스페이스 인상은 개발사 서명·앱 버전·기술 메타정보에만 제한한다.
- Spacing/layout rhythm: 4px 기반, 주요 구간 24·32·40px, 좌우 안전 여백 24px, 첫 화면 핵심 영역은 하나
- Shape/radius/elevation: 입력·버튼 16~22px 반경, 작은 요소 999px 반경 허용. 기본 그림자는 사용하지 않고 필요한 경우 8% 이하의 얕은 그림자 한 단계만 사용한다. Willbyte의 각진 `>_` 형태는 corporate signature나 작은 기술 메타정보에서만 사용할 수 있고 핵심 입력·CTA의 둥근 접근성을 대체하지 않는다.
- Motion: 160~240ms의 상태 전환만 사용. 장식 애니메이션과 무한 반복 금지
- Imagery/iconography: 핵심 흐름은 이미지 없이 시작 가능해야 한다. 일반 기능은 시스템 또는 기존 런타임 선 아이콘을 사용한다. `assets/icons/custom/`에는 현재 승인된 Startio 전용 아이콘이 없으며 다음 reference intake 전에는 새 geometry를 만들지 않는다. Willbyte CI는 corporate signature 전용이며 Startio 앱 아이콘·제품 워드마크·장식 배경으로 사용하지 않는다.

## Components

- Existing components to reuse: 기존 웹·SwiftUI 사용자 화면은 활성 소스로 복사하지 않는다. 도메인·이벤트·행동계획 API는 원본 저장소의 참고 자산이며 새 계약 테스트로 플랫폼 중립성이 증명된 부분만 선별 추출한다. 현재 활성 모바일 구성요소는 없다.
- New/changed components: 할 일 입력 영역, 글자 수 표시, AI 처리 안내, `CorporateSignature`, 설정의 앱 정보·법적 정보 영역
- Variants and states: 기본, 입력됨, 제출 중, 오류, 키보드 초점, 비활성. 새 시제품은 동일한 기능 계약 아래 근거표와 함께 제작하며, 과거 시안 01~04와 핵심 흐름 캡처는 역사·금지 패턴 확인에만 사용한다.
- CorporateSignature: 작은 Willbyte CI와 `Developed by Willbyte Inc.`를 조합한다. 설정·앱 정보·개인정보·고객지원에서만 사용하고 시작·행동 계획·타이머·완료 인증 화면에서는 사용하지 않는다.
- Token/component ownership: 시각 방향과 승인 상태는 `docs/canonical/product/10-visual-direction-2026-07-23.md`, 모바일 V1의 의미 역할은 `docs/canonical/product/09-mobile-v1-reset.md`, 구현 상세는 본 문서가 소유한다. Willbyte corporate 토큰은 `brand.corporate.*`, Startio 제품 토큰은 `brand.product.*` 이름 공간으로 분리한다. 기존 `--startio-orange*` 토큰은 과거 화면 전용이며 새 파스텔 오렌지 후보의 별칭으로 재사용하지 않는다.

## Accessibility

- Target standard: WCAG 2.2 AA
- Keyboard/focus behavior: 모든 입력·버튼은 논리적 순서와 2px 이상 초점 표시를 갖는다. Enter·버튼 제출을 지원한다.
- Contrast/readability: 본문 4.5:1 이상, 큰 글자 3:1 이상, 본문 16px 이상, 입력 18px 이상. corporate signature 역시 별도 예외 없이 같은 대비 기준을 적용한다.
- Screen-reader semantics: 입력에 항상 보이는 레이블을 연결하고 제출·오류 상태는 `aria-live`로 알린다.
- Reduced motion and sensory considerations: `prefers-reduced-motion`에서 전환을 제거한다. 색상만으로 상태를 구분하지 않는다.

## Responsive behavior

- Supported breakpoints/devices: 우선 390×844 iOS, 360×800 Android. 데스크톱에서는 430px 이하 모바일 캔버스를 중앙에 둔다.
- Production sequence: 각 화면은 390×844 iOS에서 시각 위계·입력·키보드·Dynamic Type·VoiceOver를 먼저 교정한 뒤, 같은 수직 기능 안에서 360×800 Android의 48dp·TalkBack·edge-to-edge·키보드 동등성을 통과해야 다음 화면으로 진행한다. 이는 iOS 우선 출시나 별도 네이티브 클라이언트를 뜻하지 않는다.
- Layout adaptations: 360px에서는 제목 크기와 구간 여백을 한 단계 줄이고 입력·핵심 실행 버튼은 스크롤 없이 유지한다.
- Touch/hover differences: 터치 영역 iOS 44pt·Android 48dp 이상. 호버는 보조 피드백이며 핵심 의미를 갖지 않는다.

## Interaction states

- Loading: 핵심 실행 버튼 문구를 `첫 행동 만드는 중…`으로 바꾸고 입력은 유지한다.
- Empty: 과업 입력에 초점을 유도하되 오류로 취급하지 않는다.
- Error: 2~240 문자소 묶음 범위를 입력 아래 한 줄로 설명하고 초점을 유지한다.
- Success: 시안 단계에서는 다음 화면 경계를 알리는 짧은 상태만 제공한다. 실제 제품은 행동 계획 화면으로 이동한다.
- Disabled: 입력이 2자 미만일 때 핵심 실행 버튼을 비활성화하고 이유를 글자 수·안내 문구로 함께 전달한다.
- Offline/slow network: 실제 구현에서 계약에 맞는 로컬 대체 계획으로 이어지며 진행 불가 화면을 만들지 않는다.

## Content voice

- Tone: 짧고 차분하며 실행을 재촉하지 않는 단호함
- Terminology: `과업`보다 사용자 화면에서는 `할 일`을 우선하고, `첫 행동`, `3개의 작은 행동`, `바로 시작`을 일관되게 사용
- Microcopy rules: 한 문장 24자 안팎, 느낌표 남용 금지, 진단·의지·실패 평가 금지, 인공지능 분석을 전면에 내세우지 않음

## Implementation constraints

- Framework/styling system: 활성 제품은 React Native + Expo + TypeScript로 새로 구축한다. Next.js 14 + React 18 + CSS Modules 시안은 `docs/reference/design/`의 시각 참고 자료로만 유지한다.
- Design-token constraints: 파스텔 오렌지 방향은 승인됐지만 정확한 색상값은 시제품·접근성·적응형 화면 검증 전 `provisional`이다. 원색·단일 오렌지 위계·넓은 오렌지 배경·그라디언트·레거시 카드 처리를 사용하지 않는다. Willbyte Blue를 제품 Primary의 암묵적 별칭으로 사용하지 않으며 각 화면에는 핵심 실행 버튼 하나만 둔다.
- Brand-asset constraints: Willbyte CI 원본은 `assets/brand/corporate/willbyte/`에서 보존한다. 현재 JPEG는 흰 배경·알파 없음·큰 내부 여백을 가지므로 공식 SVG 또는 검증된 파생본 없이 임의 크롭·투명화·재색상하지 않는다.
- Performance constraints: 입력란은 최소 시험 기기에서 1.5초 안에 상호작용 가능해야 하고 첫 화면은 이미지 의존 없이 렌더링한다.
- Compatibility constraints: iOS·Android의 P0 의미를 동일하게 유지한다. 안전 영역, 동적 글자 크기, 한국어 줄바꿈을 고려한다.
- Test/screenshot expectations: 각 시안은 390×844와 360×800에서 입력란·핵심 실행 버튼이 스크롤 없이 보여야 한다. 브라우저 캡처와 시각 판정 기록을 남긴다.

## Open questions

- [ ] Startio CI / 제품·디자인 / reference intake와 권리 검토 후 새 CI·헤더·앱 아이콘·custom ICO 범위 재승인
- [ ] M42-Tokens / 제품·디자인 / 승인된 CI 색상에서 파생한 UI Light·Dark·Increased Contrast와 상태별 대비를 별도 검증
- [ ] M44 / 디자인 / 과거 주황색 사용자 화면·자산 제거 목록
- [ ] M46 / 제품·디자인 / 행동 계획·실행 기록의 최종 정보 밀도
- [ ] M47 / 제품·디자인 / iOS·Android 시각적 일관성 판정 기준
- [ ] M34 / 제품·품질검증 / 출시 접근성 검증 깊이와 책임자
- [ ] Corporate CI / Willbyte / 공식 SVG, 원본 색상 토큰, 보호 여백, 최소 크기 가이드 확보
- [ ] Corporate endorsement / 제품·법무 / `CorporateSignature`를 설정·앱 정보·개인정보·고객지원 중 어디까지 노출할지 확정
