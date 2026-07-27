# Startio Task Chunking Rules

## Purpose

These rules define what a good Startio task chunking example looks like.

The goal is to help a user start one small action faster. The goal is not planning, therapy, diagnosis, or motivation.

## Good Example Criteria

A good example can be used as a positive few-shot candidate when:

- It has exactly three steps.
- Step 1 is immediately executable.
- Step 1 has a visible physical anchor such as a file, app, folder, desk, sink, document, or first line.
- Step 1 can fit into about 15 seconds after Startio MVP timer normalization.
- Each step is one action, not a bundled sequence.
- The plan matches the user's actual task category.
- The language is short, concrete, and non-clinical.

## Bad Example Criteria

A row should become a negative example when:

- The response cannot be parsed into three steps.
- The task and generated steps do not match.
- A step is vague, motivational, or purely mental.
- A step asks the user to finish too much too soon.
- A single step contains multiple actions.
- The timer is unrealistic and no correction is supplied.

## Positive Candidate Use

Positive candidates may still need timer correction when imported from MIRUNY.

For manual v0.1 observation, Startio intentionally uses a tiny first-action time attack:

- Step 1: `15` seconds by default
- Step 2: `30-60` seconds depending on energy and task type
- Step 3: `60-120` seconds depending on task type
- Low energy: `15, 30, 60`

## Negative Candidate Use

Negative candidates are useful for prompt evaluation and regression tests.

They should teach the model what not to do:

- Do not replace action with advice.
- Do not ask for planning before movement.
- Do not generate a large first action.
- Do not mismatch the task.
- Do not chunk unsafe requests.

## One-Step Action Rule

Each step should contain one physical action.

Good:

```text
발표 자료 파일 열기
메일 앱에서 답장 화면 열기
싱크대 앞에 서기
```

Bad:

```text
자료를 읽고 핵심 내용을 정리한 뒤 첫 장을 작성하기
열심히 집중해서 공부하기
방 전체를 깨끗하게 청소하기
```

## MVP Boundary

These rules prepare prompt examples and fallback policy only.

They do not implement:

- clinical personalization
- diagnosis
- treatment guidance
- crisis counseling
- institution reporting
