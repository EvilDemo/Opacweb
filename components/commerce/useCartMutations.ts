"use client";

import { useTransition } from "react";
import { removeFromCartAction, updateCartLineAction } from "@/lib/shopify/actions";
import type { Cart } from "@/types/commerce";

export interface CartOptimisticUpdate {
  type: "update" | "remove";
  lineId: string;
  quantity?: number;
}

interface UseCartMutationsOptions {
  updateCart: (newCart: Cart | null) => void;
  refreshCart?: () => Promise<void>;
  setOptimisticCart: (update: CartOptimisticUpdate) => void;
  onError?: (message: string) => void;
}

export function useCartMutations({ updateCart, refreshCart, setOptimisticCart, onError }: UseCartMutationsOptions) {
  const [isPending, startTransition] = useTransition();

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (quantity < 1) return;

    startTransition(() => {
      setOptimisticCart({ type: "update", lineId, quantity });
    });

    const result = await updateCartLineAction(lineId, quantity);

    if (result.error) {
      if (refreshCart) {
        await refreshCart();
      }
      onError?.(result.error);
      return;
    }

    updateCart(result.cart);
  };

  const removeItem = async (lineId: string) => {
    startTransition(() => {
      setOptimisticCart({ type: "remove", lineId });
    });

    const result = await removeFromCartAction([lineId]);

    if (result.error) {
      if (refreshCart) {
        await refreshCart();
      }
      onError?.(result.error);
      return;
    }

    updateCart(result.cart);
  };

  return {
    isPending,
    startTransition,
    updateQuantity,
    removeItem,
  };
}
