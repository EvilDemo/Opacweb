import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mock, test } from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const sanitySource = new URL("../app/api/sanity-webhook/route.ts", import.meta.url);
const shopifySource = new URL("../app/api/shopify-webhook/route.ts", import.meta.url);
const fixtureSecret = "synthetic-webhook-test-secret";
const body = JSON.stringify({ id: "fixture-product", handle: "fixture-shirt" });

function sign(rawBody, secret = fixtureSecret) {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
}

function loadWebhook(source, env = {}) {
  const cache = { revalidateTag: mock.fn(), revalidatePath: mock.fn() };
  const route = loadTypeScript(source, {
    dependencies: { "next/cache": cache },
    allowImports: ["next/server", "node:crypto", "@sanity/webhook"],
    env: { NODE_ENV: "production", ...env },
    logger: { debug: mock.fn(), warn: mock.fn(), error: mock.fn() },
  });
  return { route, cache };
}

function shopifyRequest({ rawBody = body, signature, topic = "products/update" } = {}) {
  const headers = {
    "content-type": "application/json",
    "x-shopify-topic": topic,
    "x-shopify-shop-domain": "fixture-shop.myshopify.com",
  };
  if (signature !== undefined) headers["x-shopify-hmac-sha256"] = signature;
  return new Request("https://website.example.test/api/shopify-webhook", {
    method: "POST",
    headers,
    body: rawBody,
  });
}

function assertNoInvalidation({ cache }) {
  assert.equal(cache.revalidateTag.mock.callCount(), 0);
  assert.equal(cache.revalidatePath.mock.callCount(), 0);
}

test("Sanity denies a missing signature without invalidating any cache", async () => {
  const fixture = loadWebhook(sanitySource, { SANITY_WEBHOOK_SECRET: fixtureSecret });
  const response = await fixture.route.POST(new Request("https://website.example.test/api/sanity-webhook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ _type: "pictures", _id: "fixture-picture" }),
  }));

  assert.equal(response.status, 401);
  assert.equal((await response.json()).message, "Missing webhook signature");
  assertNoInvalidation(fixture);
});

test("Shopify fails closed when the server secret is missing", async () => {
  const fixture = loadWebhook(shopifySource);
  const response = await fixture.route.POST(shopifyRequest({ signature: sign(body) }));
  const result = await response.json();

  assert.equal(response.status, 500);
  assert.equal(result.success, false);
  assert.equal(result.configRequired, true);
  assertNoInvalidation(fixture);
});

test("Shopify denies a missing signature with no cache or path invalidation", async () => {
  const fixture = loadWebhook(shopifySource, { SHOPIFY_WEBHOOK_SECRET: fixtureSecret });
  const response = await fixture.route.POST(shopifyRequest());

  assert.equal(response.status, 401);
  assert.equal((await response.json()).success, false);
  assertNoInvalidation(fixture);
});

for (const { name, rawBody = body, signature } of [
  { name: "a signature generated with another secret", signature: sign(body, "different-synthetic-test-secret") },
  { name: "a malformed signature", signature: "invalid-fixture-signature" },
  { name: "a body changed after it was signed", rawBody: JSON.stringify({ id: "changed-fixture-product" }), signature: sign(body) },
]) {
  test(`Shopify denies ${name} without invalidating data`, async () => {
    const fixture = loadWebhook(shopifySource, { SHOPIFY_WEBHOOK_SECRET: fixtureSecret });
    const response = await fixture.route.POST(shopifyRequest({ rawBody, signature }));

    assert.equal(response.status, 401);
    assert.equal((await response.json()).success, false);
    assertNoInvalidation(fixture);
  });
}

test("Shopify module instances retain only their own configured secret", async () => {
  const first = loadWebhook(shopifySource, { SHOPIFY_WEBHOOK_SECRET: fixtureSecret });
  const second = loadWebhook(shopifySource, { SHOPIFY_WEBHOOK_SECRET: "second-synthetic-test-secret" });
  const missing = loadWebhook(shopifySource);
  // An unsupported topic isolates secret ownership from cache invalidation behavior.
  const request = () => shopifyRequest({ signature: sign(body), topic: "orders/create" });

  for (const { fixture, status, ignored } of [
    { fixture: first, status: 200, ignored: true },
    { fixture: second, status: 401 },
    { fixture: missing, status: 500 },
    { fixture: first, status: 200, ignored: true },
  ]) {
    const response = await fixture.route.POST(request());
    assert.equal(response.status, status);
    if (ignored) assert.equal((await response.json()).ignored, true);
    assertNoInvalidation(fixture);
  }
});

test("the module loader refuses imports that were not explicitly supplied", () => {
  assert.throws(() => loadTypeScript(sanitySource), /Unmocked import "next\/cache"/);
});
