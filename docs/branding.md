# Al-Tayyibat approved brand assets

The brand keeps the existing Arabic-first olive/gold/cream palette, IBM Plex
Arabic/Mono typography, hard borders and offset shadows. The approved raster mark
is used faithfully; it has not been traced, redrawn or recolored.

## Sources and runtime files

| Supplied file | Untouched repository source | Production derivative |
| --- | --- | --- |
| `Golden Arabic-Style Olive Emblem.png` | `assets/brand/mark-approved.png` | `public/brand/mark.png` |
| Same approved mark, authorized for compact icon use | Same source | `public/brand/icon.png` |
| `Seated Middle-Aged Man in Black Suit.png` | `assets/doctor/secondary-approved.png` | `public/images/doctor/secondary.webp` |

The supplied identity board and two asset sheets are reference material, not
production logos. Their original bytes are archived locally in the ignored
`newasset/phase-3-references/` directory and are excluded from the repository and
Pages build. The two approved standalone sources are intentionally versioned for
provenance and reproducible processing; they are outside `public`.

Rebuild derivatives with `node scripts/prepare-brand-assets.mjs`. It computes the
strict nonzero-alpha bounds, removes only fully transparent outer margins, scales
the navbar mark to fit 256 px and centers the same artwork in a 512 px icon with
clear space. The portrait is trimmed to 1128 × 1094 px and encoded as lossless
WebP without resizing or retouching. No visible source content is cropped.

Current production files:

- Mark: 256 × 209 px PNG, 16,898 bytes.
- Icon master: 512 × 512 px PNG, 48,722 bytes, transparent square.
- Editorial portrait: 1128 × 1094 px lossless WebP, 696,012 bytes, transparent.

Source SHA-256 values for provenance (not frozen validator requirements):

- Approved mark: `B7B5CAF26E03BF71A2B9837FFA13D7B7236977A8ECA9E9AC0B72BA8871EBCF46`.
- Approved portrait: `270DD8A005A067DFCDE4D2175B9CA4BEA154B2D403FC573A3DF6E72EF32400A2`.

## Component usage

`src/config/brand.ts` owns mark/icon paths, intrinsic dimensions and display sizes.
`BrandMark` uses the same transparent PNG in both themes, reserves a 36 px
navigation/footer square, and uses the existing surface token and 4% clear space.
It is decorative beside the brand name; the home link supplies its accessible
name and has a 44 px minimum touch height. Failed loading retains the existing
text fallback in the same space. The favicon path is injected from the same
registry by Vite. No manifest, service worker or icon export family is added.

The canonical icon is reviewed at 16, 32, 48, 192 and 512 px. At 16 px the gold
silhouette is the principal recognition cue; fine olive veins and fruit detail
cannot be individually resolved. Preserve the approved artwork. Any later tiny
favicon simplification requires approval rather than automatic tracing/recoloring.

`src/config/doctor-assets.ts` owns the editorial portrait and its meaningful Arabic
alt text. The protected primary stays in the homepage hero and Doctor header.
The approved cutout anchors the lower system/biography block and Doctor timeline.
It uses its intrinsic aspect ratio, `contain`, lazy loading and async decoding.
The olive editorial surface supports the black clothing; the full seated pose
and chair remain visible. Text stays HTML. The two portraits serve distinct
sections rather than sitting beside one another.

## Preservation and checks

Never overwrite `public/images/doctor/portrait.jpg` or
`assets/doctor/secondary-original.jpg`. The latter is the unedited source, distinct
from the approved derivative. Both hashes remain enforced by `validate:images`.
The validator also checks configured runtime paths, formats, dimensions, alpha,
square icon shape and byte budgets. A legitimate approved update can replace its
source and update the registry; runtime branding bytes are not frozen by hashes.

Run typecheck, validate, build and `npm run qa:browser` before publishing changes.
The responsive suite covers 390, 430, 768, 820, 1024, 1280, 1440 and 1920 px in both
themes, hero search/doctor placement, guide CTAs, both portraits and reduced motion.
`browser-brand-assets.mjs` captures actual icon sizes and verifies reserved layout
while new image responses are delayed. QA output belongs in ignored `output/`.
