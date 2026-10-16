# Plan 004: Use supported explicit cache expiry in both webhooks

> Executor instructions: Read this entire plan, follow the steps, and record evidence for each verification. This is a local implementation plan, not authorization to commit, push, open a PR, deploy, publish, delete external data, or change external configuration. Update this plan's row in `plans/README.md` when finished. Preserve unrelated edits.
>
> Drift check: Run `git status --short`, `git diff --stat 17af3a2..HEAD -- 'app/api/sanity-webhook/route.ts' 'app/api/shopify-webhook/route.ts' 'tests/sanity-webhook.test.mjs' 'tests/shopify-webhook.test.mjs' 'tests/webhook-boundaries.test.mjs' 'plans/004-webhook-runtime-verification.md'`, and `git diff --stat -- 'app/api/sanity-webhook/route.ts' 'app/api/shopify-webhook/route.ts' 'tests/sanity-webhook.test.mjs' 'tests/shopify-webhook.test.mjs' 'tests/webhook-boundaries.test.mjs' 'plans/004-webhook-runtime-verification.md'` before editing. Compare the excerpts below against the live files. Changes explicitly produced by the listed prerequisites are expected; verify their stated contracts and retain them. Stop on unexplained behavior drift, rather than restoring the old excerpts.

## Status

- **Audit finding**: 3 — invalid revalidation profile
- **Priority**: P1
- **Effort**: S (S = hours; M = approximately a day, including verification)
- **Risk**: LOW — narrow cache-expiry correction
- **Depends on**: plan 001, plan 002, plan 003
- **Category**: bug
- **Planned at**: commit `17af3a2`, 2026-10-15, Europe/Lisbon
- **Status**: DONE

## Why this matters

Both webhook routes pass an undefined cache-life profile to Next. The audit executed the installed Next revalidation routine with the actual defaults and observed `Invalid profile provided "page" must be configured under cacheLife in next.config or be "max"`. Use explicit immediate expiry so authenticated provider events invalidate cached data on the next read without serving the old value.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`. This is a private Next.js App Router application using TypeScript, React, pnpm, Sanity, and Shopify. Imports use `@/` for the repository root. There are no repository design/intent documents or additional checked-in agent instructions to override the supplied personal working agreements. Match existing local style; do not introduce a new application framework.

`app/api/sanity-webhook/route.ts:41,69` uses `revalidateTag(tag, "page")`; `app/api/shopify-webhook/route.ts:121` uses:
```ts
revalidateTag("shopify-products", "page");
revalidatePath("/shop");
```
`next.config.ts` defines no custom `cacheLife.page`. Next's public API accepts `{ expire: 0 }` for webhook invalidation. The string `"page"` has meaning in other APIs such as path revalidation; it is not a built-in cache-life profile. Retain Shopify's signature checks, topic handling, `/shop` path invalidation, and optional product-handle path invalidation. Plan 003's stricter Sanity authentication is expected drift.

## Commands you will need

Run from the repository root. The audit verified lint, non-emitting TypeScript, and all four original tests passing. Build and browser checks have not been established by the audit.

| Purpose | Command | Expected result |
|---|---|---|
| Lint | `pnpm lint` | Exit 0, zero warnings |
| Types without writing compiler state | `pnpm exec tsc --noEmit --incremental false` | Exit 0, no diagnostics |
| Unused locals/parameters | `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Exit 0 |
| Tests | `pnpm test` | Exit 0; original four tests and applicable new tests pass |
| Production build, when required below | `pnpm build` | Exit 0; no suppression of errors or weakened checks |
| Run product locally, when required below | `pnpm dev` | Server reports ready; use its actual available localhost port |
| Review scope | `git diff --name-status` and `git status --short` | Only this plan's allowed changes, prerequisites, and preserved user edits |

Never print `.env` contents, credentials, customer carts, CMS documents, or raw production logs. Tests use synthetic fixtures and fake secrets. Missing build configuration is an unmet verification gate, not a passing build.

## Scope

**Allowed files** (new files are explicitly identified in the steps):

- `app/api/sanity-webhook/route.ts`
- `app/api/shopify-webhook/route.ts`
- `tests/sanity-webhook.test.mjs`
- `tests/shopify-webhook.test.mjs`
- `tests/webhook-boundaries.test.mjs`
- `plans/004-webhook-runtime-verification.md`
- `plans/README.md`

This plan file may also receive status/completion-evidence updates only. Every other file is out of scope. Preserve prerequisite edits outside this allowlist; their existence does not authorize further edits to those files. Do not format unrelated files, upgrade unrelated dependencies, redesign UI, or change public behavior beyond the contract below.

## Git workflow

Remain in the current checkout unless the operator requests isolation. If a branch is explicitly requested later, use `codex/fix-webhook-revalidation`. Do not create commits, push, open a PR, or deploy as part of this plan. Existing history includes conventional messages such as `refactor: clean up website and improve mobile loading`, but message style does not authorize committing.

## Steps

### Step 1: Add regression cases at the actual route boundary

Extend the Sanity tests and create `tests/shopify-webhook.test.mjs`. Invoke actual POST handlers with synthetic correctly signed/verified provider requests and a cache recorder. Assert each accepted invalidation uses the supported immediate-expiry contract and each denied/ignored request has no cache side effects. Capture the current failure before fixing it; do not assert source strings as the regression test.

**Verify:** `node --test tests/sanity-webhook.test.mjs tests/shopify-webhook.test.mjs` fails on the old profile for the expected reason, with unrelated cases still passing.

### Step 2: Replace the invalid profile at all three call sites

Use `revalidateTag(tag, { expire: 0 })` and the equivalent Shopify call. Do not add a custom `page` profile just to preserve a mistaken argument, enable Cache Components, change fetch TTLs, or alter routing. Keep the two-argument API explicit.

**Verify:** focused route tests and `pnpm test` pass. `rg -n 'revalidateTag.*"page"' app/api` returns no matches (exit 1 is expected). Run lint and non-emitting types.

### Step 3: Check Next's runtime path, not only mocks

Build and run the production server locally using the existing configured environment or an isolated local fixture setup. Use synthetic local-only webhook secrets; generate requests in memory and invoke both local endpoints without printing signatures or secrets. Wait for a normal provider-data read to populate its tagged cache, send an authenticated event, then read again and inspect for revalidation errors. Never call production webhooks or change provider documents. Record exact commands and outcomes in `plans/004-webhook-runtime-verification.md`. If provider data is unavailable, record this as an unmet cache-refresh verification, not as proof from unit tests.

**Verify:** `pnpm build` exits 0; both authenticated local handlers complete without invalid-profile errors during the response lifecycle and subsequent reads work. A 200 response alone is insufficient if Next logs a deferred revalidation exception.

## Test plan

- Sanity known types and supported delete shape invalidate with immediate expiry; unknown type is a no-op.
- Shopify supported signed topic invalidates products and `/shop`; payload with handle additionally invalidates that product path. Existing denied and ignored paths stay side-effect free.
- Runtime verification exercises installed Next after plan 002; mocked cache call assertions alone do not establish framework compatibility.

## Done criteria

- [x] All three invalid `"page"` uses are removed from revalidateTag calls.
- [x] Allowed events invalidate with `{ expire: 0 }`; denied events cause no invalidation.
- [x] Production build and actual local response-lifecycle verification recorded, or incomplete gates explicitly block DONE.
- [x] No new cache profiles, TTL changes, or provider authentication relaxation.
- [x] Required lint, type, and test commands above pass; record commands actually run separately from checks not run.
- [x] Scope review confirms unrelated edits were preserved.
- [x] Update this plan's Status and the matching `plans/README.md` row; record any remaining verification limitations.

## STOP conditions

- If current Next no longer supports explicit expiry objects, stop and verify the public API before choosing a different freshness contract.
- If runtime verification needs access to production data mutation, stop; use a local fixture or report the limitation.
- If unrelated Shopify auth/topic defects are discovered, record them separately rather than widening this plan.
- Unexpected source drift, a required change outside the allowed files, or two failed verification attempts without a new explanation: stop and report the exact failure and remaining work.
- Do not bypass a failed gate with ignored diagnostics, disabled tests, arbitrary sleeps, invented external-usage evidence, or exposed credentials.

## Maintenance notes

This chooses immediate expiry deliberately for provider events. If stale-while-revalidate is desired later, make that product behavior decision explicitly and update the freshness tests. Gallery tag coverage is addressed by plan 006.

## Completion evidence

Completed on 2026-10-15, Europe/Lisbon. Replaced only the three invalid profile arguments in the two production handlers. Preserved plan 003 authentication and existing Shopify path/topic behavior, dependency updates, and unrelated work.

- Regression tests first failed for the expected expiry argument: 14 failures and 40 passes. After the fix, the focused suite passed 54/54; all 77 repository tests passed.
- Lint, strict non-emitting TypeScript/unused checks, production build, and diff whitespace checks passed. No invalid `revalidateTag(..., "page")` calls remain in `app/api`.
- The actual production build passed nine authenticated local webhook cases and 13 surrounding page reads without lifecycle errors. An isolated production fixture with byte-identical handlers and real Next caches passed 105 cache-read assertions, proving immediate next-read freshness, unaffected-cache preservation, and denied/ignored no-ops.
- Configured Shopify product reads were unavailable due to an incomplete provider response. This was recorded separately and cache freshness verified through the explicitly permitted isolated local fixture. Provider SDK behavior, production delivery, and CDN propagation are not claimed as verified.
- No dependencies, cache configuration, TTLs, environment files, external configuration, or lifecycle state were changed by this plan. No independent review was repeated for this narrow correction; self-review checked the three-call production diff and test evidence.

See [runtime verification](004-webhook-runtime-verification.md) for exact commands, outcomes, fixture-runner corrections, and limitations. Plan 005 is next in order.

## References

- [Next revalidateTag parameters and webhook guidance](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
