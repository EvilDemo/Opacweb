import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCart, updateCartLines, removeFromCart } from "@/lib/shopify/index";
import { addItemToCart } from "@/lib/shopify/cart-operations";
import { CART_COOKIE, getCartCookieOptions } from "@/lib/shopify/constants";

// GET - Retrieve cart
export async function GET() {
  try {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE)?.value;

    if (!cartId) {
      return NextResponse.json({ cart: null });
    }

    const cart = await getCart(cartId);

    if (!cart) {
      // Clear invalid cart cookie
      cookieStore.delete(CART_COOKIE);
      return NextResponse.json({ cart: null });
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// POST - Create cart or add item to existing cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variantId, quantity = 1, cartId } = body;
    const cookieStore = await cookies();

    if (!variantId) {
      return NextResponse.json({ error: "variantId is required" }, { status: 400 });
    }

    const existingCartId = cartId || cookieStore.get(CART_COOKIE)?.value;
    const cart = await addItemToCart(existingCartId, variantId, quantity);

    // Set cart cookie
    cookieStore.set(CART_COOKIE, cart.id, getCartCookieOptions());

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Error creating/updating cart:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update cart" },
      { status: 500 }
    );
  }
}

// PUT - Update cart lines (quantities)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates, cartId } = body;
    const cookieStore = await cookies();

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: "updates array is required" }, { status: 400 });
    }

    const existingCartId = cartId || cookieStore.get(CART_COOKIE)?.value;

    if (!existingCartId) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cart = await updateCartLines(existingCartId, updates);

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE - Remove items from cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lineIds = searchParams.get("lineIds")?.split(",") || [];
    const cookieStore = await cookies();

    if (lineIds.length === 0) {
      return NextResponse.json({ error: "lineIds are required" }, { status: 400 });
    }

    const cartId = cookieStore.get(CART_COOKIE)?.value;

    if (!cartId) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cart = await removeFromCart(cartId, lineIds);

    // If cart is empty, remove the cookie
    if (cart.totalQuantity === 0) {
      cookieStore.delete(CART_COOKIE);
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
