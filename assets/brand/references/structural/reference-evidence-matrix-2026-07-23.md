# Startio Reference-Evidence Matrix — 2026-07-23

## 0. 문서 상태

- 상태: Active research evidence
- 확인일: 2026-07-23
- 적용 결정: `docs/canonical/product/10-visual-direction-2026-07-23.md`
- 적용 범위: Startio Mobile V1 색상, 서체, 여백, 입력란, 버튼, 표면, 상태, 모션, 미세문구
- 승인 경계: 방향과 역할은 승인됐지만 정확한 색상·크기·간격·radius·shadow·모션 값은 검증 전 `candidate` 또는 `provisional`

이 문서는 외부 제품을 모방하기 위한 무드보드가 아니다. Startio의 각 시각 결정을 어떤 공식 근거로 설명하고, 무엇을 가져오지 않을지 기록하는 증거표다.

## 1. 증거 등급

| 등급 | 의미 | 사용 가능 범위 |
| --- | --- | --- |
| A — 규범적 공식 자료 | Apple HIG, Apple Design Resources 등 플랫폼 공식 지침 | 접근성, 적응형 화면, 의미 색상, 서체, 레이아웃, 컨트롤 품질 기준 |
| B — 제품 공식 자료 | 제품 공식 사이트·도움말·App Store 설명 | 해당 제품이 제공한다고 명시한 구조·기능·사용 목적 |
| C — 날짜가 있는 실제 UI 관찰 | 플랫폼·버전·뷰포트·확인일을 기록한 캡처 | 여백, 표면, 실제 입력 위계, 상태 전이 등 관찰 가능한 시각 사실 |
| D — 해석 또는 가설 | Startio에 적용하려는 디자인 판단 | 시제품과 접근성·사용성 시험 전 최종 승인 금지 |

공식 설명만으로 확인할 수 없는 색상·간격·표면·애니메이션은 C 등급 캡처 없이 확정하지 않는다.

## 2. 규범적 플랫폼 근거

### 2.1 Apple HIG·Design Resources

| ID | 결정 대상 | 공식 근거 | 확인된 내용 | Startio 적용 원칙 | 금지하는 해석 | 상태·신뢰도 |
| --- | --- | --- | --- | --- | --- | --- |
| AP-01 | 의미 색상·적응형 화면 | [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color) | 일관된 색상 의미, Light·Dark·Increased Contrast 대응, 시스템 색상 및 의미 역할 사용 | Background·Surface·Text·Focus·Action·Success·Caution·Destructive를 역할별로 분리하고 모든 후보색에 적응형 변형을 둔다 | Apple 색상값을 복사하거나 파스텔 오렌지가 Apple의 권장 브랜드색이라고 해석하지 않는다 | 원칙 `approved`, 값 `provisional`, A/High |
| AP-02 | 서체·텍스트 확대 | [Apple HIG — Typography](https://developer.apple.com/design/human-interface-guidelines/typography) | 읽기 쉬운 크기, 내장 텍스트 스타일, Dynamic Type, 접근성 크기와 잘림 검증 | 시스템 산세리프를 기본으로 하고 의미 기반 type role과 200% 확대·한국어 줄바꿈 시험을 둔다 | 고정 px 또는 얇은 display type을 가독성보다 우선하지 않는다 | 원칙 `approved`, scale `provisional`, A/High |
| AP-03 | 레이아웃·Safe Area | [Apple HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout) | 관련 요소 묶기, 핵심 정보 공간 확보, 정렬, Safe Area·margin·guide와 문맥 적응 | 입력과 CTA를 하나의 행동 그룹으로 묶고 브랜드·보조문구를 약화하며 키보드·Safe Area에서도 접근 가능하게 한다 | 특정 Apple 화면이나 하나의 그리드를 Startio의 고정 레이아웃으로 복제하지 않는다 | 원칙 `approved`, spacing `provisional`, A/High |
| AP-04 | 할 일 입력란 | [Apple HIG — Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields) | 짧고 구체적인 텍스트 입력에 text field 사용, placeholder 보조, 입력 후에도 목적을 보존하는 label 고려 | 한 줄 할 일 입력을 즉시 활성화하고 입력 뒤에도 목적이 사라지지 않는 접근성 label을 제공한다 | 민감정보·장문 저널 입력으로 확장하거나 placeholder만으로 입력 목적을 전달하지 않는다 | 구조 `approved`, geometry `provisional`, A/High |
| AP-05 | CTA·터치 영역 | [Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | 버튼 주변 여백과 최소 44×44pt hit region, 인접 컨트롤 간 분리 | `첫 행동 만들기`를 유일한 주요 CTA로 두고 iOS 44pt 이상, Android 48dp 이상을 검증한다 | 시각 밀도를 위해 hit region을 줄이거나 작은 아이콘 버튼을 주요 CTA로 사용하지 않는다 | 원칙·문구 `approved`, geometry `provisional`, A/High |
| AP-06 | 대비·고대비·비색상 단서 | [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | 큰 텍스트, WCAG 대비, Increase Contrast·Dark Mode, 색상 외 상태 구분, Reduce Motion 대응 | 오렌지·성공·주의·위험 상태에 문구·아이콘·선·상태 속성을 병행하고 모든 appearance를 시험한다 | 오렌지·초록·빨강만으로 상태와 안전 의미를 전달하지 않는다 | 원칙 `approved`, 구현 `provisional`, A/High |
| AP-07 | VoiceOver 순서·레이블 | [Apple HIG — VoiceOver](https://developer.apple.com/design/human-interface-guidelines/voiceover) | 핵심 요소의 대체 레이블과 의미 있는 탐색 순서 필요 | 브랜드 식별 → 입력 목적·값·오류 → CTA 순서로 읽고, 타이머와 안전 상태에 간결한 label·hint를 제공한다 | 시각 배치 순서가 자동으로 올바른 읽기 순서를 만든다고 가정하지 않는다 | 원칙 `approved`, 구현 `provisional`, A/High |
| AP-08 | 플랫폼 리소스 | [Apple Design Resources](https://developer.apple.com/design/resources/) | iOS·iPadOS 27 디자인 리소스, UI kit, 색상 가이드, 폰트, SF Symbols 등 공식 보정 자료 제공 | iOS 시제품의 Safe Area·type·icon·control 품질을 현행 리소스로 교정한다 | Apple kit를 Startio 브랜드 스타일로 취급하거나 Android 화면에 그대로 이식하지 않는다 | 기준 `approved`, 2026-07-23 확인, A/High |
| AP-09 | 미세문구 | [Apple HIG — Writing](https://developer.apple.com/design/human-interface-guidelines/writing) | 사용자 행동과 결과를 명확하고 간결하게 설명하는 인터페이스 문구 기준 | 행동 동사 중심의 짧은 한국어를 사용하고 `첫 행동 만들기`가 일반 전송과 구분되는지 시험한다 | 기능 홍보, 결과 보장, 진단·의지 평가 문구를 첫 화면에 추가하지 않는다 | 원칙·CTA `approved`, 기타 copy `provisional`, A/High |

### 2.2 Android 규범·Material 권고·Expo 구현 근거

Android 근거는 Android를 먼저 구현하기 위한 별도 디자인 시스템이 아니다. 하나의 React Native + Expo 코드베이스가 같은 P0 의미를 유지하면서 Android 고유 접근성·시스템 동작을 충족하는지 판정하는 기준이다.

| ID | 규칙 유형 | 공식 근거 | 확인된 내용 | Startio 적용 원칙 | 금지하는 해석 | 상태·신뢰도 |
| --- | --- | --- | --- | --- | --- | --- |
| AN-01 | Android 규범 | [Android accessibility — Views](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views) | 상호작용 요소는 최소 48×48dp의 focusable/touch target을 권장하며 시각 크기보다 padding·minimum size로 영역을 확보할 수 있음 | Android의 입력·CTA·아이콘 컨트롤은 최소 48dp hit region을 확보한다 | iOS 44pt를 Android 목표값으로 재사용하지 않는다 | 원칙 `approved`, geometry `provisional`, A/High |
| AN-02 | Android 규범 | [Android accessibility — Views](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views), [Android traversal](https://developer.android.com/develop/ui/compose/accessibility/traversal) | TalkBack용 목적 설명과 논리적인 탐색 순서가 필요하며 기본 순서로 충분하지 않을 때 semantic hint가 필요할 수 있음 | 시각 순서와 native source order를 일치시키고 입력 목적·CTA·동적 상태에 간결한 한국어 label을 제공한다 | label에 `버튼` 같은 element type을 중복하거나 복잡한 시각 배치를 읽기 순서보다 우선하지 않는다 | 원칙 `approved`, 구현 `provisional`, A/High |
| AN-03 | Android 규범 | [Android 14 features — Nonlinear font scaling](https://developer.android.com/about/versions/14/features) | Android 14는 `sp` 기반 글자를 비선형으로 최대 200%까지 확대하며 최대 글자 크기 시험이 필요 | 고정 높이 text container를 피하고 Android 최대 글자 크기에서 입력·CTA·3단계 문구를 검증한다 | 레이아웃 보존을 위해 시스템 글자 확대를 전역 제한하지 않는다 | 원칙 `approved`, type scale `provisional`, A/High |
| AN-04 | Android 규범 | [Android dark theme](https://developer.android.com/develop/ui/views/theming/darktheme) | Android 10+ Dark theme와 DayNight/system mode를 지원하고 light-only 색상·asset hardcoding을 피해야 함 | 모든 파스텔 오렌지 후보와 아이콘·surface를 시스템 Dark theme에서 별도 검증한다 | Dark theme를 일부 화면에만 적용하거나 밝은 asset을 그대로 사용하지 않는다 | 원칙 `approved`, 값 `provisional`, A/High |
| AN-05 | Android 규범 | [Android edge-to-edge](https://developer.android.com/develop/ui/views/layout/edge-to-edge), [Android edge-to-edge setup](https://developer.android.com/develop/ui/compose/system/setup-e2e) | Android 15의 target SDK 35+에서 edge-to-edge가 강제되며 system bar·display cutout·IME inset을 처리해야 함 | 상태·내비게이션 바와 키보드가 열린 상태에서도 입력과 CTA가 가려지지 않게 한다 | iOS Safe Area와 키보드 결과만으로 Android 가림 여부를 판정하지 않는다 | 원칙 `approved`, layout `provisional`, A/High |
| AN-06 | Android 사용자 설정 | [Android — Remove animations](https://support.google.com/accessibility/android/answer/11183305) | 사용자가 애니메이션 제거를 설정할 수 있음 | 타이머·단계 전환의 비필수 motion을 제거해도 상태 의미와 조작 가능성을 유지한다 | 자동 반복·parallax·시간 제한 motion을 필수 이해 단서로 사용하지 않는다 | 원칙 `approved`, motion `provisional`, B/High |
| MT-01 | Material 권고 | [Material 3 accessible design](https://m3.material.io/foundations/accessible-design/overview), [공식 추출 가능 접근성 자료](https://m1.material.io/usability/accessibility.html) | 48dp target, 일반적으로 target 간 8dp 이상 여백, 텍스트·중요 아이콘 대비와 색상 외 상태 단서를 권고 | 밀집 컨트롤에도 hit region과 분리 여백을 두고 안전·오류·완료에 문구·아이콘·선 단서를 병행한다 | 8dp를 모든 화면의 Android OS 의무값으로 고정하지 않는다 | 원칙 `approved`, spacing `provisional`, B/High |
| MT-02 | Material 권고 | [Material 3 text fields](https://m3.material.io/components/text-fields/overview), [Material 3 buttons](https://m3.material.io/components/buttons/overview), [공식 추출 가능 text field 자료](https://m2.material.io/design/components/text-fields.html), [button 자료](https://m2.material.io/design/components/buttons.html) | text field와 button에 inactive·focused·error·disabled·pressed 등 명확한 상태와 오류 지침을 권고 | Android 입력과 CTA에 focus·filled·loading·error·disabled·pressed 상태를 제공한다 | placeholder 또는 색상만으로 목적·오류·상태를 전달하지 않는다 | state set `approved`, visual `provisional`, B/Medium-High |
| EX-01 | React Native 구현 지침 | [React Native Accessibility](https://reactnative.dev/docs/accessibility), [AccessibilityInfo](https://reactnative.dev/docs/accessibilityinfo), [Text](https://reactnative.dev/docs/text) | VoiceOver·TalkBack을 모두 지원하며 label·role·state·live region·importantForAccessibility와 font scaling·reduce motion·high text contrast API를 제공 | shared component에 의미를 공통 정의하되 TalkBack과 VoiceOver를 별도 실기기 검증한다 | VoiceOver 통과를 TalkBack 통과로 간주하거나 `allowFontScaling`을 전역 비활성화하지 않는다 | 구현 원칙 `approved`, 증거 대기, A/High |
| EX-02 | React Native 구현 지침 | [Platform-specific code](https://reactnative.dev/docs/platform-specific-code.html), [KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview) | 가능한 코드를 재사용하면서 `Platform`·platform extension으로 차이를 처리할 수 있고 키보드 동작은 iOS·Android에서 다름 | 하나의 코드베이스 안에서 Android inset·keyboard·spacing·semantics 변형을 좁게 적용한다 | 의미가 같은 화면을 별도 제품 흐름으로 포크하거나 두 플랫폼을 pixel-identical하게 강제하지 않는다 | 구조 `approved`, 구현 `provisional`, A/High |
| EX-03 | Expo 구현 지침 | [Expo platform-specific modules](https://docs.expo.dev/router/advanced/platform-specific-modules/), [Expo development builds](https://docs.expo.dev/develop/development-builds/create-a-build/) | Expo Router는 platform-specific module과 공용 route를 지원하며 development build에서 native library·configuration을 맞춤 검증 가능 | 공용 route와 제품 계약을 유지하면서 Android 고유 구성·inset·접근성·system theme를 development build에서 검증한다 | Expo Go만으로 운영 수준 Android 동작을 증명하거나 platform 분기를 제품 의미 분기로 확대하지 않는다 | 기술 선택 `approved`, 실기기 증거 대기, A/High |

현행 Material 3 페이지는 공식 기준으로 연결했지만 자동 추출이 제한되어 세부 상태 주장의 확인에는 공식 Material 1·2 자료를 함께 사용했다. Material 권고는 Android OS 규범과 구분하고, 실제 Startio 구현값은 React Native·Expo 실기기 검증으로 결정한다. React Native의 `experimental_accessibilityOrder`는 변경 가능성이 명시된 실험 API이므로 생산 구현 근거로 사용하지 않고 자연스러운 source order를 우선한다.

## 3. 제품 레퍼런스 근거

### 3.1 즉시 입력 구조 — ChatGPT·Claude·Gemini

| ID | 레퍼런스·공식 근거 | 공식적으로 확인된 내용 | Startio에 허용하는 적용 | 복제하지 않는 요소 | 상태·신뢰도 |
| --- | --- | --- | --- | --- | --- |
| AI-01 | [ChatGPT](https://chatgpt.com/), [ChatGPT Overview](https://chatgpt.com/overview/) | 자연어 prompt로 업무·작성·코드 등의 도움을 시작하는 직접 입력 구조 | 사용자가 설명 페이지를 거치지 않고 막힌 일을 자연어로 바로 입력하게 한다 | composer 외형, 색상, 장식, 문구, general-chat 정체성 | 구조 `approved`, 시각 관찰 필요, B/Medium-High |
| AI-02 | [Claude Product Overview](https://claude.com/product/overview), [Anthropic prompt guidance](https://support.anthropic.com/en/articles/7996857-my-prompt-isn-t-giving-me-a-helpful-answer) | 구체적인 task prompt로 시작하며 명확한 지시와 문맥을 권장 | 입력 placeholder와 CTA가 하나의 구체적인 막힌 일을 적도록 유도한다 | Claude prompt template, composer 외형, 브랜드 장식, 필수 대화 모델 | 구조 `approved`, 시각 관찰 필요, B/High |
| AI-03 | [Gemini Help — Start a conversation](https://support.google.com/gemini/answer/13275745) | 하단 텍스트 상자에 질문이나 prompt를 입력하고 제출해 시작 | 첫 진입에서 입력 위치와 제출 가능성을 즉시 알아볼 수 있게 한다 | Gemini branding, motion, layout, 범용 첨부 기능 | 구조 `approved`, 시각 관찰 필요, B/High |

세 제품은 **즉시 자연어 입력이 가능한 구조**만 증명한다. 실제 여백, 입력 높이, 빈 화면 구성, 색상, 포커스 상태는 날짜가 있는 실제 UI 캡처 전까지 Startio 결정 근거로 사용하지 않는다.

### 3.2 차분한 실행기능 지원 — Tiimo

| ID | 공식 근거 | 공식적으로 확인된 내용 | Startio에 허용하는 적용 | 복제하지 않는 요소 | 상태·신뢰도 |
| --- | --- | --- | --- | --- | --- |
| TI-01 | [Tiimo](https://www.tiimoapp.com/), [About Tiimo](https://www.tiimoapp.com/about), [Tiimo AI Planner](https://www.tiimoapp.com/resource-hub/ai-planner) | visual planner, focus timer, widget, AI task breakdown, flexible planning과 `no clutter, no pressure` 방향을 설명 | 낮은 인지 부담, 시각적 진행 상태, 작은 행동 분해, 압박 없는 어조의 제품 근거로 사용 | Tiimo 브랜드, 일러스트, 캘린더 밀도, AI planner flow, 임상 효과 주장 | 역할 `approved`, 실제 감각부하 관찰 필요, B/High |
| TI-02 | [Apple 2025 App Store Awards — Tiimo](https://developer.apple.com/app-store/app-store-awards-2025/?page_id=79799) | Apple이 Tiimo를 2025년 App Store Awards 자료에서 소개 | Apple 생태계에서 접근성과 생산성 품질을 추가 확인하는 보조 근거 | 수상 사실을 Startio의 품질 보증이나 디자인 복제 허가로 사용하지 않는다 | 보조 근거, B/High |

### 3.3 따뜻한 표면 관계 — Craft

| ID | 공식 근거 | 공식적으로 확인된 내용 | Startio에 허용하는 적용 | 복제하지 않는 요소 | 상태·신뢰도 |
| --- | --- | --- | --- | --- | --- |
| CR-01 | [Craft Styling](https://support.craft.do/en/write-and-edit/styling), [Craft Cards](https://support.craft.do/en/write-and-edit/styling/cards), [Craft Customize](https://www.craft.do/customize) | 문서 배경, cover, separator, card, color, gradient, image background와 reusable style을 지원 | 중립 배경 위에 입력·행동 영역을 한 단계 분리하고 반복 가능한 surface role을 설계하는 근거 | document editor 구조, block/card 밀도, gradient·image background, Craft 스타일의 직접 복제 | surface 역할 `approved`, warm quality 관찰 필요, B/Medium |

Craft의 공식 문서는 표면 계층과 스타일 재사용은 증명하지만 “따뜻한 재질감”의 정확한 색·그림자·radius는 증명하지 않는다. 해당 판단은 날짜가 있는 실제 UI 관찰과 Startio 시제품 검증이 필요하다.

### 3.4 타이머·진행 상태 — Focus by Meaningful Things

| ID | 공식 근거 | 공식적으로 확인된 내용 | Startio에 허용하는 적용 | 복제하지 않는 요소 | 상태·신뢰도 |
| --- | --- | --- | --- | --- | --- |
| FO-01 | [Focus by Meaningful Things](https://focusapp.io/), [모바일 App Store — ID 975017240](https://apps.apple.com/kr/app/focus-timer-for-productivity/id975017240), [Mac App Store — ID 777233759](https://apps.apple.com/kr/app/focus-deep-work-timer/id777233759?mt=12), [iOS features](https://focusapp.io/focus-app-ios18) | 개발사는 Meaningful Things GmbH & Co. KG다. 모바일과 Mac 앱은 서로 다른 App Store ID를 사용하며, 표시명은 지역·플랫폼에 따라 `Focus - Deep Work Timer` 또는 `Focus - Timer for Productivity`로 나타난다. 사용자 설정 focus session, break reminder, daily goal, task, widget, Live Activity와 start·pause·skip·reset·extend 상태를 제공한다 | 타이머 상태를 명시적으로 구분하고 현재 단계·진행·일시정지·완료 피드백을 가볍게 유지하는 근거 | Focusmate와 동일 제품으로 간주, Focus palette, Pomodoro 기본값, 구독 모델, Startio 시작 화면에 타이머 UI 도입 | 제품 식별·상태 모델 `approved`, 실화면 캡처 선택 보강, B/High |

## 4. Startio 결정별 근거 매핑

| 결정 ID | Startio 결정 | 1차 근거 | 2차 근거 | 검증 방법 | 승인 상태 |
| --- | --- | --- | --- | --- | --- |
| ST-COLOR-01 | 브랜드·Primary Action의 의미 방향은 따뜻하고 차분한 파스텔 오렌지 | `10-visual-direction-2026-07-23.md` | AP-01·AP-06 | Light·Dark·Increased Contrast, 상태별 WCAG 2.2 AA, 비색상 단서 | 방향 `approved`, 정확한 값 `provisional` |
| ST-SURFACE-01 | 넓은 오렌지 배경 없이 중립 배경과 집중 surface를 사용 | CR-01 | AP-01·AP-03 | 두 뷰포트 시각 판정, raw/flat/gradient/legacy 금지 감사 | 역할 `approved`, 값·radius·shadow `provisional` |
| ST-TYPE-01 | 시스템 산세리프와 의미 기반 type role 사용 | AP-02·AN-03 | AP-03·EX-01 | iOS·Android 200% 확대, 한국어 줄바꿈, VoiceOver·TalkBack | 원칙 `approved`, scale·weight `provisional` |
| ST-SPACE-01 | 입력과 CTA를 한 행동 그룹으로 묶고 다른 요소와 충분히 분리 | AP-03·AN-05 | AI-01·AI-02·AI-03 | 390×844·360×800, 키보드·Safe Area·system inset, 3초 인지 시험 | 원칙 `approved`, spacing 값 `provisional` |
| ST-INPUT-01 | 첫 화면의 가장 강한 인터랙션은 즉시 작성 가능한 한 줄 입력 | AP-04·MT-02 | AI-01·AI-02·AI-03·AN-02 | 초기 focus·label·TalkBack order·입력 후 목적 보존·오류·개인정보 검토 | 구조 `approved`, geometry·placeholder `provisional` |
| ST-CTA-01 | 유일한 주요 CTA는 `첫 행동 만들기` | AP-05·AP-09·AN-01 | MT-01·MT-02·제품 결정문 | 최소 4/5가 일반 채팅이 아닌 첫 행동 생성으로 이해, 44pt/48dp 검증 | 문구·역할 `approved`, geometry·색 `provisional` |
| ST-COPY-01 | 첫 화면에 예시·결과 약속·기능 설명을 쌓지 않음 | AP-09 | AI-01·AI-02·AI-03의 구조적 교훈 | copy inventory, 5인 이해도 시험 | 원칙 `approved` |
| ST-EXEC-01 | 압박 없이 작은 행동과 시각적 진행을 제공 | TI-01 | 제품 기능 계약 | 사용자 부담·명료성 관찰, 임상·의지 평가 문구 감사 | 원칙 `approved`, 표현 `provisional` |
| ST-TIMER-01 | start·pause·resume·complete 상태와 현재 단계를 명시 | FO-01 | AP-06·AP-07·AN-06·EX-01 | 상태 전이, VoiceOver·TalkBack, reduced motion, 색상 제거 시험 | 상태 의미 `approved`, motion·visual `provisional` |
| ST-A11Y-01 | 색상 외 단서, 44pt/48dp, 확대, 화면 읽기, reduced motion 지원 | AP-05·AP-06·AP-07·AN-01·AN-02·AN-03·AN-06 | EX-01·P0 플랫폼 동등성 계약 | `test-spec-startio-design-system-reset.md` A01–A08와 양 플랫폼 실기기 시험 | 원칙 `approved`, iOS 구현 `provisional`, Android 증거 대기 |
| ST-PLATFORM-01 | 화면 단위 iOS-first → Android parity로 하나의 Expo 앱에서 같은 P0 의미와 플랫폼별 접근성·system behavior를 함께 지원 | 제품 기술 계약 | EX-01·EX-02·EX-03·AN-04·AN-05 | 각 화면의 iOS 교정 기록과 같은 수직 기능의 Android 동등성 기록을 쌍으로 남기고 Android 통과 전 다음 화면을 차단 | 제작 순서·기술 선택 `approved`, 실기기 증거 대기 |

### 4.1 MB-10 구현 증거 — 2026-07-24

| 항목 | 실제 적용 | 검증 증거 | 상태 |
| --- | --- | --- | --- |
| 의미 색상 | Light·Dark·Increased Contrast에서 background, surface, text, focus, primary, selected, success, caution, destructive 역할을 분리 | 4개 palette의 주요 텍스트 조합 대비를 자동 계산해 모두 4.5:1 이상 확인 | iOS 코드·대비 `provisional` |
| 큰 글자·한국어 | font scaling을 제한하지 않고 1.5배부터 header, row, dialog, preview를 재배치하며 고정 높이·말줄임을 제거 | iPhone 16e 390×844의 iOS `accessibility-large`에서 시작 입력과 CTA가 잘리지 않고 한국어가 줄바꿈됨 | iOS 약 200% 통과, 전 화면 수동 순회 대기 |
| 화면 읽기 | 시작 브랜드, 단계 요약, 타이머 진행, 삭제 진행·결과에 role, state, label, hint, live region을 의미에 맞게 배치 | source order 감사와 Node 접근성 회귀 테스트 통과 | VoiceOver 실청취 `provisional` |
| Reduce Motion | 시스템 설정을 구독하고 route fade, press scale, modal animation, 완료 feedback의 비필수 motion을 제거·대체 | 정적 코드·타입 검증 통과 | 실기기 토글 `provisional` |
| 터치 영역 | 공용 platform metric으로 iOS 44pt, Android 48dp minimum을 화면 컨트롤에 적용 | Node metric 회귀 테스트 통과 | iOS 구현, Android 렌더 검증 대기 |
| appearance | 시스템 appearance와 대비 설정에 따라 4개 의미 palette를 즉시 선택 | iPhone 16e Dark+Increased Contrast 캡처와 대비 자동 검사 통과 | 정확한 색상값 `provisional` |

Android 360×800, TalkBack traversal, Android 200% 비선형 글자 확대는 현재 사용자 지시에 따라 실행을 보류했다. 따라서 MB-10은 iOS 구현·자동 검증 범위에서는 닫혔지만 P0 양 플랫폼 동등성 게이트 전체가 승인된 것은 아니다.

## 5. 실제 UI 캡처가 필요한 항목

다음 항목은 공식 설명만으로 시각 결정을 확정할 수 없다.

### 5.1 확보한 실제 UI 관찰

2026-07-23 사용자 제공 캡처와 상세 관찰은 `docs/reference/design/current-ui/2026-07-23/README.md`에 기록했다.

| ID | 제품·상태 | 관찰된 구조 | Startio 허용 교훈 | 복제 금지 | 상태 |
| --- | --- | --- | --- | --- | --- |
| UI-CL-01 | Claude 초기 Dark | 상단-중앙 greeting, 큰 composer, 넓은 빈 공간 | 즉시 입력, 하나의 명확한 input surface, 작은 accent | greeting, model·multimodal toolbar, 상표·geometry | C, captured |
| UI-CG-01 | ChatGPT clean 초기 Dark + 도구 메뉴 open 비교 | clean은 중앙 한 문장·하단 composer·넓은 빈 공간, open은 입력 위 도구 선택 3개 추가 | 하단 input anchor와 단일 중앙 microcopy 후보 | 열린 tool menu, mode·voice·attachment, general-chat identity | C, captured |
| UI-GE-01 | Gemini 초기 Dark | 중앙 prompt·brand, 하단 composer, blue gradient | 하단 input anchor와 짧은 prompt 밀도 | 중앙 ornament, blue gradient, model·multimodal toolbar | C, captured |
| UI-TI-01 | Tiimo AI planner 빈 상태·입력, iOS Dark | 중앙 mascot·안내, 하단 voice composer, 입력 시 큰 editor·keyboard·send | 짧은 빈 상태 안내, keyboard 상태에서도 제출 행동 유지 | mascot, voice-first CTA, persistent navigation, editor geometry | C, captured |
| UI-TI-02 | Tiimo AI planner 확인 질문·언어 혼선, iOS Dark | 한 줄 입력 뒤 task 여부를 다시 묻고 한국어·영어·덴마크어가 혼재 | 필수 추가 질문·언어 불일치를 금지하는 실제 실패 근거 | 자유 대화 분기, chat bubble, 혼합 언어 응답 | C, captured |
| UI-TI-03 | Tiimo Focus 시작 전, iOS Dark | 15분 숫자·원형 눈금·방향표시, 큰 시작 버튼, 상·하단 보조 control | 숫자·이름·형태의 중복 상태 단서, Primary Action 하나 | purple system, 원형 timer geometry, 복수 mode chip·navigation | C, captured |
| UI-TI-04 | Tiimo AI planner 단일 task 생성, iOS Dark | 이름·종류·30분 card, Approve·Reject, 추가 완료 메시지 | 결과 card의 짧은 이름·종류·예상시간 묶음 | 승인 상태와 완료 문구 충돌, 영문 action, 단일 task를 breakdown으로 간주 | C, captured |
| UI-TI-05 | Tiimo Focus 실행 중, iOS Dark | 시작·종료시각, 14:53 잔여시간, 진행 ring, +1분, pause icon | 잔여시간·예상 종료시각·진행형태의 중복 단서 | purple ring·hourglass, 의미 label 없는 pause, 주변 mode·navigation | C, captured |
| UI-TI-06 | Tiimo Focus 일시 중지, iOS Dark | `일시 중지` 상태 이름, 12:35 잔여시간, play icon | 상태 이름과 icon을 함께 바꿔 실행 중과 구분 | label 없는 resume action, purple ring·hourglass | C, captured |
| UI-TI-07 | Tiimo timeline 상단·시간대·완료 구간, iOS Dark | date strip, 시간대별 접이 구간, task 이름·예상시간·완료 circle, routine 0/2 | 구간 이름·개수와 task 이름·시간의 색상 외 단서 | calendar·다수 plus·emoji·floating navigation의 높은 밀도 | C, captured |
| UI-CR-01 | Craft Home Light·Dark, iOS | 동일 geometry, neutral canvas, tonal search·empty surface, elevated navigation, white document previews | appearance별 canvas·surface·text token 재매핑과 제한된 accent | dashboard 구조, blue·multicolor accent, floating blur geometry, 정확한 색·shadow 복제 | C, captured |

생성형 AI 초기 화면의 공통 관찰은 즉시 입력, 큰 음의 공간, 약한 top navigation, 설명 블록 부재다. 입력 위치는 Claude의 상단-중앙형과 ChatGPT·Gemini의 하단 anchor형으로 갈리므로 Startio의 정확한 위치는 iOS 첫 화면 시제품 비교 전 `provisional`이다. Tiimo에서 실제 확인된 것은 단일 task 생성이며 3단계 분해가 아니다. 추가 질문·언어 혼선·승인 상태 충돌은 실행을 지연시키는 반면, Focus 화면의 숫자·시각·눈금·문구 중복 단서와 일시 중지 상태 이름은 상태 구분과 종료시각 예측에 유효하다. Timeline의 구간명·개수·예상시간은 색상 외 정보 구조에 유효하지만, calendar·반복 plus·floating navigation 밀도는 Startio 첫 행동 흐름에 사용하지 않는다. Craft는 Light·Dark에서 geometry와 surface 역할을 유지하고 tonal token만 바꾸는 appearance 관계를 확인한다. 정확히 3단계를 제공하는 구조는 외부 제품 복제가 아니라 Startio 고유 제품 계약이다.

### 5.2 남은 캡처

| 우선순위 | 필요한 캡처 | 확인할 내용 | 허용 용도 |
| --- | --- | --- | --- |
| P2 | Craft 문서 내부의 Light·Dark surface | 편집 canvas·block·card·selection 관계 | Home에서 확인한 appearance token 관계를 선택 보강 |
| P2 | Focus by Meaningful Things 모바일 앱(ID `975017240`)의 break·complete 상태 | 상태 이름, 진행 표시, control 수, motion 강도 | Tiimo에서 확보한 setup·running·paused 전이의 선택 교차검증 |
| P2 | Tiimo Focus complete 상태 | 완료 이름·진행 표시·다음 행동 | 확보한 setup·running·paused 전이를 선택 보강 |

캡처마다 제품, 플랫폼, 앱/웹 버전, 확인일, 뷰포트, 출처 URL, 승인 역할, 관찰 사실, 복제 금지 요소를 기록한다. 캡처는 변화 가능한 관찰 자료이며 공식 제품 계약으로 간주하지 않는다.

## 6. 추가로 확보할 레퍼런스

### 확보 완료한 플랫폼 근거

- **Android 공식 접근성·Material·React Native·Expo:** 48dp target, TalkBack, 200% font scaling, Dark theme, edge-to-edge·IME inset, reduced motion, input·button state와 platform-specific module·development build 근거를 AN-01~AN-06, MT-01~MT-02, EX-01~EX-03에 기록했다.
- 이 근거는 React Native + Expo 단일 코드베이스 결정을 유지하면서 플랫폼별 system behavior를 별도 검증해야 함을 확인한다. Android를 먼저 구현하거나 별도 Android 디자인 시스템을 만들 근거가 아니다.

### 시각 결정 보강

- **현재 UI 날짜 캡처:** Claude·Gemini 초기 Dark, ChatGPT clean Dark와 도구 메뉴 open 비교, Tiimo AI planner·Focus·Timeline 상태, Craft Home Light·Dark를 확보했다. Craft 문서 내부, Tiimo complete와 나머지 Light appearance는 선택 보강 자료다.
- **한국어 200% 샘플:** `첫 행동 만들기`, 오류, 개인정보·AI 처리 문구를 실제 시스템 확대에서 확인할 typographic specimen이 필요하다.
- **고대비·색각 샘플:** 파스텔 오렌지가 흰색/중립 surface에서 약해지는 경우를 확인할 appearance별 시제품이 필요하다.
- **상태 전체 세트:** Default·Focus·Pressed·Disabled·Selected·Error·Caution·Destructive를 한 화면에서 비교할 token specimen이 필요하다.

위 자료는 새로운 브랜드 방향을 추가하지 않는다. 기존 승인 역할을 검증 가능한 수준으로 좁히기 위한 증거다.

## 7. 승인 규칙

정확한 색상·타입·간격·입력 geometry·radius·shadow·motion·미세문구는 다음 조건을 모두 만족할 때만 `approved`로 바꾼다.

1. 이 문서의 결정 ID와 1개 이상의 공식 근거가 연결된다.
2. 외부 제품에서 복제하지 않는 요소가 기록된다.
3. Light·Dark·Increased Contrast와 필요한 상호작용 상태가 존재한다.
4. WCAG 2.2 AA, 200% 텍스트, 한국어 줄바꿈, VoiceOver·TalkBack, reduced motion, 44pt/48dp 검증을 통과한다.
5. 390×844와 360×800에서 입력·CTA가 스크롤 없이 사용 가능하다.
6. 5명 중 최소 4명이 3초 안에 입력을 다음 행동으로 식별하고 CTA를 첫 행동 생성으로 이해한다.
7. 기능·안전·개인정보·P0 플랫폼 의미 계약을 변경하지 않는다.

조건 하나라도 충족하지 못하면 해당 결정은 `candidate` 또는 `provisional`로 유지한다.
