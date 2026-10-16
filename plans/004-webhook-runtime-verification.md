# Plan 004 runtime verification

Verified locally on 2026-10-15, Europe/Lisbon, using the installed Next.js 16.3.8. No provider documents, secrets, deployment settings, or external webhooks were modified. All signed requests used synthetic local-only secrets. No secret, signature, or provider document is included here.

## Result

All three webhook tag invalidations now pass `{ expire: 0 }`. Authentication, tag selection, Shopify topic handling, `/shop` invalidation, and optional product-handle invalidation are preserved. No cache-life profiles, cache settings, TTLs, or routing changes were introduced.

The actual application production server accepted all nine supported event cases without invalid-profile or deferred response-lifecycle errors. An isolated production fixture additionally proved first-read freshness and cache-hit behavior using actual Next caching and byte-identical copies of both webhook routes.

## Automated checks

Run from `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`:

| Command | Outcome |
|---|---|
| `node --test tests/sanity-webhook.test.mjs tests/shopify-webhook.test.mjs` before the fix | Expected failure: 14 expiry assertions failed, 40 unrelated cases passed; actual argument was `"page"` rather than `{ expire: 0 } |
| Same focused command after the fix | 54/54 passed |
| `pnpm test` | 77/77 passed, including authentication and denial regressions |
| `pnpm lint` | Passed, zero warnings |
| `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Passed; also covers the non-strict type-check gate |
| `pnpm build` | Passed |
| `rg -n 'revalidateTag.*"page"' app/api` | No matches, expected exit 1 |
| `git diff --check` | Passed |

Tests invoke the actual route handlers. Sanity typed and ID-only delete cases assert the explicit immediate-expiry object at every cache call. Shopify tests cover all four allowed topics with and without a handle, including exact path effects. Denied/ignored cases assert zero side effects. No source-string test substitutes for the behavioral assertions.

## Application production server

Command: `node /private/tmp/opac-plan-004-runtime.mjs application`.

The session-only runner launches the installed `node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 4193` through Node with synthetic secret overrides in the child environment. It waits for Next's readiness message, makes read-only local requests, signs payloads in memory, consumes responses, then stops its server and checks captured lifecycle logs for errors. It performs no arbitrary readiness sleeps.

- Warmed `/media`, `/radio`, and `/shop` with normal HTTP reads.
- Sent correctly signed Sanity events for `pictures`, `video`, `music`, `radio`, and an ID-only deletion. All returned 200 with `revalidated: true`.
- Sent correctly signed Shopify events for `products/create`, `products/update`, `products/delete`, and `inventory_levels/update`, with a synthetic product handle. All returned 200 with `revalidated: true`.
- Performed subsequent page reads: 13 reads in total, all 200. The completed run had no invalid-profile, deferred revalidation, or provider-read error in its server logs.
- Stopped the server after checks.

**Configured Shopify data limitation:** An initial attempt to warm `/api/products` returned 500 because the Storefront SDK response lacked `data`, causing the existing `response.data.products` access to throw. That response is not evidence of a cache-refresh failure or a successful provider-data read. No provider credentials or commerce error handling were changed. The subsequent application run used the existing disabled-shop page; it does not establish Shopify product freshness. The isolated fixture below supplies that cache verification without provider access. Actual provider-backed Shopify reads remain unverified and need separate investigation.

## Isolated cache-refresh fixture

Commands used in this session:

```sh
node /private/tmp/opac-plan-004-runtime.mjs prepare
cd /private/tmp/opac-plan-004-fixture
pnpm build > /private/tmp/opac-plan-004-fixture-build.log 2>&1
node /private/tmp/opac-plan-004-runtime.mjs fixture
```

The temporary fixture uses the existing installed packages through a symlink and a minimal Next application. Its build script is `next build --webpack`; the actual application was separately built with its unchanged `pnpm build`. Both webhook route files were copied byte-for-byte from the implementation. No cache function, verifier, signature checker, route handler, or framework cache implementation was mocked in this fixture.

Its read endpoint uses the same caching mechanisms and tag names as the application: `fetch` with a 3600-second revalidation interval and `pictures`, `videos`, `music`, or `radio` tags, and `unstable_cache` with `shopify-products`. A loopback-only synthetic upstream returns a revision that increments on each actual upstream read. This fixture tests the webhook/cache contract; it does not run the application's provider SDK adapters or establish provider/CDN consistency.

The runner starts the synthetic upstream on port 4195 and the fixture's production Next server on 4194. It checks all five caches after each event:

1. Initial reads populate the cache; repeat reads return the same revision without another upstream read.
2. Wrong signatures for both providers, an unknown Sanity type, and an ignored Shopify topic leave every cache revision and upstream count unchanged.
3. Each Sanity typed event causes the very next read of its affected tag to fetch a new revision. Other tags retain their cached revisions. Repeated reads hit the new cached value.
4. ID-only deletion refreshes all four Sanity tags on their next read, preserving the Shopify cache.
5. Each allowed Shopify event refreshes `shopify-products` on its next read, preserving the Sanity caches.

**Passed: 105 cache-read assertions, nine accepted events, and four denied/ignored events.** Final upstream-read counts were three for each Sanity tag (initial read, typed invalidation, deletion) and five for products (initial read and four allowed-topic invalidations). Both response completion and subsequent reads had no revalidation errors. All fixture servers were stopped.

Two fixture-runner issues were resolved before this passing run: pnpm's script launcher attempted an install against the fixture's symlinked dependency directory, so runtime launches now invoke installed Next directly; a rerun then encountered the previous run's persisted revisions, so the runner preserves the fixture's previous temporary cache under a timestamped name before each fresh run. These were harness failures, not relaxed assertions or product changes. No application cache files were manually removed.

## Evidence and remaining limits

Session artifacts: `/private/tmp/opac-plan-004-runtime.mjs`, `/private/tmp/opac-plan-004-application-evidence.json`, `/private/tmp/opac-plan-004-fixture-evidence.json`, and `/private/tmp/opac-plan-004-*.log`. They are temporary verification artifacts, not shipped application files.

The implementation and evidence were self-reviewed. Independent review was not repeated for this narrow three-call cache correction; plan 003's authentication review remains intact. Production provider delivery, deployed secret matching, actual provider data changes, and CDN propagation were not verified. Gallery tag coverage remains plan 006. No commit, push, pull request, or deployment was performed.

The explicit expiry contract matches [Next's documented webhook guidance](https://nextjs.org/docs/app/api-reference/functions/revalidateTag).
