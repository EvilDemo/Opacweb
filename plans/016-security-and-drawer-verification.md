# 016 — Remaining dependency security and cart accessibility

Status: DONE, verified before the separate Bun migration on 2026-10-16. No commit, push, deployment, provider change or real customer mutation occurred. The user explicitly authorized the remaining security fixes after plan 015, including the necessary narrow overrides and local patches. Prior audit work was preserved.

## Security changes

Three parent-scoped overrides retain actual consumer APIs: @sanity/runtime-cli > adm-zip 0.6.1; @vercel/frameworks > js-yaml 3.15.2 (preserves safeLoad, unlike v4); typeid-js > uuid 11.1.1 (preserves UUID v7 buffer generation/stringify). Direct dependency ranges/versions remain unchanged from plan 015.

Repository package-manager patch artifacts cover the two packages without published fixes. Braces 3.0.3 bounds both brace and parenthesis parser nesting and performs iterative depth validation before compile/expand/stringify, including caller-provided/cyclic ASTs. The hard ceiling is 128; unusual deeply nested patterns now reject with a controlled SyntaxError. Sprintf 1.0.3 clamps numeric precision at the public conversion boundary to ECMAScript's 0–100 range, or 1–100 for general format, instead of passing an excessive value to a native operation. Valid named/string/numeric formatting remains supported.

The raw production audit fell from 16 records to two (one high braces ID, one moderate sprintf ID). Those registry records remain because the installed version numbers match advisory ranges even though their source is patched. Nothing is hidden with audit exclusions or fake version numbers. The remaining 14 registry records disappeared through the fixed versions. See patches/braces@3.0.3.patch, patches/sprintf-js@1.0.3.patch and tests/dependency-security.test.mjs.

Primary sources: [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), [sprintf advisory](https://github.com/advisories/GHSA-hp3w-g68c-fv3c), [YAML 3.15.2](https://github.com/nodeca/js-yaml/tree/3.15.2), [UUID 11.1.1](https://github.com/uuidjs/uuid/tree/v11.1.1). Remove these temporary patches/overrides only when supported upstream versions cover the same triggers and consumer regressions pass.

## Accessibility

CartSidebar now renders an actual Radix SheetDescription, visually hidden but connected to the dialog through aria-describedby: “Review your items, adjust quantities, or continue to checkout.” The previously unused wrapper is now restored with a real consumer. No generic primitive warning suppression was added. The existing display-test adapters include it. Live desktop/mobile cart opening showed the correct title/description relation and no warning or error logs; items/totals, close/focus behavior, and refresh failure/retry recovery remained intact. This fixes the cart warning only; unrelated navigation dialogs were not altered.

## Verification before migration

- A clean pnpm frozen installation from absent node_modules passed under the existing script permissions; the prior directory was preserved outside the repo. The final patch fingerprint was then refreshed to remove an unrelated generated empty-file deletion, and a further plain frozen install passed without manifest/lock/policy/patch hash changes.
- 311 tests pass, including 14 new installed-dependency regressions. They resolve through actual Sanity callers and exercise the archive builder on file/folder inputs, framework YAML loading/merges, TypeID round trips, codegen pattern consumers, cyclic/deep AST denial, numeric precision bounds and argparse help. Inputs are small; no memory-exhaustion payload was run. One initial formatting test mistakenly mixed unsupported named/positional placeholders; the fixture was corrected without changing implementation behavior.
- Lint, strict non-emitting types/unused, peer checks, production build (21 static pages), retained-asset guard and whitespace pass.
- 11 signed/denied/malformed/missing-secret Sanity HTTP requests pass against the actual local production server with synthetic secrets. 28 product HTTP/cache requests pass, including errors versus 404 and identical-key recovery. Current copied cart components were exercised in the enabled-shop synthetic SDK fixture. No live provider writes or checkout occurred.
- Independent read-only security review found no blocking bypass/compatibility issue, confirmed the exact parent APIs and patches, and requested removal of the unrelated patch artifact (completed). Browser/product verification belongs to the primary agent.

Execution evidence and preserved pre-migration package/lock/source/patch snapshot: /private/tmp/opac-security-bun/security-phase. Logs: security-{tests,lint,types,peers,build,frozen,sanity-http,product-http}.log, pnpm-clean-install.log, audit-{before,patched}.json. Raw scanner residual IDs are GHSA-vfj7-8cjw-p6xm and GHSA-hp3w-g68c-fv3c.

Live Shopify, authenticated Studio, deployment-native behavior and real form delivery remain outside local verification. No claim of production mitigation or vulnerability-free registry metadata is made.

## Full-audit amendment before final Bun import

Bun's audit also includes development dependencies. A same-scope full pnpm scan of the security baseline confirmed three pre-existing development-tool records: two high flatted advisories and one moderate @humanfs/node advisory. These were fixed in the pnpm security baseline, not silently attributed to or upgraded as part of Bun conversion. Targeted supported resolution updates selected flatted 3.4.4 and @humanfs/node 0.16.8, with required @humanfs/core/types changes. Direct manifest ranges are unchanged. Independent read-only review confirmed compatible ranges/APIs/engines.

The amended baseline received another clean frozen pnpm installation, test run, lint, strict types, peer check and production build before reimport. Logs are security-full-*.log; pnpm-full-baseline-audit.json and security-full-final-audit.json retain the comparable scans. The full final audit contains only the same two locally patched registry records. The corrected pnpm lock snapshot and canonical graph contain 1,458 package/version pairs; the Bun phase preserves all of them and their integrity digests.
