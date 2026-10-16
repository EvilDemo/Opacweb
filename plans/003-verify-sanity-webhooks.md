# Plan 003: Authenticate Sanity webhook bodies before processing

> Executor instructions: Read this entire plan, follow the steps, and record evidence for each verification. This is a local implementation plan, not authorization to commit, push, open a PR, deploy, publish, delete external data, or change external configuration. Update this plan's row in `plans/README.md` when finished. Preserve unrelated edits.
>
> Drift check: Run `git status --short`, `git diff --stat 17af3a2..HEAD -- 'app/api/sanity-webhook/route.ts' 'package.json' 'pnpm-lock.yaml' 'tests/sanity-webhook.test.mjs' 'tests/webhook-boundaries.test.mjs' 'plans/003-sanity-configuration.md'`, and `git diff --stat -- 'app/api/sanity-webhook/route.ts' 'package.json' 'pnpm-lock.yaml' 'tests/sanity-webhook.test.mjs' 'tests/webhook-boundaries.test.mjs' 'plans/003-sanity-configuration.md'` before editing. Compare the excerpts below against the live files. Changes explicitly produced by the listed prerequisites are expected; verify their stated contracts and retain them. Stop on unexplained behavior drift, rather than restoring the old excerpts.

## Status

- **Audit finding**: 2 — Sanity signatures are not verified
- **Priority**: P1
- **Effort**: M (S = hours; M = approximately a day, including verification)
- **Risk**: MED — requires matching provider/server secret configuration
- **Depends on**: plan 001, plan 002
- **Category**: security
- **Planned at**: commit `17af3a2`, 2026-10-15, Europe/Lisbon
- **Status**: DONE

## Why this matters

The Sanity endpoint currently accepts any nonempty signature header. Authenticate the exact request body using Sanity’s raw-body verifier and a server-only secret, and fail closed before parsing or invalidating anything. This plan fixes authenticity while preserving tag selection for the later cache plans.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`. This is a private Next.js App Router application using TypeScript, React, pnpm, Sanity, and Shopify. Imports use `@/` for the repository root. There are no repository design/intent documents or additional checked-in agent instructions to override the supplied personal working agreements. Match existing local style; do not introduce a new application framework.

`app/api/sanity-webhook/route.ts:20–29`:
```ts
const body = await request.json();
const signature = request.headers.get("sanity-webhook-signature");
if (!signature) {
  return NextResponse.json({ message: "Missing webhook signature" }, { status: 401 });
}
```
No secret is consulted. The installed `next-sanity@12.1.0` helper `parseBody` validates and then parses JSON even when verification returned false. Consequently, invalid signatures plus malformed JSON can throw before the caller sees verification status. Use `isValidSignature(rawBody, signature, secret)` and `SIGNATURE_HEADER_NAME` from a **directly declared** `@sanity/webhook` dependency, then parse only on a true result. Version `4.0.4` is already present transitively through next-sanity; recheck compatibility after plan 002. Its public verifier is asynchronous and returns false for invalid/malformed signatures. Do not import from a transitive package without declaring it.

Match the route's existing `NextResponse.json` response pattern and Shopify route's server-only environment configuration convention. `GET` is a harmless reachability response and need not be removed. Plan 004 owns the existing invalid `"page"` cache profile; do not combine that change here.

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
- `package.json`
- `pnpm-lock.yaml`
- `tests/sanity-webhook.test.mjs`
- `tests/webhook-boundaries.test.mjs`
- `plans/003-sanity-configuration.md`
- `plans/README.md`

This plan file may also receive status/completion-evidence updates only. Every other file is out of scope. Preserve prerequisite edits outside this allowlist; their existence does not authorize further edits to those files. Do not format unrelated files, upgrade unrelated dependencies, redesign UI, or change public behavior beyond the contract below.

## Git workflow

Remain in the current checkout unless the operator requests isolation. If a branch is explicitly requested later, use `codex/verify-sanity-webhooks`. Do not create commits, push, open a PR, or deploy as part of this plan. Existing history includes conventional messages such as `refactor: clean up website and improve mobile loading`, but message style does not authorize committing.

## Steps

### Step 1: Establish the fail-closed configuration contract

Use `SANITY_WEBHOOK_SECRET` as the server-only variable. Write `plans/003-sanity-configuration.md` naming the variable, the requirement to configure the same secret on the Sanity webhook and application host, and the expected 500/401/400 outcomes. Include no secret value. Do not edit provider settings, environment files, or deployments. If another deployment variable already exists, determine its name without printing its value and reconcile the documented name before coding.

Declare a compatible patched `@sanity/webhook` 4.x runtime dependency in package.json and update only the required lockfile entries with `pnpm install`. This narrowly scoped direct dependency is intentional; do not upgrade Sanity itself.

**Verify:** `pnpm list @sanity/webhook --depth 0` shows the direct package, `pnpm install --frozen-lockfile` succeeds, and `rg -n 'SANITY_WEBHOOK_SECRET|401|400|500' plans/003-sanity-configuration.md` finds the contract; no `NEXT_PUBLIC_` secret is introduced.

### Step 2: Validate before processing

Read and trim the server-only secret and reject absent/blank configuration with a generic 500 response and no body processing/invalidation. Reject a missing signature with 401. Read the request once with `await request.text()` and call `await isValidSignature(rawBody, signature, secret)` from the directly declared package. A false result returns 401 before JSON parsing, even if rawBody is malformed JSON. Only on true, parse rawBody inside a narrowly scoped parsing try/catch; syntax errors return 400. Then require a non-null non-array object, string `_type` if present, and string `_id` if present. Invalid body shapes return 400; genuine verifier/processing exceptions return a generic 500. Preserve unknown-type no-op and existing delete behavior. Do not introduce the combined helper’s fixed three-second delay or any new sleep; eventual CDN consistency is checked separately in the gallery plan.

**Verify:** `node --test tests/sanity-webhook.test.mjs tests/webhook-boundaries.test.mjs` passes after Step 3. Denial and configuration failures produce zero cache calls.

### Step 3: Prove authenticity with the real verifier

Create `tests/sanity-webhook.test.mjs` using the module loader from plan 001. Test a synthetic correctly signed body with the real public verifier and a generated test-only signature; do not mock the verifier to always return true. Use Node crypto and the directly declared package’s public header encoder according to the provider format, without implementing a production custom verifier. Add wrong secret, changed body after signing, missing/malformed signature, missing/blank server secret, malformed JSON with both valid and invalid signatures, null/array/scalar bodies, wrong field types, unknown type, and valid typed/delete cases. Stub Next cache effects; valid profile integration belongs to plan 004.

**Verify:** focused tests, `pnpm test`, lint, and non-emitting typecheck pass.

## Test plan

- Missing configuration → 500; missing/invalid signature or changed body → 401; no invalidation in every denied case.
- Invalid signature plus malformed JSON → 401; correctly authenticated malformed JSON, null/array/scalar body, or invalid field types → 400; authenticated known document → existing processing response and expected invalidation intent.
- Unknown document types remain successful no-ops; signed delete payloads retain supported behavior.
- At least one allowed and one denied fixture traverse the real verifier. No production body/signature/secret appears in fixtures or output.

## Done criteria

- [x] No request is processed unless a configured secret verifies the raw body with the awaited verifier result equal to `true`.
- [x] Failure classes have tested statuses and zero invalidation on denial.
- [x] Configuration instructions are concrete, value-free, and separate from external configuration actions.
- [x] Security diff receives independent review when practical before later release; configuration matching is recorded as unverified until checked in an authorized environment.
- [x] Required lint, type, and test commands above pass; record commands actually run separately from checks not run.
- [x] Scope review confirms unrelated edits were preserved.
- [x] Update this plan's Status and the matching `plans/README.md` row; record any remaining verification limitations.

## STOP conditions

- If provider signature format/helper APIs differ after upgrades, verify official docs and adapt within this boundary; stop if an additional package or external configuration change beyond this plan is required.
- If real deployment uses another secret name, do not silently rename it or overwrite provider settings.
- Do not mark production webhook delivery verified from mocked route tests.
- Unexpected source drift, a required change outside the allowed files, or two failed verification attempts without a new explanation: stop and report the exact failure and remaining work.
- Do not bypass a failed gate with ignored diagnostics, disabled tests, arbitrary sleeps, invented external-usage evidence, or exposed credentials.

## Maintenance notes

A future body parser or middleware must not consume/normalize the raw body before signature verification. Invalid cache profiles are fixed separately by plan 004; fix this authentication boundary before making invalidation functional.

## Completion evidence

Implemented on 2026-10-15, Europe/Lisbon, in the existing checkout without lifecycle or external configuration actions.

- Added the direct runtime dependency `@sanity/webhook@^4.0.4`, resolving to the already installed 4.0.4. The only additional lockfile change beyond plan 002 is its direct importer entry. Existing dependency patches and the approved build-policy migration were preserved.
- POST now requires a trimmed server-only secret, checks for a signature before reading the body, reads text once, and awaits the public raw-body verifier. Only literal `true` permits JSON parsing and validated-payload processing. Denial and configuration failures have no invalidation effects. Unexpected errors return a generic response without logging exception contents.
- Preserved typed events, ID-only deletion, and unknown-type no-op behavior. Own-property tag lookup also prevents signed unknown types such as `constructor` from resolving inherited object properties. Existing cache profiles remain unchanged for plan 004.
- Added 44 regression tests in `tests/sanity-webhook.test.mjs`. Real verifier cases use synthetic HMAC signatures and Sanity's public encoder; the independent fixture signer matches the public encoder. Explicit tests cover signature failures, raw-byte changes, whitespace/Unicode bodies, shape failures, awaited verifier results, read/verifier/cache exceptions, and GET reachability. Plan 001's loader allowlist was extended for the directly declared verifier package.
- Before implementation, the new regression suite failed against the old handler. After implementation, focused webhook tests passed **52/52** and `pnpm test` passed **67/67**.
- Passed `pnpm list @sanity/webhook --depth 0`, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters`, `pnpm build`, and `git diff --check`. The strict type command also covers the less restrictive type-check gate.
- Passed **11 actual HTTP checks against the production build** with an explicitly synthetic secret or blank override: GET reachability; missing/forged/wrong-key signatures; invalid signature with malformed JSON; authenticated malformed JSON and null body; signed unknown/prototype-name types; and blank-configuration denial. Both temporary servers were stopped. Known-type cache calls were intentionally tested with mocks because plan 004 owns the existing invalid profile.
- Independent read-only security review by `sanity_auth_review` found no blockers and separately passed all 52 focused tests. It checked fail-closed ordering, raw-body verification, strict verifier result handling, payload validation, error disclosure, dependency declaration, and scope.
- Reviewed changed paths and diff: this task only changed the allowed route, dependency/importer entry, webhook tests, configuration instructions, and plan status/evidence. Prerequisite changes and unrelated work were preserved. Full check logs are in `/private/tmp/opac-plan-003-*.log` for this session.

**Limits:** No deployed/provider secret match, production webhook delivery, or actual cache refresh was verified. No environment file, Sanity setting, deployment, commit, push, or pull request was changed. See [configuration and rollout instructions](003-sanity-configuration.md). Plan 004 is next in order.

## References

- [Sanity webhook validation guide](https://www.sanity.io/docs/nextjs/validating-sanity-webhooks-nextjs)

- [Sanity raw-body verifier public API](https://github.com/sanity-io/webhook-toolkit)
