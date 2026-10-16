import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const { default: sitemap } = loadTypeScript(new URL("../app/sitemap.ts", import.meta.url));
const publicPaths = ["/", "/about/us", "/about/you", "/media", "/radio", "/contact", "/a0ty", "/cross", "/privacy-policy", "/terms-of-service"];

test("the sitemap advertises only HTTPS URLs on the accepted canonical origin", () => {
  const entries = sitemap();
  assert.ok(entries.length > 0);
  for (const entry of entries) {
    const url = new URL(entry.url);
    assert.equal(url.origin, "https://opacweb.pt");
    assert.equal(url.username, "");
    assert.equal(url.password, "");
    assert.equal(url.search, "");
    assert.equal(url.hash, "");
  }
});

test("the sitemap covers every supported static public route exactly once", () => {
  const paths = sitemap().map(entry => new URL(entry.url).pathname);
  assert.equal(new Set(paths).size, paths.length);
  assert.deepEqual([...paths].sort(), [...publicPaths].sort());
});

test("nonexistent, feature-gated, dynamic, and noindex routes are excluded", () => {
  for (const entry of sitemap()) {
    const path = new URL(entry.url).pathname;
    assert.notEqual(path, "/about");
    assert.doesNotMatch(path, /^\/(studio|admin|api|cart|checkout|shop)(\/|$)/);
    assert.doesNotMatch(path, /^\/media\/pictures\//);
  }
});

test("static entries omit modification dates without content-change evidence", () => {
  for (const entry of sitemap()) assert.equal(entry.lastModified, undefined);
});

test("robots advertises the sitemap on the same canonical origin", () => {
  const robots = readFileSync(new URL("../app/robots.txt", import.meta.url), "utf8");
  const advertised = [...robots.matchAll(/^Sitemap:\s*(\S+)\s*$/gm)].map(match => new URL(match[1]));
  assert.equal(advertised.length, 1);
  assert.equal(advertised[0].href, "https://opacweb.pt/sitemap.xml");
  for (const entry of sitemap()) assert.equal(new URL(entry.url).origin, advertised[0].origin);
});
