# Production readiness pass

Local source is authoritative. Audit started 2026-10-01. Catalog baseline: **385 foods**, compatible **116**, conditional **103**, notRecommended **157**, disputed **4**, unknown **5**. Food rules and sources are preserved; only food image properties may change.

## BLOCKER

- No Git repository, CI or publishing configuration initially. Remote inspected and confirmed empty; main initialized and pushed normally. Validation-first CI and HTTPS GitHub Pages deployment succeeded.
- Runtime image URLs assumed a root deployment, breaking the protected portrait and food assets under `/al-tayyibat/`. Deployment-base helper added; portrait bytes preserved.
- Image queue was stale: 63 staged images had not been reconciled. 62 accepted; one staged branded noodle photo rejected. Legacy wrong-subject and branded images quarantined. All 385 foods now have distinct visually reviewed canonical photographs; 221 generated images accepted and five generated attempts rejected/replaced. No missing images or broken references remain.

## HIGH

- Saved JSON could parse successfully with a wrong shape and crash collections. Shared validated storage now tolerates nulls, partial objects, malformed JSON and blocked storage.
- Theme writes could throw when localStorage was unavailable. In-memory operation, cross-tab synchronization and system fallback implemented.
- Single-file plugin defeated lazy route splitting and emitted 1.2 MB HTML (321.84 KB gzip). Removed; ordinary static chunks restore caching and lazy routes.
- Vite 7.3.2/esbuild advisories found by npm audit. Patch versions updated; audit now reports zero findings.
- HashRouter skip link altered navigation; recoverable global/page error boundaries were absent. Accessible skip focus and Arabic recovery controls implemented.
- See [content-observations.md](content-observations.md) for existing semantic inconsistencies. These are not resolved by engineering reference validation; no food reinterpretation performed.

## MEDIUM

- Tablet filters absent at 768–1023 px. Disclosure now remains available until desktop sidebar appears.
- Ingredient matching claimed deterministic results despite fuzzy search; approximate matches were not exposed; summary omitted disputed/unknown. Presentation now explains confidence and includes all statuses without changing matching thresholds.
- Mobile search dialog lacked a visible close control; long identifier rows and terminal headers risked overflow. Responsive wrapping/truncation and explicit dismissal/focus restoration implemented.
- All 385 food cards staggered slowly. Dense explorer uses immediate results; reduced-motion behavior is global and live.
- Light-theme small accent/status text failed contrast on secondary surfaces. Warm token hues retained with contrast-safe values.
- Metadata descriptions could leak from previous routes; social/canonical/robots/sitemap metadata missing. Default description reset and public metadata added. Hash routes are intentionally not listed as separate sitemap URLs.

## LOW

- Development scratch files, Python caches and original staging copies lacked Git exclusions. Useful migration/audit tooling retained; scratch/staging/output files ignored.
- Old stock-photo comment inaccurately described current registry. Replaced with local registry description.
- README lacked release/deployment/validation guidance. Arabic setup, validation, image policy and deployment documentation added.

## Verification and release status

The main agent completed 64 public route/theme/viewport checks (1440 and 390 px, dark and light) and 48 interaction checks on the complete-image release, with zero console errors, runtime errors, failed requests, overflow findings or axe WCAG A/AA violations. Actual screenshots were inspected across every major page, including the final image-backed food detail and populated mobile ingredient checker. Nineteen additional keyboard, tablet, dialog, recipe, reduced-motion, print, ingredient parsing/clear and intentional missing-image fallback checks passed on the live site at 390/820/1440 px. These are engineering checks, not medical-content approval.

A clean `npm ci` succeeded after releasing the Windows preview server's native-module file lock. Catalog snapshot comparison confirms every food field except image paths is unchanged. Final content/reference/search validation, `npx tsc --noEmit` and production build passed; npm audit reports zero vulnerabilities. Image validation confirms 385/385 distinct JPEG files at 1200×900, zero broken references or duplicate assignments/bytes, 77.29 MB total food imagery, and the original protected portrait checksum. Registry cleanup reports zero unused keys or orphan files. Runtime source includes no backend or authentication requirement.

Live site: [Al-Tayyibat](https://yousefe1bana.github.io/al-tayyibat/). Complete-image commit `0c9502a274193f0a05f2452e4acf8e2793e431b1` passed [CI and Pages deployment](https://github.com/YousefE1bana/al-tayyibat/actions/runs/36930956250). All 452 checked public assets match the validated local build by SHA-256, including all 385 food photographs and the protected portrait. Evidence: `browser-qa.json`, `browser-interactions-qa.json`, `live-assets-qa.json`. The final evidence commit changes documentation and QA tooling only; application/build configuration and runtime assets remain those tested here.

Build output: HTML 3.91 KB (1.49 KB gzip), CSS 56.82 KB (10.60 KB gzip), largest catalog chunk 475.42 KB (94.08 KB gzip). Cached route chunks and lazy image loading avoid transferring the entire image collection on entry. No bundle-size warnings were emitted. These measured build sizes are not a Lighthouse score or field-performance claim.

No engineering blocker remains. Existing content inconsistencies and source-provenance gaps are retained as explicit editorial follow-up in `content-observations.md`, without changing catalog rules. HashRouter SEO intentionally exposes one canonical public page; complete per-food search-engine indexing would require a separate prerendering project.

## Hosting decision

GitHub Pages is selected: a public repository is eligible on GitHub Free; HashRouter requires no rewrite service, and GitHub authentication is already available. The build uses `/al-tayyibat/` and a validation-first Actions workflow. Vercel Hobby and Cloudflare Pages can also serve this build (`npm run build`, output `dist`, root base `/`) but add a separate account connection without a benefit needed by this application.

Official references: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/).
