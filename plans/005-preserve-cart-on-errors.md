# Plan 005: Preserve existing carts on transient mutation failures

> Executor instructions: Read this entire plan, follow the steps, and record evidence for each verification. This is a local implementation plan, not authorization to commit, push, open a PR, deploy, publish, delete external data, or change external configuration. Update this plan's row in `plans/README.md` when finished. Preserve unrelated edits.
>
> Drift check: Run `git status --short`, `git diff --stat 17af3a2..HEAD -- 'lib/shopify/cart-operations.ts' 'lib/shopify/cart.ts' 'tests/cart-query.test.mjs' 'lib/shopify/actions.ts' 'app/api/cart/route.ts' 'tests/cart-operations.test.mjs' 'tests/cart-actions.test.mjs' 'tests/cart-api.test.mjs'`, and `git diff --stat -- 'lib/shopify/cart-operations.ts' 'lib/shopify/cart.ts' 'tests/cart-query.test.mjs' 'lib/shopify/actions.ts' 'app/api/cart/route.ts' 'tests/cart-operations.test.mjs' 'tests/cart-actions.test.mjs' 'tests/cart-api.test.mjs'` before editing. Compare the excerpts below against the live files. Changes explicitly produced by the listed prerequisites are expected; verify their stated contracts and retain them. Stop on unexplained behavior drift, rather than restoring the old excerpts.

## Status

- **Audit finding**: 4 — cart replacement on any add failure
- **Priority**: P1
- **Effort**: M (S = hours; M = approximately a day, including verification)
- **Risk**: MED — affects money-adjacent cart mutation and recovery
- **Depends on**: plan 001, plan 002
- **Category**: bug
- **Planned at**: commit `17af3a2`, 2026-10-15, Europe/Lisbon
- **Status**: DONE

## Why this matters

The action and REST handler interpret every add failure as an expired cart, then overwrite the cookie with a newly created cart. A simulated temporary add failure reproduced a success response with previous items lost. Share a narrow recovery operation that creates a replacement only after a successful provider read confirms the old cart no longer exists.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`. This is a private Next.js App Router application using TypeScript, React, pnpm, Sanity, and Shopify. Imports use `@/` for the repository root. There are no repository design/intent documents or additional checked-in agent instructions to override the supplied personal working agreements. Match existing local style; do not introduce a new application framework.

`lib/shopify/actions.ts:25–36`:
```ts
try {
  cart = await addToCart(existingCartId, variantId, quantity);
} catch (error) {
  try { cart = await createCart(variantId, quantity); }
  catch { throw error; }
}
```
`app/api/cart/route.ts:47–54` repeats the same fallback without preserving the original error. Actions return the established `{ cart, error }` result; REST returns `{ cart }` or `{ error }` with its existing status classes. Preserve those adapter shapes.

`lib/shopify/cart.ts:121–139` currently uses `if (!response.data.cart) return null` and casts the SDK response to a type with required data. The installed Shopify client documents optional independent `data` and `errors` fields, so a malformed/error response can be mistaken for expiry. Tighten this read before trusting it: only an error-free response with an explicitly present `data.cart === null` confirms absence; missing data/cart, non-object data, and any SDK error reject. It also returns null when Shopify is unconfigured, so the recovery operation must guard configuration before probing. `lib/shopify/constants.ts:10–12` exposes `isShopifyConfigured()`. Existing client mutation locking in `lib/cart-state.ts` is intentional and remains unchanged.

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

- `lib/shopify/cart-operations.ts`
- `lib/shopify/cart.ts`
- `tests/cart-query.test.mjs`
- `lib/shopify/actions.ts`
- `app/api/cart/route.ts`
- `tests/cart-operations.test.mjs`
- `tests/cart-actions.test.mjs`
- `tests/cart-api.test.mjs`
- `plans/README.md`

This plan file may also receive status/completion-evidence updates only. Every other file is out of scope. Preserve prerequisite edits outside this allowlist; their existence does not authorize further edits to those files. Do not format unrelated files, upgrade unrelated dependencies, redesign UI, or change public behavior beyond the contract below.

## Git workflow

Remain in the current checkout unless the operator requests isolation. If a branch is explicitly requested later, use `codex/preserve-cart-on-errors`. Do not create commits, push, open a PR, or deploy as part of this plan. Existing history includes conventional messages such as `refactor: clean up website and improve mobile loading`, but message style does not authorize committing.

## Steps

### Step 1: Make the recovery probe trustworthy

Within `lib/shopify/cart.ts`, change only the `getCart` query response type/validation and directly required narrow supporting types. Inspect the installed SDK’s declared response shape; reject a returned SDK errors object before interpreting data. Require non-null object data with an explicitly present cart field. Return null only for `data.cart === null` on an error-free response; reject undefined/missing cart, false/scalar data, or malformed non-null cart data rather than converting them to absence. A valid object still uses the existing `transformCart` mapping; any mapping failure rejects. Preserve the existing unconfigured-provider return for unrelated read callers, but the shared recovery operation below must reject configuration absence before using that read. Do not rewrite create/add/update/remove provider responses in this plan.

Create `tests/cart-query.test.mjs` loading the actual provider module with a stubbed Shopify client. Include valid cart, explicit null, SDK error with null cart, error-only response, missing data, missing cart, undefined cart, malformed non-null value, and rejected request. Assert that only the error-free explicit null returns null. Check a composed recovery scenario with the real getCart implementation and fake SDK response so stubbing the probe cannot hide this contract.

**Verify:** `node --test tests/cart-query.test.mjs` passes with those distinctions; the current loose/falsy check must fail the new malformed/error-null cases before correction.

### Step 2: Define a conservative shared operation and regression tests

Create `lib/shopify/cart-operations.ts` with an internal server-side operation named `addItemToCart` accepting an optional existing cart ID, variant ID, and quantity. It must call the existing cart functions and configuration guard; no cookies, redirects, Next cache calls, or UI imports belong in this module. Create `tests/cart-operations.test.mjs` using the actual module with stubbed provider dependencies. Test the contract below before switching adapters.

**Verify:** `node --test tests/cart-operations.test.mjs` passes and includes a failure case asserting zero replacement calls when the original cart remains valid.

### Step 3: Implement evidence-based replacement

Reject missing provider configuration. With no existing cart ID, create once. With an ID, attempt add once. On add failure, perform one `getCart(id)` probe: if it succeeds and returns null, create one replacement; if the cart exists or the probe fails, rethrow the original add error and do not create a replacement. If replacement creation fails, preserve the original add failure as the adapter's error, following the existing action convention. Never automatically retry the add after an ambiguous failure: it may already have succeeded upstream. Write cookies and revalidate paths only after the operation returns a confirmed cart.

**Verify:** focused operation tests prove call counts, call order, rejection results, no replacement on probe failure, and no mutation retries.

### Step 4: Switch both existing adapters

Replace each broad catch-and-create block with the shared operation. Keep request body interpretation, cookies, response envelopes, error statuses, and action path revalidation otherwise unchanged. Extend `tests/cart-actions.test.mjs` and create `tests/cart-api.test.mjs` for an existing multi-line cart plus transient add failure: both adapters report failure and leave the cart cookie unchanged. Include confirmed-expiry replacement and first-cart success. Retain the REST cookie lifetime until plan 008 deliberately unifies policy.

**Verify:** `node --test tests/cart-query.test.mjs tests/cart-operations.test.mjs tests/cart-actions.test.mjs tests/cart-api.test.mjs` and all baseline gates pass. In a local running product, use a synthetic/provider test cart to confirm add, quantity change, removal, and retry after a simulated failure without placing an order; record anything that cannot be exercised.

## Test plan

Operation matrix: no ID → create; valid ID/add success → existing cart; stock/user error with existing cart → failure without replacement; transport failure/probe finds cart → failure without replacement; probe fails → original failure; probe confirms error-free explicit null → one replacement; SDK errors plus null/missing/malformed data → no replacement; replacement fails → original failure; unconfigured provider → failure without provider calls. Assert cookie write count is zero on failed adapters and one on success. Use a multi-line cart fixture to expose lost-item behavior; do not inspect production carts.

## Done criteria

- [x] Both action and REST add paths use the shared operation, with original response shapes preserved.
- [x] A failed or ambiguous provider request cannot overwrite the existing cart cookie or silently discard existing items.
- [x] Replacement is allowed only after configured-provider success explicitly returns a null cart, with no SDK errors and a valid response envelope.
- [x] Provider-query tests and a composed real-probe recovery case prove malformed/error responses cannot authorize replacement.
- [x] The original cart-state locking tests still pass; no locking or UI redesign is included.
- [x] Required lint, type, and test commands above pass; record commands actually run separately from checks not run.
- [x] Scope review confirms unrelated edits were preserved.
- [x] Update this plan's Status and the matching `plans/README.md` row; record any remaining verification limitations.

## STOP conditions

- If the current SDK cannot supply explicit error-free null-cart evidence even after the scoped query validation above, stop and report its response contract; never use message matching or falsy values to infer expiry.
- If the fix requires altering GraphQL schemas, payment processing, or checkout behavior, stop for scope review.
- Do not execute cart mutations against a real customer account or place a purchase to verify this change.
- Unexpected source drift, a required change outside the allowed files, or two failed verification attempts without a new explanation: stop and report the exact failure and remaining work.
- Do not bypass a failed gate with ignored diagnostics, disabled tests, arbitrary sleeps, invented external-usage evidence, or exposed credentials.

## Maintenance notes

Plan 008 consumes this shared operation and aligns the remaining policy. Preserve the distinction between invalid cart, inventory denial, and ambiguous transport failure; future retries must not double-add items. Request an independent review when practical before later release because this changes cart recovery.

## Completion evidence

Completed on 2026-10-15, Europe/Lisbon, in the existing checkout. No commits, pushes, pull requests, deployments, provider configuration changes, customer-cart mutations, or purchases were performed.

### Implementation

- `getCart` now uses the installed SDK's optional-data response contract rather than casting to a required-data wrapper. It rejects SDK errors, missing/malformed data, absent/undefined cart fields, and malformed non-null cart values. Only an explicitly present, error-free null cart confirms provider absence. Non-null objects continue through the existing mapper; mapping failures reject. Unconfigured unrelated read callers retain their previous null fallback.
- Added `lib/shopify/cart-operations.ts` with the shared `addItemToCart`. It guards configuration before provider calls, creates once without an ID, and otherwise attempts one add. On failure it probes once and creates one replacement only for explicit null. It preserves the original add failure if the cart survives, the probe fails, or replacement fails. It never automatically retries a mutation.
- Both adapters use this operation before writing cookies. Existing response shapes, error statuses, request-ID precedence, action path invalidation, and cookie attributes remain intact. REST retains its 30-day lifetime; actions retain two days, pending plan 008. No mutation locking, UI, GraphQL, checkout, or other provider mutation handling changed.

### Regression and repository checks

| Command | Outcome |
|---|---|
| `node --test --test-name-pattern='cart query\|provider absence\|provider request\|unconfigured read' tests/cart-query.test.mjs` before correction | Expected failures: nine cases incorrectly accepted SDK errors/falsy or incomplete data; 13 other cases passed |
| `node --test tests/cart-actions.test.mjs tests/cart-api.test.mjs` before switching adapters | Expected failures: eight recovery/cookie/configuration assertions; 11 other cases passed |
| `node --test tests/cart-query.test.mjs tests/cart-operations.test.mjs` | 54/54 passed |
| `node --test tests/cart-query.test.mjs tests/cart-operations.test.mjs tests/cart-actions.test.mjs tests/cart-api.test.mjs` | 73/73 passed |
| `pnpm test` | 145/145 passed, including the original cart-state locking tests |
| `pnpm lint` | Passed, zero warnings |
| `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Passed; also covers the basic type-check gate |
| `pnpm build` | Passed |
| `git diff --check` | Passed |

Added 68 regression cases across provider-query validation, composed real-query recovery, operation call order/counts, and adapter effects. Multi-line fixtures expose silent loss; tests assert zero replacement and zero cookie/path effects on failure, one cookie write on success, and no automatic retries. The composed tests load the real `getCart` and mapper against fake SDK envelopes rather than hiding validation behind a permissive probe stub.

**Installed-dependency repair:** The first type check/build found duplicate React type definitions in untouched UI components. Inspection showed the top-level installed React types had drifted to 19.3.0 while the frozen lockfile and nested types specified 19.2.14, following plan 004's temporary fixture install attempt. `pnpm install --frozen-lockfile` skipped relinking; `pnpm install --frozen-lockfile --force` restored the locked installation, after which types, all tests, and build passed. No manifest, lockfile, dependency version, or UI source change was made for this repair. Prerequisite dependency diffs were preserved.

### Local production runtime

An isolated Next.js 16.3.8 fixture copied the actual cart query/mutation implementations, recovery operation, actions, REST handler, constants, mapper, GraphQL fragments, and queries unchanged. Only its Shopify client boundary was replaced with an in-memory synthetic SDK responder. It had no real provider credentials or provider-network implementation.

Session commands:

```sh
node /private/tmp/opac-plan-005-runtime.mjs prepare
cd /private/tmp/opac-plan-005-fixture
node /Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb/node_modules/next/dist/bin/next build --webpack > /private/tmp/opac-plan-005-fixture-build.log 2>&1
node /private/tmp/opac-plan-005-runtime.mjs check
```

The runner launched installed Next directly on loopback port 4205, awaited its readiness message, and stopped it after checks. It did not invoke pnpm scripts or install packages in the fixture.

**Passed 22 cart HTTP requests, 11 per adapter**, exercising:

- First-cart creation and add to an existing multi-line cart.
- Transient add failure: original cart ID and both old lines preserved; no Set-Cookie header; one add, one read probe, zero replacement calls.
- A subsequent cart read and explicit user retry succeeding against the original cart.
- Quantity change, line removal, and final-line removal clearing the cookie.
- SDK error plus null cart during recovery: original failure returned and no replacement/cookie write.
- Error-free explicit null: exactly one replacement and one successful cookie write.

The action adapter ran through a fixture-only POST bridge invoking the actual actions in Next's cookie/cache context; the REST adapter used its actual HTTP methods. This verifies the running framework/adapter boundaries, not browser Server Action serialization or the real storefront UI. The initial fixture assertion expected only `Max-Age=0` for cookie deletion; Next correctly used a past `Expires` date. The assertion was corrected to verify an empty cookie plus either valid expiry mechanism, then the entire runtime matrix passed. No product code changed for that correction. Expected synthetic failure logs were retained locally; no unexpected invariant or cache-profile failures occurred.

Temporary evidence: `/private/tmp/opac-plan-005-runtime.mjs`, `/private/tmp/opac-plan-005-runtime-evidence.json`, `/private/tmp/opac-plan-005-fixture`, and `/private/tmp/opac-plan-005-*.log`.

### Review, scope, and limitations

Independent read-only review by `cart_recovery_review` found no blockers and separately passed all 73 focused tests. It checked the installed SDK response types and confirmed both client layers default to zero retries, with no repository override. It reviewed the configuration guard, strict null evidence, original-error preservation, and adapter effects. No independent browser/provider verification was claimed.

Scope review confirmed only allowed cart modules, regression tests, this plan, and the plan index changed for this implementation; prior webhook/dependency work was preserved. No extra public barrel export was introduced. Real provider mutation behavior, browser storefront interactions, and checkout/order placement were not exercised; all mutations used local synthetic state. The previously observed configured Shopify product-read limitation from plan 004 remains separate and unfixed. Plan 006 is next in order.
