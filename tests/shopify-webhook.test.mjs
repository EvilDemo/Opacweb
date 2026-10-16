import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mock, test } from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const source = new URL("../app/api/shopify-webhook/route.ts", import.meta.url);
const secret = "synthetic-shopify-cache-webhook-secret";

function setup() {
  const cache = { revalidateTag: mock.fn(), revalidatePath: mock.fn() };
  const route = loadTypeScript(source, {
    dependencies: { "next/cache": cache },
    allowImports: ["next/server", "node:crypto"],
    env: { NODE_ENV: "production", SHOPIFY_WEBHOOK_SECRET: secret },
    logger: { debug: mock.fn(), warn: mock.fn(), error: mock.fn() },
  });
  return { route, cache };
}

function request({ topic = "products/update", body = {}, signingSecret = secret } = {}) {
  const rawBody = JSON.stringify(body);
  return new Request("https://website.example.test/api/shopify-webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-topic": topic,
      "x-shopify-hmac-sha256": createHmac("sha256", signingSecret).update(rawBody).digest("base64"),
      "x-shopify-shop-domain": "synthetic-shop.myshopify.com",
    },
    body: rawBody,
  });
}

for (const topic of ["products/create", "products/update", "products/delete", "inventory_levels/update"]) {
  for (const handle of [undefined, "synthetic-shirt"]) {
    test(`signed ${topic} expires products immediately${handle ? " and invalidates its product path" : " without a product path"}`, async () => {
      const fixture = setup();
      const response = await fixture.route.POST(request({ topic, body: { id: "synthetic-product", handle } }));
      const result = await response.json();
      assert.equal(response.status, 200);
      assert.equal(result.success, true);
      assert.equal(result.revalidated, true);
      assert.equal(result.topic, topic);
      assert.equal(fixture.cache.revalidateTag.mock.callCount(), 1);
      const args = fixture.cache.revalidateTag.mock.calls[0].arguments;
      assert.equal(args.length, 2);
      assert.equal(args[0], "shopify-products");
      assert.deepEqual({ ...args[1] }, { expire: 0 });
      assert.deepEqual(
        fixture.cache.revalidatePath.mock.calls.map(({ arguments: pathArgs }) => [...pathArgs]),
        handle ? [["/shop"], [`/shop/${handle}`]] : [["/shop"]],
      );
    });
  }
}

test("a signed unsupported topic is ignored without cache effects", async () => {
  const fixture = setup();
  const response = await fixture.route.POST(request({ topic: "orders/create", body: { handle: "synthetic-shirt" } }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ignored, true);
  assert.equal(fixture.cache.revalidateTag.mock.callCount(), 0);
  assert.equal(fixture.cache.revalidatePath.mock.callCount(), 0);
});

test("a forged supported event cannot expire tags or paths", async () => {
  const fixture = setup();
  const response = await fixture.route.POST(request({ signingSecret: "wrong-synthetic-secret", body: { handle: "synthetic-shirt" } }));
  assert.equal(response.status, 401);
  assert.equal(fixture.cache.revalidateTag.mock.callCount(), 0);
  assert.equal(fixture.cache.revalidatePath.mock.callCount(), 0);
});
