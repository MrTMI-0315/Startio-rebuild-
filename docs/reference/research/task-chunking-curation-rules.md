# Task Chunking Dataset Curation Rules

## Purpose

This document explains how normalized MIRUNY task logs are split into:

- positive task chunking candidates
- negative task chunking candidates
- safety redirect candidates

This is a preparation layer. It does not automatically change the production coaching prompt.

## Commands

Normalize raw export:

```bash
npm run normalize:miruny -- --input /path/to/miruny_task_logs_raw_2026-05-07.json
```

Curate normalized export:

```bash
npm run curate:chunking
```

## Outputs

```text
exports/startio_task_chunking_positive_candidates.jsonl
exports/startio_task_chunking_negative_candidates.jsonl
exports/startio_task_chunking_safety_redirect_candidates.jsonl
exports/startio_task_chunking_forbidden_rules.json
```

## Positive Candidates

Positive candidates are rows where the action text is usable as a good or near-good Startio example.

They may still require timer normalization because Startio MVP now treats Step 1 as a tiny 15-second time attack rather than a long focus block.

Use positive candidates for:

- few-shot examples
- prompt style references
- fallback plan examples
- regression snapshots

Do not use them before checking that no safety tags are present.

## Negative Candidates

Negative candidates are rows that should teach the model what not to generate.

Common reasons:

- `parse_failed`
- `too_vague`
- `too_heavy`
- `wrong_task`
- `step1_lacks_physical_anchor`

Use negative candidates for:

- evaluator tests
- prompt QA
- manual rewriting queue

## Safety Redirect Candidates

Safety redirect candidates are not ordinary bad examples.

They are rows where Startio should not chunk the task at all.

Use these only for:

- safety policy tests
- forbidden-rule examples
- redirect behavior checks

Do not use them as normal few-shot examples.

## Forbidden Rule Preparation

The generated `startio_task_chunking_forbidden_rules.json` should be treated as a policy artifact.

Before applying it to production:

- review examples manually
- decide exact in-app redirect copy
- add tests for do-not-chunk behavior
- ensure no raw unsafe text is stored in behavior events
- ensure timer/proof/EXP are disabled for redirect flows

## Human Labeling Next Step

After automatic curation, reviewers should edit:

```text
exports/startio_task_chunking_labeling.csv
```

Then copy confirmed examples into a reviewed dataset, not directly into the production prompt.
