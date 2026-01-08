"use client";

import React, { useState, useOptimistic, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Price } from "./Price";
import { useCart } from "./CartContext";
import { updateCartLineAction, removeFromCartAction } from "@/lib/shopify/actions";
import { toast } from "sonner";
import type { Cart } from "@/types/commerce";

interface CartSidebarProps {
  children?: React.ReactNode;
}

export function CartSidebar({ children }: CartSidebarProps) {
  const { cart, isLoading, updateCart, setOpenCartSidebar, refreshCart } = useCart();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Register the open function with the cart context
  React.useEffect(() => {
    setOpenCartSidebar(() => setOpen(true));
    return () => setOpenCartSidebar(null);
  }, [setOpenCartSidebar]);

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

  // Helper to parse Shopify errors
  const getErrorMessage = (error: string): string => {
    const lowerError = error.toLowerCase();

    if (
      lowerError.includes("not available") ||
      lowerError.includes("sold out") ||
      lowerError.includes("out of stock") ||
      lowerError.includes("insufficient inventory") ||
      lowerError.includes("unavailable")
    ) {
      return "This item is out of stock in the requested quantity.";
    }

    if (
      lowerError.includes("quantity") ||
      lowerError.includes("exceed") ||
      lowerError.includes("maximum") ||
      lowerError.includes("limit")
    ) {
      return "Unable to update to this quantity. Please check available stock.";
    }

    return error || "Unable to update cart. Please try again.";
  };

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (quantity < 1) return;

    // Get current quantity before updating to detect if it actually changed
    const currentLine = cart?.lines.find((line) => line.id === lineId);
    const quantityBefore = currentLine?.quantity || 0;

    // Optimistic update (must be in transition)
    startTransition(() => {
      setOptimisticCart({ type: "update", lineId, quantity });
    });

    try {
      const result = await updateCartLineAction(lineId, quantity);

      if (result.error) {
        setTimeout(() => {
          toast.error(getErrorMessage(result.error || "Failed to update cart"));
        }, 0);
        // Refresh cart to get correct state after error
        await refreshCart();
      } else if (result.cart) {
        // Check if quantity actually changed
        const updatedLine = result.cart.lines.find((line) => line.id === lineId);
        const quantityAfter = updatedLine?.quantity || 0;
        const quantityIncrease = quantityAfter - quantityBefore;

        if (quantityIncrease < quantity - quantityBefore) {
          // Quantity didn't increase by what we requested
          if (quantityIncrease === 0 && quantity > quantityBefore) {
            // Tried to increase but quantity stayed the same - stock limit
            setTimeout(() => {
              toast.error("Unable to increase quantity. Stock limit reached.");
            }, 0);
            await refreshCart();
          } else if (quantityAfter < quantity) {
            // Quantity is less than requested
            setTimeout(() => {
              toast.error(`Only ${quantityAfter} item(s) available. Cart updated.`);
            }, 0);
            updateCart(result.cart);
          } else {
            // Cart updated successfully
            updateCart(result.cart);
          }
        } else {
          // Successfully updated
          updateCart(result.cart);
        }
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      setTimeout(() => {
        toast.error("Failed to update quantity. Please try again.");
      }, 0);
      await refreshCart();
    }
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

  const cartItemCount = optimisticCart?.totalQuantity || 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <div className="relative inline-block focus:outline-none focus-visible:outline-none focus-visible:ring-0 [&:has(button:focus-visible)]:outline-none [&:has(button:focus-visible)]:ring-0">
            <Button variant="secondary">CART</Button>
            {cartItemCount > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold z-10 pointer-events-none focus-visible:outline-none"
                style={{ outline: "none", boxShadow: "none", border: "none" }}
                tabIndex={-1}
              >
                {cartItemCount}
              </span>
            )}
          </div>
        )}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg !top-[var(--navbar-height)] !h-[calc(100vh-var(--navbar-height))] pl-1"
        hideDefaultClose
      >
        <SheetHeader className="px-4  py-4 flex flex-row items-center justify-between gap-0 flex-shrink-0">
          <SheetTitle className="heading-4">Your Cart</SheetTitle>
          <SheetClose asChild>
            <Button variant="secondary" size="sm" aria-label="Close shopping cart">
              CLOSE
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center ">
              <p className="body-text text-neutral-400">Loading cart...</p>
            </div>
          ) : !optimisticCart || optimisticCart.lines.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 ">
              <p className="body-text-sm text-neutral-400">Your cart is empty</p>
              <Button variant="link" onClick={() => setOpen(false)} asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0 overflow-y-auto space-y-6 py-6 px-4">
                {optimisticCart.lines.map((line) => (
                  <div key={line.id} className="flex gap-4 pb-6 border-gradient-bottom">
                    {line.merchandise.image && (
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-900">
                        <Image
                          src={line.merchandise.image.url}
                          alt={line.merchandise.image.altText || line.merchandise.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="body-text-sm-md text-white mb-1">
                        {line.productTitle || line.merchandise.title || "Product"}
                      </h3>
                      {(() => {
                        const sizeOption = line.merchandise.selectedOptions?.find(
                          (opt) => opt.name.toLowerCase() === "size"
                        );
                        return sizeOption ? (
                          <p className="body-text-xs text-neutral-400 mb-1">Size: {sizeOption.value}</p>
                        ) : null;
                      })()}
                      <Price
                        price={line.cost.totalAmount.amount}
                        currencyCode={line.cost.totalAmount.currencyCode}
                        size="sm"
                      />
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateQuantity(line.id, line.quantity - 1)}
                            className="h-8 w-8 p-0"
                            disabled={isPending}
                            aria-label={`Decrease quantity of ${line.productTitle || line.merchandise.title || 'product'}`}
                          >
                            <span aria-hidden="true">-</span>
                          </Button>
                          <span className="body-text-sm w-8 text-center" aria-label={`Quantity: ${line.quantity}`}>{line.quantity}</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateQuantity(line.id, line.quantity + 1)}
                            className="h-8 w-8 p-0"
                            disabled={isPending}
                            aria-label={`Increase quantity of ${line.productTitle || line.merchandise.title || 'product'}`}
                          >
                            <span aria-hidden="true">+</span>
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(line.id)}
                          className="text-neutral-400 hover:text-white"
                          disabled={isPending}
                          aria-label={`Remove ${line.productTitle || line.merchandise.title || 'product'} from cart`}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-shrink-0 border-gradient-top pt-6 space-y-4 px-4 pb-4">
                <div className="flex justify-between items-center">
                  <span className="body-text-lg text-neutral-400">Subtotal</span>
                  <Price
                    price={optimisticCart.cost.subtotalAmount.amount}
                    currencyCode={optimisticCart.cost.subtotalAmount.currencyCode}
                    size="lg"
                  />
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
                  aria-label={optimisticCart?.checkoutUrl ? "Proceed to checkout" : "Checkout unavailable"}
                >
                  Checkout
                </Button>
                <Button variant="link" size="sm" className="w-full" onClick={() => setOpen(false)} asChild>
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
