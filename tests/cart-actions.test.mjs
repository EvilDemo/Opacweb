import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const actionsSource = new URL("../lib/shopify/actions.ts", import.meta.url);

function createCart() {
  const money = { amount: "20.00", currencyCode: "EUR" };
  return {
    id: "fixture-cart",
    checkoutUrl: "https://checkout.example.test/fixture-cart",
    totalQuantity: 1,
    lines: [{
      id: "fixture-line",
      quantity: 1,
      productTitle: "Fixture shirt",
      cost: { totalAmount: money },
      merchandise: {
        id: "fixture-variant",
        title: "Medium",
        price: "20.00",
        availableForSale: true,
        selectedOptions: [{ name: "Size", value: "M" }],
      },
    }],
    cost: { totalAmount: money, subtotalAmount: money },
  };
}

function loadCartActions({ cartId, getCart = async () => null, createCart, addToCart, nodeEnv = "test" } = {}) {
  const cookieStore = {
    get: mock.fn(() => cartId ? { value: cartId } : undefined),
    set: mock.fn(),
    delete: mock.fn(),
  };
  const unexpectedMutation = () => { throw new Error("Cart reads must not mutate the provider"); };
  const provider = {
    getCart: mock.fn(getCart),
    createCart: mock.fn(createCart ?? unexpectedMutation),
    addToCart: mock.fn(addToCart ?? unexpectedMutation),
    updateCartLines: mock.fn(unexpectedMutation),
    removeFromCart: mock.fn(unexpectedMutation),
  };
  const revalidatePath = mock.fn();
  const logger = { error: mock.fn() };
  const operations = loadTypeScript(new URL("../lib/shopify/cart-operations.ts", import.meta.url), {
    dependencies: { "./cart": provider, "./constants": { isShopifyConfigured: () => true } },
  });
  const actions = loadTypeScript(actionsSource, {
    dependencies: {
      "next/headers": { cookies: async () => cookieStore },
      "next/cache": { revalidatePath },
      "./cart": provider,
      "./cart-operations": operations,
      "./constants": loadTypeScript(new URL("../lib/shopify/constants.ts", import.meta.url), { env: { NODE_ENV: nodeEnv } }),
    },
    env: { NODE_ENV: nodeEnv },
    logger,
  });
  return { actions, cookieStore, provider, revalidatePath, logger };
}

function assertReadOnlyEffects({ cookieStore, provider, revalidatePath }) {
  assert.equal(cookieStore.get.mock.callCount(), 1);
  assert.deepEqual([...cookieStore.get.mock.calls[0].arguments], ["cart_id"]);
  assert.equal(cookieStore.set.mock.callCount(), 0);
  assert.equal(revalidatePath.mock.callCount(), 0);
  for (const method of ["createCart", "addToCart", "updateCartLines", "removeFromCart"]) {
    assert.equal(provider[method].mock.callCount(), 0, `${method} must not run during a cart read`);
  }
}

test("a missing cart cookie returns an empty result without calling Shopify", async () => {
  const fixture = loadCartActions();
  const result = await fixture.actions.getCartAction();

  assert.equal(result.cart, null);
  assert.equal(result.error, null);
  assert.equal(fixture.provider.getCart.mock.callCount(), 0);
  assert.equal(fixture.cookieStore.delete.mock.callCount(), 0);
  assert.equal(fixture.logger.error.mock.callCount(), 0);
  assertReadOnlyEffects(fixture);
});

test("a valid cart cookie returns the provider cart without changing cookies", async () => {
  const cart = createCart();
  const fixture = loadCartActions({ cartId: cart.id, getCart: async () => cart });
  const result = await fixture.actions.getCartAction();

  assert.equal(result.cart, cart);
  assert.equal(result.error, null);
  assert.equal(fixture.provider.getCart.mock.callCount(), 1);
  assert.deepEqual([...fixture.provider.getCart.mock.calls[0].arguments], [cart.id]);
  assert.equal(fixture.cookieStore.delete.mock.callCount(), 0);
  assert.equal(fixture.logger.error.mock.callCount(), 0);
  assertReadOnlyEffects(fixture);
});

test("a confirmed missing provider cart clears its expired cookie", async () => {
  const fixture = loadCartActions({ cartId: "expired-fixture-cart" });
  const result = await fixture.actions.getCartAction();

  assert.equal(result.cart, null);
  assert.equal(result.error, null);
  assert.equal(fixture.provider.getCart.mock.callCount(), 1);
  assert.deepEqual([...fixture.provider.getCart.mock.calls[0].arguments], ["expired-fixture-cart"]);
  assert.equal(fixture.cookieStore.delete.mock.callCount(), 1);
  assert.deepEqual([...fixture.cookieStore.delete.mock.calls[0].arguments], ["cart_id"]);
  assert.equal(fixture.logger.error.mock.callCount(), 0);
  assertReadOnlyEffects(fixture);
});

test("a provider read failure reports an error and preserves the cart cookie", async () => {
  const failure = new Error("Fixture provider unavailable");
  const fixture = loadCartActions({ cartId: "fixture-cart", getCart: async () => { throw failure; } });
  const result = await fixture.actions.getCartAction();

  assert.equal(result.cart, null);
  assert.equal(result.error, failure.message);
  assert.equal(fixture.provider.getCart.mock.callCount(), 1);
  assert.equal(fixture.cookieStore.delete.mock.callCount(), 0);
  assert.equal(fixture.logger.error.mock.callCount(), 1);
  assertReadOnlyEffects(fixture);
});

test("independent cart requests do not share cookies or failure state", async () => {
  const failedRequest = loadCartActions({
    cartId: "failed-fixture-cart",
    getCart: async () => { throw new Error("Fixture failure"); },
  });
  const cart = createCart();
  const successfulRequest = loadCartActions({ cartId: cart.id, getCart: async () => cart });

  assert.equal((await failedRequest.actions.getCartAction()).cart, null);
  const result = await successfulRequest.actions.getCartAction();
  assert.equal(result.cart, cart);
  assert.equal(result.error, null);
  assert.deepEqual([...failedRequest.provider.getCart.mock.calls[0].arguments], ["failed-fixture-cart"]);
  assert.deepEqual([...successfulRequest.provider.getCart.mock.calls[0].arguments], [cart.id]);
  assert.equal(successfulRequest.logger.error.mock.callCount(), 0);
  assertReadOnlyEffects(failedRequest);
  assertReadOnlyEffects(successfulRequest);
});

test("a transient add failure preserves the existing multi-line cart and cookie", async () => {
  const cart = createCart();
  cart.lines.push({ ...cart.lines[0], id: "fixture-second-line" });
  cart.totalQuantity = 2;
  const failure = new Error("Synthetic add request timed out");
  const fixture = loadCartActions({
    cartId: cart.id, getCart: async () => cart,
    addToCart: async () => { throw failure; }, createCart: async () => ({ ...cart, id: "replacement-would-lose-items" }),
  });
  const result = await fixture.actions.addToCartAction("fixture-new-variant", 2);
  assert.equal(result.cart, null);
  assert.equal(result.error, failure.message);
  assert.equal(fixture.provider.addToCart.mock.callCount(), 1);
  assert.equal(fixture.provider.getCart.mock.callCount(), 1);
  assert.equal(fixture.provider.createCart.mock.callCount(), 0);
  assert.equal(fixture.cookieStore.set.mock.callCount(), 0);
  assert.equal(fixture.cookieStore.delete.mock.callCount(), 0);
  assert.equal(fixture.revalidatePath.mock.callCount(), 0);
  assert.equal(cart.lines.length, 2);
});

test("a failed recovery probe reports the original add failure without cookie or path effects", async () => {
  const fixture = loadCartActions({
    cartId: "fixture-cart", addToCart: async () => { throw new Error("Synthetic add failure"); },
    getCart: async () => { throw new Error("Synthetic probe failure"); },
  });
  const result = await fixture.actions.addToCartAction("fixture-variant");
  assert.equal(result.error, "Synthetic add failure");
  assert.equal(result.cart, null);
  assert.equal(fixture.cookieStore.set.mock.callCount(), 0);
  assert.equal(fixture.cookieStore.delete.mock.callCount(), 0);
  assert.equal(fixture.revalidatePath.mock.callCount(), 0);
  assert.equal(fixture.provider.createCart.mock.callCount(), 0);
});

for (const scenario of ["first cart", "existing cart", "confirmed expiry"]) {
  test(`add action writes one cookie and retains its response shape for ${scenario}`, async () => {
    const cart = createCart();
    const fixture = loadCartActions({
      cartId: scenario === "first cart" ? undefined : "old-fixture-cart",
      getCart: async () => null, createCart: async () => cart,
      addToCart: async () => { if (scenario === "confirmed expiry") throw new Error("Synthetic expired cart"); return cart; },
    });
    const result = await fixture.actions.addToCartAction("fixture-variant", 2);
    assert.equal(result.cart, cart);
    assert.equal(result.error, null);
    assert.equal(fixture.cookieStore.set.mock.callCount(), 1);
    const args = fixture.cookieStore.set.mock.calls[0].arguments;
    assert.equal(args[0], "cart_id"); assert.equal(args[1], cart.id);
    assert.deepEqual({ ...args[2] }, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 172800, path: "/" });
    assert.equal(fixture.cookieStore.delete.mock.callCount(), 0);
    assert.deepEqual(fixture.revalidatePath.mock.calls.map(({ arguments: callArgs }) => callArgs[0]), ["/shop", "/cart"]);
    assert.equal(fixture.provider.createCart.mock.callCount(), scenario === "existing cart" ? 0 : 1);
    assert.equal(fixture.provider.getCart.mock.callCount(), scenario === "confirmed expiry" ? 1 : 0);
  });
}

for (const nodeEnv of ["production", "development"]) {
  test(`add action uses the shared two-day cookie policy in ${nodeEnv}`, async () => {
    const cart = createCart();
    const fixture = loadCartActions({ nodeEnv, createCart: async () => cart });
    const result = await fixture.actions.addToCartAction("fixture-variant");
    assert.equal(result.cart, cart);
    assert.equal(result.error, null);
    assert.equal(fixture.cookieStore.set.mock.callCount(), 1);
    const args = fixture.cookieStore.set.mock.calls[0].arguments;
    assert.equal(args[0], "cart_id");
    assert.deepEqual({ ...args[2] }, { httpOnly: true, secure: nodeEnv === "production", sameSite: "lax", maxAge: 172800, path: "/" });
  });
}
