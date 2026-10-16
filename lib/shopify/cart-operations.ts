import { addToCart, createCart, getCart } from "./cart";
import { isShopifyConfigured } from "./constants";
import type { Cart } from "@/types/commerce";

export async function addItemToCart(existingCartId: string | undefined, variantId: string, quantity: number = 1): Promise<Cart> {
  if (!isShopifyConfigured()) {
    throw new Error("Shopify is not configured");
  }

  if (!existingCartId) {
    return createCart(variantId, quantity);
  }

  try {
    return await addToCart(existingCartId, variantId, quantity);
  } catch (addError) {
    try {
      // A failed add may have succeeded upstream. Never retry it or replace a surviving cart.
      if ((await getCart(existingCartId)) === null) {
        return await createCart(variantId, quantity);
      }
    } catch {
      // Probe/replacement failures must preserve the original mutation failure.
    }
    throw addError;
  }
}
