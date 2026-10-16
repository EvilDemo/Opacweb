# Plan 012 verification: validate Shopify product query responses

Completed 2026-10-16, Europe/Lisbon, in the existing checkout based on `17af3a2` plus earlier uncommitted audit work. Plan 012 changed only `lib/shopify/products.ts`, new `tests/product-query.test.mjs`, and this plan's status/index/evidence files. Earlier audit and WebGL work was preserved. No commit, push, PR, deployment, real provider request, environment-file change, or customer/cart mutation occurred.

## Implemented behavior

Both actual query functions validate the SDK response and its data object, require the expected own field, and reject every defined SDK `errors` value before reading partial data. New validation errors use stable application messages without serializing provider bodies. Handle reads return null only for an error-free explicit `product: null`; missing, undefined, falsy, scalar, and array values reject.

List reads validate the connection object, edges array, object edges/nodes, and the selected pageInfo flags/cursors. They retain legitimate empty lists, pagination forwarding, and the existing real mapper. A malformed entry rejects the whole list rather than silently disappearing. Nested mapper failures and thrown transport errors retain their existing rejection policy; this is a narrow response-boundary check, not a complete product schema.

The unchecked required-envelope assertion was replaced with SDK data type parameters and a mapper input type derived from `Parameters<typeof transformProduct>[0]`. Existing unconfigured no-network fallbacks, cache wrappers/keys/tags, public return types, API envelopes, queries/fragments, and mapper remain unchanged. The API route and its existing adapter tests needed no edits.

Installed `@shopify/graphql-client` 1.4.1's `processJSONResponse` was inspected directly: partial data may accompany SDK errors, while success omits errors. The validator follows the existing cart query boundary's defined-errors rule.

## Regression and repository checks

| Check actually run | Outcome |
|---|---|
| `node --test tests/product-query.test.mjs tests/products-api.test.mjs` before the fix | 22 passed, 59 genuine behavior failures, including error-plus-null incorrectly returning 404; no fixture-loading failures |
| Same focused command after the fix | 81/81 passed |
| `pnpm test` | 291/291 passed: previous 216 plus 75 new regressions |
| `pnpm lint` | Passed with zero warnings |
| `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Passed with no diagnostics |
| `pnpm build` | Passed under Next.js 16.3.8, including TypeScript and 21 generated static pages |
| `git diff --check` | Passed |

New tests load the real query functions, queries/fragments, and mapper with controlled SDK responses. They cover valid mapping, explicit absence, partial data with errors, malformed envelopes/connections/pagination, mapping and transport failures, unconfigured fallbacks, cursor forwarding, and retry. Composed tests load the actual products API route with those real query functions and verify its existing 200/404/500 envelopes without SDK-only error details. Unit cache adapters invoke callbacks directly; real cache behavior is verified separately below.

The initial type/build checks identified a direct record-to-mapper-input assertion that TypeScript rejected. A narrow object guard accepting unknown input resolved it; no check was disabled, and final type/build checks pass.

Logs under `/private/tmp/`: `opac-plan-012-tests-before.log`, `opac-plan-012-tests-focused-final.log`, `opac-plan-012-tests-final.log`, `opac-plan-012-lint-final.log`, `opac-plan-012-types-final.log`, and `opac-plan-012-build-final.log`.

## Production HTTP and cache fixture

Prepared `/private/tmp/opac-plan-012-fixture` with copied actual Shopify modules, types, and `app/api/products/route.ts`, a minimal layout, and installed dependencies. Only its Shopify client boundary was replaced with a synthetic responder. Fixture-only controls select valid, explicit-null, empty, SDK-error/null, SDK-error/partial-data, missing-field, invalid-shape, mapper-failure, and transport-failure responses and expose call counts. These controls do not exist in repository application source.

The fixture keeps installed React and Next cache implementations. It uses synthetic child-process environment values, with no real provider connection or environment-file edits. No install or pnpm script ran against its symlinked dependency directory.

Commands used from `/private/tmp/opac-plan-012-fixture`:

```sh
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=synthetic-shop.myshopify.com NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=synthetic-local-token node /Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb/node_modules/next/dist/bin/next build --webpack
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=synthetic-shop.myshopify.com NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=synthetic-local-token node /Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb/node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 4223
node /private/tmp/opac-plan-012-runtime.mjs
```

Final fixture build passed. The runtime driver hash-verified that product code, mapper, query/fragments, Shopify index/constants, and API route matched the repository byte-for-byte. Each run uses a fresh scenario namespace so warmed successful keys cannot mask failure cases; failure and retry within each recovery case use identical arguments and URLs.

| Production HTTP scenario | Evidence |
|---|---|
| Handle and list matrix, nine synthetic states each | 18 requests: SDK errors, missing/invalid data, mapper failures, and transport failures return 500; error-free handle null returns 404; valid products and valid empty lists return 200; a null list connection rejects |
| Repeat valid and empty lists | Two additional 200 requests, no second SDK call for either key |
| List recovery after SDK partial-data error | 500, then 200 with the identical key after restoring the responder; third request is a successful cache hit; exactly two SDK calls with identical arguments |
| List recovery after invalid pageInfo | Same 500 → 200 → cached 200 sequence and exactly two SDK calls |
| Handle recovery after SDK error plus null | 500 → 200 for the same handle, exactly two SDK calls |

All **28 product HTTP requests passed**; fixture-control/stat requests are excluded from that count. Assertions also verify actual mapped prices/inventory, pagination, generic SDK/validation messages, and absence of SDK-only error details. Existing mapper/transport error text is intentionally unchanged. The final driver run used fresh namespaces and independently repeated the passing result.

Detailed output: `/private/tmp/opac-plan-012-runtime-evidence.json`; driver summary: `/private/tmp/opac-plan-012-runtime-final.log`; fixture build/server logs: `/private/tmp/opac-plan-012-fixture-build-final.log` and `/private/tmp/opac-plan-012-fixture-server.log`. The owned fixture server was stopped after verification.

## Scope and limits

Self-review checked the plan allowlist, failure/absence distinction, original cache configuration, unchanged public route/mapper, and preservation of unrelated edits. No new independent code review is claimed. No browser UI check was needed for this server-boundary change; actual local production HTTP behavior and cache recovery were exercised.

Live Shopify delivery, real API schema compatibility/freshness, production deployment, and customer behavior remain unverified. The implementation deliberately does not redesign logging, transport-error handling, input validation, mapper contracts, or dependency versions. Plans 013–015 remain outside this completed task.
