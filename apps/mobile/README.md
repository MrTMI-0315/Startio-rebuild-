# Startio Mobile

Startio P0 모바일 앱의 Expo Router + TypeScript 개발 빌드다.

현재 Expo SDK 55를 사용한다. 로컬 Xcode 26.2와 공식 호환되는 최신 기준선이며 Xcode 26.4 이상으로 전환할 때 SDK 57 업그레이드를 재검토한다.

루트에서 실행한다.

```bash
npm install
npm run mobile:ios
npm run mobile:android
```

현재 MB-11 iOS 릴리스 후보 코드까지 구현되어 입력, 안전 선판정, 정확히 3단계 계획, 순차 타이머,
로컬 세션 저장과 앱 재진입 복구, 체크 완료와 멱등적 EXP 30 지급,
최근 실행 기록과 privacy-safe 기본 KPI, 선택적 로컬 사진 증거, 개인정보 설정과
전체 로컬 데이터 삭제를 제공한다. Light·Dark·Increased Contrast 의미 색상,
Reduce Motion, iOS 44pt·Android 48dp 터치 기준, 200% 큰 글자 재배치와 화면 읽기용
상태 레이블을 공용 Expo 코드에 반영했다. cold deep link는 저장 hydration이 끝날 때까지
기다리고, 현재 세션 상태에 따라 행동 계획·타이머·완료 중 하나의 canonical route로
정규화한다. Android 360×800·TalkBack·릴리스 후보 실기 검증은 현재 보류 상태이며
완료된 것으로 간주하지 않는다.

세션 snapshot은 `expo-file-system`의 앱 Documents 영역에 최근 2개를 회전 저장한다.
제품 화면 복구에 필요한 로컬 할 일 문구는 `product` 상태에만 두고, 분석 이벤트에는
원문·생성 문구·사진·경로를 넣지 않는다. Documents 데이터는 운영체제와 앱 설정에 따라
기기 백업 대상이 될 수 있으므로 출시 전 iOS·Android 백업 동작을 별도로 검증한다.

완료 사진은 사용자가 `사진 추가`를 누른 경우에만 사진 보관함 권한을 요청한다.
선택한 사진 한 장은 앱 Documents의 `startio-proof`에 앱 소유 파일로 복사하며,
서버나 행동 이벤트로 전송하지 않는다. 권한 거부·선택 취소·사진 미첨부 상태에서도
체크 완료와 EXP 지급 경로는 그대로 사용할 수 있다.

iOS privacy manifest 초안은 추적을 사용하지 않는다고 선언하고, 사용자가 명시적으로
동의한 경우 행동 계획 생성에 필요한 할 일 입력을 `Other User Content` /
`App Functionality`로 공개한다. 이 초안은 App Store Connect 개인정보 답변과
인공지능 제공자 보관 정책을 확정할 때 다시 대조해야 한다.
