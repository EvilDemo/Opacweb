"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createCart, addToCart, getCart, updateCartLines, removeFromCart } from "./cart";
import { CART_COOKIE, CART_COOKIE_MAX_AGE } from "./constants";
import type { Cart } from "@/types/commerce";

export interface ActionResult {
  cart: Cart | null;
  error: string | null;
}

/**
 * Server action to add an item to the cart
 * Automatically creates a new cart if one doesn't exist
 */
export async function addToCartAction(variantId: string, quantity: number = 1): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const existingCartId = cookieStore.get(CART_COOKIE)?.value;

    let cart: Cart;

    if (existingCartId) {
      try {
        // Try to add to existing cart
        cart = await addToCart(existingCartId, variantId, quantity);
      } catch (error) {
        // Cart is invalid, create a new one
        // But if createCart also fails, we want to throw that error
        try {
          cart = await createCart(variantId, quantity);
        } catch {
          // Both failed, throw the original addToCart error (more relevant)
          throw error;
        }
      }
    } else {
      // Create new cart
      cart = await createCart(variantId, quantity);
    }

    // Set or update cart cookie
    cookieStore.set(CART_COOKIE, cart.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: CART_COOKIE_MAX_AGE,
      path: "/",
    });

    revalidatePath("/shop");
    revalidatePath("/cart");

    return { cart, error: null };
  } catch (error) {
    console.error("Error in addToCartAction:", error);
    return {
      cart: null,
      error: error instanceof Error ? error.message : "Failed to add item to cart",
    };
  }
}

/**
 * Server action to get the current cart
 */
export async function getCartAction(): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE)?.value;

    if (!cartId) {
      return { cart: null, error: null };
    }

    const cart = await getCart(cartId);

    // If cart is invalid or expired, clear the cookie
    if (!cart) {
      cookieStore.delete(CART_COOKIE);
      return { cart: null, error: null };
    }

    return { cart, error: null };
  } catch (error) {
    console.error("Error in getCartAction:", error);
    return {
      cart: null,
      error: error instanceof Error ? error.message : "Failed to fetch cart",
    };
  }
}

/**
 * Server action to update cart line quantities
 */
export async function updateCartLineAction(
  lineId: string,
  quantity: number
): Promise<ActionResult> {
  if (quantity < 1) {
    return { cart: null, error: "Quantity must be at least 1" };
  }

  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE)?.value;

    if (!cartId) {
      return { cart: null, error: "Cart not found" };
    }

    const cart = await updateCartLines(cartId, [{ id: lineId, quantity }]);

    revalidatePath("/cart");
    revalidatePath("/shop");

    return { cart, error: null };
  } catch (error) {
    console.error("Error in updateCartLineAction:", error);
    return {
      cart: null,
      error: error instanceof Error ? error.message : "Failed to update cart",
    };
  }
}

/**
 * Server action to remove items from the cart
 */
export async function removeFromCartAction(lineIds: string[]): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE)?.value;

    if (!cartId) {
      return { cart: null, error: "Cart not found" };
    }

    const cart = await removeFromCart(cartId, lineIds);

    // If cart is empty, remove the cookie
    if (cart.totalQuantity === 0) {
      cookieStore.delete(CART_COOKIE);
    }

    revalidatePath("/cart");
    revalidatePath("/shop");

    return { cart, error: null };
  } catch (error) {
    console.error("Error in removeFromCartAction:", error);
    return {
      cart: null,
      error: error instanceof Error ? error.message : "Failed to remove item from cart",
    };
  }
}

/**
 * Server action to clear the entire cart
 */
export async function clearCartAction(): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(CART_COOKIE);

    revalidatePath("/cart");
    revalidatePath("/shop");

    return { cart: null, error: null };
  } catch (error) {
    console.error("Error in clearCartAction:", error);
    return {
      cart: null,
      error: error instanceof Error ? error.message : "Failed to clear cart",
    };
  }
}

