# Plan 002: Patch the affected Next.js and image-processing runtimes

> Executor instructions: Read this entire plan, follow the steps, and record evidence for each verification. This is a local implementation plan, not authorization to commit, push, open a PR, deploy, publish, delete external data, or change external configuration. Update this plan's row in `plans/README.md` when finished. Preserve unrelated edits.
>
> Drift check: Run `git status --short`, `git diff --stat 17af3a2..HEAD -- 'package.json' 'pnpm-lock.yaml' 'pnpm-workspace.yaml' 'plans/002-runtime-validation.md'`, and `git diff --stat -- 'package.json' 'pnpm-lock.yaml' 'pnpm-workspace.yaml' 'plans/002-runtime-validation.md'` before editing. Compare the excerpts below against the live files. Changes explicitly produced by the listed prerequisites are expected; verify their stated contracts and retain them. Stop on unexplained behavior drift, rather than restoring the old excerpts.

## Status

- **Audit finding**: 1 — vulnerable runtime dependencies
- **Priority**: P1
- **Effort**: M (S = hours; M = approximately a day, including verification)
- **Risk**: MED — framework and native image library upgrades
- **Depends on**: plan 001 recommended; urgent patching may proceed without it if test-harness work is blocked. Run the original suite and all build/product gates, and record deferred boundary tests.
- **Category**: security
- **Planned at**: commit `17af3a2`, 2026-10-15, Europe/Lisbon
- **Status**: DONE

## Why this matters

The pinned Next.js and installed sharp versions fall within published vulnerability ranges on code paths this application uses. Upgrade the affected runtime packages with matching Next ESLint configuration, verify the resolved native dependencies, and test the application before any later release decision. The audit established affected versions, not successful exploitation or the deployed hosting configuration.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`. This is a private Next.js App Router application using TypeScript, React, pnpm, Sanity, and Shopify. Imports use `@/` for the repository root. There are no repository design/intent documents or additional checked-in agent instructions to override the supplied personal working agreements. Match existing local style; do not introduce a new application framework.

`package.json:37,43,56`:
```json
"next": "16.1.1",
"sharp": "^0.34.5",
"eslint-config-next": "16.1.1"
```
The audit confirmed installed versions `16.1.1` and `0.34.5`. `next.config.ts:5–27` allows Sanity/Shopify remote images, enables WebP/AVIF output, and permits SVG with a restricted image CSP. The `/studio` route embeds Sanity and the app uses App Router server actions. Image input decoding and AVIF output settings are distinct; removing an output format alone is not an adequate dependency fix.

The registry audit completed on 2026-10-15 with high/critical advisories. Relevant published patch floors then were Next `16.3.8` for the image-optimization SSRF advisory and sharp `0.35.5` for the cited librsvg advisory. The AVIF decoding advisory's Next patch floor was `16.3.3`. Recheck current primary advisories and package engines before executing; these floors are not a claim that every transitive advisory is solved.

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

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml` — equivalent legacy-to-allowBuilds policy migration explicitly approved by the user on 2026-10-15
- `plans/002-runtime-validation.md`
- `plans/README.md`

This plan file may also receive status/completion-evidence updates only. Every other file is out of scope. Preserve prerequisite edits outside this allowlist; their existence does not authorize further edits to those files. Do not format unrelated files, upgrade unrelated dependencies, redesign UI, or change public behavior beyond the contract below.

## Git workflow

Remain in the current checkout unless the operator requests isolation. If a branch is explicitly requested later, use `codex/patch-runtime-dependencies`. Do not create commits, push, open a PR, or deploy as part of this plan. Existing history includes conventional messages such as `refactor: clean up website and improve mobile loading`, but message style does not authorize committing.

## Steps

### Step 1: Refresh the affected-version evidence

Run `pnpm audit --prod --json` and save its full output outside tracked source (for example `/private/tmp/opac-before-dependency-audit.json`). A nonzero audit exit can mean findings; distinguish it from a registry/DNS error. Consult the linked maintainer advisories and current package engine/peer requirements. Select a published stable Next 16 release at least `16.3.8`, the exactly matching `eslint-config-next`, and sharp at least `0.35.5` on a supported compatible release. Choose the smallest version set clearing applicable runtime advisories; no `latest`-wide upgrade or major Sanity/React migration.

**Verify:** `pnpm view next@16.3.8 engines --json` and `pnpm view sharp@0.35.5 engines --json` return published metadata (replace versions if selecting newer patches); record the selected exact versions and advisory identifiers in `plans/002-runtime-validation.md`, without raw environment/log data.

### Step 2: Update only the affected packages and their lockfile resolution

Edit the three version entries, using an exact chosen Next/ESLint pair and a deliberate sharp constraint. Run `pnpm install`, then `pnpm install --frozen-lockfile`. Inspect the lockfile diff for package-manager/peer fallout. Do not run `audit fix --force`, delete the lockfile, or add blanket overrides. Check both top-level and Next-resolved sharp versions; updating the direct package does not prove a nested native decoder is patched.

**Verify:** `pnpm list next eslint-config-next sharp --depth 0`, `pnpm why sharp`, and `pnpm install --frozen-lockfile` show the intended compatible versions; lint, types, and tests pass.

### Step 3: Verify runtime behavior and triage remaining advisories

Run a fresh production audit, build, and start the built product locally with `pnpm start` on an available port. Exercise `/`, `/a0ty`, `/cross`, `/media`, `/radio`, `/studio`, and shop/cart/checkout paths in their configured enabled/disabled states. Verify local and allowlisted remote image optimization with ordinary trusted fixtures, including a previously used image format. Inspect runtime/console errors and record results in the validation note. Do not send exploit payloads, make real purchases, mutate CMS data, or deploy.

**Verify:** `pnpm audit --prod --json` produces a fresh report; each relevant Next/sharp advisory no longer matches the resolved versions. `pnpm build` exits 0; product checks show expected content, functional images, Studio loading, and expected redirects. Record other advisories by affected path and applicability rather than claiming the raw audit must be empty.

## Test plan

Use plan 001's boundary suite plus the original cart tests unchanged. The meaningful new evidence is resolved-version verification, a fresh advisory scan, production build, image requests, and direct product smoke testing. No tests that merely assert package.json contains a particular version. If a specific compatibility regression is found, stop for scope review rather than changing UI or unrelated packages here.

## Done criteria

- [x] Selected Next and sharp versions clear the applicable cited advisories; nested sharp resolutions were checked.
- [x] Next and eslint-config-next versions match; frozen installation succeeds.
- [x] Production build and the specified product/image checks pass, or this plan remains incomplete with a precise blocker.
- [x] `plans/002-runtime-validation.md` records version selection, commands, applicable residual advisories, and product evidence.
- [x] Independent review of the dependency/lockfile change is requested when practical before a later release; self-review is labeled accurately.
- [x] Required lint, type, and test commands above pass; record commands actually run separately from checks not run.
- [x] Scope review confirms unrelated edits were preserved.
- [x] Update this plan's Status and the matching `plans/README.md` row; record any remaining verification limitations.

## STOP conditions

- If a patched compatible stable version is unavailable, or clearing an advisory requires major React/Sanity/Next migration, stop with the evidence and proposed scope.
- If registry access, native builds, required configuration, or product access is unavailable, retain the evidence and report the gate as unmet. Do not copy `.env` values into the validation note.
- If upgraded Next changes behavior in the known webhook/cache defects, preserve those defects for their owning plans unless the upgrade itself cannot be verified; record the conflict.
- Unexpected source drift, a required change outside the allowed files, or two failed verification attempts without a new explanation: stop and report the exact failure and remaining work.
- Do not bypass a failed gate with ignored diagnostics, disabled tests, arbitrary sleeps, invented external-usage evidence, or exposed credentials.

## Maintenance notes

Dependency patch floors age. Recheck at execution and before a later release. The Windows-only critical advisory in raw audit output is not evidence that this macOS workspace or an unknown production host runs Windows. Keep advisory applicability separate from scanner severity counts.

## References

- [Next AVIF image-decoder advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4)
- [Next image-optimization SSRF advisory](https://github.com/vercel/next.js/security/advisories/GHSA-cjq9-62q9-8jv4)
- [sharp librsvg advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w)

## Execution state

Runtime patch installed and verified on 2026-10-15. All 23 tests, lint, strict TypeScript, production build, route smoke checks, and local/remote WebP/AVIF image checks pass. Independent dependency review found no blockers. See [the validation record](002-runtime-validation.md) for exact evidence, existing residual advisories, and product limits.

The user explicitly approved the equivalent `pnpm-workspace.yaml` build-policy migration on 2026-10-15. It is applied with the same three allowed packages and explicit unrs-resolver deny. Independent review of the applied configuration diff found no widened permissions. Plain `pnpm install --frozen-lockfile` exits 0, leaves the manifest/lockfile hashes unchanged, and the final `pnpm test` rerun passes all 23 cases. Status: DONE. No application source, environment, or external configuration changes were made; nothing was committed, pushed, or deployed.
