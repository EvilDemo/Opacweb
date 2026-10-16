import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const existingCart = { id: "synthetic-existing-cart", totalQuantity: 2, lines: [{ id: "shirt" }, { id: "record" }] };
const returnedCart = { id: "synthetic-returned-cart", totalQuantity: 3, lines: [...existingCart.lines, { id: "new-line" }] };

function setup({ cartId = existingCart.id, addError, probeError, probe = existingCart, configured = true, createError, updateError, removeError, removedCart = returnedCart, nodeEnv = "production" } = {}) {
  const cookieStore = { get: mock.fn(() => cartId ? { value: cartId } : undefined), set: mock.fn(), delete: mock.fn() };
  const provider = {
    addToCart: mock.fn(async () => { if (addError) throw addError; return returnedCart; }),
    getCart: mock.fn(async () => { if (probeError) throw probeError; return probe; }),
    createCart: mock.fn(async () => { if (createError) throw createError; return returnedCart; }),
    updateCartLines: mock.fn(async () => { if (updateError) throw updateError; return returnedCart; }),
    removeFromCart: mock.fn(async () => { if (removeError) throw removeError; return removedCart; }),
  };
  const operations = loadTypeScript(new URL("../lib/shopify/cart-operations.ts", import.meta.url), { dependencies: {
    "./cart": provider, "./constants": { isShopifyConfigured: () => configured },
  } });
  const route = loadTypeScript(new URL("../app/api/cart/route.ts", import.meta.url), {
    dependencies: {
      "next/headers": { cookies: async () => cookieStore }, "@/lib/shopify/index": provider,
      "@/lib/shopify/cart-operations": operations,
      "@/lib/shopify/constants": loadTypeScript(new URL("../lib/shopify/constants.ts", import.meta.url), { env: { NODE_ENV: nodeEnv } }),
    }, allowImports: ["next/server"], env: { NODE_ENV: nodeEnv }, logger: { error: mock.fn() },
  });
  return { route, cookieStore, provider };
}

function request(body = { variantId: "synthetic-variant", quantity: 2 }) {
  return new Request("https://website.example.test/api/cart", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
}

for (const failure of ["cart survives", "probe fails", "replacement fails"]) {
  test(`REST add reports the original failure without overwriting the cookie when ${failure}`, async () => {
    const addError = new Error("Synthetic add timeout");
    const fixture = setup({ addError,
      probeError: failure === "probe fails" ? new Error("Synthetic probe failure") : undefined,
      probe: failure === "replacement fails" ? null : existingCart,
      createError: failure === "replacement fails" ? new Error("Synthetic replacement failure") : undefined,
    });
    const response = await fixture.route.POST(request());
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: addError.message });
    assert.equal(fixture.cookieStore.set.mock.callCount(), 0);
    assert.equal(fixture.cookieStore.delete.mock.callCount(), 0);
    assert.equal(fixture.provider.addToCart.mock.callCount(), 1);
    assert.equal(fixture.provider.getCart.mock.callCount(), 1);
    assert.equal(fixture.provider.createCart.mock.callCount(), failure === "replacement fails" ? 1 : 0);
    assert.equal(existingCart.lines.length, 2);
  });
}

for (const scenario of ["first cart", "existing cart", "confirmed expiry"]) {
  test(`REST add returns a cart and writes exactly one cookie for ${scenario}`, async () => {
    const fixture = setup({ cartId: scenario === "first cart" ? null : existingCart.id,
      addError: scenario === "confirmed expiry" ? new Error("Synthetic expired cart") : undefined, probe: null,
    });
    const response = await fixture.route.POST(request());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { cart: returnedCart });
    assert.equal(fixture.cookieStore.set.mock.callCount(), 1);
    const args = fixture.cookieStore.set.mock.calls[0].arguments;
    assert.equal(args[0], "cart_id"); assert.equal(args[1], returnedCart.id);
    assert.deepEqual({ ...args[2] }, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 172800, path: "/" });
    assert.equal(fixture.cookieStore.delete.mock.callCount(), 0);
    assert.equal(fixture.provider.createCart.mock.callCount(), scenario === "existing cart" ? 0 : 1);
    assert.equal(fixture.provider.getCart.mock.callCount(), scenario === "confirmed expiry" ? 1 : 0);
  });
}

test("REST retains explicit request cart ID precedence over its cookie", async () => {
  const fixture = setup();
  assert.equal((await fixture.route.POST(request({ variantId: "synthetic-variant", cartId: "synthetic-explicit-cart" }))).status, 200);
  assert.deepEqual([...fixture.provider.addToCart.mock.calls[0].arguments], ["synthetic-explicit-cart", "synthetic-variant", 1]);
});

test("REST missing variant retains its 400 response without provider or cookie writes", async () => {
  const fixture = setup();
  const response = await fixture.route.POST(request({}));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "variantId is required" });
  assert.equal(fixture.provider.addToCart.mock.callCount(), 0);
  assert.equal(fixture.provider.createCart.mock.callCount(), 0);
  assert.equal(fixture.cookieStore.set.mock.callCount(), 0);
});

test("REST missing configuration cannot authorize recovery", async () => {
  const fixture = setup({ configured: false });
  const response = await fixture.route.POST(request());
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: "Shopify is not configured" });
  for (const method of Object.values(fixture.provider)) assert.equal(method.mock.callCount(), 0);
  assert.equal(fixture.cookieStore.set.mock.callCount(), 0);
  assert.equal(fixture.cookieStore.delete.mock.callCount(), 0);
});

function assertNoCookieWrites(fixture) {
  assert.equal(fixture.cookieStore.set.mock.callCount(), 0);
  assert.equal(fixture.cookieStore.delete.mock.callCount(), 0);
}

for (const scenario of ["no cookie", "existing cart", "expired cart", "provider failure"]) {
  test(`REST GET retains its envelope and cookie behavior for ${scenario}`, async () => {
    const fixture = setup({ cartId: scenario === "no cookie" ? null : existingCart.id,
      probe: scenario === "expired cart" ? null : existingCart,
      probeError: scenario === "provider failure" ? new Error("Synthetic provider failure") : undefined,
    });
    const response = await fixture.route.GET();
    assert.equal(response.status, scenario === "provider failure" ? 500 : 200);
    assert.deepEqual(await response.json(), scenario === "provider failure" ? { error: "Failed to fetch cart" } : { cart: scenario === "existing cart" ? existingCart : null });
    assert.equal(fixture.provider.getCart.mock.callCount(), scenario === "no cookie" ? 0 : 1);
    assert.equal(fixture.cookieStore.set.mock.callCount(), 0);
    assert.equal(fixture.cookieStore.delete.mock.callCount(), scenario === "expired cart" ? 1 : 0);
    if (scenario === "expired cart") assert.deepEqual([...fixture.cookieStore.delete.mock.calls[0].arguments], ["cart_id"]);
  });
}

for (const [bodyCartId, expectedId] of [[undefined, existingCart.id], ["synthetic-body-cart", "synthetic-body-cart"]]) {
  test(`REST PUT forwards updates using ${bodyCartId ? "body ID precedence" : "its cookie ID"}`, async () => {
    const fixture = setup();
    const updates = [{ id: "shirt", quantity: 3 }, { id: "record", quantity: 2 }];
    const response = await fixture.route.PUT(request({ updates, ...(bodyCartId ? { cartId: bodyCartId } : {}) }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { cart: returnedCart });
    const args = fixture.provider.updateCartLines.mock.calls[0].arguments;
    assert.equal(args[0], expectedId);
    assert.deepEqual(args[1], updates);
    assertNoCookieWrites(fixture);
  });
}

for (const scenario of ["missing updates", "missing cart", "provider failure"]) {
  test(`REST PUT retains error status/body for ${scenario}`, async () => {
    const fixture = setup({ cartId: scenario === "missing cart" ? null : existingCart.id,
      updateError: scenario === "provider failure" ? new Error("Synthetic update failure") : undefined,
    });
    const response = await fixture.route.PUT(request(scenario === "missing updates" ? {} : { updates: [{ id: "shirt", quantity: 2 }] }));
    assert.equal(response.status, { "missing updates": 400, "missing cart": 404, "provider failure": 500 }[scenario]);
    assert.deepEqual(await response.json(), { error: { "missing updates": "updates array is required", "missing cart": "Cart not found", "provider failure": "Synthetic update failure" }[scenario] });
    assert.equal(fixture.provider.updateCartLines.mock.callCount(), scenario === "provider failure" ? 1 : 0);
    assertNoCookieWrites(fixture);
  });
}

for (const empty of [false, true]) {
  test(`REST DELETE forwards comma-separated line IDs and ${empty ? "clears an emptied cart cookie" : "preserves a nonempty cart cookie"}`, async () => {
    const removedCart = empty ? { ...existingCart, totalQuantity: 0, lines: [] } : existingCart;
    const fixture = setup({ removedCart });
    const response = await fixture.route.DELETE(new Request("https://website.example.test/api/cart?lineIds=shirt,record&cartId=ignored-body-style-id"));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { cart: removedCart });
    const args = fixture.provider.removeFromCart.mock.calls[0].arguments;
    assert.equal(args[0], existingCart.id);
    assert.deepEqual([...args[1]], ["shirt", "record"]);
    assert.equal(fixture.cookieStore.set.mock.callCount(), 0);
    assert.equal(fixture.cookieStore.delete.mock.callCount(), empty ? 1 : 0);
    if (empty) assert.deepEqual([...fixture.cookieStore.delete.mock.calls[0].arguments], ["cart_id"]);
  });
}

for (const scenario of ["missing lines", "missing cart", "provider failure"]) {
  test(`REST DELETE retains error status/body for ${scenario}`, async () => {
    const fixture = setup({ cartId: scenario === "missing cart" ? null : existingCart.id,
      removeError: scenario === "provider failure" ? new Error("Synthetic removal failure") : undefined,
    });
    const response = await fixture.route.DELETE(new Request("https://website.example.test/api/cart" + (scenario === "missing lines" ? "" : "?lineIds=shirt")));
    assert.equal(response.status, { "missing lines": 400, "missing cart": 404, "provider failure": 500 }[scenario]);
    assert.deepEqual(await response.json(), { error: { "missing lines": "lineIds are required", "missing cart": "Cart not found", "provider failure": "Synthetic removal failure" }[scenario] });
    assert.equal(fixture.provider.removeFromCart.mock.callCount(), scenario === "provider failure" ? 1 : 0);
    assertNoCookieWrites(fixture);
  });
}

test("REST POST retains explicit valid quantities when using its cookie ID", async () => {
  const fixture = setup();
  assert.equal((await fixture.route.POST(request({ variantId: "synthetic-variant", quantity: 4 }))).status, 200);
  assert.deepEqual([...fixture.provider.addToCart.mock.calls[0].arguments], [existingCart.id, "synthetic-variant", 4]);
});

for (const nodeEnv of ["production", "development"]) {
  test(`REST add uses the shared two-day cookie policy in ${nodeEnv}`, async () => {
    const fixture = setup({ nodeEnv });
    assert.equal((await fixture.route.POST(request())).status, 200);
    assert.equal(fixture.cookieStore.set.mock.callCount(), 1);
    const args = fixture.cookieStore.set.mock.calls[0].arguments;
    assert.equal(args[0], "cart_id");
    assert.deepEqual({ ...args[2] }, { httpOnly: true, secure: nodeEnv === "production", sameSite: "lax", maxAge: 172800, path: "/" });
  });
}
