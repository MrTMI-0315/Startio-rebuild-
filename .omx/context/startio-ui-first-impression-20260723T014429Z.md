# Startio UI First-Impression Context Snapshot

- Created: 2026-07-23T01:44:29Z
- Mode: deep-interview / standard
- Context type: brownfield product specification with no active mobile UI implementation
- Full business-plan reference: `/Users/mrtmi/Desktop/Mr_TMI/창업/지원사업 관련 /예비창업패키지 2026/서류/-최종 - 2026년 예비창업패키지 사업계획서(다르마 AI)(v4.0) 제출서류 1(사업계획서) (1).hwp`
- Prompt-safe initial-context summary status: recorded

## Task statement

Clarify the UI direction for the Startio rebuild. The user's proposed way out of the UI↔code circular-reference problem is to prioritize visual comfort and the user's first impression, while treating the business plan as the source for functionality and the core flow.

## Desired outcome

Produce an execution-ready UI intent specification that fixes what the first screen must communicate and how it should feel, without reopening the already-documented P0 feature/core-flow contract.

## Stated solution

Start by making the interface visually comfortable and concentrate on the first impression users receive.

## Probable intent hypothesis

The user wants a stable human judgment layer that can break the design/code feedback loop: once the first-impression promise and emotional quality are explicit, UI decisions can be evaluated against them and implementation can proceed without repeatedly redefining the product.

## Known facts and evidence

### [from-code][auto-confirmed]

- The repository currently contains canonical product documents, reference design images, and brand assets; it contains no active React Native/Expo mobile implementation or reusable active mobile components.
- Four first-screen concepts exist at `docs/reference/design/concepts/startio-concept-01..04-390x844.png` and matching 360x800 variants.
- `DESIGN.md` identifies Startio's desired personality as calm, precise, action-first, non-clinical trust, low-pressure firmness, and engineered clarity.
- The canonical first-screen contract is one-line task input, zero required follow-up questions after valid input, a promise of exactly three small actions, and one dominant CTA.
- The core path is input → plan → sequential timers → completion proof → EXP/history. Safety resolves to `plan_allowed | safe_redirect` before plan generation.
- Orange-centric UI, large rounded-card dashboards, strong shadows, long coaching conversations, diagnostic/therapy claims, and decorative code/terminal aesthetics are prohibited.
- Product tokens currently remain a hypothesis pending prototype testing; the reference direction is neutral background, cobalt primary, restrained borders/spacing, and no image dependency on the first screen.
- The four concepts differ mainly in first-impression framing: (01) direct precision prompt, (02) quiet progress ledger, (03) soft emotional focus, (04) explicit first-action system/process rail.

### Prompt-safe business-plan summary

The canonical documents state that the referenced 2026 business plan supplies the business and market rationale plus the core loop: task input/barrier analysis → three-step action decomposition → timer → proof → EXP/level → behavioral KPIs. It positions the target as adults in their 20s–30s with chronic procrastination or executive-function difficulty, framed as non-medical execution coaching. Calendar, memberships, B2B/institutional tools, sLLM/RAG expansion, clinical research, and aggressive revenue/efficacy claims do not define mobile V1 scope.

## Constraints

- React Native + Expo development build + TypeScript.
- iOS and Android P0 semantics must match.
- No mandatory follow-up after valid task input; exactly three steps.
- One visually dominant action per screen.
- `plan_allowed | safe_redirect` safety contract precedes planning.
- Raw task text, generated copy, photos/paths, email, medical data, and free input stay out of behavioral analytics.
- No account, payment, sync, calendar, push, server photos, or advanced personalization without a separate decision.
- Deep-interview clarifies requirements only; it does not implement.

## Unknowns and open questions

- Which first impression is primary: relief, trust, momentum, being understood, or another quality?
- What observable user reaction would prove that first impression worked?
- Whether the UI should visibly explain the product mechanism or let the single input interaction carry the promise.
- Which of the four concept framings is closest and which elements are explicitly rejected.
- How much warmth versus engineered precision the product should express.
- Whether 'visually comfortable' means low stimulation, familiarity, generous whitespace, soft language, or something else.

## Decision-boundary unknowns

- What UI decisions Codex may make autonomously once the intent is fixed.
- Which brand, type, color, density, copy, and motion decisions still require explicit user approval.
- Which visual qualities are non-goals even if users find them polished.

## Likely codebase touchpoints after handoff

- `DESIGN.md`
- `docs/reference/design/concepts/`
- Future `apps/mobile/` Expo routes, product tokens, and first-screen components
- Prototype/visual acceptance artifacts for 390x844 and 360x800

## Final interview decisions

- The intended first reaction is: `뭔가 막히는 일을 한 번 입력해봐야겠다`.
- The first screen is an immediately writable, AI-home-like input surface rather than an explanatory landing page.
- A single action-specific CTA such as `첫 행동 만들기` distinguishes Startio from a general chat interface.
- Existing Startio concept and core-flow captures are excluded from the approved visual reference set.
- The previous cobalt-primary/orange-warning-only contract is superseded by an internal product decision.
- The new system is pastel-orange-led, including primary brand/action treatment, while avoiding raw saturated orange and flat monochrome treatment.
- Every choice of color, type, spacing, input form, and microcopy must be traceable to an approved reference and current Apple design guidance.
- Approved reference roles: ChatGPT/Claude/Gemini for the input structure; Tiimo for calm executive-function productivity and accessibility; Craft for warm pastel material treatment; Focus for timer/state behavior; Apple HIG and iOS 27 Design Resources for platform guidance.
