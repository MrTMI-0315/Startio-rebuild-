# Current UI Capture Log — 2026-07-23

## 상태

- 증거 등급: C — 날짜가 있는 실제 UI 관찰
- 제공자: 사용자 제공 캡처
- 확인일: 2026-07-23
- 플랫폼·운영체제·앱 버전: Tiimo·Craft는 iOS, 나머지는 캡처에서 확인 불가, 앱 버전 미확인
- appearance: Dark, Craft는 Light·Dark 쌍
- 승인 역할: 즉시 입력 구조와 실행기능 지원 상태 비교
- 제한: 색상·간격·geometry의 최종 근거로 단독 사용 금지

## 파일 무결성

| 제품·상태 | 파일 | 크기 | SHA-256 |
| --- | --- | --- | --- |
| Claude 초기 화면 | `claude-initial-dark.png` | 584×1268 | `1fcdf07960154bae7e725192eecaadc04a3f9ae661d3be3b08601e41eaf0a380` |
| ChatGPT clean 초기 화면 | `chatgpt-initial-clean-dark.png` | 558×1212 | `b6f4ff3588208504a97c2850b9c746a90d9375da4360d20407bc5c75851418df` |
| ChatGPT 초기 화면·도구 메뉴 열림 | `chatgpt-initial-tools-open-dark.png` | 584×1270 | `251d918d5f4400824cf9584f08b9d1279508c842d576bcfe2868c76bc4f5523d` |
| Gemini 초기 화면 | `gemini-initial-dark.png` | 592×1272 | `4af957c7a9f8378e9beaaa7b27aeebbba7a987d868ade24b5f8c89ecf766eed6` |
| Tiimo AI planner 빈 상태 | `tiimo-ai-planner-empty-dark-ios.png` | 1125×2436 | `9f8da2db0267a7f2ce6934d5dd9f32960b0f12fae329e74909769effbdc4f39c` |
| Tiimo AI planner 입력 상태 | `tiimo-ai-planner-input-dark-ios.png` | 1125×2436 | `6fb244c0a653ed8a3085c9021b84c93136e2ba3b7d2f7b11b0ef656af9a820e9` |
| Tiimo AI planner 확인 질문 | `tiimo-ai-planner-clarification-dark-ios.png` | 1125×2436 | `c9e69704d4af10b6f1c455930ccf9e94679b25316f01fd8ca39738dfbdc9a45f` |
| Tiimo AI planner 언어 혼선 | `tiimo-ai-planner-language-mismatch-dark-ios.png` | 1125×2436 | `64e36e2f7bf46b8989b3a98a20ba1166ce9dbd73fd50142bc7e10c6bfe640047` |
| Tiimo AI planner 단일 task 생성 | `tiimo-ai-planner-task-created-dark-ios.png` | 1125×2436 | `b8631f17861328927c5301dd692b844ecd4901e66a380e9802e4f7f48b3927c7` |
| Tiimo Focus 시작 전 | `tiimo-focus-setup-dark-ios.png` | 1125×2436 | `ffb888217d0ad18056687fbd563033fda077c9af4510bf5c9d56b3aafbbdd93c` |
| Tiimo Focus 실행 중 | `tiimo-focus-running-dark-ios.png` | 1125×2436 | `320454a70cdfa8edd6b13ecdbaf6cc235221e3dab60720f8f9c2037f6bd4650d` |
| Tiimo Focus 일시 중지 | `tiimo-focus-paused-dark-ios.png` | 1125×2436 | `3866c067871d816dd81e9c09a6086299a25c9ea489fcfdd0d48a1335e608b188` |
| Tiimo timeline 상단 | `tiimo-timeline-top-dark-ios.png` | 1125×2436 | `597e12f52c9f0f785e1854c7cd819607a9c21ce75c052cd3228e143c7efefb41` |
| Tiimo timeline 시간대·완료 구간 | `tiimo-timeline-sections-dark-ios.png` | 1125×2436 | `577ac0c44c1d50a48bd2f56209fd92ff7ea9b4a5880053a35447e16c00086ad4` |
| Craft Home Dark | `craft-home-dark-ios.png` | 1125×2436 | `85413c4bb3e9f39bc1bd4724e48a20ac9ad619593351484b865a5c2368111c8f` |
| Craft Home Light | `craft-home-light-ios.png` | 1125×2436 | `9cc7231103e14d17a8ae6595b8fd1b41b02d7d9957871ec8f683f280655b18ea` |

## 제품별 관찰

### Claude

- 상단 navigation은 작게 유지하고 중앙 greeting과 큰 입력 surface가 초기 위계를 만든다.
- 입력은 화면 하단 고정이 아니라 상단과 중앙 사이에 위치한다.
- 입력 surface 안에 attachment, model, microphone, voice 동작이 함께 있다.
- 넓은 빈 공간이 greeting·input 이외의 경쟁 요소를 제거한다.

Startio에 허용하는 교훈:

- 사용자가 navigation을 거치지 않고 입력을 바로 시작하게 한다.
- 입력을 하나의 명확한 surface로 만들고 주변을 비운다.
- 따뜻한 accent는 넓은 배경이 아니라 작은 식별·행동 요소로 제한할 수 있다.

복제하지 않는 요소:

- 대화형 greeting
- model selector와 멀티모달 toolbar
- Claude 상표·orange mark·composer geometry
- general-chat 질문 문구

### ChatGPT

- clean 상태에서 입력은 화면 하단에 고정되고 중앙 대부분을 비운다.
- 중앙에는 `오늘은 무슨 이야기를 할까요?` 한 문장만 두고 긴 설명·기능 목록은 사용하지 않는다.
- top navigation, 중앙 prompt, 하단 composer의 세 영역이 넓은 간격으로 분리된다.
- 보조 비교 캡처에는 `이미지 만들기`, `글쓰기`, `웹 검색` 도구 메뉴가 열려 있다. 이 상태는 입력 위에 추가 선택을 만들기 때문에 clean 초기 위계의 기준으로 사용하지 않는다.

Startio에 허용하는 교훈:

- 하단 입력 anchor와 큰 음의 공간을 초기 화면 후보로 비교한다.
- 입력 가능 상태를 첫 진입부터 유지한다.
- 중앙 문구가 하나일 때에도 입력과 경쟁하는지 Startio 시제품에서 비교한다.

복제하지 않는 요소:

- 열린 tool menu와 여러 시작 옵션
- mode selector, attachment, voice control 묶음
- `Chat` 분류와 general-chat placeholder
- composer 외형과 toolbar 배치

두 캡처의 역할:

- `chatgpt-initial-clean-dark.png`: 초기 위계 기준
- `chatgpt-initial-tools-open-dark.png`: 추가 선택을 열었을 때 위계가 어떻게 복잡해지는지 보여주는 금지 패턴 비교

### Gemini

- 중앙 brand mark와 질문 문구, 하단 고정 composer가 수직으로 분리된다.
- 화면 대부분을 비우면서 중앙 prompt가 입력 행동을 보조한다.
- 하단의 넓은 blue gradient와 brand mark가 강한 브랜드 인상을 만든다.

Startio에 허용하는 교훈:

- 입력을 하단 행동 anchor로 두는 배치 후보를 비교한다.
- 하나의 짧은 prompt 외에는 설명을 쌓지 않는 밀도 원칙을 참고한다.

복제하지 않는 요소:

- 중앙 brand ornament와 general-chat 질문 문구
- blue gradient와 Gemini 색상 체계
- model selector, attachment, microphone toolbar
- CTA 없이 전송 아이콘에 의존하는 구조

### Tiimo

#### AI planner 빈 상태와 입력

- 빈 상태는 중앙 mascot·두 줄 안내와 하단 음성 중심 composer만 강조하고 나머지를 비운다.
- 입력을 시작하면 composer가 큰 편집 surface로 확장되고 `재설정`과 `보내기`가 분리된다.
- 키보드가 올라와도 전송 행동은 composer 안에 유지되지만, mascot·안내·입력·키보드가 한 화면에 남아 세로 밀도가 급격히 높아진다.
- persistent bottom navigation과 assistant shortcut이 입력 행동과 동시에 노출된다.

#### AI 응답 실패 상태

- `바이브코딩` 한 줄 입력 뒤 바로 계획을 만들지 않고 task인지 다른 항목인지 다시 묻는다.
- 후속 응답에서는 한국어 입력에 영어와 덴마크어가 섞여 언어 일관성이 깨진다.
- 큰 chat bubble과 자유 대화 구조가 사용자를 실행보다 대화 분기로 되돌린다.
- 생성된 결과는 `바이브코딩`, `할 일`, `30분`을 한 카드에 묶어 이름·종류·예상시간을 빠르게 읽게 한다.
- 같은 화면에 `Approve`와 `Reject`를 요구하면서 바로 아래 메시지는 이미 추가됐다고 말해 상태와 행동이 충돌한다.
- 실제 관찰 범위에는 3단계 분해 기능이 없으며 단일 task 생성만 확인된다. 이 캡처들은 확인 질문·언어 혼선·승인 상태 충돌의 비교 증거로 사용한다.

#### Focus 시작 전과 실행 중

- `15분`을 중앙 숫자, 원형 눈금, 15·30·45·60 표식과 방향 화살표로 중복 표현한다.
- 색상을 제거해도 현재 시간과 `시작하기` 문구로 핵심 상태와 다음 행동을 식별할 수 있다.
- 큰 `시작하기` 하나가 화면의 Primary Action이다.
- 실행 중에는 `오후 1:05 → 오후 1:20`, `14:53`, 진행 ring으로 시작·종료·잔여 시간을 동시에 표현한다.
- `+1분`은 진행 중 시간 조정을 직접 제공하지만 pause는 문구 없는 아이콘 버튼이라 의미 확인을 아이콘 인지에 의존한다.
- 일시 중지 상태에서는 `일시 중지`라는 상태 이름과 play icon을 함께 노출해 실행 중과 구분한다.
- resume 동작 자체는 `계속하기` 같은 문구 없이 play icon에 의존한다.
- 상단의 `음악 감상`·`집중 모드 시작`, 하단 navigation은 포커스 시작 행동과 경쟁한다.

#### Timeline

- 상단은 요일·날짜·주간 date strip을 보여주고, `언제든지`, `아침`, `낮`, `저녁`, `완료`로 task를 접을 수 있는 구간에 나눈다.
- 각 구간은 이름, 아이콘, task 개수를 함께 표시하므로 색상 없이도 구간 의미와 규모를 읽을 수 있다.
- task card는 emoji, 이름, 예상시간, 완료 circle을 반복해 빠른 scanning을 지원한다.
- routine card의 `0/2` 표시는 하나의 일정 안에 하위 진행이 있음을 text와 bar로 중복 표현한다.
- 전역 plus, 구간별 plus, task 완료 circle, date navigation과 persistent bottom navigation이 동시에 보여 조작점이 많다.
- 고정 bottom navigation과 assistant shortcut이 화면 아래 task를 가리며 긴 목록의 가시 영역을 줄인다.
- 이 화면은 일정 관리 dashboard 근거이며 Startio의 첫 입력·정확히 3단계 결과 화면의 직접 layout 근거가 아니다.

Startio에 허용하는 교훈:

- 시간·진행 상태는 색상 하나가 아니라 숫자, 이름, 형태를 함께 사용한다.
- 남은 시간과 예상 종료시각을 함께 제공하면 진행 상태의 예측 가능성을 높일 수 있다.
- 실행·일시 중지처럼 상태가 바뀔 때 icon만 바꾸지 않고 상태 이름을 함께 표시한다.
- 실행 화면마다 다음 행동을 나타내는 Primary Action 하나를 둔다.
- 키보드가 올라온 상태에서도 입력과 제출 행동을 같은 surface 안에서 유지한다.
- 빈 상태는 긴 기능 설명보다 짧은 안내와 넓은 음의 공간으로 시작할 수 있다.
- 결과 card에서는 행동 이름·종류·예상시간을 짧은 묶음으로 표현한다.
- 목록에서는 구간 이름·개수와 task 이름·예상시간을 색상 외 text 단서로 제공한다.

복제하지 않는 요소:

- 보라색 브랜드 체계, mascot·illustration과 원형 타이머 geometry
- task인지 다시 묻는 필수 확인 질문과 자유 대화 분기
- 한국어 요청 뒤 영어·덴마크어가 섞이는 응답
- 승인 전후 상태와 완료 문구가 충돌하는 흐름, `Approve`·`Reject` 영문 action
- voice-first CTA, unlabeled navigation icon, 상단의 복수 모드 chip
- 의미 label 없는 pause icon과 장식용 hourglass
- date strip·다수 구간·반복 plus·navigation을 한 화면에 쌓은 dashboard 밀도
- emoji category system, purple section pill, timeline card geometry
- content를 가리는 floating bottom navigation과 assistant shortcut
- AI planner chat bubble의 크기·색상·배치

### Craft

#### Light·Dark surface 관계

- 두 appearance는 heading, search, document preview, navigation의 위치와 geometry를 동일하게 유지한다.
- Light는 매우 밝은 중립 canvas 위에 search와 즐겨찾기 empty surface를 한 단계 어둡게 두고, navigation은 더 밝은 floating surface와 soft shadow로 분리한다.
- Dark는 검은색에 가까운 canvas 위에 search·utility·navigation을 한 단계 밝은 charcoal surface로 올린다.
- document preview는 양쪽 appearance에서 흰 문서와 옅은 cream·blue frame을 유지해 콘텐츠 자체의 색을 보존한다.
- section row는 border·divider·icon·text를 약한 회색으로 통일하고, 선택된 Home icon만 blue accent로 강조한다.
- Light의 즐겨찾기 empty text와 Dark의 search placeholder처럼 일부 저대비 보조 문구는 접근성 검증 없이 그대로 사용할 수 없다.
- floating navigation과 create control은 배경과 분리되지만 화면 하단 콘텐츠를 가릴 수 있다.

Startio에 허용하는 교훈:

- Light·Dark에서 component 위치와 역할은 유지하고 background·surface·text token만 appearance별로 재매핑한다.
- canvas와 입력 surface 사이에 작은 명도 차이를 두고, Primary Action만 제한된 accent를 사용한다.
- warm accent는 넓은 배경보다 input focus, CTA, 작은 상태 표시에 배치한다.
- 정확한 색상값보다 `canvas → surface → elevated control`의 상대 관계를 token contract로 만든다.

복제하지 않는 요소:

- Craft 문서 dashboard, horizontal preview carousel과 정보 구조
- blue selected icon, multicolor create control과 Craft app icon
- floating navigation·utility capsule의 geometry와 blur
- document preview의 cream·blue frame과 soft shadow
- 스크린샷에서 추출한 정확한 색상·radius·shadow 값
- 저대비 placeholder·empty-state text

## 공통 구조

세 생성형 AI 초기 화면에서 공통으로 관찰되는 사실은 다음과 같다.

1. 앱 진입 즉시 자연어 입력이 가능하다.
2. 초기 화면 대부분을 빈 공간으로 유지한다.
3. 긴 온보딩·결과 약속·기능 설명을 쌓지 않는다.
4. top navigation은 입력보다 시각적으로 약하다.
5. 입력 위치는 Claude의 상단-중앙형과 ChatGPT·Gemini의 하단 anchor형으로 나뉜다.

## Startio 적용 결론

- 가져올 것: 즉시 입력, 큰 음의 공간, 약한 navigation, 짧은 문구, 첫 진입의 낮은 선택 부담
- 가져오지 않을 것: 범용 채팅 identity, model chooser, attachment·voice toolbar, tool menu, 중앙 brand ornament, blue gradient
- Startio 차별점: `첫 행동 만들기`를 별도의 유일한 Primary Action으로 제공해 입력 결과가 일반 대화가 아니라 행동 생성임을 명시한다.
- Tiimo 비교로 더 명확해진 Startio 고유 계약: 단일 task 생성이나 필수 추가 질문으로 끝내지 않고 정확히 3단계를 만들며, 언어를 입력 언어와 일치시키고 진행 상태를 색상 외 단서로도 표현한다.
- Craft 비교로 더 명확해진 appearance 계약: Light·Dark에서 정보 구조와 component geometry를 유지하고 canvas·surface·text·accent 역할만 token으로 재매핑한다.
- 미확정: 입력을 상단-중앙형으로 둘지 하단 anchor형으로 둘지, 정확한 input height·radius·spacing·placeholder

## 다음 캡처 순서

1. 필수 외부 제품 캡처는 현재 역할 범위에서 완료
2. 선택 보강 — Focus by Meaningful Things 모바일 앱(App Store ID `975017240`)의 break·complete, Craft 문서 내부 surface, Tiimo Focus complete, ChatGPT·Claude·Gemini Light appearance

각 제품은 승인된 역할에 해당하는 상태만 수집하고, 로그인·계정·개인정보가 보이는 부분은 제외한다.
