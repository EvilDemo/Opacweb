"use client";

import React from "react";
import { useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/lib/shopify/actions";
import { useCart } from "./CartContext";
import { toast } from "sonner";

interface AddToCartButtonProps {
  variantId: string;
  availableForSale: boolean;
  className?: string;
  quantity?: number;
}

// Helper to parse Shopify errors and provide user-friendly messages
function getErrorMessage(error: string): string {
  const lowerError = error.toLowerCase();

  if (
    lowerError.includes("not available") ||
    lowerError.includes("sold out") ||
    lowerError.includes("out of stock") ||
    lowerError.includes("insufficient inventory") ||
    lowerError.includes("unavailable")
  ) {
    return "This item is out of stock and cannot be added to your cart.";
  }

  if (
    lowerError.includes("quantity") ||
    lowerError.includes("exceed") ||
    lowerError.includes("maximum") ||
    lowerError.includes("limit")
  ) {
    return "Unable to add this quantity. Please check available stock.";
  }

  return error || "Unable to add item to cart. Please try again.";
}

export function AddToCartButton({ variantId, availableForSale, className, quantity = 1 }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { cart, updateCart, openCartSidebar, refreshCart } = useCart();
  const [optimisticState, setOptimisticState] = useOptimistic(
    { isAdding: false },
    (state, newState: { isAdding: boolean }) => newState
  );

  const handleAddToCart = async () => {
    if (!availableForSale || isPending) return;
    // Get current cart state before adding to detect quantity changes
    const existingLine = cart?.lines.find((line) => line.merchandise.id === variantId);
    const quantityBefore = existingLine?.quantity || 0;

    // Show loading state (must be in transition)
    startTransition(() => {
      setOptimisticState({ isAdding: true });
    });

    try {
      const result = await addToCartAction(variantId, quantity);

      // After await, we need a new transition for optimistic updates
      if (result.error) {
        startTransition(() => {
          setOptimisticState({ isAdding: false });
        });
        const errorMsg = getErrorMessage(result.error);
        const message = String(errorMsg || "Failed to add item to cart");
        setTimeout(() => {
          toast.error(message);
        }, 0);
        await refreshCart();
      } else if (result.cart) {
        const addedLine = result.cart.lines.find((line) => line.merchandise.id === variantId);
        const quantityAfter = addedLine?.quantity || 0;
        const quantityIncrease = quantityAfter - quantityBefore;

        if (!addedLine) {
          // Item wasn't added at all
          startTransition(() => {
            setOptimisticState({ isAdding: false });
          });
          setTimeout(() => {
            toast.error("This item is out of stock and cannot be added to your cart.");
          }, 0);
          await refreshCart();
        } else if (quantityIncrease < quantity) {
          // Quantity didn't increase by what we requested
          startTransition(() => {
            setOptimisticState({ isAdding: false });
          });
          if (quantityIncrease === 0) {
            // No increase at all - likely stock limit reached
            setTimeout(() => {
              toast.error("Unable to add more of this item. Stock limit reached.");
            }, 0);
            await refreshCart();
          } else {
            // Partial increase - some items available
            setTimeout(() => {
              toast.error(`Only ${quantityIncrease} additional item(s) available. Added to cart.`);
            }, 0);
            updateCart(result.cart);
            openCartSidebar();
          }
        } else {
          // Successfully added
          startTransition(() => {
            setOptimisticState({ isAdding: false });
          });
          updateCart(result.cart);
          openCartSidebar();
        }
      } else {
        startTransition(() => {
          setOptimisticState({ isAdding: false });
        });
        setTimeout(() => {
          toast.error("Failed to add item to cart. Please try again.");
        }, 0);
        await refreshCart();
      }
    } catch (error) {
      console.error("Unexpected error in handleAddToCart:", error);
      startTransition(() => {
        setOptimisticState({ isAdding: false });
      });
      setTimeout(() => {
        toast.error("An unexpected error occurred. Please try again.");
      }, 0);
      await refreshCart();
    }
  };

  return (
    <Button onClick={handleAddToCart} disabled={!availableForSale || isPending} className={className} variant="default">
      {optimisticState.isAdding || isPending ? "Adding..." : availableForSale ? "Add to Cart" : "Sold Out"}
    </Button>
  );
}
