# Startio product identity

## Status

- Approval: `historical-reference`
- Source: user-provided `startio_ci_1024px.png`, received 2026-07-24
- Product brand: Startio
- Corporate endorsement brand: Willbyte Inc.
- Historical raster source: `startio-ci-source.png` (1254 × 1254)
- Current production vector source: none (`awaiting-design`)
- Delivery grid: 1024 × 1024

## Historical measured values

- Startio Orange: tonal orange pixels in the historical raster source; not an approved new-CI color
- Wordmark Ink: `#1F1F1F`
- Icon Paper: preserve the white background in the canonical raster source
- UI display size: 44 × 44 logical pixels
- Internal symbol target: 26–28 logical pixels
- Symbol-to-wordmark gap: 12 logical pixels

## Historical files

- `startio-ci-source.png`: untouched user-provided CI reference
- `startio-app-icon.png`: former 1024 × 1024 platform delivery asset
- `startio.ico`: favicon derivative of the canonical raster source

## Current reset state

- CI, header, app-icon, and custom-icon directories are retained but contain no active design result.
- Reference register: `assets/brand/references/README.md`
- Intake checklist: `docs/brand/reference-intake-checklist.md`
- SVG-to-PNG build, validation, contact-sheet logic, and manifest schema remain available in `scripts/`.

The failed 2026-07-27 vector attempt was removed. This directory remains historical reference material and is not an active source of truth.

## Deprecated reconstructions

- The SVG files in this directory are earlier single-S reconstructions.
- They are retained only for change history and must not be used to generate product assets.
- Do not redraw, recolor, crop, sharpen, or otherwise reinterpret the canonical raster source.

## Typography

- Product UI: Noto Sans KR, OFL-1.1
- Product wordmark: not approved for the next design round.
- Willbyte corporate typography and colors remain separate.

## Usage

- Do not recolor Startio with Willbyte Blue.
- Do not add gradients, AI sparkles, checkmarks, rockets, or drop shadows to the master.
- Do not place the Willbyte corporate CI in the Startio app icon.
- iOS app icons use the opaque 1024 × 1024 raster delivery asset; the operating system supplies the corner mask.
