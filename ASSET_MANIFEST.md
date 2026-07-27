# Startio Rebuild 자산 등록부

- 생성일: 2026-07-22
- 원본 저장소: `/Users/mrtmi/Desktop/Mr_TMI/repos/startio`
- 신규 저장소: `/Users/mrtmi/Desktop/Mr_TMI/repos/startio-rebuild`
- 원칙: 기준·근거·검증 자산만 복사하고 레거시 실행 코드는 원본 저장소에 동결한다.

## KEEP — 복사한 자산

### 기준 문서

- Dev Replan
- 모바일 V1, MVP 핵심, 사용자 흐름, 기능 명세
- AI 코칭 계약과 행동 이벤트 스키마
- Quiet Precision 디자인 계약

### 연구·안전 근거

- 사용자 피드백
- 안전 문구 경계
- 현재 MVP 감사와 백엔드 경계
- MIRUNY 내보내기 스키마
- 과업 분해 정제·라벨링 규칙
- 안전, 금지 표현, 장벽, 과업 분해 매뉴얼

### 디자인 참고

- 과업 입력 시안 4개, 각 390×844와 360×800
- 핵심 흐름 상태 캡처 22개

## OWNER BRAND — 개발 주체 Corporate Identity

### Willbyte Inc. CI

- 경로: `assets/brand/corporate/willbyte/willbyte-ci-original.jpeg`
- 원본 파일명: `Willbyte_ci.jpeg`
- 반입일: 2026-07-22
- 출처: 사용자가 로컬 파일로 직접 제공
- 권리·브랜드 주체: Startio 개발 주체인 Willbyte Inc.로 사용자 확인
- 용도: 개발 주체 표기와 corporate 디자인 근거
- 상태: `owner-provided-original`
- 파일 정보: JPEG, RGB, 2752×1536, 알파 채널 없음
- SHA-256: `98591c77a7994ce62cc5f4d614177f9f3d57bee8fb7e027fbffe6cdeef744cf5`
- 측정 후보색: Willbyte Blue 약 `#005DFC`, Willbyte Ink 약 `#111E2B`
- 제한: Startio 앱 아이콘·제품 워드마크로 사용하지 않으며 실제 UI 노출 위치와 파생본은 `DESIGN.md`를 따른다.

## PRODUCT BRAND — Startio Corporate Identity

### Startio CI

- 기준 경로: `assets/brand/references/`
- 상태: `awaiting-design`
- 활성 벡터 원본·파생 PNG·manifest·contact sheet: 없음
- 역사 참고: `assets/brand/product/startio/startio-ci-source.png`, PNG, RGB, 1254×1254, 알파 채널 없음
- Primary reference: `assets/brand/references/primary/startio-ci-concepts-v0.1.svg`의 Option 2 비교 자료
- Reference register: `assets/brand/references/README.md`
- Intake gate: `docs/brand/reference-intake-checklist.md`
- 심벌·워드마크·정확한 CI 색상: 미승인
- 제품 UI 서체: Noto Sans KR 400·500·600·700
- 라이선스: Noto Sans KR은 OFL-1.1. 새 심벌·워드마크는 출처·권리·상표 검토 전 제품 자산으로 승인하지 않는다.
- 제한: reference를 production asset으로 직접 사용하거나 임의 trace·vectorize·recolor하지 않는다. 새 geometry와 placeholder를 만들지 않는다.

## REFERENCE ONLY — 원본 저장소에만 유지

- `lib/domain.ts`
- `lib/coaching-contract.ts`
- `lib/events.ts`
- `lib/ids.ts`
- `lib/kpi.ts`
- `lib/coaching.ts`
- `app/api/coach/plan/route.ts`
- `lib/remote-ai.ts`
- `lib/openai-coaching.ts`
- 기존 웹 회귀 테스트
- `ios/StartioNative/`

이 코드는 새 저장소의 활성 `src/`에 복사하지 않는다. 새 계약 테스트의 비교 자료로만 읽는다.

## EXCLUDE — 복사하지 않은 자산

- Next.js 사용자 화면, React 웹 구성요소, CSS, Tailwind, 웹 라우트
- 대화 중심 API·계약·말풍선 UI
- 시연 데이터와 과거 주황색 중심 UI
- 기존 npm 의존성, `package.json`, `package-lock.json`, Next.js 설정
- MIRUNY 정규화 로그와 과업 문구가 포함된 `exports/`
- `.env.local`, API 키, 인증정보
- `.next/`, `node_modules/`, 로그, 임시 OMX·Playwright 상태
- 출처·상업 이용 권한이 확인되지 않은 아바타와 효과음

## 외부 자산 연결

- MIRUNY PoC: `https://miruny-2-0.lovable.app`
- 기존 Startio 저장소: `../startio`
- 기존 행동계획 API 참고 URL: `https://startio.vercel.app`

외부 URL, 계정 소유권, 운영 환경과 배포 상태는 실제 개발 연결 전에 다시 확인한다.

## 개인정보·라이선스 경계

- 실제 MIRUNY 로그는 모바일 소스 저장소에 넣지 않는다.
- 새 테스트에는 합성 또는 명시적으로 승인된 비식별 고정 데이터만 사용한다.
- 이미지, 소리, 폰트는 출처와 배포 권한이 확인된 경우에만 `assets/`에 추가한다.
- 모바일 앱에는 OpenAI API 키를 포함하지 않는다.
