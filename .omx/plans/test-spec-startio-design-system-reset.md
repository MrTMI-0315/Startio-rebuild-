# Test Specification — Startio Design-System Reset

## Purpose

Prove that the source-of-truth conflict is resolved, the first screen communicates immediate task entry, the pastel-orange system is nuanced and accessible, and the mobile P0 behavior remains unchanged.

## Evidence policy

- Document checks may run immediately after authority migration.
- Visual checks require prototypes at 390×844 and 360×800.
- Each screen requires paired evidence in production order: 390×844 iOS calibration first, then 360×800 Android parity; the next screen is blocked until the Android result passes.
- Run `$visual-verdict` for every visual iteration and persist verdict JSON at `.omx/state/{scope}/ralph-progress.json` as required by the workspace visual gate.
- Literal colors remain `provisional` until every applicable test below passes.

## Contract-migration tests

| ID | Test | Pass condition |
| --- | --- | --- |
| C01 | Search active authority and plan files for `주황|orange|코발트|cobalt|#315CEA|#D97706|Quiet Precision` | Every hit classified as current semantic direction, superseded history, or prohibited pattern; zero unclassified contradictions |
| C02 | Review `AGENTS.md:24` diff | Only the visual prohibition changes; one-action rule and all adjacent product contracts retain meaning |
| C03 | Review `DESIGN.md`, `00`, and `09` diff | Only visual clauses, dated decision state, and necessary links change |
| C04 | Compare protected invariant checklist before/after | Exactly three actions, no mandatory follow-up, safety-before-plan, single CTA, privacy exclusions, parity, and non-goals are semantically identical |
| C05 | Inspect subordinate `.omx/plans/*` | No active non-orange/cobalt-primary test remains; canonical precedence is explicit |
| C06 | Inspect reference artifacts | Each is classified current, supporting, or historical; none silently overrides canonical authority |

## First-viewport tests

| ID | Test | Pass condition |
| --- | --- | --- |
| V01 | Render 390×844 initial screen | Writable input and `첫 행동 만들기` visible without scrolling; no other prominent CTA |
| V02 | Render 360×800 initial screen | Same as V01 with no clipping or unsafe-area collision |
| V03 | Visual hierarchy review | Input is the strongest interactive element; logo, copy, decoration, and navigation do not compete |
| V04 | Copy inventory | No stacked examples, result promises, feature list, or onboarding paragraph on the initial viewport |
| V05 | CTA semantics review | Label describes creation of a first action; it does not imply generic chat/send behavior |
| V06 | Positive color assertion | Independent reviewers identify the brand/action direction as warm pastel orange rather than blue/cobalt or neutral-only |
| V07 | Negative color assertion | No raw saturated orange, flat single-orange hierarchy, decorative orange background/gradient, or legacy orange card/dashboard treatment |
| V08 | Historical-reference audit | Prior Startio four concepts/core-flow captures are absent from positive evidence citations |

## Token and state tests

| ID | Test | Pass condition |
| --- | --- | --- |
| T01 | Semantic token inventory | Background, surface, text, border, focus, action, pressed, disabled, selection, success, caution, and destructive roles exist |
| T02 | Approval-state audit | Each literal color is labeled candidate/provisional or approved; approval requires linked test evidence |
| T03 | Component-state contrast | Default, focus, pressed, disabled, selected, error, caution, and destructive states meet their documented contrast requirement |
| T04 | Adaptive appearance | Light, dark, and increased-contrast variants preserve hierarchy and semantic meaning |
| T05 | Non-color cues | Focus, disabled, error, caution, and destructive meaning are not conveyed by color alone |

## Accessibility and platform tests

| ID | Test | Pass condition |
| --- | --- | --- |
| A01 | WCAG 2.2 AA contrast audit | Normal text, large text, essential icons, controls, focus, and state distinctions meet applicable AA thresholds |
| A02 | 200% text scaling | Input, CTA, and essential microcopy remain readable, operable, and unclipped at both viewports |
| A03 | Korean line breaking | No orphaned particles, clipped glyphs, or meaning-changing truncation in required copy |
| A04 | Screen-reader order | VoiceOver and TalkBack announce identity, input purpose, current value, validation, and CTA in logical order |
| A05 | Target size | iOS interactive targets are at least 44pt and Android targets at least 48dp |
| A06 | Reduced motion | No required understanding depends on animation; reduced-motion state is equivalent |
| A07 | Safe areas/keyboard | Input and CTA remain reachable with device insets and software keyboard visible |
| A08 | Platform parity | iOS and Android preserve the same P0 meaning, CTA hierarchy, and result expectations |

## Reference-evidence tests

| ID | Test | Pass condition |
| --- | --- | --- |
| R01 | Matrix completeness | Every material color, type, spacing, input, state, and microcopy decision has a source, role, rationale, forbidden inference, and verification |
| R02 | Role isolation | Chat assistants, Tiimo, Craft, Focus by Meaningful Things (`focusapp.io`, mobile App Store ID `975017240`), and Apple each contribute only their declared role |
| R03 | Apple baseline boundary | Apple evidence improves system quality without creating iOS-only Android behavior |
| R04 | Unsupported-choice audit | No exact token, type scale, spacing, radius, shadow, input state, or microcopy is labeled final without evidence |

## Moderated first-impression test

### Participants and setup

- Five target users, each seeing one target viewport first; alternate viewport ordering across participants.
- No facilitator explanation before the first three-second observation.
- Prompt after observation: `이 화면에서 지금 무엇을 할 수 있다고 느꼈나요? 다음으로 무엇을 누르거나 입력하겠어요?`

### Recorded outcomes

| ID | Metric | Pass condition |
| --- | --- | --- |
| U01 | Input recognition | At least 4/5 identify task entry as the next action within three seconds |
| U02 | CTA meaning | At least 4/5 explain that `첫 행동 만들기` turns the task into an actionable start/plan, not generic chat |
| U03 | Copy burden | At least 4/5 begin without requesting explanation of examples, promises, or features |
| U04 | First-impression language | Qualitative responses align with “막히는 일을 입력해보고 싶다”; no repeated “무슨 서비스인지 모르겠다” or “챗봇인가?” failure pattern |

Any failure in U01 or U02 blocks token approval and implementation handoff. Qualitative U04 failure triggers hierarchy/copy review even if numeric criteria pass.

## Exit criteria

1. C01–C06 all pass.
2. V01–V08 all pass with an approved `$visual-verdict` iteration.
3. T01–T05, A01–A08, and R01–R04 all pass with linked evidence.
4. U01 and U02 meet 4/5; U03 and U04 show no repeated blocking pattern.
5. A final `verifier` confirms no known active contradiction, protected-invariant regression, accessibility blocker, or unlabeled literal color remains.

Until all exit criteria pass, exact tokens and React Native implementation remain blocked.
