# Plan 015: Patch compatible vulnerable dependency paths and account for residual risk

> Executor instructions: Refresh the dependency evidence, select a concrete compatible remediation set, apply and verify it locally, and update this Status and `plans/README.md`. Do not treat this plan as a blanket upgrade, build-permission expansion, major migration, commit, PR, deployment, or external provider change.
>
> Drift check first: `git status --short`; `git diff --stat 17af3a2..HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml`; and the same scoped `git diff --stat` without the range. Preserve the existing Next/sharp/verifier patches and approved pnpm policy. The current working tree includes plans 001–010 plus the WebGL correction beyond HEAD; do not reset it to obtain a clean install. Reconcile expected changes from 011–014 before interpreting failures.

## Status

- **Finding**: Existing transitive advisories remain after the targeted Next/sharp runtime patch; applicability and compatible remediation are not fully resolved.
- **Priority**: P1 for exposure triage; not a claim of demonstrated production exploitation
- **Effort**: M, escalating to a separately scoped plan if a major migration is required
- **Risk**: MED for compatible dependency changes; HIGH/breaking migrations are excluded
- **Confidence**: HIGH for installed vulnerable resolutions; production exploitability remains unverified
- **Depends on**: completed plan 002 runtime/install baseline; execute after 011–014 as requested and rerun their regressions
- **Category**: security
- **Planned at**: commit `17af3a2` plus the existing audit working tree, 2026-10-16, Europe/Lisbon
- **Status**: DONE — verified 2026-10-16 (compatible cleanup; residual advisories documented)

## Why this matters

The earlier patch deliberately fixed Next and sharp without migrating the rest of the graph. A final production audit still reports vulnerable transitive packages in Sanity/Studio, build tools, and other paths. Identify where the vulnerable APIs can run, apply compatible fixes with minimal graph churn, and leave concrete evidence for any migration that cannot safely fit this plan. A lower scanner total alone is not proof that a path is safe.

## Current state and conventions

Repository: `/Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb`. Private Next.js App Router / React / TypeScript app, Shopify storefront, embedded Sanity Studio, pnpm 12.11.2. The final review's 2026-10-16 production scan reported **0 critical, 52 high, 52 moderate, 10 low**, representing **99 unique advisory IDs** across multiple vulnerable package/version records. These totals are unchanged from plan 002's after-scan, not a count of proven exploits. No Next or sharp advisory entry was present. Regenerate the evidence at execution time; do not use an old temporary report as a gate.

Current direct versions include:

```json
{
  "next": "16.3.8",
  "eslint-config-next": "16.3.8",
  "sharp": "~0.35.5",
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "sanity": "^5.12.0",
  "next-sanity": "^12.1.0",
  "@sanity/client": "^7.16.0",
  "@sanity/image-url": "^2.0.3",
  "@sanity/vision": "^5.12.0",
  "@sanity/webhook": "^4.0.4",
  "@shopify/storefront-api-client": "^1.0.9"
}
```

Observed affected resolutions included undici 6.23.0 through Sanity CLI/template validation/Actions helpers; Vite 7.3.1 through Sanity/CLI/Studio build paths; lodash 4.17.23 through several Sanity utilities; PostCSS 8.4.49 and 8.5.6 through framework/tooling paths. The audit also lists other modules; do not restrict triage to these examples. A package being under production dependencies does not establish that every bundled CLI function runs on a public route. Build/distribution exposure still matters even if a path is absent from a server request.

The approved `pnpm-workspace.yaml` policy must stay equivalent:

```yaml
allowBuilds:
  '@tailwindcss/oxide': true
  esbuild: true
  sharp: true
  unrs-resolver: false
```

Sanity peers and Next's native image runtime justify retaining `styled-components`, `@sanity/client`, and `sharp` despite sparse direct imports. No unused direct dependency was established by the review. Do not infer removability from import counts. Preserve Node compatibility (Next/sharp require at least Node 20.9), the local installed runtime, public routes, schema/data contracts, and lazy client boundaries.

## Commands and primary sources

| Purpose | Command | Expected result |
|---|---|---|
| Current production audit | `pnpm audit --prod --json` | Valid JSON; nonzero exit is expected while advisories exist |
| Dependency paths | `pnpm why <exact-package-name>` | Installed versions and owning paths recorded |
| Candidate metadata | `pnpm view <package>@<exact-candidate-version> version engines peerDependencies dependencies --json` | Exact published metadata resolves and is reviewed |
| Frozen installation | `pnpm install --frozen-lockfile` | Exit 0 with unchanged manifest/lockfile hashes during this verification |
| Tests | `pnpm test` | All pass, including 011–013 and WebGL regressions |
| Lint | `pnpm lint` | Exit 0, zero warnings |
| Types/unused | `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Exit 0 |
| Build | `pnpm build` | Exit 0 |
| Asset guard | `node scripts/audit-public-assets.mjs --check --after-removal` | Exit 0, retained assets unchanged |
| Whitespace | `git diff --check` | Exit 0 |

For advisory details, use the exact GitHub/vendor advisory URLs returned by the fresh audit, not inferred patch floors. Examples from the reviewed scan: [Lodash advisory](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) and [Undici advisory](https://github.com/advisories/GHSA-f269-vfmq-vjvj). Consult [Sanity upgrade guidance](https://www.sanity.io/docs/studio/upgrade) and [pnpm build settings](https://pnpm.io/settings#allowbuilds) for the installed versions. Verify current primary-source guidance before choosing a workaround.

The Sanity guidance checked on 2026-10-16 says `sanity@latest` installs major v6. This repository is on major v5; do not copy an unqualified latest-version upgrade command. Select exact compatible v5 candidates if supported, or record the v6 migration as separate scope with its concrete requirements.

## Scope and Git workflow

Only modify `package.json`, `pnpm-lock.yaml`, this plan's status/evidence, `plans/015-dependency-validation.md` (new), and `plans/README.md`. `pnpm-workspace.yaml` is a read-only policy gate, not an allowed edit. Source, tests, schemas, configuration, assets, environment files, and provider settings remain unchanged. A required source/API/schema adaptation is a separate plan, not permission to expand this one.

Allowed changes are compatible patch/minor updates or lockfile resolution refreshes for existing direct dependencies demonstrably owning the selected advisory paths. Sanity-related direct packages must have compatible documented peers; keep Next and eslint-config-next aligned if an advisory-driven compatible Next update is necessary. Preserve the shared patched sharp runtime. Do not upgrade React, Node, pnpm, or a direct package to a new major; do not add packages solely to influence resolution, relocate runtime peers to devDependencies, remove functionality to hide an audit path, disable checks/scripts, or use force/blanket audit fixes.

Prefer upstream-compatible resolutions over overrides. An override is not part of the default plan: if a needed fix cannot be reached through a supported parent update/resolution within this scope, record an exact proposal and stop that remediation path for a scoped follow-up. Do not force a transitive major past a parent's range. Stay in the current checkout; a separately requested branch would be `codex/cleanup-vulnerable-dependencies`. No commit/push/release is included.

## Steps

### Step 1: Produce an applicability and remediation matrix

Capture a fresh production audit outside tracked source. Confirm the output is a real report, not a network/registry error. Group by advisory ID, affected resolved version, and owning path so duplicate roots do not inflate the decision count. Use `pnpm why` and installed package code/metadata to classify runtime server, browser/Studio, build/distribution, or tooling-only paths. Check the vulnerable API/trigger in the official advisory; an uninspected path is `unknown`, not `not applicable`.

Create `plans/015-dependency-validation.md` with a row for every unique advisory/version group: severity, path(s), exposure evidence, applicability (`applicable`, `not applicable` with evidence, or `unknown`), exact compatible candidate/parent range, disposition, and primary advisory link. High/critical and build/distribution paths come first. Moderate/low rows can be grouped only when version/path/disposition are the same; do not drop them or hide unresolved high findings. Record exact environment/package-manager versions without secrets or private configuration values.

**Verify:** unique advisory/version groups in the matrix reconcile with the captured JSON, metadata counts are recorded separately, and every high/critical row has an evidence-backed classification or explicit investigation requirement. No source/manifest change has occurred yet.

### Step 2: Select and review exact compatible fixes

For each in-scope remediable path, verify exact published candidate versions, advisory ranges, engines, peers, and parent constraints. Record before/after targets and the commands proposed to update only those packages/resolutions. Do not hardcode today's presumed latest version into the install command without checking metadata. If a direct version is already compatible and only its transitive resolution is stale, prefer the smallest targeted supported lockfile update.

Obtain independent read-only review when practical of the matrix and proposed version set, concentrating on engines/peers, transitive range compatibility, native image runtime, and unchanged build permissions. The user has authorized scoped local dependency remediation when this plan is executed; no extra approval is needed for an ordinary compatible update. A breaking migration/override/security-permission change remains outside this plan and needs a concrete separate scope decision.

**Verify:** the validation record contains an exact target/version/path matrix with no unresolved compatibility assumptions for the selected set. Unsafe or unsupported paths are excluded with a concrete follow-up, not silently forced. A zero-fix triage alone is not reported as implemented dependency cleanup when compatible fixes exist.

### Step 3: Apply only selected compatible remediation

Use pnpm to update the selected direct packages or narrowly refresh compatible lockfile resolutions. No blanket `pnpm update --latest`, `audit --fix --force`, blanket overrides, lockfile deletion, or install/build-policy bypass. Preserve existing unrelated manifest/lockfile work. Reinspect the graph and manifest after each coherent family update; avoid a repository-wide formatting or upgrade diff.

**Verify:** `pnpm why <affected-package>` confirms each intended resolved fix and its parent path. `git diff -- package.json pnpm-lock.yaml pnpm-workspace.yaml` contains only selected changes; the allowBuilds file is unchanged from execution start. Next/lint alignment, React peer compatibility, and patched shared sharp/native decoder loading remain valid. Failed installs are failures to investigate, not permission to approve more build scripts.

### Step 4: Run clean installation, regression, product, and audit gates

Record manifest/lockfile hashes, run plain `pnpm install --frozen-lockfile`, and verify it succeeds without modifying those files. Run every command gate above and a fresh production audit. Compare advisory IDs/versions/paths, not just totals. No selected fixed vulnerable resolution may remain, no new critical/high advisory ID may be introduced, and existing Next/sharp security fixes may not regress. Newly published advisories must be investigated instead of attributed automatically to the update.

Smoke the built home/media/radio/About/footer, mobile WebGL failure/poster/retry, local image optimization for WebP/AVIF, and Studio initialization. Verify enabled-shop product/cart boundary behavior against a synthetic local provider, including product error-vs-404, retained cart display after failed refresh, cookie policy, and normal add/update/remove. No checkout/purchase, real cart mutation, provider configuration, or authenticated Studio editing is required. Temporary fixtures must invoke installed Next directly and must not install through a symlinked `node_modules`. Use deterministic readiness/state waits and clean up owned servers/tabs.

**Verify:** install/tests/lint/types/build/assets/whitespace and the scoped product checks pass. Audit evidence shows selected fixes applied with no introduced critical/high IDs. Record exact commands, version/path deltas, independent review scope, native/runtime observations, and skipped/unavailable production checks in the validation record.

### Step 5: Give every residual risk an honest disposition

Update all matrix rows after the patch. Each remaining high/critical path must have concrete evidence for non-applicability or a specific unresolved migration/override/compatibility requirement with affected packages, trigger/exposure, candidate versions, and next action. Unknown exposure stays unknown. Do not declare the application vulnerability-free or treat undeployed changes as production mitigation.

**Verify:** every selected compatible fix is applied and verified; every remaining row has a disposition. If compatible required work or verification remains incomplete, keep this plan IN PROGRESS or record a concrete BLOCKED condition. If only explicitly out-of-scope migrations remain and this bounded compatible cleanup is complete, DONE must state the residual risks and required follow-up; it must not say the dependency audit is clean.

## Done criteria

- [x] Fresh before/after audit reports and a reconciled advisory/version/path matrix exist; no secret/private configuration values are recorded.
- [x] Every selected compatible remediation is installed and absent from the after graph as a vulnerable resolution.
- [x] Exact targets, compatibility evidence, residual migrations/unknowns, and independent review or its unavailability are recorded.
- [x] Plain frozen installation succeeds without changing manifest/lockfile hashes; build-script policy and prior security fixes are preserved.
- [x] All code, build, asset, native image, and scoped browser/provider-fixture gates pass; no new critical/high advisory IDs are introduced without an explicit resolved explanation.
- [x] Only allowed files changed; status/index accurately distinguish completed compatible cleanup from remaining exposure/migration work.

## STOP conditions and maintenance

Stop the affected remediation path and report if registry evidence is unavailable, a supported fix needs a direct/transitive major outside parent constraints, an override, expanded build permissions, a runtime/React upgrade, source/schema changes, or native/peer incompatibility. Continue independent in-scope triage and safe fixes; preserve completed work. Reassess repeated install/build failures before trying again and never repair them by suppressing checks or resetting unrelated edits.

Dependency advisories change over time. Preserve evidence dates, paths, and trigger conditions, and rerun boundary tests when SDK/Next/Sanity packages change. Live provider delivery, deployment-native-library behavior, and production exploitability remain separate verification tasks.

## Completion evidence — 2026-10-16

Completed the bounded compatible remediation: Sanity/Vision 5.31.2, styled-components 6.6.0 and client 7.27.0, plus targeted supported transitive resolutions. App React/DOM, Next/linter alignment, sharp, approved build policy and all application source/contracts are preserved. Independent dependency review found no compatibility blocker; final frozen install, 297 tests, lint, strict types/unused, peers, build, assets, native images, navigation/forms, commerce and product/cache runtime gates pass.

The audit is **not clean**: 114 records/99 unique IDs became 16 records/IDs (9 high, 7 moderate). There are zero new high/critical IDs and one new moderate YAML advisory from an exact upstream pin, explicitly investigated. Remaining families are adm-zip, js-yaml, braces, uuid 10 and sprintf-js. They need supported upstream parent migrations or separately reviewed patches/overrides; no override, major direct upgrade, or expanded build permission was applied. See [complete before/after matrices, review, runtime evidence and exact residual follow-ups](015-dependency-validation.md). No commit/deployment occurred.
