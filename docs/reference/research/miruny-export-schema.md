# MIRUNY Task Logs Export Schema

## Purpose

MIRUNY admin exports are used only to improve Startio's non-clinical execution coaching task chunking.

This dataset must not be described or used as medical, diagnostic, therapeutic, or counseling data. Its purpose is to compare how vague or heavy user tasks can be converted into small physical first actions.

## Raw Source

Expected raw export file:

```text
exports/miruny_task_logs_raw_2026-05-07.json
```

For local one-off normalization, the script also accepts an explicit input path:

```bash
npm run normalize:miruny -- --input /path/to/miruny_task_logs_raw_2026-05-07.json
```

The raw export file is intentionally ignored by git via `exports/*raw*.json`.

## Raw Fields

Observed or expected source fields:

```text
id
created_at
session_id
response
task
user_id
```

Notes:

- `response` may be an object with `steps`, `notes`, `question`, or `options`.
- In the 2026-05-07 local export, `response.steps[]` used `title`, `durationSec`, and `instruction`.
- In the 2026-05-07 local export available during normalization, `user_id` was not present, so `user_hash` is emitted as `unknown`. If a future export includes `user_id`, the script hashes it automatically.
- Some rows are coach question/options rows instead of completed 3-step chunking rows. Those rows remain in the normalized files, but are counted as parse failures.

## Normalized Outputs

The normalizer writes:

```text
exports/miruny_task_logs_normalized.jsonl
exports/miruny_task_logs_normalized.csv
exports/startio_task_chunking_labeling.csv
exports/startio_task_chunking_examples.jsonl
```

The JSONL and CSV normalized files preserve row count with the raw export. The few-shot examples file includes only rows where all three steps and timer seconds were parsed.

## Privacy Rules

Do not store these in normalized outputs:

- raw `user_id`
- API keys
- authorization headers
- Supabase URLs
- real names
- raw emails
- phone numbers
- diagnosis names
- therapy records
- full raw counseling text

Allowed normalized fields:

- `user_hash`: SHA-256 hash of `user_id` when present, otherwise `unknown`
- `session_id_hash`: SHA-256 hash of `session_id` when present
- `sanitized_task`: trimmed, redacted, length-limited task text
- parsed action labels, action texts, timer seconds, and short tips

## Normalized Schema

```text
log_id
user_hash
created_at
session_id_hash
sanitized_task
task_category
barrier_type
step1_label
step1_text
step1_seconds
step2_label
step2_text
step2_seconds
step3_label
step3_text
step3_seconds
tips
source
raw_input_stored
quality_label
label_reason
improved_step1
improved_step2
improved_step3
```

Defaults:

- `source`: `miruny_admin`
- `raw_input_stored`: `false`
- `quality_label`: empty for human labeling
- `label_reason`: empty for human labeling
- `improved_step1`, `improved_step2`, `improved_step3`: empty for human labeling

## Rule-Based Initial Labels

`task_category` and `barrier_type` are inferred only as bootstrap labels. If no rule matches, the value is `unknown`.

The current bootstrap `barrier_type` values use Startio BarrierType v1:

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

These labels are not ground truth. Human reviewers should correct them during labeling.
