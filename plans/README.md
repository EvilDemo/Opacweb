# Implementation plans

Prepared with the improve skill on 2026-10-15, Europe/Lisbon, against commit `17af3a2`. These are implementation specifications only: no application code, dependencies, tests, public assets, environment settings, or external systems were changed while preparing them.

Follow-up plans 011–015 were added on 2026-10-16 after final review, against the same HEAD plus the existing audit/WebGL working-tree changes. Their current statuses are tracked below alongside the original completed series. The follow-up planning pass changed only files under `plans/`; later implementation evidence is recorded separately.

## Execution order and status

The plan number is execution order; the Finding column preserves the original audit numbering. Start with test foundations, then patch runtime dependencies, then behavior fixes, then cleanup. Dependency patching is urgent: plan 002 may proceed independently if plan 001 becomes a substantial blocker, but must still run the existing suite/build/product gates; document the deferred tests explicitly.

| Plan | Original audit finding | Outcome | Priority | Effort | Depends on | Status |
|---|---|---|---|---|---|---|
| [001](001-test-critical-boundaries.md) | 6 — critical behavior lacks coverage | Establish tests for server boundaries and checkout | P1 | M | — | DONE |
| [002](002-patch-runtime-dependencies.md) | 1 — vulnerable runtime dependencies | Patch the affected Next.js and image-processing runtimes | P1 | M | 001 recommended | DONE |
| [003](003-verify-sanity-webhooks.md) | 2 — Sanity signatures are not verified | Authenticate Sanity webhook bodies before processing | P1 | M | 001, 002 | DONE |
| [004](004-fix-webhook-revalidation.md) | 3 — invalid revalidation profile | Use supported explicit cache expiry in both webhooks | P1 | S | 001, 002, 003 | DONE |
| [005](005-preserve-cart-on-errors.md) | 4 — cart replacement on any add failure | Preserve existing carts on transient mutation failures | P1 | M | 001, 002 | DONE |
| [006](006-invalidate-picture-galleries.md) | 5 — gallery cache tags do not match webhook tags | Invalidate gallery data with its picture document | P1 | S | 001, 002, 003, 004 | DONE |
| [007](007-align-search-metadata.md) | 7 — stale sitemap host and nonexistent about route | Align crawler metadata with current canonical routes | P2 | S | 001 | DONE |
| [008](008-share-commerce-policy.md) | 8 — duplicate commerce interfaces and cookie drift | Share commerce policy while retaining public endpoints | P2 | M | 001, 002, 005 | DONE |
| [009](009-remove-unused-exports.md) | Cleanup — unused exports | Remove confirmed unused exports and duplicate configuration | P3 | S | 001, 005, 008 | DONE |
| [010](010-review-stale-assets.md) | Cleanup — stale assets | Remove stale public assets only after usage is resolved | P3 | M | 002 | DONE |
| [011](011-preserve-cart-display-on-refresh-errors.md) | Final review 1 — transient reads display an empty cart | Preserve the last cart snapshot and show retryable read errors | P2 | M | 001, 005, 008 | DONE |
| [012](012-validate-product-query-responses.md) | Final review 2 — SDK product errors become false 404s | Validate product query responses before interpreting absence | P2 | M | 001, 008; after 011 by requested order | DONE |
| [013](013-repair-footer-about-link.md) | Final review 3 — footer About targets a missing page | Point About to the existing Us page and preserve its submenu | P2 | S | 007, 009; after 012 by requested order | DONE |
| [014](014-remove-remaining-unused-code.md) | Final review — remaining unused helpers/UI exports | Remove confirmed dead declarations and narrow named module exports | P3 | S | 009, 011–013 | DONE |
| [015](015-clean-up-vulnerable-dependencies.md) | Final review — residual dependency advisories | Patch compatible vulnerable paths and document required migrations | P1 | M | 002; after 011–014 with regression gates | DONE |
| [016](016-security-and-drawer-verification.md) | Follow-up security and accessibility | Patch remaining vulnerable paths and describe the cart drawer | P1 | M | 015 | DONE |
| [017](017-bun-migration-verification.md) | Separate package-manager migration | Preserve the verified graph and permissions with Bun, retaining Node runtime | P2 | M | 016 | DONE |

Status values: TODO, IN PROGRESS, DONE, BLOCKED (with concrete reason), REJECTED (with rationale). Update the matching plan's Status field together with this index. Plan creation does not mean implementation or runtime verification has happened.

## Dependency notes

- 001 establishes deterministic server-boundary/checkout tests with the existing Node test runner. Each fixing plan owns its regression cases; do not codify the known bugs as desired behavior.
- 002 patches Next/sharp and validates the actual runtime before interpreting downstream cache behavior. Keep Next and its ESLint config aligned and verify nested native decoder resolutions.
- 003 directly declares Sanity’s raw-body verifier dependency and authenticates before parsing, then 004 makes invalidation work. Both touch the Sanity route sequentially.
- 004 repairs unsupported expiry profiles. 006 then adds the shared `pictures` tag to galleries; it does not need another webhook rewrite.
- 005 creates a shared conservative add operation for action and REST adapters. 008 reuses it and aligns remaining cookie policy while retaining endpoints.
- 007 is independent of cart/webhook behavior once 001's test loader exists.
- 009 follows 005/008 so newly needed exports are retained. Remove only candidates still lacking real consumers.
- 010 requires a patched runtime for meaningful built-product checks; it can otherwise proceed after behavior work without code overlap. External/CMS usage remains a per-file evidence gate.
- Follow-up execution order is **011 → 012 → 013 → 014 → 015**, as requested: the three behavior fixes, then unused code, then dependency cleanup. Priority labels do not override that selected sequence.
- 011 fixes the client display/read-error boundary while preserving completed server recovery, cookies, mutation serialization, and checkout rules. Successful null still clears a cart; a failed read preserves its last successful snapshot.
- 012 applies SDK failure/absence discipline to product handle/list reads without changing public response envelopes, queries, mappers, or cache policy. 011 is an ordering predecessor, not a technical dependency.
- 013 corrects the shared About parent destination to `/about/us`; existing Us/You submenu and sitemap routes remain. It adds no landing page or redirect.
- 014 recomputes consumers after behavior fixes. It can now address the six specifically named unused UI declarations excluded from 009, but must retain any primitive that gains a legitimate caller. Active internal helpers/types are unexported, not deleted.
- 015 first builds a current advisory/path/exposure matrix, then applies exact compatible fixes within existing package majors and tests the completed behavior contracts again. Overrides, major migrations, source/schema adaptations, and expanded build permissions require separate scope; residual advisories must remain explicit.

## Selected implementation decisions

1. Tests stay on `node:test` using the project's installed TypeScript compiler; no runner migration or arbitrary coverage target.
2. Revalidate webhook tags with `{ expire: 0 }` to make the next read fresh. Do not invent a `page` cache-life profile.
3. Recreate an existing cart only after a configured-provider read validates its response envelope, rejects SDK errors, and explicitly confirms null; never turn a transient/ambiguous failure into silent replacement or an automatic add retry.
4. Gallery reads gain the existing `pictures` tag while retaining gallery-specific tags and TTLs. Coarse picture invalidation is an intentional small boundary.
5. Align crawler entrypoints with the currently accepted `opacweb.pt` canonical host. Contrary authoritative deployment evidence is a stop condition, not permission to mass-rewrite URLs.
6. Retain `/api/cart` and `/api/products`; unknown external usage precludes assuming they are dead. Share cookie policy using the active action path's two-day lifetime, with a compatibility gate if contrary consumer requirements appear.
7. Remove only zero-consumer exports after prerequisites. No dependency deletion was justified by the audit.
8. All 18 stale-asset candidates start pending in [the inventory](010-asset-decisions.json). Retention is valid; deletion needs usage clearance or an explicit exact-path owner decision accepting unknown external use. No production retirement/deployment is included.
9. The final review's three behavior findings are pre-existing issues, not regressions attributed to the original audit fixes. Their plans include error, empty/missing, retry, and recovery states with real owning code under test.
10. Follow-up unused-code scope is the explicit candidate table in 014, not a new whole-repository deletion sweep. No unused direct dependency has been established; Sanity peers/native image runtime packages remain unless separate evidence changes that conclusion.
11. Dependency completion means the selected compatible fixes are installed and verified, with each residual path accounted for. It must not be described as a clean security audit while unknown/applicable advisories or separately required migrations remain.

## Baseline evidence and limits

Audit checks passed: `pnpm lint`; `pnpm exec tsc --noEmit --incremental false`; the stricter unused-local/parameter form; `pnpm test` (four tests). Focused in-memory runtime checks reproduced Next's invalid `page` profile exception and cart replacement on a temporary add failure. A registry dependency audit succeeded; scanner counts include conditionally applicable/transitive issues and do not prove deployment exploitation.

Not verified during planning: production build, browser flows, production hosting/native decoder configuration, actual provider webhook configuration, CMS references to public assets, external endpoint consumers, or aggregate asset usage. Each plan identifies the verification it must supply; unavailable evidence must not be reported as a pass. Security/cart/dependency work should receive independent review when practical before a later authorized release. The previous audit used an independent import-reachability helper; these implementation plans were self-reviewed and the security/cache/cart/endpoint/asset boundaries received an independent review. The two blocking findings (verifier parse precedence and trustworthy cart-null evidence) were incorporated; this is plan review, not implementation verification.

## Drift and ownership

Every plan includes a baseline drift check and explicit expected predecessor changes. A predecessor's intended edits are not a reason to restore old code or blindly block a dependent plan. Reconcile the stated contract; stop only on unexplained drift, changed requirements, or scope growth. Preserve all user-owned edits. Authoring these plans does not authorize branch creation, commits, pushes, PRs, deployments, provider changes, or deletion of external data.

## Findings considered and rejected

- Broad component deletion: no wholly unreachable component, hook, library, or type file was found after dynamic imports and framework/config roots were traced.
- Removing `styled-components`, `@sanity/client`, or `sharp` because of few direct imports: rejected; they satisfy Sanity peers or framework runtime requirements.
- Treating `noUnusedLocals` as proof that all exports are used: rejected; exported types/functions need consumer analysis.
- Deleting REST endpoints based on no in-repo fetch call: rejected; public-route consumers may exist elsewhere.
- Bulk public-asset deletion or automatic build-time purging: rejected; static absence does not prove external/CMS disuse.
- Broad UI refactoring, unrelated dependency upgrades, new SEO architecture, or feature work: outside the selected audit scope.
- Reopening asset deletion from local absence alone: rejected. Final review found the same 18 candidates, all retained under completed plan 010 because external usage is unresolved. No new stale-asset implementation plan is needed without new clearance/owner instructions.
- Planning the mobile WebGL activation-label fix again: rejected; it is already implemented and verified after plan 010. That plan's old failure note is historical evidence, not an outstanding behavior plan.
- Treating sparse imports, CLI-only dependency paths, or a lower advisory count as automatic proof of safety/removability: rejected. Plan 015 requires path/API exposure and compatibility evidence.

## Follow-up review baseline and planning limits

Final read-only review on 2026-10-16 passed all **195 tests**, lint, strict non-emitting TypeScript/unused-local checks, production build, asset checker, and whitespace checks. An independent webhook/cart server-boundary review found no actionable regression. A synthetic actual-provider/cart-page probe confirmed last-cart loss in the UI after a failed read; an actual product-module/API composition confirmed error-plus-null becomes 404; local production HTTP checks confirmed Footer About points to `/about` (404) while `/about/us` and `/about/you` return 200.

The source graph review found no wholly unreachable source module after framework roots/dynamic imports were included. Smaller unused helper/UI declarations and unneeded exports remain as named in 014. All 44 public assets were inventoried, no duplicate asset hashes were found, and the same 18 unreferenced candidates remain unchanged at 15,901,818 bytes; no deletion/external-usage clearance was inferred.

The final production dependency scan reported 0 critical, 52 high, 52 moderate, and 10 low entries across 99 unique advisory IDs, unchanged from the post-002 scan; none target Next or sharp. These are dependency findings, not demonstrated production exploits. Plan 015 must refresh advisory/version/path evidence when executed, verify exact candidate versions/peers/engines, and record required out-of-scope migrations.

When authored, plans 011–015 were specifications, not implemented fixes or fresh runtime verification. No broad re-audit, new source/test implementation, install, production build, browser run, provider mutation, or dependency patch was performed while writing those follow-up plans. Subsequent implementation results are recorded below. Production delivery/secrets, actual provider behavior, deployed native dependencies, and external public-URL consumers remain outside the verified evidence.

An independent cold read of 011–015 against their owning code/tests/manifests found no execution blocker. Its cache-recovery clarification was incorporated into 012: each failure/retry pair must reuse identical arguments/cache key and prove a second upstream call. This was plan review only; the reviewer did not implement changes or run verification commands. The primary planning pass also checked local links, plan statuses, scope wording, and whitespace; all new plans were TODO at the end of planning.

## Implementation evidence

- **001 — DONE (2026-10-15):** Added 19 cases across checkout, cart-read, webhook denial, and loader/isolation contracts. All 23 tests pass; lint and strict non-emitting TypeScript/unused checks pass. Production code, dependencies, and original tests unchanged. See [plan 001 completion evidence](001-test-critical-boundaries.md#completion-evidence) for exact commands and limitations.

- **002 — DONE (2026-10-15):** Patched Next/eslint-config-next to 16.3.8 and shared sharp to 0.35.5. Applied the explicitly approved equivalent pnpm build-policy migration. Plain frozen installation, all 23 tests, lint, strict TypeScript, production build, and local page/image checks pass. Independent review found no dependency or permission blocker. No Next/sharp advisories remain in the fresh scan; other transitive advisories and product/deployment limits are recorded in [the validation record](002-runtime-validation.md). Next in order: 003, Sanity webhook authentication.

- **003 — DONE (2026-10-15):** Sanity POST now authenticates the original body with the directly declared public verifier before parsing. Added 44 regression cases; all 67 tests, lint, strict TypeScript, frozen installation, production build, and 11 local production-server HTTP checks pass. Independent security review found no blockers. Provider/server secret matching and production delivery remain unverified; existing cache-profile correction is plan 004. See [completion evidence](003-verify-sanity-webhooks.md#completion-evidence) and [configuration instructions](003-sanity-configuration.md).

- **004 — DONE (2026-10-15):** Both webhooks now use explicit immediate expiry at all three tag call sites, preserving authentication and Shopify paths/topics. All 77 tests, lint, strict TypeScript, production build, nine local production webhook events, and 105 isolated real-cache read assertions pass. Actual Shopify provider reads were unavailable; the permitted local fixture proves cache freshness. See [runtime verification and limitations](004-webhook-runtime-verification.md). Next in order: 005, preserve carts on transient failures.

- **005 — DONE (2026-10-15):** Both add adapters share conservative recovery: one add, one probe, and replacement only after configured-provider success explicitly returns an error-free null cart. Added 68 regressions; all 145 tests, lint, strict TypeScript, production build, and 22 synthetic local production cart requests pass. Independent review found no blockers. Restored installed dependencies to the existing lockfile after React-type drift without changing dependency specifications. Browser/live-provider cart mutations were not exercised. See [completion evidence](005-preserve-cart-on-errors.md#completion-evidence). Next in order: 006, gallery invalidation.

- **006 — DONE (2026-10-16):** Galleries now share the listing's `pictures` tag while retaining gallery-specific tags and existing TTLs. Added 15 regressions; all 160 tests, lint, strict TypeScript, and production build pass. An isolated production fixture passed 30 reads and four webhook requests, proving first-read refresh of both galleries after a picture event and removal of stale deleted-gallery data. Real CDN/provider delivery and browser navigation remain unverified. See [runtime verification](006-gallery-runtime-verification.md). Next in order: 007, crawler metadata.

- **007 — DONE (2026-10-16):** Sitemap and robots now advertise `https://opacweb.pt`. The sitemap covers the ten supported static public routes, replaces nonexistent `/about`, and omits unsupported modification timestamps. All 165 tests, lint, strict TypeScript, and production build pass; actual local crawler endpoints and all ten advertised pages returned 200 with intended output and no redirects. Crawl rules and deployment settings were preserved. See [completion evidence](007-align-search-metadata.md#completion-evidence). Next in order: 008, shared commerce policy.

- **008 — DONE (2026-10-16):** Cart actions and REST share authoritative cookie options and retain conservative add recovery. New REST cookies now match the existing two-day action lifetime; previous cookies are not forcibly invalidated. Public endpoints, methods, envelopes, and ID precedence are retained. All 190 tests, lint, strict TypeScript, production build, local shop/cart/checkout checks, and 22 synthetic cart runtime requests pass. Independent code review found no blockers. External usage remains unknown. See [compatibility note](008-commerce-compatibility.md). Next in order: 009, unused exports.

- **009 — DONE (2026-10-16):** Rechecked all candidates after the commerce fixes and removed seven unused exports, the combined hook's private type, and duplicate `SHOP_CONFIG.SHOPIFY`. Retained `PageInfo`, distinct active cart hooks, shared recovery/cookie policy, core types, and all modules/dependencies. All 190 tests, lint, strict TypeScript, and production build pass. An enabled-shop synthetic browser smoke verified navigation, add/drawer, quantity/count synchronization, full cart page, and removal. The existing drawer accessibility-description warning remains outside scope. See [exact removals and evidence](009-remove-unused-exports.md#completion-evidence). Next in order: 010, stale asset review.

- **010 — DONE (2026-10-16):** All 18 candidates retained unchanged (15,901,818 bytes), with zero removals/pending decisions and zero saved bytes. Local references and limited published CMS matches are absent; external traffic/embed usage remains unknown. Added a read-only audit checker; its modes and 13 isolated scenarios pass. All 190 tests, lint, strict TypeScript, build, 44 asset HTTP checks, six active-media range requests, and controlled browser media/poster checks pass. The existing forced-WebGL mobile activation-label issue is recorded separately. See [asset review and limits](010-asset-verification.md). All ten plans now have recorded completion evidence; no deployment or commit was performed.

- **011 — DONE (2026-10-16):** Cart reads preserve the last successful client snapshot on failure. Page/drawer errors now offer safe inline Retry instead of false emptiness; successful null/empty reads remain authoritative. Added 21 regressions; all 216 tests, lint, strict type/unused checks, production build, and whitespace checks pass. An enabled-shop synthetic browser fixture verified actual optimistic rollback, retained page/mobile-drawer items/count/totals, repeated failure and successful retry, first-load errors, normal updates, and confirmed absence. Counters showed no replacement or automatic mutation retry. Existing drawer-description warning and live-provider/deployment limits remain explicit. See [verification evidence](011-cart-display-verification.md). No commit or deployment occurred.

- **012 — DONE (2026-10-16):** Product queries reject SDK errors and malformed envelopes before interpreting absence or caching success. Only error-free explicit null confirms a missing product; valid mapping, empty lists, pagination, and unconfigured fallbacks remain intact. Added 75 regressions; all 291 tests, lint, strict type/unused checks, production build, and whitespace checks pass. A synthetic local production fixture passed 28 product HTTP requests, including identical-key recovery after SDK/validation failures and subsequent successful list cache hits. Live Shopify was not exercised. See [verification evidence](012-product-query-verification.md). No commit or deployment occurred.

- **013 — DONE (2026-10-16):** Shared About destination now reaches /about/us. Six navigation regressions, desktop/mobile footer/submenu browser checks, seven footer/About route responses, and all 297 tests/lint/types/build/whitespace gates pass. No page/redirect or layout change. See [completion evidence](013-repair-footer-about-link.md#completion-evidence--2026-10-16).

- **014 — DONE (2026-10-16):** Removed seven confirmed unused bodies and narrowed ten further named exports across nine files. Internal helpers/types and every module/asset remain. Consumer review, 297 tests, lint, strict types, build, retained-asset guard and navigation/media/form/synthetic-cart checks pass. Existing drawer-description warning remains explicit. See [exact dispositions](014-remove-remaining-unused-code.md#completion-evidence--2026-10-16).

- **015 — DONE, compatible scope (2026-10-16):** Applied independently reviewed Sanity/Vision/client/styling updates and targeted compatible transitive fixes. Frozen install/hash, 297 tests, lint/types/peers/build/assets, native WebP/AVIF, Studio initialization, browser commerce/navigation/form/3D, 28 product HTTP/cache and six cart HTTP/cookie checks pass. Audit reduced from 114 records/99 IDs to 16 records/IDs (9 high, 7 moderate); zero new high/critical IDs, one new moderate pinned YAML advisory. Five residual tooling families require upstream migration or separately scoped patches; this is not a vulnerability-free graph. See [matrix, evidence and required follow-up](015-dependency-validation.md). No commit, push, PR, provider setting, or deployment occurred.

- **016 — DONE (2026-10-16):** Fixed remaining dependency triggers with three reviewed scoped overrides and two local package patches; cart now has a real accessible description. Clean/frozen pnpm installation, 311 tests, lint/types/peers/build/assets, 11 Sanity HTTP and 28 product/cache checks pass. Two raw registry advisory records remain for locally patched packages; no suppression. See [security and drawer evidence](016-security-and-drawer-verification.md). Bun migration follows separately.

- **017 — DONE (2026-10-16):** Separate Bun 1.4.3 migration preserves all 1,458 security-baseline versions/integrities, patches, and lifecycle permissions; Node 24 remains runtime. Clean/frozen installs, 313 tests, lint/types/build/assets, Sanity/Shopify HTTP/browser checks and the exact Vercel installer pass. Repository Vercel config is prepared; remote deployment is unverified. Bun installer environment opt-out bug and two patched registry records are explicit. See [migration and Vercel evidence](017-bun-migration-verification.md).
