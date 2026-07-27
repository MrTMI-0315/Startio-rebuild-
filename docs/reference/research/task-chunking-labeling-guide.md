# Startio Task Chunking Labeling Guide

## Goal

Label MIRUNY-derived task chunking rows so Startio can generate smaller, clearer, and more context-fit 3-step action plans.

This labeling work is for non-clinical execution coaching only. Do not label, infer, or store medical diagnosis, treatment effect, therapy progress, or counseling records.

## What To Review

For each row, review:

- `sanitized_task`
- `task_category`
- `barrier_type`
- step labels
- step action text
- timer seconds
- tips

Then fill:

- `quality_label`
- `label_reason`
- `improved_step1`
- `improved_step2`
- `improved_step3`

## Quality Labels

Use exactly one of:

```text
excellent
good
too_heavy
too_vague
wrong_task
needs_emotional_support
unsafe_or_sensitive
parse_failed
```

## Label Definitions

### excellent

The plan is immediately usable by Startio.

Criteria:

- Step 1 is physical and startable now.
- Step 1 can be normalized to a 15-second first-action time attack.
- All three steps are concrete.
- The plan reduces burden and avoids over-planning.

### good

The plan is usable with minor copy or timer edits.

Criteria:

- The task is correct.
- Step 1 is mostly concrete.
- One or two steps may need clearer wording.

### too_heavy

The plan asks for too much too soon.

Examples:

- "Write the introduction" as step 1 for a user who is stuck.
- 10+ minute first action without a concrete opening action.
- Multiple actions bundled into one step.

### too_vague

The step is too abstract to execute.

Examples:

- "Think about the task"
- "Prepare well"
- "Organize ideas"
- "Focus on studying"

### wrong_task

The generated steps do not match the user's task.

Examples:

- User asks about cleaning, plan answers with writing.
- User asks about email, plan answers with studying.

### needs_emotional_support

The plan may be mechanically correct, but the task text shows high friction that needs a lower-burden coach message or smaller first step.

Use non-clinical language only. Do not label this as diagnosis or treatment need.

### unsafe_or_sensitive

The row contains sensitive, unsafe, medical, diagnostic, or counseling-like content that should not be used as a few-shot example.

Action:

- Do not copy the sensitive text into improvement fields.
- Write a brief reason such as `contains sensitive health text`.

### parse_failed

The row does not contain a parseable 3-step task chunking result.

Common cases:

- Coach question/options row
- Missing step text
- Missing timer seconds
- Malformed response

## Improvement Guidelines

When writing `improved_step1` through `improved_step3`:

- Write one concrete physical action per step.
- Avoid bundled sequences.
- Prefer visible anchors: file, app, folder, desk, sink, document, first line.
- Keep step 1 tiny enough to start within about 15 seconds after timer normalization.
- Keep Korean mobile copy short.
- Do not include diagnoses, therapy framing, or medical claims.

Recommended shape:

```text
Open the relevant file
Read only the last visible sentence
Write one rough sentence
```

## Timer Review Rules

Timer seconds should match the current Startio MVP time-attack policy:

- Step 1: 15 seconds by default.
- Activation-low rows: 15, 30, 60 seconds.
- Task-overwhelm rows: 15, 60, 120 seconds.
- Work or study rows: usually 15, 60, 120 seconds.
- Home or personal rows: usually 15, 45, 90 seconds.

## Privacy Rules

Never add these to label fields:

- real name
- phone number
- raw email
- diagnosis name
- therapy or counseling transcript
- medical document text
- API key or authorization token

If a useful improvement requires sensitive context, generalize it.
