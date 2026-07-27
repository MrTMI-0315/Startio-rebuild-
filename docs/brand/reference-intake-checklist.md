# Startio brand reference intake checklist

Use this checklist before creating any new CI, header mark, app icon, or Startio-specific product icon.

## 1. Authority and provenance

- [ ] Identify the decision owner for the next design round.
- [ ] Record each reference's original filename, source, received date, and provider.
- [ ] Confirm which single reference is primary.
- [ ] Mark every other reference as structural, form, usage, or secondary.
- [ ] Verify that the categorized copy matches the original file byte-for-byte.

## 2. Rights and restrictions

- [ ] Record ownership and commercial-use permission.
- [ ] Record redistribution and modification limits.
- [ ] Confirm whether the primary reference may be vectorized or only viewed.
- [ ] Complete trademark and confusing-similarity review.
- [ ] Confirm that no platform symbol path, font glyph, or third-party logo will be used as CI geometry.

## 3. Design brief

- [ ] State the intended meaning in one sentence.
- [ ] Define the elements that must be retained.
- [ ] Define the elements that must not be retained.
- [ ] Approve the exact color values or mark them provisional.
- [ ] Define clear-space, optical-center, minimum-size, and background rules.
- [ ] Define whether master, compact, and micro variants are required.
- [ ] Define header, app-icon, and custom-icon roles separately.

## 4. Required source package

- [ ] Primary Option 2 reference at the highest available quality
- [ ] Original vector file, if one exists and its use is authorized
- [ ] Untouched raster original with dimensions and checksum
- [ ] Light and dark usage examples
- [ ] 44px header placement example
- [ ] 1024px app-icon usage and platform constraints
- [ ] Small-size examples at 32px, 24px, and 16px
- [ ] Custom-icon semantic brief, if custom icons remain in scope
- [ ] Explicit avoid examples and known similarity risks

## 5. Production authorization

- [ ] The primary reference and brief are approved.
- [ ] Exact SVG source filenames and output sizes are approved.
- [ ] `assets/brand/asset-plan.json` is reviewed before rendering.
- [ ] No placeholder logo or inferred geometry is present.
- [ ] Build, dimension, alpha, format, checksum, and contact-sheet checks are ready.
- [ ] App integration is assigned to a separate, reviewable change.

Until every applicable item is checked, keep the repository in the `awaiting-design` state and do not generate design assets.
