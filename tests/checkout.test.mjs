import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const checkoutSource = new URL("../app/checkout/page.tsx", import.meta.url);

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

const cart = createCart();
const scenarios = [
  { name: "cart lookup errors return visitors to the cart", result: { cart: null, error: "Fixture lookup failure" }, destination: "/cart" },
  { name: "lookup errors take precedence over a populated cart", result: { cart, error: "Fixture lookup failure" }, destination: "/cart" },
  { name: "visitors without a cart return to the shop", result: { cart: null, error: null }, destination: "/shop" },
  { name: "empty carts return visitors to the shop", result: { cart: { ...cart, lines: [], totalQuantity: 0 }, error: null }, destination: "/shop" },
  { name: "carts without a checkout URL return visitors to the shop", result: { cart: { ...cart, checkoutUrl: "" }, error: null }, destination: "/shop" },
  { name: "populated carts redirect to their checkout URL", result: { cart, error: null }, destination: cart.checkoutUrl },
];

for (const { name, result, destination } of scenarios) {
  test(name, async () => {
    const redirectSignal = new Error("Fixture redirect");
    const redirect = mock.fn(() => { throw redirectSignal; });
    const getCartAction = mock.fn(async () => result);
    const { default: CheckoutPage } = loadTypeScript(checkoutSource, {
      dependencies: {
        "next/navigation": { redirect },
        "@/lib/shopify/actions": { getCartAction },
      },
    });

    await assert.rejects(CheckoutPage, (error) => error === redirectSignal);
    assert.equal(getCartAction.mock.callCount(), 1);
    assert.equal(getCartAction.mock.calls[0].arguments.length, 0);
    assert.equal(redirect.mock.callCount(), 1);
    assert.deepEqual([...redirect.mock.calls[0].arguments], [destination]);
  });
}
