# Startio Rebuild 문서 등록부

## 우선순위

1. `AGENTS.md`
2. `canonical/00-startio-dev-replan-v0.1.md`
3. `canonical/product/09-mobile-v1-reset.md`
4. `canonical/product/10-visual-direction-2026-07-23.md`
5. 영역별 기준 문서
6. `reference/`의 연구·디자인 근거

## 기준 문서

- `canonical/product/01-mvp-core.md`
- `canonical/product/02-user-flow.md`
- `canonical/product/03-feature-spec.md`
- `canonical/product/09-mobile-v1-reset.md`
- `canonical/product/10-visual-direction-2026-07-23.md`
- `canonical/ai/04-coaching-engine.md`
- `canonical/data/05-behavior-event-schema.md`
- `../DESIGN.md`

## 참고 문서

- `reference/research/`: 제품 결정의 근거이며 구현 범위를 확장하지 않는다.
- `reference/design/`: 시각·상태 참고이며 웹 코드를 모바일 코드로 직접 이식하지 않는다.
- `reference/plans/`: 원본 저장소에서 가져온 실행 보조 자료이며 canonical 결정을 덮어쓰지 않는다.
- `reference/research/web-p0-acceptance-matrix.md`: 기존 웹 P0 회귀·이전 대상 참고 자료다. 모바일 V1 완료표가 아니다.

## 실행 보조 계획

- `../.omx/plans/prd-startio-mobile-v1-reset.md`
- `../.omx/plans/test-spec-startio-mobile-v1-reset.md`
- `../.omx/plans/micro-build-startio-rebuild.md`

이 계획들은 현재 경로와 결정 상태에 맞게 정규화한 보조 문서다. 범위·일정·안전·데이터 계약은 canonical 문서가 우선한다.

기준 문서가 충돌하면 더 높은 우선순위와 더 최근의 모바일 V1 결정을 따른다. 시각 방향과 토큰 승인 상태는 `canonical/product/10-visual-direction-2026-07-23.md`를 적용하며 기능·안전·개인정보 계약은 기존 영역별 canonical 문서를 유지한다.
