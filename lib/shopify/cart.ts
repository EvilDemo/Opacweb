import { getShopifyClient } from "./client";
import { isShopifyConfigured } from "./constants";
import { CREATE_CART_MUTATION, ADD_TO_CART_MUTATION, UPDATE_CART_LINES_MUTATION, REMOVE_FROM_CART_MUTATION } from "./mutations/cart";
import { GET_CART_QUERY } from "./queries/cart";
import { transformCart } from "./utils";
import type { Cart } from "@/types/commerce";

type TransformCartInput = Parameters<typeof transformCart>[0];

interface CartMutationUserError {
  message: string;
}

interface CartCreateResponse {
  data: {
    cartCreate: {
      cart: unknown | null;
      userErrors?: CartMutationUserError[];
    };
  };
}

interface CartLinesAddResponse {
  data: {
    cartLinesAdd: {
      cart: unknown | null;
      userErrors?: CartMutationUserError[];
    };
  };
}

interface CartLinesUpdateResponse {
  data: {
    cartLinesUpdate: {
      cart: unknown | null;
      userErrors?: CartMutationUserError[];
    };
  };
}

interface CartLinesRemoveResponse {
  data: {
    cartLinesRemove: {
      cart: unknown | null;
      userErrors?: CartMutationUserError[];
    };
  };
}

interface CartQueryResponse {
  cart?: unknown;
}

function getFirstUserErrorMessage(errors?: CartMutationUserError[]): string | null {
  return errors?.length ? errors[0].message : null;
}

export async function createCart(variantId: string, quantity: number = 1): Promise<Cart> {
  if (!isShopifyConfigured()) {
    throw new Error("Shopify is not configured");
  }

  try {
    const client = getShopifyClient();
    const response = (await client.request(CREATE_CART_MUTATION, {
      variables: {
        input: {
          lines: [{ merchandiseId: variantId, quantity }],
        },
      },
    })) as CartCreateResponse;

    const errorMessage = getFirstUserErrorMessage(response.data.cartCreate.userErrors);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    if (!response.data.cartCreate.cart) {
      throw new Error("Shopify returned an empty cart response");
    }

    return transformCart(response.data.cartCreate.cart as TransformCartInput);
  } catch (error) {
    console.error("Error creating cart:", error);
    throw error;
  }
}

export async function addToCart(cartId: string, variantId: string, quantity: number = 1): Promise<Cart> {
  if (!isShopifyConfigured()) {
    throw new Error("Shopify is not configured");
  }

  try {
    const client = getShopifyClient();
    const response = (await client.request(ADD_TO_CART_MUTATION, {
      variables: {
        cartId,
        lines: [{ merchandiseId: variantId, quantity }],
      },
    })) as CartLinesAddResponse;

    const errorMessage = getFirstUserErrorMessage(response.data.cartLinesAdd.userErrors);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    if (!response.data.cartLinesAdd.cart) {
      throw new Error("Shopify returned an empty cart response");
    }

    return transformCart(response.data.cartLinesAdd.cart as TransformCartInput);
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}

export async function getCart(cartId: string): Promise<Cart | null> {
  if (!isShopifyConfigured()) {
    return null;
  }

  try {
    const client = getShopifyClient();
    const response = await client.request<CartQueryResponse>(GET_CART_QUERY, {
      variables: { id: cartId },
    });

    // An SDK error or incomplete envelope cannot establish that a cart expired.
    if (response.errors !== undefined) {
      throw new Error("Shopify cart query failed");
    }
    if (!response.data || typeof response.data !== "object" || Array.isArray(response.data) || !Object.hasOwn(response.data, "cart")) {
      throw new Error("Shopify returned an invalid cart response");
    }

    if (response.data.cart === null) {
      return null;
    }

    if (!response.data.cart || typeof response.data.cart !== "object" || Array.isArray(response.data.cart)) {
      throw new Error("Shopify returned an invalid cart response");
    }

    return transformCart(response.data.cart as TransformCartInput);
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
}

export async function updateCartLines(cartId: string, updates: Array<{ id: string; quantity: number }>): Promise<Cart> {
  if (!isShopifyConfigured()) {
    throw new Error("Shopify is not configured");
  }

  try {
    const client = getShopifyClient();
    const response = (await client.request(UPDATE_CART_LINES_MUTATION, {
      variables: {
        cartId,
        lines: updates.map((update) => ({ id: update.id, quantity: update.quantity })),
      },
    })) as CartLinesUpdateResponse;

    const errorMessage = getFirstUserErrorMessage(response.data.cartLinesUpdate.userErrors);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    if (!response.data.cartLinesUpdate.cart) {
      throw new Error("Shopify returned an empty cart response");
    }

    return transformCart(response.data.cartLinesUpdate.cart as TransformCartInput);
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  if (!isShopifyConfigured()) {
    throw new Error("Shopify is not configured");
  }

  try {
    const client = getShopifyClient();
    const response = (await client.request(REMOVE_FROM_CART_MUTATION, {
      variables: { cartId, lineIds },
    })) as CartLinesRemoveResponse;

    const errorMessage = getFirstUserErrorMessage(response.data.cartLinesRemove.userErrors);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    if (!response.data.cartLinesRemove.cart) {
      throw new Error("Shopify returned an empty cart response");
    }

    return transformCart(response.data.cartLinesRemove.cart as TransformCartInput);
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
}
