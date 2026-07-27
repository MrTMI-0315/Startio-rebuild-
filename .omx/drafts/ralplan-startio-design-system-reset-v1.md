# Startio Design-System Reset — RALPLAN Draft v1

## Status

- Mode: RALPLAN-DR short, Architect-revised
- Scope: design contract migration + prototype/test planning; no product implementation
- Requirements source: `.omx/specs/deep-interview-startio-ui-first-impression.md`
- Context: no active Expo/mobile components; empty `app/` and `src/` paths do not constitute an implementation surface

## RALPLAN-DR summary

### Principles

1. Input first, explanation second: the writable field must own the first-screen hierarchy.
2. Visual direction may change; functional, safety, and privacy contracts may not.
3. Pastel orange is semantic, adaptive, accessible, and nuanced — never raw, flat, or a revival of the rejected legacy orange UI.
4. Each reference has one declared role; visual mixing without evidence is prohibited.
5. Contradictory source-of-truth documents must be resolved before mobile UI implementation.

### Decision authority

1. `AGENTS.md` is the highest local operating/product contract, and `docs/README.md:3-10` places the canonical documents beneath it.
2. `docs/canonical/00-startio-dev-replan-v0.1.md:33-43` assigns visual/product authority to `docs/canonical/product/09-mobile-v1-reset.md`, with AI and data contracts remaining in their own canonical documents.
3. The 2026-07-23 deep-interview spec is the newer approved product-decision input, not yet active canonical law: `.omx/specs/deep-interview-startio-ui-first-impression.md:123-128`, `.omx/specs/deep-interview-startio-ui-first-impression.md:131-157`.
4. The migration becomes authoritative only when its dated decision is reflected atomically in `AGENTS.md`, `DESIGN.md`, and the canonical documents. Imported `.omx/plans/*` remain subordinate supporting artifacts.

### Decision drivers

1. The 2026-07-23 internal product decision explicitly supersedes cobalt-primary/orange-warning-only guidance: `.omx/context/startio-ui-first-impression-20260723T014429Z.md:75-83`, `.omx/specs/deep-interview-startio-ui-first-impression.md:123-128`, and `.omx/specs/deep-interview-startio-ui-first-impression.md:131-147`.
2. Mobile V1 behavior remains locked: one-line input, exactly three actions, `plan_allowed | safe_redirect`, zero required follow-up after valid input, and one dominant CTA: `AGENTS.md:19-29`, `docs/canonical/product/09-mobile-v1-reset.md:69-91`.
3. The repository has no active mobile UI component surface, so contract migration and prototype evidence can happen before code without code-migration risk: `README.md:5-20`, `DESIGN.md:58-61`.

### Viable options

#### Option A — Hybrid contract-first migration, then token approval (favored)

- Pros: removes conflicting direction and test instructions before execution while keeping exact token values provisional; creates one source of truth with low code risk.
- Cons: requires careful language to distinguish an approved color direction from an unapproved exact palette and adds one documentation pass before visual learning.

#### Option B — Prototype-first, then migrate documents after user testing

- Pros: strongest protection against canonizing an aesthetic that has not survived contrast, adaptive-appearance, and first-impression evidence; fastest visual learning; token decisions remain provisional until observed.
- Cons: prototype and test authors must work around active canonical bans and stale verdict criteria; greater rework and inconsistent review risk.

#### Option C — Keep cobalt primary and treat orange as exploration

- Pros: minimal document churn.
- Cons: contradicts the resolved internal decision; invalid unless the user explicitly reopens the color direction.

## Requirements summary

### Preserve without modification

- React Native + Expo development build + TypeScript: `AGENTS.md:19-20`.
- Valid input yields exactly three actions without mandatory follow-up: `AGENTS.md:21`, `docs/canonical/product/09-mobile-v1-reset.md:69-80`, `docs/canonical/product/03-feature-spec.md:119-125`.
- Safety result precedes planning: `AGENTS.md:22`, `docs/canonical/product/09-mobile-v1-reset.md:81-106`.
- Raw task, generated copy, photos/paths, email, medical/free input stay out of behavior analytics: `AGENTS.md:23`, `docs/canonical/data/05-behavior-event-schema.md:16-31`, `docs/canonical/data/05-behavior-event-schema.md:262-283`.
- Account, payment, sync, calendar, push, server photo, and advanced-personalization non-goals remain: `AGENTS.md:27-29`.

### Apply as new visual contract

- The intended first reaction is `뭔가 막히는 일을 한 번 입력해봐야겠다`: `.omx/specs/deep-interview-startio-ui-first-impression.md:30-36`.
- The first screen is immediately writable and uses one action-specific CTA such as `첫 행동 만들기`: `.omx/specs/deep-interview-startio-ui-first-impression.md:38-50`.
- The system is pastel-orange-led; it excludes raw saturated orange, flat single-orange hierarchy, dominant blue/cobalt, explanatory copy stacks, and general-chat UI: `.omx/specs/deep-interview-startio-ui-first-impression.md:52-61`.
- Exact visual decisions require an Apple/approved-reference evidence trail: `.omx/specs/deep-interview-startio-ui-first-impression.md:63-74`.
- Existing Startio concepts and core-flow captures are historical artifacts, not positive visual references: `.omx/specs/deep-interview-startio-ui-first-impression.md:54`.
- The pastel-orange direction is fixed, but exact light/dark/increased-contrast values remain provisional until component contrast and prototype evidence pass; semantic roles are canonicalized before literal hex values.

## Conflict audit

| Severity | Current source | Conflict | Planned resolution |
| --- | --- | --- | --- |
| Hard | `AGENTS.md:24` | Prohibits orange-centered user screens without distinguishing legacy raw orange from the approved nuanced system | Rewrite narrowly: prohibit raw/flat/legacy orange treatment while permitting evidence-backed pastel-orange-led UI |
| Hard | `DESIGN.md:17` | Lists all orange-centered screens under Avoid | Replace with specific rejected patterns |
| Hard | `DESIGN.md:47-49` | Fixes `#315CEA` as product Primary and `#D97706` as warning | Replace fixed values with provisional semantic token roles and validation requirements |
| Hard | `DESIGN.md:96` | Orange warning-only; cobalt core action | Mark superseded and replace with new token constraint |
| Hard | `docs/canonical/product/09-mobile-v1-reset.md:31` | Locks orange-centered core-screen removal | Preserve rejection of the legacy implementation, not the color family |
| Hard | `docs/canonical/product/09-mobile-v1-reset.md:45` | User-feedback rationale resolves directly to neutral/cobalt | Add dated decision evolution: raw/dated orange failed; nuanced pastel orange is newly approved |
| Hard | `docs/canonical/product/09-mobile-v1-reset.md:112-132` | Quiet Precision token table is cobalt-primary/orange-warning-only | Replace or version with semantic pastel-orange-led roles; retain hierarchy/accessibility rules |
| Hard | `docs/canonical/product/09-mobile-v1-reset.md:240` | Acceptance rejects orange-centered surfaces | Replace with two-sided test: positive pastel-orange recognition + negative raw/flat/gradient/legacy rejection |
| Hard | `docs/canonical/00-startio-dev-replan-v0.1.md:62` | Executive summary names cobalt primary/orange warning-only | Add dated supersession note and updated summary |
| Hard | `docs/canonical/00-startio-dev-replan-v0.1.md:252-267` | Repeats old token table and orange prohibition | Migrate to new semantic direction without changing functional flow |
| Decision-state | `docs/canonical/00-startio-dev-replan-v0.1.md:672-673` | M42 is open while M43 locks old orange rejection | Resolve M42 through a dated design decision; redefine M43 as legacy-pattern rejection |
| Hard | `.omx/plans/prd-startio-mobile-v1-reset.md:27,60-61` | Requires non-orange visual validation | Update or explicitly subordinate to new design decision |
| Hard | `.omx/plans/test-spec-startio-mobile-v1-reset.md:113-126` | E05 rejects orange gradient/central orange surface only, with no positive new-direction test | Replace with positive and negative color-system assertions |
| Soft | `DESIGN.md:13-45` | Quiet Precision personality is not inherently blue but currently coupled to it | Retain calm/precise/action-first principles; decouple from cobalt |
| Historical | `docs/reference/design/README.md:3-6` | Captures are generic reference history | Add explicit historical-only note; do not delete assets |
| Historical/supporting | `docs/reference/plans/mobile-v1-safe-start-task-packet.md:32,89` | May still repeat prior visual handoff assumptions | Classify as historical/supporting; edit only if an active execution link still treats it as current |
| None | `docs/canonical/product/01-mvp-core.md`, `02-user-flow.md`, `03-feature-spec.md`, `docs/canonical/ai/04-coaching-engine.md`, `docs/canonical/data/05-behavior-event-schema.md` | Functional, safety, and data behavior remain compatible | Preserve; only update cross-links if needed |

## Acceptance criteria

1. A single dated decision is reflected consistently in `AGENTS.md`, `DESIGN.md`, the two top-level canonical product/replan documents, and imported PRD/test spec; none presents cobalt-primary/orange-warning-only as current law.
2. Every migrated document distinguishes rejected legacy raw/flat/orange-heavy UI from approved nuanced pastel-orange-led UI.
3. First-screen criteria require the input as the strongest element and `첫 행동 만들기` as the only prominent CTA at 390×844 and 360×800 without scrolling.
4. Color criteria require recognizable warm/pastel-orange direction and reject raw saturated orange, flat single-orange hierarchy, decorative orange gradients, and legacy orange card/dashboard UI.
5. Exactly-three-actions, zero-required-follow-up, single-CTA, `plan_allowed | safe_redirect`, privacy, and P1/P2 non-goal contracts are unchanged.
6. A decision-evidence matrix maps every material token/component choice to Apple HIG/iOS 27 resources or one approved reference role.
7. Prototype/test criteria cover light, dark, increased contrast, WCAG 2.2 AA, Korean line breaking, 200% text scaling, VoiceOver/TalkBack, reduced motion, safe areas, and 44pt/48dp targets.
8. A five-person moderated prototype test requires at least 4/5 to identify task entry as the next action within three seconds and understand that the CTA creates a first action rather than open-ended chat.
9. No step adds accounts, payment, sync, calendar, push, server photos, RAG/sLLM, clinical claims, or remote behavior analytics.
10. Existing Startio captures remain available as history but are not used as positive design evidence.
11. No exact pastel-orange hex token is marked approved until it passes light, dark, increased-contrast, component-state, and WCAG contrast verification; pre-validation documents define semantic roles and candidate ranges only.

## Planned work

1. Create a dated visual decision record that supersedes cobalt-primary/orange-warning-only while explicitly preserving every P0 functional, safety, and privacy invariant and recording exact color values as provisional.
2. In one migration change, narrowly update `AGENTS.md:24`, `DESIGN.md`, `docs/canonical/product/09-mobile-v1-reset.md`, and `docs/canonical/00-startio-dev-replan-v0.1.md`. `AGENTS.md` changes only the visual prohibition: permit evidence-backed pastel-orange-led UI while continuing to ban raw/flat/legacy orange, orange page backgrounds/gradients, and multiple dominant actions.
3. Make `DESIGN.md` the active visual contract for principles, semantic token slots, reference roles, first-screen hierarchy, adaptive color/accessibility gates, and provisional-vs-approved token status; do not freeze exact hex values during migration.
4. Limit canonical edits to visual clauses and dated decision state; leave functional, safety, privacy, and release sections untouched except for necessary cross-links.
5. Update `.omx/plans/prd-startio-mobile-v1-reset.md` and `.omx/plans/test-spec-startio-mobile-v1-reset.md` as subordinate artifacts, replacing negative-only orange checks with positive pastel-orange and negative legacy/raw-orange assertions.
6. Add a role-bound reference evidence matrix and prototype/usability-test specification covering the full P0 visual carry-through.
7. Verify all documentation and test criteria align before any React Native UI implementation handoff.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Pastel-orange-led becomes the rejected legacy orange UI | Define positive and negative visual assertions; require multi-role semantic tokens and prototype evidence |
| Documentation migration changes product behavior | Limit edits to visual clauses and diff functional invariants before/after |
| Apple reference becomes iOS-only mimicry | Treat Apple as quality/system evidence while maintaining Android semantic parity |
| Stale imported plans mislead execution | Patch or subordinate them in the same migration change |
| Orange primary fails contrast/adaptive appearances | Canonicalize semantic roles but do not approve exact values before light/dark/increased-contrast, component-state, and WCAG verification |
| References become an incoherent mood board | Every reference must have one named role and a forbidden-copy boundary |

## Verification

1. Search `AGENTS.md`, `DESIGN.md`, `docs/`, and `.omx/plans/` for `주황|orange|코발트|cobalt|#315CEA|#D97706|Quiet Precision`; classify every result as current, superseded-history, or prohibited-pattern language.
2. Diff changed visual documents against the invariant checklist: three actions, no required follow-up, safe result, one CTA, privacy exclusion, and P1/P2 non-goals.
3. Validate the prototype/test spec contains both target viewports and every accessibility/adaptive-appearance check.
4. Validate the user-test script includes the three-second input recognition and CTA-meaning checks.
5. Block mobile implementation handoff until the source-of-truth conflict search returns no unclassified active contradictions.
6. Confirm every literal color candidate is labeled `provisional` until the accessibility and prototype gates produce recorded evidence.

## ADR draft

### Decision

Adopt the 2026-07-23 input-first pastel-orange-led direction through a hybrid contract-first migration. Supersede cobalt-primary/orange-warning-only guidance while preserving all mobile V1 functional, safety, privacy, and platform-parity contracts; approve semantic color roles now and exact color values only after evidence gates pass.

### Drivers

- The deep interview resolves the first-impression target, color direction, and approved reference roles.
- Current active documents directly contradict that decision.
- No active mobile UI requires code migration, making contract-first correction the lowest-rework path.

### Alternatives considered

- Prototype first, migrate docs later: faster visual learning but leaves contradictory review criteria active.
- Keep cobalt and treat orange as exploration: rejected because it contradicts the resolved decision.
- Combine documentation, prototype, and React Native implementation: rejected because prototype/user evidence is a precondition and active mobile components do not exist.

### Why chosen

Hybrid contract-first migration establishes one coherent directional source of truth and lets prototype/test work operate against current criteria without prematurely canonizing an unvalidated palette.

### Consequences

- `AGENTS.md`, `DESIGN.md`, two canonical documents, and imported plan artifacts need coordinated visual-clause edits.
- Historical captures remain but lose positive-reference status.
- Exact orange values remain provisional until accessibility and user testing pass.

### Follow-ups

- Decide whether the dated decision is an addendum referenced by canonical docs or an inline versioned section in each document.
- Produce final PRD and test specification before implementation.

## Architect review incorporation

- Corrected the authority hierarchy and clarified that the interview spec is newer decision input, not active canonical law by itself.
- Strengthened the prototype-first antithesis and made the central tension explicit: authority coherence versus visual learning speed.
- Narrowed the `AGENTS.md` change to one visual-product clause.
- Changed the favored approach from blanket contract-first to hybrid contract-first: direction and tests migrate now; exact hex values remain provisional.
- Added classification for supporting reference plans and stronger positive/negative test migration requirements.
