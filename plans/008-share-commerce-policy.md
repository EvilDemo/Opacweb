# Plan 008: Share commerce policy while retaining public endpoints

> Executor instructions: Read this entire plan, follow the steps, and record evidence for each verification. This is a local implementation plan, not authorization to commit, push, open a PR, deploy, publish, delete external data, or change external configuration. Update this plan's row in `plans/README.md` when finished. Preserve unrelated edits.
>
> Drift check: Run `git status --short`, `git diff --stat 17af3a2..HEAD -- 'app/api/cart/route.ts' 'app/api/products/route.ts' 'lib/shopify/actions.ts' 'lib/shopify/cart-operations.ts' 'lib/shopify/constants.ts' 'tests/cart-actions.test.mjs' 'tests/cart-api.test.mjs' 'tests/cart-operations.test.mjs' 'tests/products-api.test.mjs' 'plans/008-commerce-compatibility.md'`, and `git diff --stat -- 'app/api/cart/route.ts' 'app/api/products/route.ts' 'lib/shopify/actions.ts' 'lib/shopify/cart-operations.ts' 'lib/shopify/constants.ts' 'tests/cart-actions.test.mjs' 'tests/cart-api.test.mjs' 'tests/cart-operations.test.mjs' 'tests/products-api.test.mjs' 'plans/008-commerce-compatibility.md'` before editing. Compare the excerpts below against the live files. Changes explicitly produced by the listed prerequisites are expected; verify their stated contracts and retain them. Stop on unexplained behavior drift, rather than restoring the old excerpts.

## Status

- **Audit finding**: 8 — duplicate commerce interfaces and cookie drift
- **Priority**: P2
- **Effort**: M (S = hours; M = approximately a day, including verification)
- **Risk**: MED — preserve public compatibility and align cookie lifetime
- **Depends on**: plan 001, plan 002, plan 005
- **Category**: tech-debt
- **Planned at**: commit `17af3a2`, 2026-10-15, Europe/Lisbon
- **Status**: DONE

## Why this matters

The application uses server actions, but its REST endpoints remain publicly reachable and may have external callers. Retain those URLs and response envelopes while making cart mutation recovery and cookie policy shared. This removes proven drift without treating absent internal imports as permission to break an external API.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`. This is a private Next.js App Router application using TypeScript, React, pnpm, Sanity, and Shopify. Imports use `@/` for the repository root. There are no repository design/intent documents or additional checked-in agent instructions to override the supplied personal working agreements. Match existing local style; do not introduce a new application framework.

`app/api/cart/route.ts:5–6` locally defines `cart_id` and a 30-day max age. `lib/shopify/constants.ts:7–8` defines the same name and a two-day max age, which the active server actions use. `app/api/cart/route.ts` exports GET/POST/PUT/DELETE; POST/PUT accept a body cartId fallback, DELETE uses cookie ID and comma-separated query line IDs. Keep those compatibility semantics unless an independently justified authorization fix is separately approved.

`app/api/products/route.ts:8–10` parses handle/first/after, then returns `{ product }` or the shared product-page result. Product requests already use shared `getProducts`/`getProductByHandle`; there is no reason to wrap those again. Repository search found no internal fetch calls to these endpoints; external usage was not checked. Plan 005 adds `addItemToCart` in `lib/shopify/cart-operations.ts` and switches both add adapters; retain its conservative expiry recovery.

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

- `app/api/cart/route.ts`
- `app/api/products/route.ts`
- `lib/shopify/actions.ts`
- `lib/shopify/cart-operations.ts`
- `lib/shopify/constants.ts`
- `tests/cart-actions.test.mjs`
- `tests/cart-api.test.mjs`
- `tests/cart-operations.test.mjs`
- `tests/products-api.test.mjs`
- `plans/008-commerce-compatibility.md`
- `plans/README.md`

This plan file may also receive status/completion-evidence updates only. Every other file is out of scope. Preserve prerequisite edits outside this allowlist; their existence does not authorize further edits to those files. Do not format unrelated files, upgrade unrelated dependencies, redesign UI, or change public behavior beyond the contract below.

## Git workflow

Remain in the current checkout unless the operator requests isolation. If a branch is explicitly requested later, use `codex/share-commerce-policy`. Do not create commits, push, open a PR, or deploy as part of this plan. Existing history includes conventional messages such as `refactor: clean up website and improve mobile loading`, but message style does not authorize committing.

## Steps

### Step 1: Characterize adapter compatibility

Extend `tests/cart-api.test.mjs` and create `tests/products-api.test.mjs`. Exercise real handlers with fake provider/cookie boundaries. Capture documented envelopes and statuses, cookie-vs-body ID precedence, valid default/explicit quantities, PUT updates, DELETE behavior, product lookup success/not-found, and paginated-list forwarding. Record the endpoint inventory and unknown external usage in `plans/008-commerce-compatibility.md`. Do not record traffic/customer data or infer retirement from zero internal imports.

**Verify:** `node --test tests/cart-api.test.mjs tests/products-api.test.mjs` passes before the consolidation, aside from new assertions for the explicit cookie-lifetime change below.

### Step 2: Make one cookie policy authoritative

Import `CART_COOKIE` and `CART_COOKIE_MAX_AGE` from `lib/shopify/constants.ts` in the REST route. Preserve the action path's established two-day lifetime, httpOnly, production secure flag, SameSite=lax, and root path; intentionally align the REST setter with it. To avoid duplicated option construction, export a narrowly scoped `getCartCookieOptions()` from the shared constants module if needed and call it only at server adapter boundaries. Do not move cookie writes into the provider operation or change storefront public-token handling. Existing cookie instances simply expire under their previously issued lifetime; no mass invalidation is needed.

**Verify:** action and REST tests assert identical cookie name/options/maxAge in production and development fixture environments. All original envelopes/statuses remain unchanged.

### Step 3: Finish the smallest shared boundary

Verify both add paths still use plan 005's `addItemToCart` operation. Consolidate only remaining duplicated policy needed for those paths; do not route HTTP handlers through server actions, move Next headers/cache dependencies into provider code, or create a generic commerce framework. GET/PUT/DELETE and product endpoints keep their existing owning provider functions. Document that retention is the selected resolution; future endpoint retirement needs actual consumer evidence and explicit lifecycle authorization.

**Verify:** all focused commerce tests and baseline gates pass. `rg -n 'CART_COOKIE_MAX_AGE|addItemToCart' app/api/cart/route.ts lib/shopify/actions.ts lib/shopify/constants.ts lib/shopify/cart-operations.ts` shows shared definitions/use. Build and exercise local shop/cart/checkout routes without making a purchase.

## Test plan

Tests must preserve transport behavior, not merely count shared imports: verify HTTP status/body, action `{ cart, error }`, provider arguments, and cookie effects. Cover missing cookie, expired cart, transient add failure, successful add, update, removal, empty-cart cookie deletion, product not found, and explicit pagination. Avoid codifying unrelated malformed-input quirks as desired behavior; record them separately. Do not remove endpoints or change query/body formats.

## Done criteria

- [x] Existing REST URLs, methods, envelopes, ID precedence, and accepted valid inputs remain supported.
- [x] Action and REST add recovery share plan 005's operation and do not replace a cart on a transient failure.
- [x] Cookie lifetime/options are shared, with the intentional REST change to two days documented and tested.
- [x] No new wrapper around the already shared product data functions; no endpoint deletion.
- [x] Compatibility note records external usage as unknown and separates any future retirement decision.
- [x] Required lint, type, and test commands above pass; record commands actually run separately from checks not run.
- [x] Scope review confirms unrelated edits were preserved.
- [x] Update this plan's Status and the matching `plans/README.md` row; record any remaining verification limitations.

## STOP conditions

- If consumer evidence requires the 30-day REST lifetime or incompatible behavior, stop for a policy decision rather than silently changing either public contract.
- If consolidation reveals a new authorization issue, stop and scope it; do not silently remove body cartId support or change identity ownership here.
- If sharing requires importing server actions from route adapters, use the provider-operation boundary instead; stop if that cannot preserve behavior.
- Unexpected source drift, a required change outside the allowed files, or two failed verification attempts without a new explanation: stop and report the exact failure and remaining work.
- Do not bypass a failed gate with ignored diagnostics, disabled tests, arbitrary sleeps, invented external-usage evidence, or exposed credentials.

## Maintenance notes

Public routes can be entrypoints without repository imports. Keep response compatibility tests when future refactors change provider code. Add strong shared input validation only as an explicitly scoped follow-up if it changes accepted public inputs beyond this consolidation.

## Completion evidence

Completed on 2026-10-16, Europe/Lisbon. Added `getCartCookieOptions()` beside the existing authoritative name/lifetime constants and used it in both add adapters. Newly issued REST cookies now use the existing action policy's two days; all security flags and the root path are preserved. Previously issued cookies are not forcibly changed. Plan 005 recovery remains unchanged and shared; product routes remain unchanged and retained.

- Characterized REST methods, status/body contracts, ID precedence, valid quantities, updates, deletions, product lookup, and pagination before consolidation: 30/30 tests passed. New two-day expectations then produced five expected REST lifetime failures while 39 other cases passed.
- Added 25 cases. After implementation, all 56 focused commerce cases and all 190 repository tests pass, including original checkout/locking and conservative-recovery regressions. Production/development tests load the actual shared constants/helper and assert the same policy for both adapters.
- Lint, strict non-emitting TypeScript/unused checks, production build, and diff whitespace checks passed. Shared-policy/operation reference search confirmed both adapters use the same owning boundaries.
- Actual local production `/shop` and `/cart` returned 200; no-cookie checkout redirected to `/shop`; empty-cart GET and missing-variant POST retained their status/body and caused no cookie writes. A synthetic production fixture passed 22 cart HTTP requests and checked actual cookie headers on both adapters, including `Max-Age=172800` and all security/path attributes. Servers were stopped without a purchase or live cart mutation.
- Independent read-only code review found no blockers and passed all 44 action/cart REST/product REST cases. Compatibility documentation was finished afterward and self-reviewed; independent browser/live-provider verification was not claimed.
- Scope review confirmed only the allowed constants, adapters, compatibility tests/note, and plan status/evidence changed for this task. Earlier cart, webhook, gallery, crawler, dependency, and test work was preserved. No generic commerce framework, product wrapper, input/authorization redesign, endpoint retirement, dependency change, or external lifecycle action was introduced.

See [compatibility inventory and verification](008-commerce-compatibility.md) for exact contracts, commands, the cookie migration, unknown external usage, and limitations. Live provider mutation behavior, interactive browser flows, actual elapsed expiration, and external consumer behavior remain unverified. Plan 009 is next in order.
