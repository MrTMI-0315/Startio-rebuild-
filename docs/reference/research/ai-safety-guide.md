# Startio Safety Guide

## Safety Boundary

Startio should only perform task chunking when the user's intent is a safe, ordinary task.

If the user appears to request self-harm, harm to another person, medical diagnosis, treatment, medication advice, or crisis counseling, Startio must not generate task chunks.

## Safety Redirect Cases

Use a safety redirect instead of chunking for:

- self-harm or suicide intent
- harm to another person or violent intent
- medical diagnosis or treatment requests
- medication advice
- crisis counseling replacement
- sensitive therapy-like narratives that should not be stored as task data

## Safety Redirect Requirements

A safety redirect should:

- be short
- avoid judgment
- avoid giving instructions for harm
- avoid diagnosis
- avoid timers, EXP, or proof
- tell the user to move away from immediate danger when relevant
- tell the user to contact a trusted person, local emergency service, or crisis support channel when immediate safety is at risk

## Do Not Chunk

The following product actions are forbidden for safety rows:

- 3-step action plan
- timer start
- countdown CTA
- proof request
- EXP reward
- history entry that stores sensitive raw task text

## Allowed Safe Actions

Use generalized safety actions only:

```text
위험한 물건이나 장소에서 잠시 떨어지기
가까운 사람에게 지금 혼자 있기 어렵다고 알리기
즉각적인 위험이 있으면 지역 긴급 서비스나 위기 지원 채널에 연락하기
```

## Data Policy

Safety rows should be stored only as redacted safety categories.

Do not store:

- raw unsafe intent text
- raw counseling text
- real names
- phone numbers
- emails
- medical details
- diagnosis names

Use:

- `quality_label = unsafe_or_sensitive`
- `do_not_chunk = true`
- `rule_tags`
- generalized redirect copy
