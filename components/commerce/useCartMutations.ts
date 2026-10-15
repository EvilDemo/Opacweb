"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { addToCartAction, removeFromCartAction, updateCartLineAction, type ActionResult } from "@/lib/shopify/actions";
import { applyCartUpdate, createCartMutationLock, type CartOptimisticUpdate } from "@/lib/cart-state";
import type { Cart } from "@/types/commerce";

interface UseCartMutationsOptions {
  cart: Cart | null;
  updateCart: (newCart: Cart | null) => void;
  refreshCart: () => Promise<void>;
  onItemAdded: () => void;
}

function getErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unable to update cart. Please try again.";
  if (/network|fetch|connection/i.test(message)) {
    return "Unable to update cart. Please try again.";
  }
  if (/not available|sold out|out of stock|insufficient inventory|unavailable/i.test(message)) {
    return "This item is out of stock in the requested quantity.";
  }
  if (/quantity|exceed|maximum|limit/i.test(message)) {
    return "Unable to update to this quantity. Please check available stock.";
  }
  return message;
}

// One instance in CartProvider keeps the page, drawer and add buttons in sync.
export function useCartMutations({ cart, updateCart, refreshCart, onItemAdded }: UseCartMutationsOptions) {
  const [optimisticCart, setOptimisticCart] = useOptimistic(cart, applyCartUpdate);
  const [isPending, startTransition] = useTransition();
  const [runExclusive] = useState(createCartMutationLock);

  const mutate = (
    request: () => Promise<ActionResult>,
    optimisticUpdate?: CartOptimisticUpdate,
    onSuccess?: (updatedCart: Cart) => void
  ) => {
    startTransition(async () => {
      await runExclusive(async () => {
        if (optimisticUpdate) setOptimisticCart(optimisticUpdate);
        try {
          const result = await request();
          if (result.error || !result.cart) throw new Error(result.error || "Unable to update cart. Please try again.");
          const updatedCart = result.cart;
          startTransition(() => updateCart(updatedCart));
          onSuccess?.(updatedCart);
        } catch (error) {
          toast.error(getErrorMessage(error));
          await refreshCart();
        }
      });
    });
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;
    mutate(
      () => updateCartLineAction(lineId, quantity),
      { type: "update", lineId, quantity },
      (updatedCart) => {
        const actualQuantity = updatedCart.lines.find((line) => line.id === lineId)?.quantity || 0;
        if (actualQuantity < quantity) toast.error(`Only ${actualQuantity} item(s) available. Cart updated.`);
      }
    );
  };

  const removeItem = (lineId: string) => {
    mutate(() => removeFromCartAction([lineId]), { type: "remove", lineId });
  };

  const addItem = (variantId: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;
    const quantityBefore = cart?.lines.find((line) => line.merchandise.id === variantId)?.quantity || 0;
    mutate(() => addToCartAction(variantId, quantity), undefined, (updatedCart) => {
      const quantityAfter = updatedCart.lines.find((line) => line.merchandise.id === variantId)?.quantity || 0;
      const addedQuantity = quantityAfter - quantityBefore;
      if (addedQuantity <= 0) {
        toast.error("Unable to add more of this item. Stock limit reached.");
      } else {
        if (addedQuantity < quantity) toast.error(`Only ${addedQuantity} additional item(s) available. Added to cart.`);
        onItemAdded();
      }
    });
  };

  return { optimisticCart, isPending, updateQuantity, removeItem, addItem };
}
