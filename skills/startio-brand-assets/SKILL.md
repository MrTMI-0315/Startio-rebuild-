---
name: startio-brand-assets
description: Reset, intake, build, inspect, and validate Startio brand assets with approved SVG sources and deterministic PNG outputs. Use for reference intake, clean awaiting-design state, SVG-to-PNG rendering, manifests, dimension/alpha/format checks, contact sheets, and visual QA; do not use for generative-image work.
---

# Startio Brand Assets

Maintain the Startio vector asset pipeline and produce assets only after an approved reference intake. Preserve source SVGs, render every raster derivative through the repository pipeline, and fail closed when references, rights, an explicit build plan, or validation evidence are missing.

## Required workflow

1. Read repository `AGENTS.md`, `DESIGN.md`, canonical visual documents, and [references/asset-contract.md](references/asset-contract.md).
2. Locate the active CI reference, product screenshots, tokens, asset catalog, and Expo configuration. Record exact paths.
3. Read `assets/brand/references/README.md` and complete `docs/brand/reference-intake-checklist.md`.
4. Keep owner-provided raster references untouched. If intake or design approval is incomplete, preserve the `awaiting-design` state and do not create geometry or placeholders.
5. After approval, create original SVG paths and an explicit `assets/brand/asset-plan.json`. Never trace, export, or modify an SF Symbol for CI, app icon, logo, or trademark use.
6. Use `sharp` through the repository scripts. Do not use an image-generation model, upscale a PNG, or redraw on top of a raster.
7. Run:

```bash
npm run assets:build
npm run assets:validate
```

8. Inspect generated contact sheets at actual raster sizes enlarged with nearest-neighbor sampling. Persist a structured visual verdict before the next edit.
9. If any automatic or visual check fails, fix the approved SVG or pipeline and repeat both commands. Never report an unrun check as passed.

## Source and output rules

- Use SVG as the only geometry source.
- Apply only the effects and product roles approved in the current design brief.
- Use only explicitly approved output sizes and filenames.
- Declare transparency for every output in the approved asset plan.
- Define size variants in the approved brief; do not infer master, compact, or micro mappings.
- Generate manifests from the actual bytes and include SHA-256, source, renderer, dimensions, mode, transparency, and variant.
- Keep scripts idempotent and deterministic apart from manifest/report timestamps.

## Design boundary

- Use SF Symbols only as a quality reference for simplicity, optical weight, alignment, position, scale, and small-size clarity.
- Do not copy an SF Symbol path, use a confusingly similar silhouette for a trademark, or reproduce Apple product geometry.
- Prefer system symbols in runtime code for generic actions. Create custom assets only for explicitly approved Startio-specific concepts.

## Completion gate

Complete only when:

- the repository either validates as `awaiting-design` with zero active assets or every approved SVG, PNG, manifest, contact sheet, script, and document exists;
- `npm run assets:validate` exits zero;
- active outputs match their manifest dimensions, alpha contract, format, and checksum;
- an active design has a visual review at every approved critical size on light and dark backgrounds;
- manual legal/design checks are explicitly recorded as manual, not automated.
