# Startio Design-System Reset — Approved Consensus Plan

## Status

- Workflow: non-interactive RALPLAN-DR
- Verdict: APPROVED by Planner → Architect → Critic
- Scope: design-contract migration, design-system PRD, and prototype/test specification
- Stop boundary: no React Native implementation in this workflow

## Direct answer

Yes. The newly approved input-first, pastel-orange-led direction conflicts with the currently active design system in **13 hard or decision-state clauses across six active artifacts**. The conflict is visual, not functional: the existing documents still prescribe cobalt as primary, restrict orange to warning, or reject orange-centered surfaces without distinguishing the rejected legacy treatment from a nuanced pastel-orange system.

The mobile P0 behavior remains compatible and must not change: one-line input, exactly three actions without required follow-up, safety-before-plan, one dominant action, privacy exclusions, Android/iOS semantic parity, and the current P1/P2 non-goals (`AGENTS.md:19-26`; `docs/canonical/product/09-mobile-v1-reset.md:69-106`; `docs/canonical/data/05-behavior-event-schema.md:16-31`).

## RALPLAN-DR summary

### Principles

1. The immediately writable input owns the first-screen hierarchy; explanation is secondary.
2. Visual direction may change; functional, safety, privacy, and platform-parity contracts may not.
3. Pastel orange is a semantic, adaptive color family, not raw orange, a flat monochrome hierarchy, or a revival of the historical orange dashboard.
4. Each approved reference has one named role and an evidence trail.
5. Directional authority must be coherent before implementation, while exact literal tokens remain provisional until validated.

### Decision drivers

- The 2026-07-23 product decision supersedes cobalt-primary/orange-warning-only: `.omx/context/startio-ui-first-impression-20260723T014429Z.md:75-83` and `.omx/specs/deep-interview-startio-ui-first-impression.md:123-147`.
- The intended first reaction, immediate input, and action-specific CTA are explicit: `.omx/specs/deep-interview-startio-ui-first-impression.md:30-50`.
- The repository currently has no active mobile product implementation to migrate: `README.md:5-20` and `DESIGN.md:58-61`.
- Existing canonical docs already treat final visual tokens as prototype-dependent rather than permanently approved: `docs/canonical/product/09-mobile-v1-reset.md:33,132` and `docs/canonical/00-startio-dev-replan-v0.1.md:468-473`.

### Options considered

1. **Hybrid contract-first — selected.** Migrate the approved direction and test language now; approve exact hex values only after accessibility and prototype evidence. This removes contradictory execution law without canonizing an untested palette.
2. **Prototype-first.** Strongest protection against premature palette lock-in and fastest visual learning, but forces prototype and test authors to operate against active canonical bans and stale verdict criteria.
3. **Keep cobalt; explore orange.** Lowest document churn, but contradicts the resolved internal decision and is unavailable unless that decision is reopened.

### Genuine tradeoff and synthesis

Authority coherence favors documentation migration before execution; visual learning speed favors prototype evidence before token lock-in. The synthesis is to make the **semantic direction** canonical now and keep **literal color values** provisional until light, dark, increased-contrast, component-state, contrast, and five-person first-impression gates pass.

## Authority model

1. `AGENTS.md` remains the highest local operating/product contract (`AGENTS.md:3-27`).
2. `docs/README.md:3-10` establishes canonical-document priority; `docs/canonical/00-startio-dev-replan-v0.1.md:33-43` assigns product/visual authority to the mobile reset document.
3. The deep-interview spec is newer approved decision input, not independently active canonical law (`.omx/specs/deep-interview-startio-ui-first-impression.md:149-157`).
4. A new dated visual-decision addendum will record the supersession. `AGENTS.md`, `DESIGN.md`, `00`, and `09` must reference or reflect it in one migration change.
5. `.omx/plans/*` and `docs/reference/*` are subordinate support/history and cannot override canonical documents (`.omx/plans/prd-startio-mobile-v1-reset.md:1-15`; `docs/reference/design/README.md:3-6`).

## Conflict register

| # | Active source | Current conflict | Required resolution |
| --- | --- | --- | --- |
| 1 | `AGENTS.md:24` | Broadly prohibits orange-centered screens | Permit evidence-backed pastel-orange-led UI; continue banning raw/flat/legacy orange, orange page gradients/backgrounds, and multiple dominant actions |
| 2 | `DESIGN.md:17` | Treats all orange-centered screens as an avoid pattern | Replace with specific prohibited legacy patterns |
| 3 | `DESIGN.md:48` | Fixes `#315CEA` as Primary and `#D97706` as Warning | Replace with semantic roles and candidate/provisional status |
| 4 | `DESIGN.md:96` | Restricts orange to warning and cobalt to action | Supersede with the approved direction and evidence gates |
| 5 | `docs/canonical/product/09-mobile-v1-reset.md:31` | Locks removal of orange-centered core screens | Clarify that the rejected item is the legacy treatment, not the color family |
| 6 | `docs/canonical/product/09-mobile-v1-reset.md:45` | Resolves feedback directly to neutral/cobalt | Record the dated decision evolution |
| 7 | `docs/canonical/product/09-mobile-v1-reset.md:112-132` | Hardcodes cobalt primary/orange warning-only tokens | Version to semantic pastel-orange-led roles; keep literal values provisional |
| 8 | `docs/canonical/product/09-mobile-v1-reset.md:232-243` | Acceptance rejects orange-centered surfaces generically | Add positive new-direction and negative legacy/raw-orange assertions |
| 9 | `docs/canonical/00-startio-dev-replan-v0.1.md:51-63` | Executive summary prescribes cobalt/orange-warning | Add dated supersession and update the visual summary |
| 10 | `docs/canonical/00-startio-dev-replan-v0.1.md:252-272` | Repeats old tokens and prohibition | Migrate only the visual clauses |
| 11 | `docs/canonical/00-startio-dev-replan-v0.1.md:672-674` | M42 remains open while M43 locks the old rejection | Resolve M42 and redefine M43 as legacy-pattern rejection |
| 12 | `.omx/plans/prd-startio-mobile-v1-reset.md:22-30,58-67` | Requires non-orange validation | Update as subordinate planning history/current handoff |
| 13 | `.omx/plans/test-spec-startio-mobile-v1-reset.md:113-126` | Has only a negative orange check | Replace with positive pastel-orange and negative raw/legacy assertions |

Supporting artifact to classify, not automatically rewrite: `docs/reference/plans/mobile-v1-safe-start-task-packet.md:32,89`. Compatible functional documents remain unchanged except for necessary links: `01-mvp-core.md`, `02-user-flow.md`, `03-feature-spec.md`, `04-coaching-engine.md`, and `05-behavior-event-schema.md`.

## Approved work sequence

1. Create `docs/canonical/product/10-visual-direction-2026-07-23.md` as the dated addendum: supersession, retained invariants, positive/negative visual boundaries, provisional token policy, and evidence gates.
2. Atomically migrate the active authority surface: narrowly edit `AGENTS.md:24`; update visual clauses in `DESIGN.md`, `09-mobile-v1-reset.md`, and `00-startio-dev-replan-v0.1.md`; leave functional/safety/privacy/release clauses untouched.
3. Update subordinate PRD/test artifacts so their visual assertions no longer contradict canonical authority.
4. Create the reference-evidence matrix. Assign roles: ChatGPT/Claude/Gemini for input structure; Tiimo for calm executive-function productivity/accessibility; Craft for warm pastel material; Focus by Meaningful Things (`focusapp.io`, mobile App Store ID `975017240`) for state/timer behavior; Apple HIG/current iOS design resources for system-quality baseline (`.omx/specs/deep-interview-startio-ui-first-impression.md:63-74`).
5. Produce the first-screen prototype by calibrating 390×844 iOS first, then passing 360×800 Android parity in the same screen slice before moving forward. Keep immediate input and one prominent `첫 행동 만들기` CTA; exclude stacked examples/promises and the prior Startio captures as positive evidence (`.omx/specs/deep-interview-startio-ui-first-impression.md:38-60`).
6. Run visual, accessibility, adaptive-appearance, and five-person first-impression tests defined in `test-spec-startio-design-system-reset.md`. Run `$visual-verdict` on every visual iteration and persist its state per the workspace visual gate.
7. Approve exact tokens only after all gates pass. Block React Native implementation handoff while any active contradiction or unlabeled literal color remains.

## Risks

| Risk | Mitigation / proof |
| --- | --- |
| Pastel orange recreates the rejected legacy UI | Positive/negative visual assertions plus reference-role evidence and visual verdict |
| Documentation migration changes behavior | Before/after invariant diff for three actions, no follow-up, safety, privacy, one CTA, parity, and non-goals |
| Exact orange fails adaptive contrast | Literal values remain provisional until all appearance/state checks pass |
| Apple baseline becomes an iOS clone | Apple supplies system-quality evidence; Android retains semantic parity and 48dp interaction targets |
| Historical files silently regain authority | Classify every search hit as active, superseded history, or prohibited-pattern language |
| Reference set becomes a mixed mood board | One declared role and one forbidden-copy boundary per reference |

## Verification and stop condition

- Run a repository conflict search for `주황|orange|코발트|cobalt|#315CEA|#D97706|Quiet Precision`; no result may remain an unclassified active contradiction.
- Diff the seven protected product invariants before and after migration.
- Validate both viewports, all appearance/accessibility states, and the 4/5 three-second comprehension threshold.
- Confirm every literal candidate color is labeled `provisional` until its evidence record passes.
- Stop before product implementation. This planning workflow is complete when the PRD and test spec exist and the Critic verdict is APPROVE.

## ADR

**Decision:** adopt a hybrid contract-first migration. Canonicalize the input-first, pastel-orange-led semantic direction and two-sided tests now; approve literal tokens after evidence.

**Why:** it reconciles the newer product decision with active authority, prevents executors from following contradictory rules, and avoids premature palette lock-in while no active mobile code exists.

**Rejected:** prototype-first as the governing workflow, because it leaves active review criteria contradictory; cobalt retention, because it reopens a resolved decision; simultaneous React Native implementation, because validated design evidence is a prerequisite.

**Consequences:** six active artifacts require coordinated visual-clause migration; historical captures remain but are not positive references; exact color values remain candidate tokens until approval.

## Follow-up staffing and launch hints

Available relevant agent types: `explore`, `researcher`, `designer`, `executor`, `test-engineer`, `verifier`, `architect`, `critic`, `code-reviewer`, `writer`, and `git-master`.

- **Preferred `$ralph` lane:** one `executor` at high reasoning owns the sequential authority migration, PRD/test alignment, and verification loop; bring in `designer` and `verifier` reviews at gates. This minimizes shared-file conflicts. Planning gate is satisfied by the PRD and test spec saved beside this plan.
- **Optional `$team` lane:** `executor` (medium) owns `AGENTS.md` and canonical migration; `designer` (high) owns `DESIGN.md`, evidence matrix, and prototype specification; `test-engineer` (medium) owns subordinate test artifacts; `verifier` (high) owns conflict/invariant/accessibility evidence. Do not let lanes edit the same file concurrently. Launch through `$team` in the App-safe workflow, or under OMX CLI with a prompt such as `omx team 4:executor "execute .omx/plans/ralplan-startio-design-system-reset.md with file ownership and verification gates"`.
- **Team verification path:** lane-local checks → integration diff → conflict search → invariant audit → `$visual-verdict` → accessibility/adaptive checks → moderated 5-user result → final `verifier` sign-off.

Goal-mode suggestion: use `$ultragoal` by default for durable end-to-end migration and evidence tracking. Use `$autoresearch-goal` only if approved-reference evidence remains materially incomplete. `$performance-goal` is not relevant until an executable React Native prototype exists.

## Consensus changelog

- Planner identified 13 visual/decision-state conflicts and separated compatible functional contracts.
- Architect corrected authority precedence, steelmanned prototype-first, narrowed the `AGENTS.md` edit, and converted the approach to hybrid contract-first with provisional literals.
- Critic approved the revised plan and requested only non-blocking polish; the final selects a separate dated visual-decision addendum and tightens the non-goal citation.
