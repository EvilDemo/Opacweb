# 017 — Bun package-manager migration

Status: DONE — separate from security/accessibility change 016, verified 2026-10-16. No commit, push, PR, deployment, remote Vercel change, real cart/order mutation or provider setting change occurred. All earlier audit work remains.

## Boundary and preservation

The security/drawer fix was implemented, independently reviewed, and verified under pnpm first. When the broader Bun audit exposed three existing development-tool records, the security baseline was amended and reverified under pnpm before the final import. See [security phase evidence](016-security-and-drawer-verification.md).

Bun 1.4.3 imported the final pnpm lock through `bun pm migrate`. Every one of the **1,458 unique package/version pairs and registry integrity hashes matches** the corrected pnpm baseline. Direct dependencies/devDependencies retain exactly their prior names and ranges. Both local patch files retain identical SHA-256 hashes. Parent-scoped overrides and patch metadata migrated into package.json; no additional package was added or upgraded during final migration. The prior pnpm lock/policy and canonical graph are preserved at /private/tmp/opac-security-bun/security-phase for independent comparison.

Removed pnpm-lock.yaml and pnpm-workspace.yaml after verifying their Bun replacements. bun.lock is the sole active lockfile. Bun's isolated linker retains strict dependency boundaries. Explicit trustedDependencies lists exactly @tailwindcss/oxide, esbuild and sharp, replacing Bun's default list; unrs-resolver remains excluded. No trust-all or ignore-scripts workaround was used.

Node 24 remains the application runtime. dev/build/start/ESLint/TypeScript explicitly invoke node; test already uses Node's test runner. bunfig.toml sets run.bun=false. A live server launched through bun run start recorded Node v24.15.0 and bunRuntime=false; evidence is node-runtime-evidence.jsonl in the temporary directory. No Bun runtime setting was added to Next or Vercel Functions.

The asset audit skips bun.lock just as it skipped the old lockfile. The Shopify diagnostic's development command now uses bun run dev. Historical plans retain their original pnpm commands as execution evidence; README.md contains current instructions.

## Install and policy verification

A genuinely clean plain Bun install and a second genuinely clean frozen install succeeded. Prior node_modules directories were moved to owned temporary backups rather than deleted. Final manifest/lock/config/patch SHA-256 hashes match before and after the frozen install and after the exact Vercel bootstrap command. Fresh install sources were checked again against the corrected pnpm package/integrity set.

Two durable tests in tests/package-manager.test.mjs verify behavior using isolated local fixtures: lifecycle scripts execute only for the preserved allowlist while unrs-resolver and default-trusted node-sass stay blocked, including a fresh frozen install; and bun run invokes Node while leaving application .env loading to Next. Native-package installation may optimize away a sharp fixture script, so the test asserts which scripts may execute rather than requiring every allowed package to run a script. Actual sharp decoding/optimization is independently verified below.

The runtime environment regression checks .env, .env.local and .env.production.local synthetic values: the Node child initially sees none, then Next selects production-local. It uses no real credentials or environment files.

### Known upstream installer environment limitation

The independent reviewer identified Bun's different automatic environment loading. Top-level env=false fixes bun run and preserves Next's existing mode-aware behavior. A separate synthetic install probe showed that **Bun 1.4.3's installer ignores env=false, --no-env-file and --env-file=/dev/null** and still loads .env values into allowed lifecycle processes. This matches [upstream issue 31450](https://github.com/oven-sh/bun/issues/31450), despite newer documentation describing broader opt-out support.

No ineffective flags or environment-file renaming workaround were retained. This is an explicit installation limitation, not a failed application-runtime or build-permission guarantee. The strict lifecycle allowlist remains enforced; installation scripts are trusted code and are not sandboxed from project files. Do not rely on the install-time opt-out for secret isolation. Repository environment files were neither changed nor printed.

## Final gates

| Check actually run | Result |
|---|---|
| bun install (clean node_modules) | Pass |
| bun install --frozen-lockfile (second clean node_modules) | Pass, unchanged manifest/lock/config/patch hashes |
| bun run test | 313/313 passed, no skips |
| bun run lint | Pass, zero warnings |
| bun run typecheck --incremental false --noUnusedLocals --noUnusedParameters | Pass, no diagnostics |
| bun run build | Pass under Node/Next 16.3.8, including 21 static pages |
| node scripts/audit-public-assets.mjs --check --after-removal | Pass, all 18 retained candidates unchanged |
| git diff --check | Pass |
| bun audit --json (full graph, including development packages) | Two raw registry records only: patched braces and patched sprintf; no audit suppression |
| bunx bun@1.4.3 install --frozen-lockfile | Exact Vercel command passed locally; no project/lock/patch hash change |

The two raw findings remain because package versions still overlap their published advisory ranges. Tests resolve through actual owning Sanity modules and prove patched behavior. This is not a claim that registry metadata reports zero vulnerabilities.

Logs and preserved artifacts: /private/tmp/opac-security-bun. Relevant names: bun-final-{clean-install,frozen-clean}.log, bun-{tests,lint,types,build,assets}-final.log, bun-policy-tests.log, bun-audit-final.json, migration-versions.json, bun-final-{before,after}.txt, bun-post-vercel.txt, vercel-install-command.log. Unsuccessful synthetic fixture assertions and the installer environment investigation are retained separately and not presented as successful checks.

## Sanity and Shopify flows

Rebuilt disposable fixtures with the actual current source and Bun-installed dependencies, invoking installed Next with Node directly. No package installation ran through a fixture's symlinked node_modules. Fixture clients use invented SDK values; actual provider settings were untouched.

- **Sanity:** 11 actual production HTTP cases verify signed requests, forged/missing signatures, altered/malformed bodies and missing-secret denial with synthetic secrets. Nine authenticated Sanity/Shopify events and their surrounding page reads also pass through actual handlers and local revalidation. Sanity-backed media/radio pages render loaded responsive images in the browser. Studio hydrates to its existing unregistered-loopback-host connection screen; CorsOriginError remains expected for that local origin. No registration, CORS change, login, schema sync or authenticated content editing was attempted.
- **Shopify products:** 28 production HTTP/cache requests pass again with actual validators, mapper, routes and Next caching: explicit absence stays 404, provider errors stay 500, valid/empty results stay 200, and identical-key failures recover before later successful cache hits.
- **Cart:** Six REST HTTP operations exercise create/add/read/update/partial-remove/final-remove with totals 1→3→3→4→2→0. Cookie policy remains two days, HttpOnly, Secure, SameSite=Lax; final removal expires it. Browser desktop/mobile drawers have actual aria-describedby text and no missing-description warnings. Failed refresh/repeated retry retains both items/count/€60; successful retry clears the warning. Normal quantity update, remove, and add work; add opens the drawer with quantity 3/€60. Closing returns focus to the cart trigger. No checkout was activated.
- **Public/native runtime:** Nine public routes return 200 without redirect. Local image optimization produces WebP and AVIF that installed sharp successfully decodes at the requested width.

Details are in bun-{sanity-http,webhook-events,product-http,main-http}.log and the HTTP-driver evidence JSON under /private/tmp/opac-final-cleanup and /private/tmp/opac-plan-012-runtime-evidence.json. Runtime fixture source boundaries and limitations match phase 016 and earlier records. All owned tabs/servers were closed/stopped and viewport settings reset.

Live customer Shopify mutations, production exploitability/freshness, authenticated Studio editing, deployment-native loading and real form delivery remain unverified. Browser/runtime verification is primary-agent evidence; the independent helper reviewed security and migration/configuration compatibility.

## Vercel compatibility and required configuration

Vercel supports Bun package management and Node 24. Checked current primary documentation: [package-manager detection](https://vercel.com/docs/package-managers), [pinning Bun](https://vercel.com/kb/guide/how-to-pin-a-specific-bun-version-for-vercel-builds), [Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), and [Bun runtime opt-in](https://vercel.com/docs/functions/runtimes/bun). Nested override metadata requires Bun lockfileVersion 3, so relying on an unspecified older Bun version is insufficient.

vercel.json now sets installCommand to bunx bun@1.4.3 install --frozen-lockfile and buildCommand to bun run build. packageManager is bun@1.4.3 and engines.node is 24.x, matching the tested local Node major. No bunVersion/runtime opt-in is set; Next/Vercel Functions continue on Node. The exact install command passes locally.

Keep the Next.js framework preset and existing environment variables. External CI that hardcodes pnpm must switch to the documented Bun commands, and the next Vercel deployment should show the pinned Bun install plus Node 24. There is no linked .vercel directory or repository CI definition; remote dashboard settings were not accessible/inspected and were not changed. No deployment or claim of hosted verification is made.
