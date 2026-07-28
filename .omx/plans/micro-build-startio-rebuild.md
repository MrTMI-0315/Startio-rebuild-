# Startio Rebuild 구현 중심 Micro-build 계획

- status: implementation-plan
- updated: 2026-07-28
- source_revision: 8343cf8
- authority: canonical 문서를 실제 제품 수직 기능으로 분해한 실행 보조 계획
- supersedes: 2026-07-23의 MB-01~MB-28 기반·화면 분리 계획
- current_checkpoint: 기준 revision `abd6174` 위에서 MB-25A 로컬 chunking 품질 계약을 canonical 문서와 TypeScript 타입으로 고정했다. 로컬 v0.2의 6개 BarrierType, CONTACT → NARROW → PRODUCE, 6개 ActionPrimitive, Hard Gate, 100점 평가와 penalty, privacy-safe descriptor를 정의했다. 기존 v0.1 원격·저장 호환 enum과 런타임 선택 결과는 변경하지 않았다.
- next_build: MB-25A를 별도 commit·push하고 MB-25B 결정론적 로컬 chunking engine, MB-25C fixture suite를 각각 별도 commit으로 진행한다. MB-25 전체 뒤 물리 iPhone Smoke가 통과해야 MB-26 월간 탐색기를 시작한다. Android 동등성은 별도 재개 지시 전까지 명시적 미검증이다.
- open_questions: 실제 iPhone에서 선택 사진 진입과 촬영·삭제가 자연스러운가; 단계별 햅틱과 화면 모드 유지가 Release 빌드에서 재현되는가; 원격 계획의 실제 응답도 새 단일 행동 경계를 안정적으로 통과하는가; iPhone 13 mini·큰 글자 조합에서 완료 화면 밀도가 유지되는가; Android 360×800·TalkBack 검증을 언제 재개할 것인가.

## 1. 재계획 결론

기존 계획은 첫 사용자 가치가 MB-08에서야 나타나고, 테스트 인프라·계약·토큰을 별도 작업으로 앞세웠다. 새 계획은 다음 원칙으로 바꾼다.

1. Micro-build 하나는 사용자가 끝까지 확인할 수 있는 행동 한 가지를 만든다.
2. 화면과 그 화면을 작동시키는 최소 도메인·상태·이벤트를 같은 MB에서 구현한다.
3. 테스트, 저장소, 디자인 토큰, dependency는 기능에 붙여 추가하며 독립적인 환경 구축 MB로 만들지 않는다.
4. 각 화면은 같은 MB 안에서 `iOS 390×844 → Android 360×800` 순서로 완성한다.
5. `plan_allowed | safe_redirect`, 정확히 3단계, 개인정보 금지 필드는 모든 MB의 선행 불변식이다.

MB-01부터 레거시 UI를 이식하지 않고 `apps/mobile/src` 안에서 모바일 수직 기능을 직접 구현한다. 공용 패키지 추출은 두 번째 실제 소비자가 생기기 전까지 보류한다.

## 2. 요구사항 요약

### P0 정상 경로

```text
할 일 입력
→ 안전 판정
→ 정확히 3개 행동
→ 1·2·3단계 순차 타이머
→ 체크 인증과 선택적 로컬 사진
→ EXP 30 한 번 지급
→ 실행 흔적과 기본 KPI 확인
```

- 유효한 입력 뒤 필수 추가 질문은 0개다. (`docs/canonical/product/09-mobile-v1-reset.md:75-85`)
- 안전 판정은 계획 생성보다 먼저며 `safe_redirect`에는 계획이 없다. (`docs/canonical/product/09-mobile-v1-reset.md:87-112`)
- 입력은 trim 뒤 2~240 grapheme cluster다. (`docs/canonical/product/09-mobile-v1-reset.md:77-80`)
- 첫 행동은 관찰 가능하고 15~20초 안에 시작할 수 있다. (`docs/canonical/product/03-feature-spec.md:73-125`)
- 타이머는 timestamp 기반으로 순서와 재진입을 복구한다. (`docs/canonical/product/03-feature-spec.md:127-158`)
- 세 단계 뒤 체크 인증을 완료해야 EXP 30을 한 번 지급한다. (`docs/canonical/product/03-feature-spec.md:160-217`)
- 행동 이벤트에는 원문, 생성 문구, 사진·경로, 이메일, 의료·자유 입력을 넣지 않는다. (`docs/canonical/data/05-behavior-event-schema.md:16-47`)
- 원격 행동 데이터 전송은 승인 전까지 비활성이다. (`docs/canonical/product/09-mobile-v1-reset.md:197-205`)

### 첫 화면과 시각 계약

- 첫 화면은 즉시 입력 가능한 입력란, `첫 행동 만들기`, 최소 브랜드 요소만 강하게 배치한다. (`docs/canonical/product/10-visual-direction-2026-07-23.md:70-85`)
- 파스텔 오렌지는 핵심 동작에만 사용하고 중립 배경·표면을 유지한다. (`docs/canonical/product/10-visual-direction-2026-07-23.md:58-68`)
- 화면마다 핵심 실행 버튼은 하나다. (`docs/canonical/product/10-visual-direction-2026-07-23.md:46-56`)
- 정확한 색상값은 검증 전 `provisional`이다. (`docs/canonical/product/10-visual-direction-2026-07-23.md:103-129`)
- 모든 시각 MB는 390×844 iOS를 먼저 교정하고 같은 MB에서 360×800 Android 동등성을 통과한다. (`docs/canonical/product/10-visual-direction-2026-07-23.md:131-145`)

### 명시적 제외

- 계정, 결제, 동기화, 캘린더, 푸시, 서버 사진, 고급 개인화
- 자유 입력 완료 인증, 대화형 코칭 선행, RAG, sLLM
- 테스트 인프라 완성만을 목적으로 하는 MB
- React Native override 또는 Expo SDK 변경
- 전체 `packages/*` 선행 추출
- 에뮬레이터·dependency 설치 자체를 완료 조건으로 삼는 작업

## 3. 구현 구조

공용 패키지를 먼저 만들지 않고 `apps/mobile/src` 안에서 수직 기능을 증명한다.

```text
apps/mobile/src/
  app/
    _layout.tsx
    index.tsx
    plan.tsx
    timer.tsx
    done.tsx
    history.tsx
    settings.tsx
  core/
    coaching/
    events/
    session/
    storage/
  design/
    tokens.ts
    components/
  features/
    start/
    plan/
    timer/
    completion/
    history/
    settings/
```

- `core/*`는 React에 의존하지 않는 순수 규칙과 adapter interface를 소유한다.
- `features/*`는 화면 상태와 사용자 상호작용을 소유한다.
- `app/*`는 라우트 연결과 흐름 보호만 담당한다.
- 공용 패키지 추출은 실제 모바일 수직 흐름이 통과하고 두 번째 소비자가 생긴 뒤 별도 결정한다. (`docs/canonical/product/09-mobile-v1-reset.md:169-185`)

## 4. 공통 실행 규칙

### 기능 우선

- 각 MB 첫 변경은 제품 코드다.
- 테스트는 해당 기능과 같은 MB에서 추가한다.
- 새 dependency가 필요하면 그 dependency를 사용하는 기능 MB에서만 추가하고 이유·개인정보 영향을 기록한다.
- install, Jest, lint preset, override, lockfile 정리만으로 MB를 만들지 않는다.
- 기존 Expo SDK 55와 현재 workspace 구조를 유지한다.

### 검증 우선순위

1. 변경한 순수 로직은 Node 기본 test runner로 검증한다. Jest 도입을 전제로 하지 않는다.
2. `npm run typecheck`
3. `apps/mobile`에서 iOS·Android Expo export
4. 시각 변경이면 iOS 390×844 스크린샷과 visual verdict
5. 같은 화면의 Android 360×800 스크린샷과 동등성 verdict
6. 수명 주기 관련 MB만 simulator/emulator에서 background·kill·restore를 검증

시각 변경은 verdict 없이 다음 편집으로 넘어가지 않는다. 환경 명령이 실패하면 제품 코드와 무관한 설치 작업으로 전환하지 말고, 실패 이유와 가능한 기존 명령 검증을 기록한다.

### 모든 MB의 차단 조건

- `safe_redirect`가 task, plan, timer, proof, EXP 또는 행동 이벤트를 생성함
- 허용된 계획의 단계가 3개가 아님
- 이벤트에 원문 입력·생성 문구·사진 또는 경로가 포함됨
- 한 화면에 시각적으로 경쟁하는 Primary Action이 두 개 이상임
- iOS만 통과하고 Android 의미 동등성이 확인되지 않음

## 5. Micro-build 실행 순서

### MB-01. 입력에서 로컬 3단계 계획까지

**사용자 결과**

사용자는 앱을 열고 막힌 일을 입력한 뒤 `첫 행동 만들기`를 한 번 눌러 정확히 세 개의 작은 행동을 본다. 안전하지 않은 요청에는 행동 계획 대신 비임상 안전 경계를 본다.

**구현**

- 임시 홈을 입력 우선 시작 화면으로 교체한다.
- visible label, 한 줄 `TextInput`, 글자 수·오류, loading, 단일 CTA를 구현한다.
- trim과 2~240 grapheme 검증을 구현한다.
- `PlanAllowed | SafeRedirect` 구분형 결과, 고정 안전 fixture, 안전 선판정 함수를 구현한다.
- 허용 입력에는 결정론적 `general + unknown` 3단계 fallback을 만든다.
- 1단계 강조, 2·3단계 약화, `지금 시작` 단일 CTA인 계획 화면을 만든다.
- 시작·계획 화면에 필요한 최소 semantic token만 함께 만든다.
- `task_submitted`, `plan_generated`, `fallback_used`를 금지 필드 없는 메모리 event ledger에 기록한다. `safe_redirect`에는 이 이벤트를 기록하지 않는다.

**주요 파일**

- `apps/mobile/src/app/index.tsx`
- `apps/mobile/src/app/plan.tsx`
- `apps/mobile/src/core/coaching/result.ts`
- `apps/mobile/src/core/coaching/input.ts`
- `apps/mobile/src/core/coaching/safety.ts`
- `apps/mobile/src/core/coaching/fallback.ts`
- `apps/mobile/src/core/events/event.ts`
- `apps/mobile/src/features/start/StartScreen.tsx`
- `apps/mobile/src/features/plan/PlanScreen.tsx`
- `apps/mobile/src/design/tokens.ts`

**인수 기준**

- 1자·241자 입력은 네트워크나 계획 함수를 호출하지 않는다.
- 2자·240자·한글 조합·emoji 경계가 grapheme 기준으로 동작한다.
- 일반적인 안전 입력은 추가 질문 없이 정확히 3단계를 보여준다.
- 진단·치료·약물 조정, 위기·자해, 위험·불법 고정 fixture는 각각 올바른 `safe_redirect` reason을 반환한다.
- `safe_redirect` 화면에는 타이머 CTA가 없다.
- 390×844와 360×800에서 키보드가 열린 상태로 입력과 CTA를 스크롤 없이 사용할 수 있다.
- VoiceOver·TalkBack이 입력 목적과 `첫 행동 만들기`를 구분해 읽는다.

**제외**

- 원격 AI, persistence, 타이머 동작, 사진

### MB-02. 계획에서 3단계 타이머 완료까지

**사용자 결과**

사용자는 계획 화면에서 `지금 시작`을 누르고 1·2·3단계를 순서대로 실행하며 각 단계의 타이머를 완료·일시정지·재개·포기할 수 있다.

**구현**

- `idle | running | paused | completed | abandoned` 순수 상태 머신을 구현한다.
- interval 누적이 아니라 `startedAt`, `pausedAt`, 누적 pause로 남은 시간을 계산한다.
- 1단계 완료 뒤 2단계, 2단계 완료 뒤 3단계로만 전이한다.
- 상태별로 하나의 Primary Action만 보이는 타이머 화면을 만든다.
- `timer_started`, `timer_paused`, `timer_completed`, `timer_abandoned` 이벤트를 안정적인 session/task/plan/step id와 함께 기록한다.
- 포기 시 홈으로 돌아가되 같은 세션의 재시작 정보는 메모리에 유지한다.

**주요 파일**

- `apps/mobile/src/app/timer.tsx`
- `apps/mobile/src/core/session/ids.ts`
- `apps/mobile/src/core/session/timerMachine.ts`
- `apps/mobile/src/features/timer/TimerScreen.tsx`
- `apps/mobile/src/features/timer/useTimer.ts`

**인수 기준**

- 1→2→3 이외의 단계 건너뛰기가 불가능하다.
- pause 중에는 경과시간이 증가하지 않는다.
- 완료·포기 중복 탭이 이벤트를 중복 생성하지 않는다.
- 타이머 이벤트에는 `assigned_step_count: 3`과 결정론적 step id가 있다.
- 타이머 화면은 현재 행동, 남은 시간, 상태별 핵심 조작만 보여준다.
- iOS·Android에서 1초 경과 오차가 허용 범위 안이며 system back이 무단 완료를 만들지 않는다.

**제외**

- 프로세스 종료 복구, 완료 인증, EXP

### MB-03. 로컬 저장과 앱 재진입 복구

**사용자 결과**

사용자는 타이머 중 앱을 background로 보내거나 종료한 뒤 다시 열어도 잘못 완료 처리되지 않은 현재 단계에서 이어갈 수 있다.

**구현**

- 버전이 있는 `SessionSnapshot`과 storage adapter를 구현한다.
- 현재 task, plan, timer timestamp, 완료 단계, event ledger를 원자적으로 저장한다.
- `AppState`와 앱 시작 복원으로 남은 시간을 재계산한다.
- 홈에 진행 중인 할 일 하나의 간결한 `이어하기` 경로를 추가한다.
- `app_opened`, `session_started`, `session_resumed`, `task_restarted`, `reentry_prompt_created` 이벤트를 계약에 맞게 추가한다.
- 실제 persistence dependency가 필요하면 이 MB에서만 추가하고 로컬 저장 범위와 백업 영향을 기록한다.

**주요 파일**

- `apps/mobile/src/core/session/session.ts`
- `apps/mobile/src/core/storage/storage.ts`
- `apps/mobile/src/core/storage/sessionRepository.ts`
- `apps/mobile/src/features/session/SessionProvider.tsx`
- `apps/mobile/src/features/start/ResumeCard.tsx`
- `apps/mobile/src/app/_layout.tsx`

**인수 기준**

- background·foreground·process restart 뒤 timestamp 기준 남은 시간이 복구된다.
- 복구만으로 `timer_completed`, proof, EXP가 생성되지 않는다.
- 복구는 기존 session/task/plan id를 유지한다.
- 데이터가 없거나 손상되면 새 세션으로 안전하게 돌아가고 앱이 종료되지 않는다.
- 저장 snapshot과 event ledger에 원문 할 일이 포함되지 않는다. 사용자에게 보여줄 로컬 task content는 분석 이벤트와 분리된 로컬 제품 상태에만 저장한다.

**제외**

- 클라우드 동기화, 원격 telemetry

### MB-04. 체크 완료와 멱등적 EXP

**사용자 결과**

세 번째 타이머를 마친 사용자는 체크 인증을 제출하고 EXP 30을 한 번 받은 뒤 완료 상태를 확인한다.

**구현**

- 세 단계 완료를 선행조건으로 하는 completion transaction을 구현한다.
- `task_id + plan_id` 기준 proof와 EXP 멱등성을 구현한다.
- 필수 체크와 `체크 완료` 단일 CTA인 완료 화면을 만든다.
- `proof_submitted`, `exp_granted`, `session_ended`를 저장한 뒤 화면을 전환한다.
- 완료 뒤 `다른 일 시작하기`로 새 세션을 만들 수 있게 한다.

**주요 파일**

- `apps/mobile/src/app/done.tsx`
- `apps/mobile/src/core/session/completion.ts`
- `apps/mobile/src/core/session/reward.ts`
- `apps/mobile/src/features/completion/CompletionScreen.tsx`

**인수 기준**

- 세 단계 전에는 완료 인증 라우트에 진입할 수 없다.
- 중복 탭·재시작·저장 재시도에도 같은 task+plan은 EXP 30을 한 번만 받는다.
- proof 저장 실패 시 EXP만 단독 지급되지 않는다.
- safe redirect 세션은 completion transaction을 호출할 수 없다.
- iOS·Android 완료 화면에 Primary Action은 하나다.

**제외**

- 사진, 레벨·streak·bonus EXP

### MB-05. 실행 흔적과 기본 KPI

**사용자 결과**

사용자는 History에서 최근 시작한 일의 완료 단계, 완료 시각, EXP와 최근 시작 지연시간을 확인한다.

**구현**

- 로컬 session/event ledger에서 privacy-safe history projection을 만든다.
- 시작 지연시간, task start rate, task completion rate를 순수 함수로 계산한다.
- empty state와 최근 실행 흔적 중심 History 화면을 만든다.
- 홈에서 History로 이동하되 진행 중 핵심 흐름에서는 비핵심 내비게이션을 숨긴다.
- 원문과 생성 문구는 로컬 사용자 표시 모델과 분석 이벤트 모델을 분리한다.

**주요 파일**

- `apps/mobile/src/app/history.tsx`
- `apps/mobile/src/core/events/kpi.ts`
- `apps/mobile/src/core/events/historyProjection.ts`
- `apps/mobile/src/features/history/HistoryScreen.tsx`

**인수 기준**

- 기록이 없어도 오류나 가짜 데이터 없이 empty state가 보인다.
- 계획 하나의 첫 `timer_started`만 task start rate 분자에 사용한다.
- History에 barrier enum·진단·의료 분류를 표시하지 않는다.
- event export allowlist에 raw task, generated action, coach copy, photo/path, email, free text가 0건이다.
- 숫자 카드 묶음보다 최근 행동 흔적이 먼저 보인다.

**제외**

- 주간 차트, 고급 보고서, 원격 분석

### MB-06. 상호작용 피드백·iOS 화면 밀도

**사용자 결과**

사용자는 입력 제출, 단계 완료, 앱 재진입, 최종 완료가 실제로 처리됐는지 추가 설명 없이 즉시 알 수 있다. 피드백은 필요한 순간에만 나타나며 화면마다 핵심 실행 버튼 하나를 유지한다.

**구현**

- 홈 입력 영역을 ChatGPT 계열의 컴팩트한 composer 밀도로 줄이고 `첫 행동 만들기`를 입력 영역과 하나의 실행 묶음으로 정리한다.
- 2~240자 안내와 글자 수는 비활성 상태에서 약화하고 focus·오류 상태에서만 선명하게 표시한다.
- 제출 중에는 중복 탭을 차단하고 같은 CTA 위치에서 `첫 행동 만드는 중…` 상태를 보여준다.
- 현재 step order 증가를 감지해 `n단계 완료`를 약 600ms 표시한 뒤 다음 단계 화면을 노출한다. 이 UI 피드백은 timer 상태·event ledger를 추가 변경하지 않는다.
- 재진입 카드에 `일시정지됨 · n초 남음`과 완료 단계 수를 함께 표시한다.
- 최종 완료 화면에서 체크와 `EXP +30`을 한 번만 나타나는 opacity·scale 전환으로 확인한다. reward transaction은 기존 멱등 로직을 그대로 사용한다.
- `AccessibilityInfo`로 reduce motion을 존중하고 제출·단계 완료·최종 완료를 screen reader에 알린다.
- 오류와 `safe_redirect`는 입력 영역 바로 아래 한 줄 피드백으로 유지하고 modal·toast stack을 추가하지 않는다.
- `expo-haptics`는 현재 설치되어 있지 않으므로 이 MB에서는 추가하지 않는다. 햅틱은 dependency 승인 뒤 별도 보강한다.

**주요 파일**

- `apps/mobile/src/features/start/StartScreen.tsx`
- `apps/mobile/src/features/start/ResumeCard.tsx`
- `apps/mobile/src/features/timer/TimerScreen.tsx`
- `apps/mobile/src/features/timer/useStepFeedback.ts`
- `apps/mobile/src/features/completion/CompletionScreen.tsx`
- `apps/mobile/src/design/tokens.ts`
- `apps/mobile/tests/mb06-feedback.test.mjs`

**인수 기준**

- 제출 버튼을 반복 탭해도 plan·event가 중복 생성되지 않는다.
- 1→2, 2→3 전환마다 완료 피드백은 한 번만 보이고 timer event 수를 변경하지 않는다.
- 재실행 뒤 카드가 현재 단계, 완료 단계 수, 일시정지 상태, 남은 시간을 함께 보여준다.
- 완료 체크와 EXP +30 피드백이 동일 completion key에서 한 번만 보이며 보상은 한 번만 지급된다.
- Reduce Motion 활성 시 scale·slide 없이 즉시 상태가 바뀐다.
- VoiceOver가 제출 중, 단계 완료, 최종 완료를 중복 없이 읽는다.
- iPhone 16e 390×844에서 키보드가 열린 상태로 입력과 단일 CTA를 스크롤 없이 확인할 수 있다.
- visual verdict가 90점 이상이거나, 90점 미만이면 차이를 기록하고 다음 기능 MB로 넘어가지 않는다.
- `npm run typecheck`와 기존 MB-01~05 40개 테스트에 회귀가 없다.

**제외**

- Android 시각 교정, 새 animation library, 새 haptics dependency, 사진, 원격 AI

### MB-07. 선택적 로컬 사진 증거

**사용자 결과**

사용자는 세 번째 단계 뒤 사진 없이 체크 완료하거나, 원할 때만 사진 하나를 첨부해 로컬 History 미리보기로 볼 수 있다.

**구현**

- 사진 선택 권한은 사용자가 첨부를 눌렀을 때만 요청한다.
- 선택한 파일을 앱 소유 로컬 저장소로 복사하고 proof record에는 로컬 참조만 둔다.
- 완료 화면과 History에 선택적 미리보기를 추가한다.
- proof 삭제와 전체 삭제가 원본·미리보기를 함께 제거하도록 file repository를 구현한다.
- 필요한 Expo media/file dependency는 이 MB에서만 추가하고 개인정보 영향을 기록한다.

**주요 파일**

- `apps/mobile/src/core/storage/proofFileRepository.ts`
- `apps/mobile/src/features/completion/PhotoProofPicker.tsx`
- `apps/mobile/src/features/history/ProofThumbnail.tsx`

**인수 기준**

- 사진 없이 완료하는 경로가 기본이며 막히지 않는다.
- 권한 거부 뒤에도 체크 완료가 가능하다.
- 사진 URI·경로가 BehaviorEvent 또는 export payload에 들어가지 않는다.
- 사진은 서버 요청·content report에 포함되지 않는다.
- 삭제 뒤 앱 소유 파일과 미리보기가 남지 않는다.

**제외**

- 카메라 강제 사용, 서버 업로드, 사진 동기화

### MB-08. AI 동의와 원격 계획의 안전한 대체

**사용자 결과**

사용자는 최초 원격 요청 직전에만 짧은 AI 처리 동의를 선택한다. 거절·offline·timeout·잘못된 응답에서도 로컬 3단계 계획으로 계속 진행한다.

**구현**

- 버전이 있는 AI processing consent 상태를 구현하고, 설정 철회 UI는 MB-09의 전체 개인정보 제어와 함께 연결한다.
- `PlanClient` interface와 HTTP adapter를 만들고 API key는 클라이언트에 두지 않는다.
- injected timeout, abort, non-2xx, malformed enum/steps 검증을 구현한다.
- 원격 성공만 validated `plan_allowed`로 사용하고 나머지는 로컬 fallback으로 전환한다.
- 원격 `safe_redirect`는 fallback plan으로 바꾸지 않는다.
- 생성 콘텐츠 신고 진입은 별도 서버 endpoint와 report payload 정책이 확정된 뒤 제공하며 원문 할 일을 기본 포함하지 않는다.
- `remote_timeout`, `api_error`, `fallback_used`를 금지 필드 없이 기록한다.

**주요 파일**

- `apps/mobile/src/core/coaching/planClient.ts`
- `apps/mobile/src/core/coaching/remotePlan.ts`
- `apps/mobile/src/core/coaching/validateRemoteResult.ts`
- `apps/mobile/src/core/session/consent.ts`
- `apps/mobile/src/features/start/AiConsentSheet.tsx`
- `apps/mobile/src/features/plan/ContentReportAction.tsx`

**인수 기준**

- 동의 전·거절 상태에서 원문 할 일이 기기 밖으로 나가지 않는다.
- timeout·offline·5xx·malformed 0/1/2/4-step 응답은 정확히 3단계 로컬 fallback으로 끝난다.
- 원격 safe redirect는 plan/timer CTA를 만들지 않는다.
- 원격 행동 데이터 전송은 여전히 0건이다.
- endpoint가 구성되지 않아도 로컬 P0 전체 흐름이 동작한다.

**외부 의존**

- 기존 Next.js 계획 API의 실제 URL과 응답 계약 검증은 별도 서버 상태가 필요하다. URL이 없으면 로컬 fallback이 기본이며 제품 구현을 멈추지 않는다.

### MB-09. 설정·개인정보·전체 로컬 삭제

**사용자 결과**

사용자는 앱이 무엇을 로컬에 저장하는지 확인하고 AI 동의를 철회하거나 모든 로컬 데이터를 삭제할 수 있다.

**구현**

- 개인정보 요약, AI consent 상태, 로컬 데이터 삭제를 포함한 설정 화면을 만든다.
- 삭제 확인·취소·진행·완료 상태를 구현한다.
- session, task content, plan, events, KPI, EXP, proof files, consent를 하나의 clear transaction으로 제거한다.
- 앱 재실행 뒤 삭제된 상태가 복구되지 않게 한다.

**주요 파일**

- `apps/mobile/src/app/settings.tsx`
- `apps/mobile/src/core/storage/clearAll.ts`
- `apps/mobile/src/features/settings/SettingsScreen.tsx`
- `apps/mobile/src/features/settings/DeleteLocalDataDialog.tsx`

**인수 기준**

- 삭제 취소는 아무 데이터도 변경하지 않는다.
- 삭제 확정 뒤 History, EXP, 진행 세션, proof files, consent가 모두 사라진다.
- 삭제 실패는 부분 성공을 완료로 표시하지 않는다.
- 설정에 계정·결제·동기화 UI가 없다.
- VoiceOver·TalkBack이 파괴적 동작과 확인 결과를 명확히 읽는다.

**제외**

- 계정 삭제, 원격 telemetry 삭제. 원격 telemetry 자체가 비활성이다.

### MB-10. 전 화면 디자인·접근성 동등성

**사용자 결과**

Startio의 시작→계획→타이머→완료→History→설정 흐름이 차분한 입력 우선 파스텔 오렌지 체계로 일관되고, 보조 기술과 큰 글자에서도 사용할 수 있다.

**구현**

- MB-01에서 시작한 semantic token을 Light·Dark·Increased Contrast 후보로 확장한다.
- focus, pressed, disabled, selected, success, caution, destructive 상태를 색상 외 단서와 함께 구현한다.
- Dynamic Type 200%, 한국어 줄바꿈, Reduce Motion, screen reader focus/announcement를 전 화면에서 보정한다.
- iOS와 Android의 platform convention은 다르게 적용하되 P0 의미와 action order를 동일하게 유지한다.
- reference evidence matrix에 실제 적용 근거와 `provisional` 상태를 갱신한다.

**주요 파일**

- `apps/mobile/src/design/tokens.ts`
- `apps/mobile/src/design/components/*`
- `apps/mobile/src/features/*/*Screen.tsx`
- `docs/reference/design/reference-evidence-matrix-2026-07-23.md`

**인수 기준**

- 모든 화면에서 Primary Action은 하나다.
- WCAG 2.2 AA 후보 대비를 통과한다.
- iOS 44pt, Android 48dp 최소 터치 영역을 충족한다.
- 390×844와 360×800에서 핵심 CTA가 200% 텍스트에도 잘리지 않는다.
- VoiceOver·TalkBack traversal이 시각 순서와 일치한다.
- 정확한 색상 토큰은 5인 시험 전까지 `provisional`로 남는다.

### MB-11. P0 통합·수명주기·릴리스 후보 코드

**사용자 결과**

사용자는 양 플랫폼에서 `입력 → 안전 판정 → 3단계 → 타이머 → 복구 → 체크/선택 사진 → EXP → History`를 중단 없이 완료한다.

**구현**

- 라우트 guard와 deep link/back behavior를 전체 흐름에 적용한다.
- happy path, safe redirect, local fallback, AI 거절, timeout, 포기·복귀, 중복 proof, 전체 삭제를 E2E 시나리오로 고정한다.
- cold launch, background, process kill, 저장 손상, 권한 거부 실패 처리를 보강한다.
- 실제 dependency와 데이터 흐름을 기준으로 privacy manifest·permission copy 초안을 작성한다.
- 출시 후보에서 발견된 blocker만 수정하고 기능을 추가하지 않는다.

**주요 파일**

- `apps/mobile/src/app/*`
- `apps/mobile/src/features/session/SessionProvider.tsx`
- `apps/mobile/app.json`
- `apps/mobile/README.md`
- `tests/e2e/*`
- `docs/release/*`

**인수 기준**

- iOS·Android P0 happy path와 모든 named failure path가 통과한다.
- app kill/restore에서 현재 단계·남은 시간이 복구되고 EXP가 중복 지급되지 않는다.
- safety fixture, exactly-three fixture, privacy forbidden-key fixture가 모두 통과한다.
- 접근성 blocker, crash, 데이터 삭제 blocker가 0건이다.
- 새 기능 없이 같은 source revision에서 양 플랫폼 release candidate를 재현할 수 있다.

**제외**

- 실제 서명, TestFlight/Play Console 업로드, 운영 credential, 5인 시험 수행

## 6. Gate

| Gate | 포함 MB | 통과 증거 |
| --- | --- | --- |
| First value | MB-01 | 안전 입력은 정확히 3단계, unsafe fixture는 계획 0건, 양 플랫폼 첫 화면·계획 화면 |
| Execution | MB-02~03 | 3단계 순차 타이머와 process restore |
| Completion | MB-04, MB-07 | 체크 완료, EXP 멱등성, 선택 사진 local-only |
| Interaction feedback | MB-06 | 제출·단계 완료·재진입·최종 완료 피드백과 iOS 390×844 visual verdict |
| Intelligence/privacy | MB-08~09 | 동의·fallback·report 경계, 전체 삭제 |
| Product quality | MB-10 | 전 화면 visual verdict와 접근성·플랫폼 동등성 |
| Release candidate code | MB-11 | 양 플랫폼 P0 E2E와 blocker 0건 |

Gate가 실패하면 다음 MB로 이동하지 않는다. 다만 npm 설치·에뮬레이터 준비 같은 환경 문제는 기능 구현을 대체하는 작업으로 확장하지 않고, 해당 증거만 미검증으로 명시한다.

## 7. MB 완료 보고 형식

```text
완료한 MB:
- MB-XX / 사용자 결과

실제 구현:
- 사용자가 할 수 있게 된 행동

변경한 제품 코드:
- 파일과 책임

검증:
- 순수 로직 테스트
- typecheck
- iOS 390×844
- Android 360×800
- visual verdict 또는 수명주기 증거

발견된 위험:
- 남은 제품 위험과 환경 미검증

다음 MB:
- Gate 통과 시에만 한 개
```

## 8. 구현 이후 별도 릴리스 검증

다음은 제품 구현 Micro-build가 아니라 사람·계정·외부 시스템이 필요한 release checklist다.

- 대표 사용자 5명 첫인상·사용성 시험
- 정확한 디자인 토큰 승인
- Apple·Google 개발자 계정, bundle/package identifier, 서명
- TestFlight와 Play Internal Testing
- App Privacy, Data Safety, privacy manifest, store metadata 검토
- 설치·업그레이드·삭제 smoke

이 항목은 MB-11까지의 제품 코드 완성을 지연시키는 선행 환경 작업으로 사용하지 않는다.

## 9. Phase 2 목표

Phase 2의 목표는 **“계획을 보여주는 프로토타입”을 “실제로 첫 행동을 끝낼 수
있는 iOS 제품 흐름”으로 교정하는 것**이다.

성공 기준은 다음과 같다.

- 입력부터 완료 저장까지 사용자가 구현·QA 문구를 보지 않는다.
- 각 단계는 제시 시간 전에도 완료할 수 있고, 초과해도 중단되지 않는다.
- 실제 실행 시간, 절약 시간, 초과 시간이 로컬 기록에 남는다.
- 진행도·긴박감·완료가 시각·문구·햅틱 중 둘 이상의 신호로 전달된다.
- 시스템·라이트·다크 모드와 VoiceOver 기본 계약을 지킨다.
- Expo 개발 서버 여부와 관계없이 제품 로직·번들이 재현 가능하다.

Android 시각 smoke는 현재 사용자 지시에 따라 이 Phase에서 제외하되,
공유 TypeScript 제품 의미는 포크하지 않는다.

## 10. Phase 2 Micro-build — MB-12~20

### MB-12. 입력·키보드 상호작용 — 완료

- 빈 공간 터치와 드래그로 키보드를 내린다.
- 키보드 완료 키 제출, 240자 제한, 중복 제출 방지를 구현한다.
- 글자 수는 제한에 가까워졌을 때만 표시한다.

### MB-13. 세 단계 문구 품질 — 완료

- 할 일 범주별 로컬 fallback을 제공한다.
- 정확히 세 단계 계약을 유지하면서 추상적·LLM식 문구를 줄인다.
- 계획 화면에서 설명성 코치 문장을 제거한다.

### MB-14. 조기 완료·초과 시간 모델 — 완료

- 타이머가 남아 있어도 현재 단계를 완료할 수 있다.
- 목표 시간 0 이후에도 타이머를 계속 실행한다.
- 단계별 예정·실제·차이 시간을 로컬 상태에 저장한다.

### MB-15. 진행도·긴박감·햅틱 — 완료

- 시간이 흐르면 채워지는 원형 진행 표시를 구현한다.
- 임박·초과 상태를 색상과 문구로 구분한다.
- 시작, 일시정지, 임박, 초과, 단계 완료에 햅틱을 제공한다.

### MB-16. 완료 저장 단순화 — 완료

- 중복 체크 단계를 제거하고 `완료 저장` 한 번으로 기록한다.
- 예정 대비 빠름·초과와 실제 실행 시간을 완료 화면에 표시한다.
- 사진은 선택 사항으로 유지한다.

### MB-17. 실행 기록의 제품 지표 — 완료

- QA용 백분율 카드 대신 완료 수와 EXP를 표시한다.
- 각 기록에 시작까지 걸린 시간, 실제 실행 시간, 절약·초과 시간을 표시한다.
- 과거 archive는 nullable 시간 필드로 안전하게 마이그레이션한다.

### MB-18. 화면 모드·개인정보 설정 — 완료

- 시스템·라이트·다크 모드를 선택하고 기기에 저장한다.
- 전체 로컬 삭제 시 화면 모드도 시스템으로 초기화한다.
- 서버 availability 같은 구현 상태 대신 실제 개인정보 경계만 설명한다.

### MB-19. Apple UX·접근성·제품 언어 — 완료

- 진행 중 그만두기와 저장 세션 새로 시작에 native confirmation을 둔다.
- 원형 타이머를 접근성 progressbar로 제공한다.
- 동의 버전, 원격 연결, 저장소 같은 QA·인프라 문구를 제거한다.

### MB-20. 통합 검증·스모크 준비 — 완료

- 전체 TypeScript와 제품 로직 회귀 테스트를 실행한다.
- iOS Expo production bundle을 생성한다.
- `expo-haptics` 네이티브 반영 상태를 확인하고 개발 빌드 재설치 조건을 남긴다.
- Phase 2 스모크 체크리스트와 알려진 환경 차이를 기록한다.

검증 기준 revision에서 다음을 확인했다.

- TypeScript typecheck 통과
- 모바일 제품 로직 회귀 테스트 81개 통과
- Expo iOS production export 및 Xcode embed bundle 생성
- CocoaPods에 `ExpoHaptics 55.0.16` 반영
- iPhone 16e Simulator Release 빌드·설치·콜드 스타트 성공
- Release 앱은 Metro 개발 서버 없이 홈 화면을 표시

실기기 smoke 체크리스트:

1. 입력란 선택 후 빈 공간 터치·드래그로 키보드가 내려간다.
2. 제출 후 추가 질문 없이 정확히 세 단계가 표시된다.
3. 남은 시간이 있어도 `완료`로 다음 단계에 이동한다.
4. 예정 시간 초과 후에도 타이머가 계속되고 초과 시간이 표시된다.
5. 진행 원, 임박·초과 상태, 단계 전환 햅틱이 구분된다.
6. 시스템·라이트·다크 선택이 재실행 후에도 유지된다.
7. 그만두기와 진행 중 세션 교체에는 확인 창이 표시된다.
8. 완료 저장 후 실제 실행 시간과 절약·초과 시간이 기록에 남는다.

알려진 환경 차이:

- Simulator에서는 햅틱의 물리 강도를 판정할 수 없어 실기기 확인이 필요하다.
- 최초 Release 콜드 스타트는 네이티브 초기화 후 홈 렌더까지 수 초가 걸릴 수 있다.
- Android 시각 smoke는 사용자 지시에 따라 Phase 2 범위에서 제외했다.

## 11. Phase 2 Gate

| Gate | 포함 MB | 통과 증거 |
| --- | --- | --- |
| Input quality | MB-12~13 | 키보드·제출 회귀 테스트, 범주별 정확히 3단계 |
| Execution quality | MB-14~16 | 조기 완료·초과·진행 원·햅틱·완료 저장 |
| Trust and polish | MB-17~19 | 실제 시간 기록, 3개 appearance, 제품 언어·이탈 확인 |
| Integration | MB-20 | typecheck, 전체 테스트, iOS production bundle, native smoke checklist |

## 12. 다음 작업

Phase 2 MB-12~20은 완료했다. 두 번째 iPhone 실기기 Smoke에서 확인한
교정 우선순위와 현재 구현 대조 결과는
[`smoke-2-priority-checklist.md`](./smoke-2-priority-checklist.md)를 따른다.
P0 코드 누락은 현재 대조에서 발견되지 않았고, 카메라·햅틱·화면 모드 유지의
실기기 판정과 P1 시각 밀도 교정을 다음 작업으로 진행한다.

## 13. Phase 3 실기기 피드백 Micro-build

### MB-21. 완료 시간의 의미 교정 — 완료

- 완료·기록 화면은 실제 실행 시간을 사실형으로 보여준다.
- `예상보다 빨랐어요`, `예상보다 더 걸렸어요`처럼 사용자가 타이머를
  조기에 끝내도록 보상할 수 있는 평가는 노출하지 않는다.
- 단계별 예정·실제·차이 원시 데이터와 저장 구조는 회귀 분석을 위해
  유지한다.

### MB-22. 행동 문구의 단일성·관찰 가능성 — 완료

- 범주별 fallback의 추상 표현을 수량·대상·종료 조건이 있는 행동으로
  교체한다.
- 원격 계획의 행동이 추상적이거나 두 행동을 묶으면 해당 응답을 거부하고
  기존 로컬 fallback으로 안전하게 돌아간다.
- 정확히 3단계, 15~180초, 안전 선판정 계약은 바꾸지 않는다.

### MB-23. 사진 선택성의 권한 전 의미 — 완료

- 사진 영역에 `선택 사항`을 먼저 표시하고 사진 없이 완료 저장할 수 있음을
  설명한다.
- 카메라 권한은 사용자가 `사진으로 남기기`를 눌렀을 때만 요청한다.
- 저장 전 화면에서 EXP를 미끼처럼 약속하지 않고, EXP는 저장 성공 뒤
  결과로만 보여준다.

### MB-24. 타이머 시간 지각 및 상태 위계 교정 — 자동 검증 완료

- 눈금은 약 24개로 줄이고 주황색 눈금과 중앙 숫자가 모두 남은 시간을
  나타낸다. 시간 경과에 따라 눈금은 시계 방향으로 사라진다.
- 단계 표시는 얇은 3구간으로 교체하고 시작 CTA에는 실제 시간을 표시한다.
- 실행 중 primary CTA는 `끝냈어요`, 일시정지는 secondary text action이다.
- 초과 상태는 `+0:12` 형식과 얇은 적색 테두리만 사용한다.
- timer duration·state machine·timestamp 복구·event·proof·EXP 계약은
  변경하지 않는다.
- Node 회귀 테스트 88개와 TypeScript typecheck는 통과했다. iPhone 13 mini
  실제 화면, background/foreground, Android는 미검증이다.

### MB-25A. Task Chunking Quality Contract — 완료

- `BarrierType`, `StepRole`, `ActionPrimitive`, hard Gate와 고정 평가함수를
  canonical 문서와 TypeScript 타입으로 고정한다.
- 모든 후보는 정확히 3단계이며 `CONTACT → NARROW → PRODUCE`를 따른다.
- 평가 가중치와 penalty는 `local_chunking_policy_v0.2`의 초기 가설로
  명시한다.
- 이 MB에서는 런타임 선택 결과를 바꾸지 않는다.

### MB-25B. Deterministic Local Chunking Engine v0.2

- 입력 정규화부터 안전 분류, 제한 신호 추출, 장벽 분류, 2~4개 후보 생성,
  Gate, 고정 점수, 최종 선택, 낮은 확신 fallback을 순수 함수 경계로
  분리한다.
- 같은 정규화 입력과 같은 policy version은 항상 같은 결과를 반환한다.
- descriptor에는 policy·barrier·confidence·후보 수·전략·primitive·fallback
  여부만 포함하며 raw task text를 저장하지 않는다.
- 원격 계획 경로·consent gate·8초 timeout·remote validator와 15/60/120초
  정책은 변경하지 않는다.

### MB-25C. Quality Fixture Suite

- 실제 한국어 입력 30~50개를 추가하고 각 BarrierType을 최소 5개 포함한다.
- 구조 계약, 역할 순서, 관찰 가능성, 중복·모호 동사 부재, timer 정책,
  낮은 확신 fallback을 검증한다.
- golden 10~15개는 v0.1·v0.2 후보·Gate·점수·최종 선택·한계를 비교하는
  보고서로 남긴다.

### MB-26. 로컬 실행 기록 월간 탐색기

- MB-25 전체와 물리 iPhone Smoke 통과 뒤에만 시작한다.
- 기존 `completedAt`을 월간 날짜 그리드와 선택 날짜별 기존 기록 필터로
  탐색한다.
- OS Calendar, streak, 실패 경고, weekly goal, 동기화, 새 KPI는 제외한다.

### MB-27. EXP 역할 결정

- +30 EXP와 멱등성은 유지하되 기록 화면은 완료 횟수를 primary로 둔다.
- EXP를 난이도·timer·기능 잠금과 연결하지 않는다.
- 유지·축소·대체 선택지를 decision record로 작성하고 결정 전 레벨 UI나
  보상을 구현하지 않는다.

## 14. 레퍼런스 적용 규칙

레퍼런스는 화면을 베끼는 구현 소스가 아니라 **한 MB에서 한 판단을 내리는
비교 증거**로만 사용한다. 제품 계약과 충돌하면 canonical 문서가 항상
우선한다.

| 레퍼런스 | 사용하는 판단 | 적용 MB | 복제하지 않는 것 |
| --- | --- | --- | --- |
| Apple HIG | 적시 권한, 글자·버튼 기본 관례 | MB-23~24 | 시스템 앱의 화면 구성 자체 |
| Things | 현재 행동과 다음 이동의 직접성 | MB-24 | 내비게이션·리스트 외형 |
| Structured | 날짜별 기록 탐색의 읽기 순서 | MB-26 | 타임라인 UI와 색상 체계 |
| Day One | 완료 콘텐츠 우선, 사진의 보조적 역할 | MB-23·26 | 저널 카드·브랜드 문법 |
| Startio canonical·행동 계약 | 안전, 정확히 3단계, 단일 행동, local-only | 모든 MB | 외부 제품 기준으로 대체 불가 |

레퍼런스 검토는 다음 순서를 따른다.

1. 해당 MB의 사용자 문제를 한 문장으로 고정한다.
2. 레퍼런스에서 그 문제와 직접 관련된 원칙 하나만 고른다.
3. Startio 화면의 before/after를 같은 상태·크기로 비교한다.
4. 자동 테스트와 visual verdict에 Startio 인수 기준으로 기록한다.
5. 레퍼런스와 닮았다는 이유만으로 새 화면·dependency·상호작용을 추가하지
   않는다.

MB-25A~25C 다음에는 물리 iPhone Smoke를 수행한다. 실기기에서 재현된
결함만 P0로 승격하며, 이상이 없을 때 MB-26부터 제품 단위 loop를 이어간다.
각 MB는 구현 → 자동 QA → 별도 Lore commit·push → `$explain-diff` HTML
누적 순서로 닫는다.
