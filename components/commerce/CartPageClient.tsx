"use client";

import { useOptimistic, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Price } from "./Price";
import { useCart } from "./CartContext";
import { updateCartLineAction, removeFromCartAction } from "@/lib/shopify/actions";
import type { Cart } from "@/types/commerce";

export function CartPageClient() {
  const { cart, isLoading, updateCart } = useCart();
  const [isPending, startTransition] = useTransition();

  // Optimistic cart state for instant UI updates
  const [optimisticCart, setOptimisticCart] = useOptimistic(
    cart,
    (state: Cart | null, update: { type: string; lineId: string; quantity?: number }) => {
      if (!state) return state;

      if (update.type === "update") {
        return {
          ...state,
          lines: state.lines.map((line) =>
            line.id === update.lineId ? { ...line, quantity: update.quantity || line.quantity } : line
          ),
        };
      }

      if (update.type === "remove") {
        return {
          ...state,
          lines: state.lines.filter((line) => line.id !== update.lineId),
          totalQuantity: Math.max(0, state.totalQuantity - 1),
        };
      }

      return state;
    }
  );

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (quantity < 1) return;

    startTransition(async () => {
      // Optimistic update
      setOptimisticCart({ type: "update", lineId, quantity });

      const result = await updateCartLineAction(lineId, quantity);

      if (result.error) {
        // Only refresh on error to get correct state
      } else {
        updateCart(result.cart);
      }
    });
  };

  const removeItem = async (lineId: string) => {
    startTransition(async () => {
      // Optimistic update
      setOptimisticCart({ type: "remove", lineId });

      const result = await removeFromCartAction([lineId]);

      if (result.error) {
        // Only refresh on error to get correct state
      } else {
        updateCart(result.cart);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] padding-global py-16">
        <p className="body-text text-neutral-400">Loading cart...</p>
      </div>
    );
  }

  if (!optimisticCart || optimisticCart.lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] padding-global py-16 space-y-6">
        <h1 className="heading-1">Shopping Cart</h1>
        <p className="body-text-lg text-neutral-400">Your cart is empty</p>
        <Button variant="default" asChild>
          <Link href="/shop" aria-label="Continue shopping">Continue Shopping</Link>
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
            {optimisticCart.lines.map((line) => (
              <div key={line.id} className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-neutral-800">
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
                  <h3 className="heading-4 mb-2">{line.productTitle}</h3>
                  {line.merchandise.selectedOptions
                    .filter((opt) => opt.name.toLowerCase() === "size")
                    .map((opt) => (
                      <p key={opt.name} className="body-text-sm text-neutral-400 mb-2">
                        Size: {opt.value}
                      </p>
                    ))}
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
                        disabled={isPending}
                        aria-label={`Decrease quantity of ${line.productTitle || 'item'}`}
                      >
                        -
                      </Button>
                      <span className="body-text w-10 text-center" aria-label={`Quantity: ${line.quantity}`}>{line.quantity}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
                        className="h-9 w-9 p-0"
                        disabled={isPending}
                        aria-label={`Increase quantity of ${line.productTitle || 'item'}`}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(line.id)}
                      className="text-neutral-400 hover:text-white"
                      disabled={isPending}
                      aria-label={`Remove ${line.productTitle || 'item'} from cart`}
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
                    price={optimisticCart.cost.subtotalAmount.amount}
                    currencyCode={optimisticCart.cost.subtotalAmount.currencyCode}
                  />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                  <span className="body-text-lg text-white font-semibold">Total</span>
                  <Price
                    price={optimisticCart.cost.totalAmount.amount}
                    currencyCode={optimisticCart.cost.totalAmount.currencyCode}
                    size="lg"
                  />
                </div>
              </div>

              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  if (optimisticCart?.checkoutUrl) {
                    window.location.href = optimisticCart.checkoutUrl;
                  }
                }}
                disabled={!optimisticCart?.checkoutUrl}
                aria-label="Proceed to checkout"
              >
                Proceed to Checkout
              </Button>
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/shop" aria-label="Continue shopping">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
