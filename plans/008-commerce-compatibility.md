# Commerce compatibility and cookie policy

Implemented and verified locally on 2026-10-16, Europe/Lisbon. Public REST endpoints are retained. No consumer retirement, API deprecation, redirect, deployment, credential change, or external mutation is authorized by this consolidation.

## Retained endpoint contracts

| Endpoint | Accepted valid inputs and identity selection | Success | Existing error classes |
|---|---|---|---|
| `GET /api/cart` | Reads `cart_id` cookie; no cookie skips Shopify | 200 `{ cart }`, including null; confirmed absence clears the cookie | 500 `{ error: "Failed to fetch cart" }` on provider failure; cookie preserved |
| `POST /api/cart` | `variantId`, optional quantity defaulting to 1; body `cartId` takes precedence over cookie | 200 `{ cart }`; writes the shared cart cookie after successful add/create/recovery | 400 for missing variant; 500 `{ error }` on failure; no cookie write on failed recovery |
| `PUT /api/cart` | `updates` array; body `cartId` takes precedence over cookie | 200 `{ cart }`; no cookie renewal | 400 for missing/non-array updates, 404 without a cart ID, 500 on provider failure |
| `DELETE /api/cart` | Comma-separated `lineIds` query; cart identity comes from the cookie | 200 `{ cart }`; clears cookie only when resulting cart is empty | 400 without line IDs, 404 without cookie, 500 on provider failure |
| `GET /api/products?handle=…` | Handle lookup takes precedence over list pagination | 200 `{ product }` | 404 `{ error: "Product not found" }`; 500 `{ error }` on provider failure |
| `GET /api/products` | Optional `first` defaulting to 20 and optional `after`; valid explicit pagination forwarded | 200 shared product-page result `{ products, pageInfo }` | 500 `{ error }` on provider failure |

Server actions retain their `{ cart, error }` results and existing path revalidation. Routes call shared provider functions directly rather than importing actions. Products already used shared `getProducts`/`getProductByHandle`; that route was left unchanged and no additional wrapper was introduced.

Both add adapters continue using plan 005's `addItemToCart`. An existing-cart add is attempted once, followed by one read probe after failure. Only an error-free explicit null response from a configured provider allows one replacement. Surviving carts, ambiguous responses, and probe/replacement failures preserve the original add failure. No automatic add retry or cookie write occurs on failure.

## Authoritative cookie policy

`lib/shopify/constants.ts` owns `CART_COOKIE`, `CART_COOKIE_MAX_AGE`, and `getCartCookieOptions()`. Both server adapters use that policy when a successful add/create returns a cart:

| Property | Value |
|---|---|
| Name | `cart_id` |
| Lifetime for newly issued cookies | 172800 seconds, two days |
| HttpOnly | true |
| Secure | true in production; false in development |
| SameSite | lax |
| Path | `/` |

The only intentional transport behavior change is reducing the REST setter's former 30-day lifetime to the actions' established two days. This is the selected plan decision; no repository consumer evidence requiring 30 days was found. All other cookie attributes and deletion behavior are preserved.

Existing cookie instances keep their previously issued expiry unless a normal successful POST/action reissues them or an existing clear/delete path removes them. GET and PUT do not renew cookies; DELETE retains its existing empty-cart deletion behavior. No mass invalidation, background migration, expiration wait, or provider cart deletion was performed. Provider expiration can independently make a cookie's cart unavailable.

Cookie writes remain at the Next adapter boundaries. The provider operation contains no cookies, redirects, Next headers/cache dependencies, or UI imports. The helper was not added to the public Shopify barrel.

## Consumer evidence and retention

External callers are **unknown**. No production traffic, analytics, customer data, or external client inventory was inspected. Repository absence of endpoint fetch calls does not establish that the endpoints are unused. Retention is the selected resolution; future endpoint retirement requires actual consumer evidence and explicit lifecycle authorization.

Valid body/query formats, ID precedence, methods, envelopes, and statuses were characterized before consolidation. Malformed-input validation and authorization/ownership redesign were not included; no undocumented parser quirks were enshrined as newly desired behavior.

## Verification

| Check | Outcome |
|---|---|
| `node --test tests/cart-api.test.mjs tests/products-api.test.mjs` before the cookie change | 30/30 compatibility cases passed with the original policy |
| `node --test tests/cart-actions.test.mjs tests/cart-api.test.mjs tests/products-api.test.mjs` with new two-day expectations, before consolidation | Five expected REST lifetime failures; 39 other cases passed |
| `node --test tests/cart-actions.test.mjs tests/cart-api.test.mjs tests/cart-operations.test.mjs tests/products-api.test.mjs` after consolidation | 56/56 passed |
| `pnpm test` | 190/190 passed |
| `pnpm lint` | Passed, zero warnings |
| `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Passed; includes basic non-emitting type checking |
| `pnpm build` | Passed |
| `git diff --check` | Passed |

Added 25 cases: 15 cart REST compatibility cases, six product REST cases, and production/development cookie assertions for both adapters. Tests load actual constants and helper implementations; they verify observable cookie arguments, HTTP results, action results, provider arguments, and failure side effects. The initial DELETE test needed a host-array copy for a VM-created argument array; this corrected test isolation and changed no production behavior.

Independent read-only review by `cart_recovery_review` found no code blockers and separately passed all 44 focused action/cart REST/product REST tests. It confirmed cookie flags, two-day issuance, unchanged methods/statuses/envelopes/ID precedence, no forced migration, and the untouched products route. This compatibility note was completed afterward and self-reviewed; the independent review did not claim to have verified its final text.

## Local runtime evidence

The actual application production build was run on loopback port 4209 with `node /private/tmp/opac-plan-008-pages.mjs`. Passed:

- `/shop` and `/cart` returned 200.
- No-cookie `/checkout` returned 307 to `/shop`; the runner did not follow an external checkout destination.
- No-cookie `GET /api/cart` returned 200 `{ cart: null }` without a cookie write.
- Missing-variant `POST /api/cart` returned 400 with its existing error body and no cookie write/provider mutation.

A separate production Next fixture copied the actual cart modules, constants/helper, actions, REST handler, mapper, and GraphQL code, substituting only an in-memory synthetic Shopify client. The session reused plan 005's runtime matrix and added actual `Set-Cookie` header assertions for the shared policy on every successful non-deletion cookie. Commands:

```sh
node /private/tmp/opac-plan-008-runtime.mjs prepare
cd /private/tmp/opac-plan-008-fixture
node /Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb/node_modules/next/dist/bin/next build --webpack > /private/tmp/opac-plan-008-fixture-build.log 2>&1
node /private/tmp/opac-plan-008-runtime.mjs check
```

**22 synthetic cart HTTP requests passed**, 11 per adapter, covering first-cart creation, multi-line add, failed add with no replacement/cookie write, cart read, explicit retry, quantity change, removal, SDK-error/null probe denial, confirmed-expiry replacement, and final-line cookie clearing. All newly issued cart cookies carried `Max-Age=172800`, HttpOnly, Secure, SameSite=lax, and the root path. Unit cases separately verified Secure is false in development. The action fixture uses a POST bridge to invoke the actual actions in Next's cookie/cache context; it does not prove browser Server Action serialization.

All local servers were stopped. Both runners wait for readiness and response completion without arbitrary sleeps. Next was launched directly with installed packages; no dependency installation or manifest/lockfile changes were made in the fixture. Temporary scripts, JSON evidence, and logs are at `/private/tmp/opac-plan-008-*`.

## Limits

Real provider cart mutations, live product SDK responses, interactive browser flows, elapsed two-day expiration, external consumer compatibility, and purchases were not exercised. The configured Shopify product-read issue recorded in plan 004 remains outside this consolidation. HTTP smoke checks do not establish an enabled/live shop. No production deployment, commit, push, or pull request was performed.
