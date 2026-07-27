# Startio Barrier Types Manual v0.1

## Purpose

This manual defines the MVP execution-barrier taxonomy for Startio.

It is a non-clinical behavior-transition taxonomy. A barrier type describes the user's friction at the moment before action. It must not be used as diagnosis, mental-health screening, personality labeling, or treatment guidance.

## Barrier Set

Startio MVP uses seven barrier types plus `unknown`:

```text
task_overwhelm
sequence_uncertainty
choice_paralysis
activation_low
avoidance_emotion
environment_friction
completion_pressure
unknown
```

If confidence is low but the user has already shown a stuck signal, use `unknown` and do not keep asking upper-category questions.

## Priority

When multiple signals appear, use this priority:

```text
sequence_uncertainty
choice_paralysis
completion_pressure
environment_friction
activation_low
avoidance_emotion
task_overwhelm
unknown
```

## 1. task_overwhelm

Signal: 막막함, 너무 많음, 압도감, 분량 부담.

Policy: reduce the task mass to one visible artifact or contact point.

Good first actions:

- 발표 자료 파일 열기
- 책상 위 종이 한 장만 집기
- 문서에서 마지막 줄만 보기

Avoid:

- 전체 계획 세우기
- 끝까지 하기
- 여러 항목을 동시에 정리하기

## 2. sequence_uncertainty

Signal: 뭐부터 해야 할지 모름, 시작 순서가 막힘, 첫 단계가 안 보임.

Policy: pick the first visible object, app, file, or place. Do not ask the user to plan the order.

Good first actions:

- 메일 앱 열기
- 싱크대 앞에 서기
- 공부 자료 파일 열기

Avoid:

- 생각 정리하기
- 계획하기
- 우선순위표 만들기

## 3. choice_paralysis

Signal: 선택이 안 됨, 못 고름, 조합이 안 떠오름, 비교가 길어짐.

Policy: choose one temporary visible option without optimizing.

Good first actions:

- 눈에 보이는 상의 하나만 손에 들기
- 후보 중 맨 위 항목 하나만 열기
- 임시 기준 하나만 정하기

Avoid:

- 가장 좋은 선택 찾기
- 전체 후보 비교하기
- 추천 목록 더 찾기

## 4. activation_low

Signal: 시작이 안 됨, 몸이 안 움직임, 손이 안 감, 피곤함, 누워 있음.

Policy: make Step 1 smaller than the resistance threshold.

Good first actions:

- 화면만 켜기
- 바닥에 발만 내리기
- 문서 아이콘만 누르기

Avoid:

- 5분 집중하기
- 바로 일어나서 전부 하기
- 의지를 끌어올리기

## 5. avoidance_emotion

Signal: 보기 싫음, 무서움, 두려움, 미룸, 딴짓, 회피.

Policy: create a short low-stakes contact with the task.

Good first actions:

- 메일 제목만 보기
- 제출하지 않을 초안 한 줄 쓰기
- 작업 화면을 30초만 앞에 두기

Avoid:

- 왜 피하는지 오래 분석하기
- 더 좋은 계획 찾기
- 감정을 설득하려 하기

## 6. environment_friction

Signal: 책상/방/바닥/옷더미/쓰레기/주변 상태가 시작을 막음.

Policy: move one blocker or clear one palm-sized space.

Good first actions:

- 책상 위 방해물 하나만 옆으로 밀기
- 바닥 쓰레기 하나만 집기
- 작업 물건 하나를 눈앞에 두기

Avoid:

- 방 전체 청소하기
- 정리 계획 세우기
- 모든 물건 제자리 찾기

## 7. completion_pressure

Signal: 완벽하게 해야 함, 제대로 해야 함, 망칠까 봄, 평가/제출/최종본 압박.

Policy: create a disposable rough trace before quality work begins.

Good first actions:

- 빈 문서에 임시 제목 쓰기
- 틀려도 되는 단어 하나 쓰기
- 제출물이 아닌 메모장에 한 줄 적기

Avoid:

- 좋은 문장 쓰기
- 완성도 높이기
- 평가 기준부터 확인하기

## 8. unknown

Signal: 그냥 막힘, 모르겠음, 답답함, 애매한 stuck signal.

Policy: stop classification loops. Use a safe visible anchor and move to task chunking.

Good first actions:

- 가장 가까운 작업 화면 앞으로 가져오기
- 보이는 것 하나만 손대기
- 다음 행동 표시 하나 남기기

Avoid:

- 상위 카테고리 질문 반복하기
- 원인을 계속 캐묻기
- 추상적 조언으로 마무리하기

## MVP Timer Policy

For manual v0.1, Step 1 should usually be 15 seconds. Treat Step 1 as a time attack that creates movement, not as a focus session.
