# Plan 006 gallery cache verification

Verified locally on 2026-10-16, Europe/Lisbon, using Next.js 16.3.8. The production change adds `pictures` to gallery fetch tags while preserving `gallery`, `gallery-${id}`, the production 3600-second lifetime, development zero revalidation, React request memoization, result types, and error fallbacks. Existing authenticated webhook handling is unchanged.

Picture events deliberately expire every picture gallery along with the listing. Non-picture typed events do not expire these caches. The existing ID-only delete branch retains its broader media invalidation behavior.

## Regression and repository checks

| Command | Outcome |
|---|---|
| `node --test tests/media-cache.test.mjs tests/sanity-webhook.test.mjs` before the tag change | Expected failure: signed picture update and ID-only deletion had no invalidated tag common to the listing and both galleries; 57 other cases passed |
| Same focused command after the change | 59/59 passed |
| `pnpm test` | 160/160 passed |
| `pnpm lint` | Passed with zero warnings |
| `pnpm exec tsc --noEmit --incremental false --noUnusedLocals --noUnusedParameters` | Passed; includes the basic type-check gate |
| `pnpm build` | Passed |
| `git diff --check` | Passed |

The 15 new tests invoke actual exported media functions, recording fetch options for two distinct picture IDs. Composed cases call the actual webhook POST with real public signature verification and record its invalidated tags, then require a tag common to both the listing and every gallery. They also cover signed deletion, non-picture/unknown types, rejected signatures, retained gallery-specific tags and TTLs, null/error fallbacks, and missing configuration. Existing webhook regression tests were retained unchanged. Tests use the real React `cache` export; they do not claim to prove request memoization outside a React render.

## Real production-cache fixture

Commands used in this session:

```sh
node /private/tmp/opac-plan-006-runtime.mjs prepare
cd /private/tmp/opac-plan-006-fixture-pVslm4
node /Users/leoribeiro/Documents/02_Projects/Opac/website/opacweb/node_modules/next/dist/bin/next build --webpack > /private/tmp/opac-plan-006-fixture-build.log 2>&1
node /private/tmp/opac-plan-006-runtime.mjs check
```

The fixture copies `lib/mediaData.ts` and `app/api/sanity-webhook/route.ts` byte-for-byte, and the runner checks their equality before starting. Only the Sanity client boundary is substituted: its fetch forwards the data layer's actual `next.tags` and `next.revalidate` options to real Next-patched `fetch` against a loopback synthetic provider. The fixture uses the installed React, Next, and Sanity verifier packages. No cache, webhook, or verifier implementation is mocked in this runtime check.

The upstream runs on loopback port 4216 and Next's production server on 4215. A fixture-only read route calls the actual `getPictures`, `getGallery`, and `getMusic` exports. The runner waits for Next's readiness message and fully consumes each read/webhook response before dependent steps; it uses no arbitrary sleeps. The Next process is launched directly through Node, with no pnpm install or dependency change in the fixture. A fresh temporary directory avoids previous test cache state.

**Passed 30 read requests and four webhook requests.** Observed synthetic values:

| Step | Gallery A | Gallery B | Upstream gallery reads per ID |
|---|---|---|---|
| Warm and repeat read | `synthetic-a-revision-1.jpg` | `synthetic-b-revision-1.jpg` | 1 |
| Change fixture to revision 2, before webhook | Still revision 1 | Still revision 1 | 1 |
| Wrong-key picture event, rejected 401 | Still revision 1 | Still revision 1 | 1 |
| Signed music event | Still revision 1 | Still revision 1 | 1 |
| First read after signed picture update | `synthetic-a-revision-2.jpg` | `synthetic-b-revision-2.jpg` | 2 |
| Repeat read after update | Still revision 2 | Still revision 2 | 2 |
| Delete fixture A and change to revision 3, before webhook | Still revision 2 | Still revision 2 | 2 |
| First read after signed ID-only deletion | `null` | `synthetic-b-revision-3.jpg` | 3 |
| Repeat read after deletion | `null` | Still revision 3 | 3 |

The listing refreshed alongside both galleries after each picture event; after deletion it omitted A. The signed music event refreshed music alone, without touching picture caches. Picture updates preserved the music cache; ID-only deletion refreshed it under the existing broader deletion contract. Upstream counters proved the repeat reads hit cache and the first post-invalidation reads fetched new data. Deferred lifecycle logs had no invalid-profile, data-read, or webhook-processing errors. Both local servers were stopped.

## Evidence, review, and limits

Session-only evidence is saved in `/private/tmp/opac-plan-006-runtime.mjs`, `/private/tmp/opac-plan-006-fixture-path.json`, `/private/tmp/opac-plan-006-runtime-evidence.json`, the fixture directory above, and `/private/tmp/opac-plan-006-*.log`.

The one-line production diff and verification evidence were self-reviewed; no independent review was requested for this narrow tag addition. Prior webhook authentication/expiry changes and other in-progress repository work were preserved. No dependency, environment file, external setting, production document, commit, push, pull request, or deployment changed.

The running fixture proves the actual data-layer/webhook/Next cache contract. It does not verify real Sanity CDN propagation, deployed signing-secret matching, provider delivery, browser rendering/navigation, or cached pages in an already-open browser. No production content was mutated, and no real provider data or credentials appear in the fixtures or this record.
