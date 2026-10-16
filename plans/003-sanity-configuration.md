# Sanity webhook authentication configuration

The application server must provide a nonblank, server-only `SANITY_WEBHOOK_SECRET`. Configure the exact same secret in Sanity's webhook settings for the existing POST `/api/sanity-webhook` endpoint. Do not use a `NEXT_PUBLIC_` variable, include the secret in a URL, commit it, or print secrets/signatures/request bodies in logs.

The local environment already declares this variable name. Its value and the provider's matching configuration were not inspected or changed. No provider settings, environment files, deployment settings, or deployed code were modified by this plan.

## Configuration and later rollout

1. In an authorized deployment environment, provision the server-only secret through its existing secret manager. In Sanity's webhook settings, use the matching signing secret for the endpoint.
2. Keep the existing document filter and projection, including the supported document `_type` and optional `_id` fields. A deletion projection containing only `_id` remains supported.
3. Ensure any proxy forwards the original body and `sanity-webhook-signature` header without parsing or reserializing the body.
4. After a separately authorized deployment, check delivery using an approved test event without logging the body, secret, or signature. Confirm the delivery result in Sanity's existing delivery logs; do not expose raw logs in reports.

## Response contract

| Condition | Status | Cache effects |
|---|---|---|
| Server secret missing or blank | 500 | None; body is not read |
| Signature missing | 401 | None; body is not read |
| Invalid/malformed signature, wrong secret, or changed body | 401 | None; JSON is not parsed |
| Invalid signature with malformed JSON | 401 | None |
| Verified signature with malformed JSON | 400 | None |
| Verified body is null, an array/scalar, or has non-string `_type`/`_id` | 400 | None |
| Verified object lacks both a document type and deletion ID | 400 | None |
| Verified unknown document type | 200 | None |
| Verified known document type or supported deletion | 200 processing response | Existing invalidation intent is retained |
| Unexpected verification/read/processing failure | 500, generic response | No invalidation on verification/read failure; processing failures may follow partial invalidation |

## Verification limits

Plan 003 verifies authentication using synthetic fixtures and the real public verifier. It does not establish that the deployed server and Sanity have matching secrets or that provider delivery works in production.

The pre-existing `revalidateTag(..., "page")` profile remains for plan 004. Authenticated known-type cache refresh is not production-ready until that correction is applied and verified. Do not interpret a mocked cache call in authentication tests as proof of actual Next.js revalidation.

[Sanity's raw-body verification API](https://github.com/sanity-io/webhook-toolkit) is the verifier contract used here.
