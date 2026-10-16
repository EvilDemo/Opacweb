# Plan 012: Distinguish Shopify product failures from missing products

> Executor instructions: Implement this local plan with regression evidence, then update its Status and `plans/README.md`. Preserve unrelated work. No commit, push, PR, deployment, credential/provider change, real cart mutation, or purchase is authorized.
>
> Drift check first: `git status --short`; `git diff --stat 17af3a2..HEAD -- lib/shopify/products.ts app/api/products/route.ts tests/products-api.test.mjs`; and the same scoped `git diff --stat` without the range. Compare current code to the excerpts below. The working tree already contains audit plans 001–010 and the WebGL fix beyond HEAD; preserve their changes and the completed cart-response guard. Reconcile expected predecessor edits rather than restoring HEAD.

## Status

- **Finding**: Pre-existing SDK errors may become false product 404s; list reads also trust an unchecked response envelope.
- **Priority**: P2
- **Effort**: M — query validation, composed regressions, local runtime verification
- **Risk**: MED — public product reads and cache behavior
- **Confidence**: HIGH — error-plus-null response reproduced through the actual product module and API route
- **Depends on**: completed test loader and endpoint contracts from plans 001/008; execute after 011 in the requested order
- **Category**: bug
- **Planned at**: commit `17af3a2` plus the existing audit working tree, 2026-10-16, Europe/Lisbon
- **Status**: DONE — implemented and verified 2026-10-16

## Why this matters

An SDK error with `data.product === null` currently looks like a missing product and returns 404. Missing data also causes incidental property-access exceptions. Only a validated error-free explicit null should mean provider absence; failures must remain failures, without becoming cached successful absence or leaking provider details to customers.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`. Private Next.js 16.3.8 / React 19.2.4 / TypeScript application using pnpm 12.11.2 and `@shopify/storefront-api-client` 1.0.9. Root imports use `@/`. Tests use Node's runner and `tests/helpers/load-typescript.mjs` with explicit dependencies and synthetic fixtures.

`lib/shopify/products.ts:83–92` casts the SDK result to a required envelope and immediately maps `response.data.products.edges`. At `114–122`, handle lookup does:

```ts
const response = await client.request(PRODUCT_BY_HANDLE_QUERY, {
  variables: { handle },
});
if (!response.data.product) {
  return null;
}
return transformProduct(response.data.product);
```

`app/api/products/route.ts:16–17` translates null to `{ error: "Product not found" }`, status 404. Thrown errors use the existing 500 envelope. `app/shop/[slug]/page.tsx` also interprets null as not-found; its metadata lookup uses the same provider function. Successful missing products must retain these contracts.

The installed GraphQL client's `processJSONResponse` preserves partial `data` while attaching `errors`; success omits `errors`. `lib/shopify/cart.ts:123–148` is the local exemplar: reject defined SDK errors, validate an own data field, accept only explicit null as absence, then use the existing mapper. `tests/cart-query.test.mjs` tests the real query module against synthetic SDK responses; `tests/products-api.test.mjs` currently mocks the product provider, so it cannot catch this bug alone.

## Commands you will need

| Purpose | Command | Expected result |
|---|---|---|
| Focused product regressions | `node --test tests/product-query.test.mjs tests/products-api.test.mjs` | All pass after correction |
| Full suite | `pnpm test` | All pass; 195 tests before follow-up plans |
| Lint | `pnpm lint` | Exit 0, zero warnings |
| Types/unused | `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Exit 0 |
| Build | `pnpm build` | Exit 0 |
| Whitespace | `git diff --check` | Exit 0 |

## Scope and Git workflow

Only modify `lib/shopify/products.ts`, `tests/product-query.test.mjs` (new), `tests/products-api.test.mjs`, this plan's status/evidence, `plans/012-product-query-verification.md` (new), and `plans/README.md`.

Keep the API route, pages, mappers, GraphQL queries/fragments, client/retry settings, webhook tags/expiry, cache keys, pagination behavior, public types/envelopes, cart code, dependencies, flags, and assets unchanged. The route is an integration test subject, not a required edit. Do not add broad schema validation or a shared Shopify abstraction. Stay in the current checkout; if separately requested, branch name is `codex/validate-product-responses`. No commits or external lifecycle actions are part of this plan.

## Steps

### Step 1: Add regressions at the real SDK boundary

Create `tests/product-query.test.mjs` using `loadTypeScript` and a controlled `getShopifyClient().request`. Load the real `transformProduct` implementation and use a structurally valid synthetic GraphQL product so a permissive mapper mock cannot hide broken data. Stub React `cache` and Next `unstable_cache` only to invoke the actual read callbacks; these unit stubs do not prove cache invalidation.

For handle reads cover valid products; error-free own explicit null; errors with null and with otherwise valid data; no data; null/array/scalar data; absent/undefined/falsy/scalar/array product fields; malformed objects causing mapping failure; and transport rejection. For lists cover valid nonempty and empty results, cursor forwarding/pageInfo preservation, errors with partial valid data, missing/null/malformed connection/edges/pageInfo, and mapping failure. Preserve unconfigured no-network fallbacks for both functions.

Compose the actual query module into the actual GET route through the existing loader. Assert error-plus-null produces 500, error-free null alone produces 404, and valid product/list results retain their 200 envelopes. Use generic synthetic errors only; never real tokens, provider bodies, or response objects in test output.

**Verify:** `node --test tests/product-query.test.mjs tests/products-api.test.mjs` exposes the false 404 before correction. Record genuine regression failures, not fixture-loading errors.

### Step 2: Validate before absence, mapping, or successful cache return

Replace the list's required-envelope assertion with a type parameter representing SDK `data`, not another nested SDK response. For both queries reject defined SDK `errors` before considering any data, including partial data. Validate data as a non-array object with the expected own property. Handle lookup returns null only for an error-free own `product: null`; every other missing/falsy/non-object product rejects. Preserve the current unconfigured fallback.

Validate the SDK response itself before accessing its errors/data fields. For lists, validate a non-null connection object, an edges array, non-null object edge/node entries, and the pageInfo fields selected by the current query (boolean next/previous flags; string-or-null cursors). A legitimate empty edges array with valid pageInfo succeeds. Retain the existing product mapper and let mapping failures reject; do not silently filter bad entries or build a field-by-field schema for every nested product property. Existing mapper input types can be referenced with `Parameters<typeof transformProduct>[0]` instead of broad casts to a success envelope.

New validation failures must use stable generic application errors such as `Shopify product query failed` or `Shopify returned an invalid product response`, without serializing SDK errors or response bodies. Do not alter the endpoint's status/envelope contract or existing thrown-transport-error policy in this fix. Do not catch failures inside the cache wrapper and return null/empty success as a fallback.

**Verify:** focused tests pass; valid products, empty lists, explicit absence, and pagination remain unchanged. All ambiguous/error envelopes reject and become the route's existing 500 response.

### Step 3: Check the running framework and recovery

Run all repository commands above. Build a disposable local production fixture with the actual product module, mapper, query/fragments, API route, and installed Next runtime; replace only the SDK boundary with a deterministic synthetic responder. Use installed Next directly (`node <repository>/node_modules/next/dist/bin/next build --webpack` / `start --hostname 127.0.0.1 --port <free-port>`), never pnpm installation/scripts against a symlinked dependency directory. Do not edit real environment files or contact a real provider.

Verify both list and handle requests in each state: SDK error/partial response returns 500, explicit error-free absence returns 404 for a handle, valid products return 200, and a transient failure followed by success can recover. Use a fresh fixture cache/key per scenario; do not accidentally test a warmed success instead of the failing upstream. Within the failure/recovery scenario, reuse the identical list arguments and cache key for the failed request and successful retry. Assert the synthetic responder was called twice and the retry returns 200 with the real product result. Retain cache keys/tags/TTL in product code. Verify recovery with a real `unstable_cache` wrapper so failure is not stored as a successful empty result. Record HTTP statuses, request counts, and payload shapes; stop the fixture server.

**Verify:** expected status/envelope assertions pass, including error-to-success recovery. Record exact fixture commands and limits in `plans/012-product-query-verification.md`; no real provider freshness claim is permitted.

## Done criteria

- [x] Error-plus-null is a provider failure, not 404; only explicit error-free null confirms absence.
- [x] Both actual query functions reject incomplete/errored envelopes before successful mapping/caching.
- [x] Real-mapper query tests and composed route tests prove failure, success, absence, empty listing, pagination, and retry recovery.
- [x] Unconfigured reads keep their previous no-network fallbacks.
- [x] Full tests, lint, strict types/unused, production build, whitespace, and local HTTP/cache recovery gates pass.
- [x] Allowed-file review passes; status/index/evidence are updated and remaining provider limits are explicit.

## Completion evidence

Implemented 2026-10-16 in the existing checkout. Both query functions now reject SDK errors and invalid envelopes before interpreting absence or mapping results. Only an error-free own explicit null confirms a missing product. Lists validate their connection, edges/nodes, and selected pagination fields; successful empty results, real mapping, and unconfigured fallbacks are preserved. Cache policy and public API contracts are unchanged.

Added 75 query-boundary and composed-route regressions in `tests/product-query.test.mjs`. The focused baseline had 59 genuine failures and 22 passes before correction; the final focused run passes all 81 cases. The full suite passes all 291 tests, with lint, strict type/unused checks, production build, and whitespace checks also passing. A disposable production fixture passed 28 product HTTP requests, including identical-key failure/recovery and subsequent successful list cache hits. No live provider was contacted.

Only `lib/shopify/products.ts`, the new test, and this plan's status/index/evidence changed for plan 012; the existing API adapter tests and API route needed no edits. See [verification record and limits](012-product-query-verification.md). Plans 013–015 remain TODO. No commit or deployment occurred.

## STOP conditions and maintenance

Stop if installed SDK success/error semantics contradict the described contract, real query results require an unplanned API-version/schema migration, or correcting the bug requires changing route/page behavior, caching policy, mapper contracts, or dependencies. Reassess two failed checks before retrying; report unresolved failures rather than disabling assertions. Do not broaden this into input validation, logging redesign, or live Shopify troubleshooting.

Future product readers must keep provider failure, valid empty results, and confirmed absence distinct. Plan 015 may update the SDK transitively; rerun these boundary tests after dependency changes.
