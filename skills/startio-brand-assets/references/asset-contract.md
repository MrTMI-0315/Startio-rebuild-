# Startio vector asset pipeline contract

## Sources

- Current state: `awaiting-design`
- Reference register: `assets/brand/references/README.md`
- Intake checklist: `docs/brand/reference-intake-checklist.md`
- Future CI sources: `assets/brand/ci/source/`
- Future header sources: `assets/brand/header/`
- Future app icon sources: `assets/app-icon/source/`
- Future custom icon sources: `assets/icons/custom/source/`
- Historical raster reference: `assets/brand/product/startio/startio-ci-source.png`
- UI/token references: `DESIGN.md`, `apps/mobile/src/design/palette.ts`, `apps/mobile/src/design/tokens.ts`

Do not modify, trace, upscale, or reinterpret the historical raster reference. Do not create any new geometry until reference intake, rights review, role definitions, sizes, and colors are explicitly approved.

## Renderer and checks

Use `sharp` from repository scripts. An approved future round adds `assets/brand/asset-plan.json`; the build script must not infer missing geometry or output specifications. Generated manifests retain source, output, dimensions, format, mode, transparency, SHA-256, renderer, timestamp, and variant fields.

Manifest asset entry schema (the `1×1` dimensions below are schema examples, not an approved asset size):

```json
{
  "name": "approved-asset-name",
  "source": "assets/.../source.svg",
  "output": "assets/.../output.png",
  "width": 1,
  "height": 1,
  "format": "PNG",
  "mode": "RGBA",
  "colorMode": "RGBA",
  "transparent": true,
  "sha256": "...",
  "generatedAt": "...",
  "renderer": "...",
  "variant": "approved-variant"
}
```

Validate PNG signature, declared dimensions, color mode, alpha contract, opacity, nonempty bounds, checksum, manifest coverage, and corruption. Contact sheets are manifest-driven and must use actual raster outputs enlarged with nearest-neighbor sampling.

Manual checks remain required for:

- reference rights, trademark risk, and confusing similarity;
- absence of wordmarks;
- absence of a baked app-icon mask;
- semantic clarity at actual display sizes.
