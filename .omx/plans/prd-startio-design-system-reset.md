# PRD — Startio Input-First Pastel-Orange Design-System Reset

## Status and authority

- Status: execution-ready planning artifact; implementation not started
- Parent decision: `.omx/plans/ralplan-startio-design-system-reset.md`
- Requirements source: `.omx/specs/deep-interview-startio-ui-first-impression.md`
- Canonical rule: this PRD does not override `AGENTS.md` or `docs/canonical/*`; the planned migration makes the approved direction active (`docs/README.md:3-10`).

## Problem

The approved 2026-07-23 visual direction is input-first and pastel-orange-led, but the active design contract still fixes cobalt as primary, limits orange to warning, and broadly bans orange-centered screens (`AGENTS.md:24`; `DESIGN.md:17,48,96`; `docs/canonical/product/09-mobile-v1-reset.md:112-132`). This creates circular UI/code review criteria before any active mobile implementation exists (`README.md:5-20`).

## Product outcome

On opening Startio, a user should immediately think, `뭔가 막히는 일을 한 번 입력해봐야겠다`. The first viewport presents an immediately writable input as the strongest element and one action-specific CTA, `첫 행동 만들기`, without a stack of examples, outcome promises, or general-chat framing (`.omx/specs/deep-interview-startio-ui-first-impression.md:30-60`).

## Goals

1. Establish one coherent active visual contract for the pastel-orange-led semantic direction.
2. Preserve the full P0 product/safety/privacy contract unchanged.
3. Define positive and negative visual acceptance criteria instead of a generic orange ban.
4. Make every material visual choice traceable to Apple system guidance or one approved reference role.
5. Keep exact color values provisional until accessibility and first-impression evidence passes.

## Non-goals

- No React Native UI implementation in this planning deliverable.
- No account, payment, sync, calendar, push, server-photo, advanced-personalization, RAG/sLLM, or clinical-claim scope (`AGENTS.md:26`; `docs/canonical/product/09-mobile-v1-reset.md:150-159`).
- No copying of the legacy Startio UI/SwiftUI or treating prior Startio concepts/core-flow captures as positive visual references (`AGENTS.md:25`; `.omx/specs/deep-interview-startio-ui-first-impression.md:52-60`).
- No final hex-token approval before evidence gates.

## Protected product contracts

| Contract | Evidence |
| --- | --- |
| One-line task input returns exactly three actions without mandatory follow-up | `AGENTS.md:21`; `docs/canonical/product/03-feature-spec.md:119-125` |
| Safety result precedes plan generation | `AGENTS.md:22`; `docs/canonical/product/09-mobile-v1-reset.md:81-106` |
| One dominant action per screen | `AGENTS.md:24`; `docs/canonical/product/09-mobile-v1-reset.md:232-243` |
| Raw task/generated copy/photos/paths/email/medical/free input excluded from behavior analytics | `AGENTS.md:23`; `docs/canonical/data/05-behavior-event-schema.md:16-31,239-273` |
| iOS and Android preserve P0 meaning | `AGENTS.md:20`; `docs/canonical/product/09-mobile-v1-reset.md:137-148` |

## Functional design requirements

- **DS-00 — Production sequence:** Calibrate each screen at 390×844 iOS first, then pass 360×800 Android parity within the same prototype/Expo vertical slice before starting the next screen. This does not permit an iOS-only product or iOS-first release.
- **DS-01 — Immediate input:** At 390×844 and 360×800, the editable task field is visible, enabled, and visually dominant without scrolling.
- **DS-02 — One CTA:** `첫 행동 만들기` is the only prominent action on the first viewport and communicates plan creation, not open-ended chat.
- **DS-03 — Minimal copy:** No stacked input examples, result promises, feature list, or onboarding explanation competes with the input.
- **DS-04 — Warm semantic direction:** Brand/action emphasis is recognizably warm pastel orange; cobalt/blue is not the dominant brand/action family.
- **DS-05 — Legacy-pattern rejection:** Raw saturated orange, single-orange hierarchy, decorative orange page gradients/backgrounds, and prior orange card/dashboard treatment are prohibited.
- **DS-06 — Semantic tokens:** Define roles for background, surface, text, border, focus, primary action, pressed/disabled action, selection, success, caution, and destructive states. Literal values remain `candidate/provisional` until tested.
- **DS-07 — Reference traceability:** Every material color, type, spacing, input, state, and microcopy decision maps to one evidence source and records the allowed inference plus forbidden copying boundary.
- **DS-08 — Adaptive accessibility:** Cover light, dark, increased contrast, 200% text, Korean line breaking, VoiceOver/TalkBack, reduced motion, safe areas, 44pt iOS/48dp Android targets, and WCAG 2.2 AA contrast.
- **DS-09 — Historical boundary:** Existing Startio concepts and flow captures are history/negative evidence only.
- **DS-10 — Cross-platform semantics:** Apple resources establish system-quality criteria, not iOS-only visual mimicry; Android retains semantic and interaction parity.

## Reference roles

| Reference | Permitted role | Forbidden inference |
| --- | --- | --- |
| ChatGPT / Claude / Gemini | Immediate-input structure and hierarchy | General-chat identity or explanatory copy stack |
| Tiimo | Calm executive-function productivity and accessibility | Wholesale visual cloning |
| Craft | Warm pastel material/surface relationships | Decorative material without task value |
| Focus by Meaningful Things (`focusapp.io`, mobile App Store ID `975017240`) | State/timer behavior | Importing timer UI into the start screen |
| Apple HIG / current iOS design resources | Typography, spacing, controls, accessibility, adaptive appearance baseline | iOS-only behavior or literal component copying onto Android |

## Deliverables

1. Dated visual-decision addendum at `docs/canonical/product/10-visual-direction-2026-07-23.md`.
2. Narrow authority migration across `AGENTS.md`, `DESIGN.md`, `00`, and `09`.
3. Updated subordinate mobile reset PRD/test artifacts.
4. Reference-evidence matrix with source, role, decision, forbidden inference, and verification columns.
5. First-screen prototype for both target viewports.
6. Completed evidence package defined by `test-spec-startio-design-system-reset.md`.

## Acceptance criteria

1. Conflict search finds no unclassified active cobalt-primary/orange-warning-only rule.
2. Every active document distinguishes approved pastel-orange direction from prohibited raw/flat/legacy orange treatment.
3. DS-01 through DS-10 each has recorded pass evidence.
4. At least 4/5 moderated participants identify the input as the next action within three seconds.
5. At least 4/5 understand `첫 행동 만들기` creates an actionable first plan rather than opening generic chat.
6. All protected product contracts match their pre-migration meaning.
7. Every literal candidate color remains labeled `provisional` until all appearance, state, and contrast checks pass.
8. No P1/P2 or excluded data scope is introduced.

## Handoff gate

React Native implementation may start only after canonical migration, evidence-matrix completion, prototype acceptance, accessibility/adaptive checks, five-person results, and final verifier approval. A failed gate returns to design/prototype iteration, not product-code implementation.
