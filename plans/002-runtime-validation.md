# Plan 002 runtime validation

Baseline: `17af3a2`; work started 2026-10-15 (Europe/Lisbon). Status: DONE; the approved build-policy migration and normal frozen-install gate are complete.

## Selected versions

| Package | Before | Selected | Reason |
|---|---|---|---|
| next | 16.1.1 | 16.3.8, exact | Smallest verified stable Next 16 patch clearing the current Next advisory ranges |
| eslint-config-next | 16.1.1 | 16.3.8, exact | Matches Next; existing ESLint 9 remains compatible |
| sharp | 0.34.5 | 0.35.5, constraint ~0.35.5 | Clears current sharp decoder advisories; Next 16.3.8 accepts ^0.35.4 and resolves to the same patched copy |

Published engines for Next/sharp require Node >=20.9.0; this workspace uses Node 24.21.0 and pnpm 12.11.2. Existing React 19.2.4 satisfies the new Next peer range. No React, Sanity, or package-manager version migration is proposed.

Selected versions were verified against registry metadata and these primary advisory sources:

- [Next AVIF decoder issue](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4), fixed in the selected range.
- [Next image optimization SSRF issue](https://github.com/vercel/next.js/security/advisories/GHSA-cjq9-62q9-8jv4), patch floor 16.3.8.
- [sharp librsvg advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w), patch floor 0.35.5.

## Approved installation policy migration

Before migration, plain installation resolved the patched packages but exited with ERR_PNPM_IGNORED_BUILDS for esbuild/unrs-resolver. The existing pnpm-workspace.yaml used legacy `onlyBuiltDependencies`/`ignoredBuiltDependencies`; pnpm 12 requires `allowBuilds`. An equivalent policy migration was explicitly approved by the user on 2026-10-15 and applied as shown below.

The applied migration preserves the exact existing allow/deny policy:

```diff
-ignoredBuiltDependencies:
-  - unrs-resolver
-
-onlyBuiltDependencies:
-  - '@tailwindcss/oxide'
-  - esbuild
-  - sharp
+allowBuilds:
+  '@tailwindcss/oxide': true
+  esbuild: true
+  sharp: true
+  unrs-resolver: false
```

[Official pnpm policy migration guidance](https://pnpm.io/blog/releases/11.0) confirms that the old settings were removed. No blanket build allowance, disabled security check, or new package permission was added. The approved scope extension is reflected in plan 002’s allowed-file list.

## Verification results

- Registry metadata and before audit saved outside tracked source under `/private/tmp/opac-plan-002-*`.
- Installed Next 16.3.8, matching lint config, and one shared sharp 0.35.5 resolution confirmed by `pnpm list` and `pnpm why sharp`.
- Native sharp loads successfully: libvips 8.18.7, libheif 1.23.5, librsvg 2.63.2 on the local host.
- `pnpm test`: 23 tests passed after the dependency patch and again after the approved frozen installation. Final log: `/private/tmp/opac-plan-002-tests-final.log`.
- `pnpm lint`: exit 0, zero warnings. Log: `/private/tmp/opac-plan-002-lint.log`.
- `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters`: exit 0, no diagnostics. Log: `/private/tmp/opac-plan-002-types.log`.
- `pnpm build`: exit 0 under Next 16.3.8; compilation, TypeScript, page collection, and all 21 generated static pages completed. Log: `/private/tmp/opac-plan-002-build.log`.
- `pnpm install --frozen-lockfile`: exit 0 with the migrated repository policy and no extra flags. Log: `/private/tmp/opac-plan-002-frozen-install-approved.log`. Hash comparison confirmed package.json and pnpm-lock.yaml were unchanged by verification. The existing node_modules directory was retained.
- `pnpm config get allowBuilds`: confirmed the three existing approvals and explicit unrs-resolver denial.

## Advisory scan and residual risk

Fresh production audit before/after: critical 2 → 0; high 69 → 52; moderate 70 → 52; low 14 → 10. The after report contains **no Next or sharp advisory entries**, and independent review found no newly introduced advisory IDs. Reports: `/private/tmp/opac-plan-002-audit-before.json` and `/private/tmp/opac-plan-002-audit-after.json`. These totals include transitive and conditionally applicable findings, not a count of proven production exploits.

Other existing findings remain in Sanity/Studio dependencies and tooling (for example undici through Sanity CLI template validation, Vite through Sanity CLI/build paths, plus lodash, postcss/source-map-js, and other transitive packages). This patch does not establish that all remaining findings are unreachable or harmless; their remediation/applicability is separate scope. No blanket overrides or unrelated upgrades were applied.

## Production runtime smoke checks

Started the built application locally at `127.0.0.1:4173`. The existing configuration has the shop feature disabled. No environment files, production settings, provider data, customer carts, purchases, or credentials were changed.

| Check | Observed result |
|---|---|
| `/`, `/a0ty`, `/cross`, `/media`, `/radio`, `/studio`, `/shop`, `/cart` | HTTP 200; pages rendered without an application-error page |
| `/cross` | Canvas and desktop interaction instructions became visible; the metallic cross rendered in a browser screenshot |
| Home images | Local logo and six allowlisted Sanity images completed with nonzero natural dimensions |
| `/studio` | Studio initialized and displayed its development-host registration boundary for this local origin; editor/authenticated content access was not verified or enabled |
| `/shop` | Expected “Shop Currently Unavailable” state |
| `/cart` | Expected empty cart state |
| `/checkout` without cart | HTTP 307 to `/shop`, also followed and verified in the browser |
| Local WebP input → WebP / AVIF output | Both HTTP 200, matching image content types and nonempty payloads |
| Allowlisted remote JPEG input → WebP / AVIF output | Both HTTP 200, matching image content types and nonempty payloads |

HTTP evidence: `/private/tmp/opac-plan-002-http-checks.json`. Browser inspection observed one audio autoplay denial from the existing unchanged `HomeInteractiveMusic` path, which attempts playback without a gesture; no new application error was observed. No source fix was mixed into this dependency patch. Lazy offscreen media was not treated as failed playback solely from its initial accessibility placeholder.

Not verified: enabled-shop product/purchase flows, real checkout with a populated cart, authenticated Studio editing, deployed host/native-library behavior, or production exploitability. These checks would require different configuration, credentials/host registration, or external mutations and were not performed.

## Independent review and completion

A separate read-only reviewer confirmed manifest/lockfile alignment, expected Next/sharp dependency-tree churn, compatible inspected peer/engine requirements, one shared patched native sharp installation, no old Next/sharp records in the lockfile, no new advisory IDs, and equivalence of the build-script permissions. After user approval and application, the reviewer checked the actual pnpm-workspace.yaml diff and confirmed no widened permissions or blocker. The reviewer did not run the install/build/browser checks; those were performed by the primary agent as recorded above.

**Completion:** the user approved the equivalent migration; the normal frozen installation now passes, along with the final 23-test rerun. Plan 002 is DONE. The patch has not been committed, pushed, or deployed. Product/deployment limitations and residual transitive advisories above remain explicit; completion does not certify them as resolved.
