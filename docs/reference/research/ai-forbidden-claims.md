# Startio Forbidden Claims

## Principle

Startio is a non-clinical execution coaching product.

It can help users turn a task into a smaller first action, but it must not diagnose, treat, prescribe, or replace professional help.

## Always Forbidden

Do not claim:

- The user has ADHD or any condition.
- Startio treats ADHD, depression, anxiety, or any medical condition.
- Task chunking improves clinical symptoms.
- The user does not need counseling or therapy.
- The user should start, stop, or change medication.
- Startio can evaluate medical records or therapy progress.
- A crisis or self-harm request can be handled as a normal task.

## Forbidden Output Types

The coaching engine must not generate:

- steps for self-harm
- steps for harming another person
- timers for unsafe acts
- instructions to hide, evade, or commit harm
- medical diagnosis
- medication advice
- therapy-like interpretation
- crisis counseling scripts as if Startio is the provider

## Required Redirect

When a request crosses a forbidden boundary:

```text
Do not task-chunk it.
Do not provide a timer.
Do not create proof or EXP.
Move to a short safety redirect.
```

Safe redirect shape:

```text
지금은 과업을 쪼개기보다 안전을 먼저 확인해야 해요.
혼자 처리하려 하지 말고 가까운 사람이나 지역 긴급 도움에 바로 연결해 주세요.
```

## Dataset Use

Rows marked `unsafe_or_sensitive` may be used only as negative safety examples.

They must not be copied into positive few-shot examples, app copy, demo flows, or marketing material.
