# Startio Rebuild

Startio 모바일 V1을 React Native + Expo + TypeScript로 다시 개발하기 위한 깨끗한 작업 저장소다.

## 현재 상태

- 단계: MB-05 기능 구현 완료, 실기기 수명주기·실화면 시각 검증 보류
- 활성 제품 코드: 입력 → 안전 선판정 → 로컬 3단계 계획 → 1·2·3단계 타이머 → 로컬 저장·재진입 복구 → 체크 완료·EXP 30 → 실행 기록·기본 KPI
- 기존 웹·행동계획 API: `../startio`에서 유지
- MIRUNY PoC: 외부 배포 자산으로 유지

## 시작 순서

1. `docs/README.md`에서 기준 문서를 읽는다.
2. `ASSET_MANIFEST.md`에서 복사된 자산과 제외된 자산을 확인한다.
3. `.omx/plans/micro-build-startio-rebuild.md`의 순서로 Micro-build를 진행한다.
4. 각 화면은 iOS를 먼저 교정하고 Android 동등성을 통과한 뒤 다음 화면으로 이동한다.

기존 Startio 웹 UI나 SwiftUI 코드를 이 저장소에 직접 복사하지 않는다.
