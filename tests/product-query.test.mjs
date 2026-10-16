import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const source = new URL("../lib/shopify/products.ts", import.meta.url);
const utils = loadTypeScript(new URL("../lib/shopify/utils.ts", import.meta.url));
const fragments = loadTypeScript(new URL("../lib/shopify/fragments.ts", import.meta.url));
const queries = loadTypeScript(new URL("../lib/shopify/queries/product.ts", import.meta.url), { dependencies: { "../fragments": fragments } });
const money = { amount: "20.00", currencyCode: "EUR" };
const providerProduct = {
  id: "synthetic-product", handle: "synthetic-shirt", title: "Synthetic shirt", description: "Synthetic description", descriptionHtml: "<p>Synthetic description</p>",
  availableForSale: true, tags: ["synthetic"], options: [{ id: "size", name: "Size", values: ["Medium"] }],
  priceRange: { minVariantPrice: money, maxVariantPrice: money },
  images: { edges: [{ node: { id: "image", url: "https://assets.example.test/shirt.webp", altText: "Synthetic shirt" } }] },
  variants: { edges: [{ node: { id: "variant", title: "Medium", price: money, availableForSale: true, quantityAvailable: 5, selectedOptions: [{ name: "Size", value: "Medium" }] } }] },
};
const pageInfo = { hasNextPage: true, hasPreviousPage: false, startCursor: "synthetic-start", endCursor: "synthetic-end" };
const connection = { pageInfo, edges: [{ node: providerProduct }] };

function setup(response, { configured = true, rejection, sequence } = {}) {
  const request = mock.fn(async () => {
    if (rejection) throw rejection;
    return sequence ? sequence.shift() : response;
  });
  const getShopifyClient = mock.fn(() => ({ request }));
  const products = loadTypeScript(source, {
    dependencies: {
      "next/cache": { unstable_cache: callback => callback },
      react: { cache: callback => callback },
      "./client": { getShopifyClient }, "./constants": { isShopifyConfigured: () => configured },
      "./queries/product": queries, "./utils": utils,
    },
    logger: { error: mock.fn() },
  });
  return { products, request, getShopifyClient };
}

test("a valid handle query uses the real mapper and preserves product details", async () => {
  const fixture = setup({ data: { product: providerProduct } });
  const result = await fixture.products.getProductByHandle(providerProduct.handle);
  assert.equal(result.id, providerProduct.id);
  assert.equal(result.price, "20.00");
  assert.equal(result.currencyCode, "EUR");
  assert.equal(result.images[0].url, providerProduct.images.edges[0].node.url);
  assert.equal(result.variants[0].quantityAvailable, 5);
  assert.equal(result.variants[0].selectedOptions[0].value, "Medium");
  assert.equal(fixture.request.mock.callCount(), 1);
  assert.equal(fixture.request.mock.calls[0].arguments[1].variables.handle, providerProduct.handle);
});

test("only an error-free own explicit null confirms a missing product", async () => {
  assert.equal(await setup({ data: { product: null } }).products.getProductByHandle("synthetic-missing"), null);
});

test("list reads preserve mapped products, pagination, and requested cursors", async () => {
  const fixture = setup({ data: { products: connection } });
  const result = await fixture.products.getProducts(12, "synthetic+cursor=");
  assert.equal(result.products.length, 1);
  assert.equal(result.products[0].id, providerProduct.id);
  assert.equal(result.products[0].variants[0].price, "20.00");
  assert.deepEqual({ ...result.pageInfo }, pageInfo);
  assert.deepEqual({ ...fixture.request.mock.calls[0].arguments[1].variables }, { first: 12, after: "synthetic+cursor=" });
});

test("an empty connection with complete pageInfo is a successful empty list", async () => {
  const emptyInfo = { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null };
  const fixture = setup({ data: { products: { edges: [], pageInfo: emptyInfo } } });
  const result = await fixture.products.getProducts();
  assert.equal(result.products.length, 0);
  assert.deepEqual({ ...result.pageInfo }, emptyInfo);
  assert.deepEqual({ ...fixture.request.mock.calls[0].arguments[1].variables }, { first: 20, after: undefined });
});

const invalidEnvelopes = [
  ["undefined response", undefined], ["null response", null], ["scalar response", false], ["array response", []],
  ["missing data", {}], ["null data", { data: null }], ["scalar data", { data: "invalid" }], ["array data", { data: [] }],
  ["missing own field", { data: {} }],
  ["inherited field", { data: Object.create({ product: null, products: connection }) }],
];

for (const [name, field, read] of [
  ["handle", "product", module => module.getProductByHandle("synthetic-shirt")],
  ["list", "products", module => module.getProducts()],
]) {
  for (const [description, response] of invalidEnvelopes) {
    test(`${name} query rejects ${description} with a controlled validation error`, async () => {
      await assert.rejects(read(setup(response).products), { message: "Shopify returned an invalid product response" });
    });
  }
  for (const [description, errors] of [["SDK error object", { message: "Synthetic SDK-only details" }], ["empty errors", {}], ["null errors", null], ["array errors", []]]) {
    test(`${name} query rejects ${description} even with otherwise valid data`, async () => {
      const fixture = setup({ data: { [field]: field === "product" ? providerProduct : connection }, errors });
      await assert.rejects(read(fixture.products), { message: "Shopify product query failed" });
      assert.equal(fixture.request.mock.callCount(), 1);
    });
  }
  test(`${name} query preserves transport rejections`, async () => {
    const rejection = new Error("Synthetic transport failure");
    await assert.rejects(read(setup(undefined, { rejection }).products), error => error === rejection);
  });
  test(`${name} unconfigured reads keep their no-network fallback`, async () => {
    const fixture = setup(undefined, { configured: false });
    const result = await read(fixture.products);
    if (field === "product") assert.equal(result, null);
    else {
      assert.equal(result.products.length, 0);
      assert.deepEqual({ ...result.pageInfo }, { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null });
    }
    assert.equal(fixture.getShopifyClient.mock.callCount(), 0);
    assert.equal(fixture.request.mock.callCount(), 0);
  });
}

for (const [description, value] of [["undefined", undefined], ["false", false], ["zero", 0], ["empty string", ""], ["string", "invalid"], ["array", []]]) {
  test(`handle query rejects ${description} product instead of confirming absence`, async () => {
    await assert.rejects(setup({ data: { product: value } }).products.getProductByHandle("synthetic-shirt"), { message: "Shopify returned an invalid product response" });
  });
}

const invalidConnections = [
  ["undefined connection", undefined], ["null connection", null], ["scalar connection", "invalid"], ["array connection", []],
  ["missing edges", { pageInfo }], ["null edges", { pageInfo, edges: null }], ["object edges", { pageInfo, edges: {} }],
  ["null edge", { pageInfo, edges: [null] }], ["array edge", { pageInfo, edges: [[]] }], ["missing node", { pageInfo, edges: [{}] }],
  ["null node", { pageInfo, edges: [{ node: null }] }], ["array node", { pageInfo, edges: [{ node: [] }] }],
  ["scalar node", { pageInfo, edges: [{ node: "invalid" }] }],
  ["missing pageInfo", { edges: [] }], ["null pageInfo", { edges: [], pageInfo: null }], ["array pageInfo", { edges: [], pageInfo: [] }],
  ["non-boolean next flag", { ...connection, pageInfo: { ...pageInfo, hasNextPage: "true" } }],
  ["missing previous flag", { ...connection, pageInfo: { hasNextPage: true, startCursor: null, endCursor: null } }],
  ["missing start cursor", { ...connection, pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null } }],
  ["invalid end cursor", { ...connection, pageInfo: { ...pageInfo, endCursor: 42 } }],
];
for (const [description, value] of invalidConnections) {
  test(`list query rejects ${description} without treating it as a successful empty list`, async () => {
    await assert.rejects(setup({ data: { products: value } }).products.getProducts(), { message: "Shopify returned an invalid product response" });
  });
}

for (const [description, value] of [["empty object", {}], ["broken variants", { ...providerProduct, variants: null }]]) {
  test(`handle mapping failure for ${description} remains a rejection`, async () => {
    await assert.rejects(setup({ data: { product: value } }).products.getProductByHandle("synthetic-shirt"));
  });
  test(`list mapping failure for ${description} rejects the whole result instead of dropping a product`, async () => {
    await assert.rejects(setup({ data: { products: { ...connection, edges: [{ node: providerProduct }, { node: value }] } } }).products.getProducts());
  });
}

// These unit cache adapters invoke real callbacks; production cache recovery is a separate HTTP fixture gate.
test("a failed read can be retried with identical arguments and a successful provider result", async () => {
  const fixture = setup(undefined, { sequence: [
    { data: { products: connection }, errors: { message: "Synthetic transient failure" } },
    { data: { products: connection } },
  ] });
  await assert.rejects(fixture.products.getProducts(12, "synthetic-retry"));
  const result = await fixture.products.getProducts(12, "synthetic-retry");
  assert.equal(result.products[0].id, providerProduct.id);
  assert.equal(fixture.request.mock.callCount(), 2);
});

const httpCases = [
  ["SDK error plus null product", "?handle=synthetic-shirt", { data: { product: null }, errors: { message: "Synthetic SDK-only details" } }, 500],
  ["SDK error plus valid product", "?handle=synthetic-shirt", { data: { product: providerProduct }, errors: { message: "Synthetic SDK-only details" } }, 500],
  ["confirmed absence", "?handle=synthetic-missing", { data: { product: null } }, 404],
  ["missing product field", "?handle=synthetic-shirt", { data: {} }, 500],
  ["valid product", "?handle=synthetic-shirt", { data: { product: providerProduct } }, 200],
  ["SDK error plus valid list", "", { data: { products: connection }, errors: { message: "Synthetic SDK-only details" } }, 500],
  ["valid list", "", { data: { products: connection } }, 200],
  ["empty list", "", { data: { products: { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null } } } }, 200],
];
for (const [description, query, response, expectedStatus] of httpCases) {
  test(`the actual products route with real query validation preserves the envelope for ${description}`, async () => {
    const fixture = setup(response);
    const { GET } = loadTypeScript(new URL("../app/api/products/route.ts", import.meta.url), {
      dependencies: { "@/lib/shopify/index": fixture.products }, allowImports: ["next/server"], logger: { error: mock.fn() },
    });
    const http = await GET(new Request("https://website.example.test/api/products" + query));
    const body = await http.json();
    assert.equal(http.status, expectedStatus);
    assert.doesNotMatch(JSON.stringify(body), /SDK-only details/);
    if (expectedStatus === 404) assert.deepEqual(body, { error: "Product not found" });
    else if (expectedStatus === 500) assert.equal(typeof body.error, "string");
    else if (query) assert.equal(body.product.id, providerProduct.id);
    else {
      assert.ok(Array.isArray(body.products));
      assert.deepEqual(body.pageInfo, response.data.products.pageInfo);
      assert.equal(body.products.length, response.data.products.edges.length);
    }
  });
}
