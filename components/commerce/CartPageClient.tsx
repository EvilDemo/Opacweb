"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Price } from "./Price";
import type { Cart } from "@/types/commerce";

export function CartPageClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          updates: [{ id: lineId, quantity }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const removeItem = async (lineId: string) => {
    try {
      const response = await fetch(`/api/cart?lineIds=${lineId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] padding-global py-16">
        <p className="body-text text-neutral-400">Loading cart...</p>
      </div>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] padding-global py-16 space-y-6">
        <h1 className="heading-1">Shopping Cart</h1>
        <p className="body-text-lg text-neutral-400">Your cart is empty</p>
        <Button variant="default" asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="padding-global py-16">
      <h1 className="heading-1 mb-12">Shopping Cart</h1>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.lines.map((line) => (
              <div
                key={line.id}
                className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-neutral-800"
              >
                {line.merchandise.image && (
                  <div className="relative w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-900">
                    <Image
                      src={line.merchandise.image.url}
                      alt={line.merchandise.image.altText || line.merchandise.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 128px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="heading-4 mb-2">{line.merchandise.title}</h3>
                  <Price
                    price={line.cost.totalAmount.amount}
                    currencyCode={line.cost.totalAmount.currencyCode}
                    size="md"
                    className="mb-4"
                  />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateQuantity(line.id, line.quantity - 1)}
                        className="h-9 w-9 p-0"
                      >
                        -
                      </Button>
                      <span className="body-text w-10 text-center">{line.quantity}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
                        className="h-9 w-9 p-0"
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(line.id)}
                      className="text-neutral-400 hover:text-white"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 space-y-6">
              <h2 className="heading-3">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="body-text text-neutral-400">Subtotal</span>
                  <Price
                    price={cart.cost.subtotalAmount.amount}
                    currencyCode={cart.cost.subtotalAmount.currencyCode}
                  />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                  <span className="body-text-lg text-white font-semibold">Total</span>
                  <Price
                    price={cart.cost.totalAmount.amount}
                    currencyCode={cart.cost.totalAmount.currencyCode}
                    size="lg"
                  />
                </div>
              </div>

              <Button variant="default" className="w-full" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

