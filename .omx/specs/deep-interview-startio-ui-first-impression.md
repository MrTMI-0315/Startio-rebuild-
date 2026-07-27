# Startio UI First-Impression and Design-System Specification

## Metadata

- Source: deep-interview
- Profile: standard
- Rounds: 7
- Final ambiguity: 0.04
- Threshold: 0.20
- Context type: brownfield product specification; no active mobile UI implementation
- Context snapshot: `.omx/context/startio-ui-first-impression-20260723T014429Z.md`
- Transcript: `.omx/interviews/startio-ui-first-impression-20260723T015449Z.md`
- Status: execution-ready for planning; not an implementation artifact

## Prompt-safe source summary

The referenced 2026 business plan supplies the business rationale and core loop: task input and internal barrier analysis → exactly three actions → sequential timers → completion proof → EXP/history and behavioral KPIs. Canonical repository documents remain the prompt-safe functional source. The full HWP path is preserved in the context snapshot and transcript. Calendar, payments, accounts, B2B tools, sLLM/RAG expansion, and clinical claims do not enter the UI redesign scope.

## Clarity breakdown

| Dimension | Final clarity | Evidence |
| --- | ---: | --- |
| Intent | 0.99 | Desired first reaction is stated in the user's own words |
| Outcome | 0.95 | Input-first screen and single product-specific CTA are fixed |
| Scope | 0.96 | Design-system redesign is separated from functional/core-flow expansion |
| Constraints | 0.98 | Apple/reference traceability, accessibility, platform and product contracts are explicit |
| Success criteria | 0.86 | Observable first-screen comprehension and interaction checks are defined below |
| Brownfield context | 0.99 | Canonical conflict, absent mobile code, and excluded historical visuals are identified |

## Intent

Break the UI↔code circular-reference loop by fixing a human-centered visual promise before implementation. A new user should see the first screen and think:

> 뭔가 막히는 일을 한 번 입력해봐야겠다.

The product should invite one immediate trial without asking the user to understand the mechanism first.

## Desired outcome

Create a reference-backed, Apple-aligned mobile design system whose first screen feels as immediately writable as the initial home screens of leading AI tools, while remaining clearly action-oriented through one CTA such as `첫 행동 만들기`. Extend the same visual system coherently to plan, timer, proof, completion, history, and settings without changing their functional contracts.

## In scope

- Redesign the full mobile visual system around a nuanced pastel-orange direction.
- Define semantic light/dark/high-contrast tokens for background, surface, primary action, text, divider, success, warning, and focus states.
- Redesign typography, spacing, input treatment, control treatment, motion restraint, and microcopy using approved reference evidence.
- Produce the input-first start screen for 390×844 iOS and 360×800 Android.
- Carry the approved system through the existing P0 core flow without changing its meaning.
- Document a decision-evidence matrix that links material visual decisions to Apple guidance and/or an approved product reference.
- Replace outdated color guidance in canonical/design documents through a later approved execution task.

## Out of scope / non-goals

- Existing Startio four-concept and core-flow captures as positive visual references; they may be retained only as history.
- Cobalt/blue as the dominant category or primary-action image.
- Raw saturated orange, flat single-color orange screens, or undifferentiated monochrome treatment.
- Explanatory landing-page copy, stacked promises, multiple examples, dashboards, or competing first-screen focal elements.
- General chat bubbles or a required conversation before plan generation.
- Decorative terminal/code aesthetics, game-like exaggeration, strong shadow stacks, or card-wall layouts.
- Any change to the safe-result contract, three-step core flow, analytics privacy boundary, account/payment/sync scope, or medical positioning.
- Direct implementation during deep-interview.

## Decision boundaries

Codex may autonomously choose exact color values, type scale, spacing values, input geometry, control styling, and microcopy only when all of the following hold:

1. The choice is traceable to Apple HIG/iOS 27 Design Resources or an approved role-specific reference.
2. It preserves the input-first hierarchy and one dominant CTA.
3. It passes accessibility, adaptive appearance, localization, and target-viewport checks.
4. It does not reintroduce a rejected visual or product pattern.

Codex must request a new product decision before changing the approved reference roles, reintroducing blue/cobalt dominance, using raw/flat orange, adding first-screen explanatory blocks, or modifying the functional/core-flow contract.

## Approved reference matrix

| Reference | Approved role | Must not be copied |
| --- | --- | --- |
| ChatGPT, Claude, Gemini current initial home screens | Immediate input affordance, focus, low-friction first action | General-chat conversation model or brand-specific ornament |
| Tiimo | Calm executive-function productivity, soothing color hierarchy, neuroinclusive accessibility | Calendar/planner feature density or diagnostic positioning |
| Craft | Warm neutral/pastel material handling and polished productivity surfaces | Document-editor structure or decorative block density |
| Focus by Meaningful Things (`focusapp.io`, mobile App Store ID `975017240`) | Apple-native timer, state feedback, Live Activity and platform behavior | Its palette or Pomodoro-specific product model |
| Apple HIG + iOS 27 Design Resources | System controls, hierarchy, safe areas, typography, semantic/adaptive color, accessibility | Platform mimicry that breaks Android semantic parity |

Official evidence:

- Apple design principles: https://developer.apple.com/design/human-interface-guidelines/design-principles
- Apple color: https://developer.apple.com/design/human-interface-guidelines/color
- Apple typography: https://developer.apple.com/design/human-interface-guidelines/typography
- Apple layout: https://developer.apple.com/design/human-interface-guidelines/layout
- Apple text fields: https://developer.apple.com/design/human-interface-guidelines/text-fields
- Apple buttons: https://developer.apple.com/design/human-interface-guidelines/buttons
- Apple writing: https://developer.apple.com/design/human-interface-guidelines/writing
- Apple iOS 27 Design Resources: https://developer.apple.com/design/resources/
- Apple 2025 App Store Awards / Tiimo: https://developer.apple.com/app-store/app-store-awards-2025/?page_id=79799
- Craft App Store: https://apps.apple.com/us/app/craft-notes-documents-ai/id1487937127
- Focus by Meaningful Things mobile App Store: https://apps.apple.com/kr/app/focus-timer-for-productivity/id975017240
- Focus by Meaningful Things Mac App Store: https://apps.apple.com/kr/app/focus-deep-work-timer/id777233759?mt=12

## Constraints

- React Native + Expo development build + TypeScript.
- iOS and Android P0 semantics remain identical; Apple is the interaction-quality baseline, not permission to ignore Android conventions.
- `plan_allowed | safe_redirect` is resolved before action planning.
- Valid input produces exactly three actions without required follow-up questions.
- One visually dominant action per screen.
- First-screen input and CTA remain usable without scrolling at 390×844 and 360×800.
- Dynamic Type/equivalent scaling, VoiceOver, TalkBack, reduced motion, safe areas, Korean line breaking, and at least 44pt iOS / 48dp Android touch targets.
- Color never carries essential state alone; custom colors need light, dark, and increased-contrast treatments.
- Raw task text, generated copy, photos/paths, email, medical data, and free input remain outside behavioral analytics.

## Testable acceptance criteria

1. On both target viewports, the writable task input is the first and strongest content element and `첫 행동 만들기` is the only prominent CTA without scrolling.
2. The first screen contains no separate result-promise block, example-chip row, promotional card stack, dashboard, or pre-plan chat.
3. In a moderated clickable-prototype test with at least five representative users, at least four independently identify entering one blocked task as the next action within three seconds, without facilitator explanation.
4. The same participants can state that the CTA produces a first action rather than an open-ended chat response.
5. The palette is recognizably warm/pastel orange but contains no large raw saturated-orange field and no flat single-orange hierarchy.
6. Primary action, text, input, focus, error, disabled, success, and warning states pass WCAG 2.2 AA and remain distinguishable in light, dark, increased-contrast, and color-vision checks.
7. Text remains usable with system text enlargement up to 200%, with input and CTA still reachable and without clipped essential labels.
8. Every material token/component decision has an evidence note pointing to Apple guidance or one approved reference role.
9. No functional P0 contract, safety result, event privacy boundary, or iOS/Android semantic meaning changes as a side effect of visual redesign.
10. Canonical documents no longer claim cobalt primary/orange warning-only after the redesign decision is formally applied.

## Assumptions exposed and resolved

- **Assumption:** A familiar AI home screen automatically explains the product. **Resolution:** It may imply general chat; a single action-specific CTA resolves the difference without added copy.
- **Assumption:** Existing Startio concepts should guide implementation. **Resolution:** Explicitly rejected as visual references.
- **Assumption:** The canonical cobalt contract remains binding. **Resolution:** Explicitly superseded by an internal product decision.
- **Assumption:** Pastel orange can be chosen by taste alone. **Resolution:** Exact treatment must be evidence-backed, adaptive, accessible, and role-based.
- **Assumption:** More references always improve the result. **Resolution:** References are accepted only for a named role to prevent incoherent visual mixing.

## Brownfield evidence and inference

### [from-code][auto-confirmed]

- The repository has no active Expo/mobile UI implementation.
- Current canonical documents prohibit orange-centric UI and set cobalt as Primary; these statements now require an explicit follow-up update.
- Existing Startio captures are reference files rather than implementation contracts.

### [from-research]

- Current Apple guidance emphasizes purpose, simplicity, hierarchy, adaptive semantic color, Dynamic Type, safe-area-aware layout, clear text fields, concise verb-led button labels, and accessible target sizes.
- Apple published iOS/iPadOS 27 Design Resources in June 2026.
- Apple selected Tiimo as the 2025 iPhone App of the Year and described its soothing-color approach as making to-dos calming.

### [from-user]

- First-reaction target, input-first hierarchy, CTA-only differentiation, historical-reference exclusion, orange-led redesign, canonical color supersession, evidence requirement, and final reference matrix approval.

## Planning handoff

Recommended next step: `$ralplan` using this file as the requirements source of truth. Planning should produce:

- an approved design-system PRD,
- a visual/reference evidence matrix,
- a prototype and usability-test specification,
- a canonical-document migration list,
- and an implementation test specification before React Native code begins.

The next workflow must not repeat requirements discovery unless the user explicitly reopens a decision.
