import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const source = new URL("../lib/shopify/cart.ts", import.meta.url);
const operationsSource = new URL("../lib/shopify/cart-operations.ts", import.meta.url);
const utils = loadTypeScript(new URL("../lib/shopify/utils.ts", import.meta.url));
const money = { amount: "20.00", currencyCode: "EUR" };
const providerCart = {
  id: "synthetic-existing-cart", checkoutUrl: "https://checkout.example.test/cart", totalQuantity: 2,
  lines: { edges: ["shirt", "record"].map(id => ({ node: {
    id, quantity: 1, cost: { totalAmount: money },
    merchandise: { id: `variant-${id}`, title: id, price: money, selectedOptions: [], product: { title: id, handle: id, images: { edges: [] } } },
  } })) },
  cost: { totalAmount: money, subtotalAmount: money },
};

function setup(response, { configured = true, rejection } = {}) {
  const request = mock.fn(async () => { if (rejection) throw rejection; return response; });
  const getShopifyClient = mock.fn(() => ({ request }));
  const cart = loadTypeScript(source, {
    dependencies: {
      "./client": { getShopifyClient }, "./constants": { isShopifyConfigured: () => configured },
      "./queries/cart": { GET_CART_QUERY: "synthetic-cart-query" }, "./mutations/cart": {}, "./utils": utils,
    },
    logger: { error: mock.fn() },
  });
  return { cart, request, getShopifyClient };
}

test("an error-free cart query transforms all existing lines", async () => {
  const fixture = setup({ data: { cart: providerCart } });
  const result = await fixture.cart.getCart(providerCart.id);
  assert.equal(result.id, providerCart.id);
  assert.equal(result.lines.length, 2);
  assert.deepEqual([...result.lines].map(line => line.id), ["shirt", "record"]);
  assert.equal(fixture.request.mock.callCount(), 1);
  assert.equal(fixture.request.mock.calls[0].arguments[1].variables.id, providerCart.id);
});

test("only an error-free explicit null confirms provider absence", async () => {
  assert.equal(await setup({ data: { cart: null } }).cart.getCart("synthetic-expired-cart"), null);
});

const ambiguousResponses = [
  ["SDK errors with null cart", { data: { cart: null }, errors: { message: "synthetic provider error" } }],
  ["SDK errors with a valid cart", { data: { cart: providerCart }, errors: {} }],
  ["error-only response", { errors: { message: "synthetic network error" } }],
  ["missing data", {}], ["null response", null], ["undefined response", undefined],
  ["null data", { data: null }], ["false data", { data: false }], ["scalar data", { data: "invalid" }],
  ["array data", { data: [] }], ["missing cart", { data: {} }], ["undefined cart", { data: { cart: undefined } }],
  ["false cart", { data: { cart: false } }], ["zero cart", { data: { cart: 0 } }],
  ["string cart", { data: { cart: "invalid" } }], ["array cart", { data: { cart: [] } }],
  ["malformed object cart", { data: { cart: {} } }],
  ["mapping failure", { data: { cart: { ...providerCart, lines: null } } }],
];

for (const [name, response] of ambiguousResponses) {
  test(`cart query rejects ${name} instead of confirming expiry`, async () => {
    await assert.rejects(setup(response).cart.getCart(providerCart.id));
  });
}

test("a rejected provider request remains a rejection", async () => {
  const rejection = new Error("synthetic transport failure");
  await assert.rejects(setup(undefined, { rejection }).cart.getCart(providerCart.id), error => error === rejection);
});

test("unconfigured read callers retain the existing null fallback without contacting Shopify", async () => {
  const fixture = setup(undefined, { configured: false });
  assert.equal(await fixture.cart.getCart(providerCart.id), null);
  assert.equal(fixture.getShopifyClient.mock.callCount(), 0);
  assert.equal(fixture.request.mock.callCount(), 0);
});

// These cases compose the actual getCart validator with recovery; a permissive probe stub cannot hide an invalid envelope.
for (const [name, response] of [...ambiguousResponses, ["existing cart", { data: { cart: providerCart } }]]) {
  test(`real-query recovery preserves the original add failure for ${name}`, async () => {
    const query = setup(response);
    const originalError = new Error("synthetic ambiguous add failure");
    const addToCart = mock.fn(async () => { throw originalError; });
    const createCart = mock.fn(async () => ({ id: "replacement-must-not-be-created" }));
    const operations = loadTypeScript(operationsSource, { dependencies: {
      "./cart": { ...query.cart, addToCart, createCart }, "./constants": { isShopifyConfigured: () => true },
    } });
    await assert.rejects(operations.addItemToCart(providerCart.id, "synthetic-variant", 1), error => error === originalError);
    assert.equal(addToCart.mock.callCount(), 1);
    assert.equal(query.request.mock.callCount(), 1);
    assert.equal(createCart.mock.callCount(), 0);
  });
}

test("real-query recovery permits exactly one replacement after an error-free null cart", async () => {
  const query = setup({ data: { cart: null } });
  const replacement = { id: "synthetic-replacement" };
  const createCart = mock.fn(async () => replacement);
  const operations = loadTypeScript(operationsSource, { dependencies: {
    "./cart": { ...query.cart, addToCart: async () => { throw new Error("synthetic add failure"); }, createCart },
    "./constants": { isShopifyConfigured: () => true },
  } });
  assert.equal(await operations.addItemToCart(providerCart.id, "synthetic-variant", 1), replacement);
  assert.equal(createCart.mock.callCount(), 1);
});
