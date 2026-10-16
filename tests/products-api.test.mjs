import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const product = { id: "synthetic-product", handle: "synthetic-shirt", title: "Synthetic shirt" };
const page = { products: [product], pageInfo: { hasNextPage: true, hasPreviousPage: false, startCursor: "synthetic-start", endCursor: "synthetic-end" } };

function setup({ found = product, failure } = {}) {
  const provider = {
    getProducts: mock.fn(async () => { if (failure) throw failure; return page; }),
    getProductByHandle: mock.fn(async () => { if (failure) throw failure; return found; }),
  };
  const route = loadTypeScript(new URL("../app/api/products/route.ts", import.meta.url), {
    dependencies: { "@/lib/shopify/index": provider }, allowImports: ["next/server"], logger: { error: mock.fn() },
  });
  return { route, provider };
}

for (const [query, args] of [["", [20, undefined]], ["?first=12&after=synthetic%2Bcursor%3D", [12, "synthetic+cursor="]]]) {
  test(`product listing preserves pagination forwarding and its page envelope (${query || "defaults"})`, async () => {
    const fixture = setup();
    const response = await fixture.route.GET(new Request("https://website.example.test/api/products" + query));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), page);
    assert.deepEqual([...fixture.provider.getProducts.mock.calls[0].arguments], args);
    assert.equal(fixture.provider.getProductByHandle.mock.callCount(), 0);
  });
}

test("handle lookup retains its product envelope and takes precedence over list pagination", async () => {
  const fixture = setup();
  const response = await fixture.route.GET(new Request("https://website.example.test/api/products?handle=synthetic-shirt&first=12&after=synthetic-cursor"));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { product });
  assert.deepEqual([...fixture.provider.getProductByHandle.mock.calls[0].arguments], [product.handle]);
  assert.equal(fixture.provider.getProducts.mock.callCount(), 0);
});

test("an unknown product handle retains its 404 error envelope", async () => {
  const fixture = setup({ found: null });
  const response = await fixture.route.GET(new Request("https://website.example.test/api/products?handle=synthetic-missing"));
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "Product not found" });
  assert.equal(fixture.provider.getProducts.mock.callCount(), 0);
});

for (const query of ["", "?handle=synthetic-shirt"]) {
  test(`provider errors retain the products endpoint's 500 response (${query || "list"})`, async () => {
    const fixture = setup({ failure: new Error("Synthetic product provider failure") });
    const response = await fixture.route.GET(new Request("https://website.example.test/api/products" + query));
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: "Synthetic product provider failure" });
  });
}
