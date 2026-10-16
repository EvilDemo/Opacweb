"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Price } from "./Price";
import { useCartData, useCartUI } from "./CartContext";

interface CartSidebarProps {
  children?: React.ReactNode;
}

export function CartSidebar({ children }: CartSidebarProps) {
  const { cart: optimisticCart, isLoading, isPending, updateQuantity, removeItem, error, refreshCart } = useCartData();
  const { setOpenCartSidebar } = useCartUI();
  const [open, setOpen] = useState(false);

  // Register the open function with the cart context
  React.useEffect(() => {
    setOpenCartSidebar(() => setOpen(true));
    return () => setOpenCartSidebar(null);
  }, [setOpenCartSidebar]);

  const cartItemCount = optimisticCart?.totalQuantity || 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <div className="relative inline-block focus:outline-none focus-visible:outline-none focus-visible:ring-0 [&:has(button:focus-visible)]:outline-none [&:has(button:focus-visible)]:ring-0">
            <Button variant="secondary" aria-label={`Open cart${cartItemCount > 0 ? ` with ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}` : ''}`}>
              CART
            </Button>
            {cartItemCount > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold z-10 pointer-events-none focus-visible:outline-none"
                style={{ outline: "none", boxShadow: "none", border: "none" }}
                tabIndex={-1}
                aria-hidden="true"
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
          <SheetDescription className="sr-only">
            Review your items, adjust quantities, or continue to checkout.
          </SheetDescription>
          <SheetClose asChild>
            <Button variant="secondary" size="sm" aria-label="Close cart">
              CLOSE
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {error && (
            <div role="alert" className="flex flex-col items-start gap-3 px-4 py-4 flex-shrink-0">
              <p className="body-text-sm text-neutral-400">
                {optimisticCart
                  ? "We couldn't refresh your cart. Your items may be out of date."
                  : "We couldn't load your cart. Please try again."}
              </p>
              <Button type="button" variant="secondary" size="sm" onClick={refreshCart} disabled={isLoading}>
                Retry
              </Button>
            </div>
          )}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center ">
              <p className="body-text text-neutral-400">Loading cart...</p>
            </div>
          ) : !optimisticCart || optimisticCart.lines.length === 0 ? (
            !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 ">
                <p className="body-text-sm text-neutral-400">Your cart is empty</p>
                <Button variant="link" onClick={() => setOpen(false)} asChild>
                  <Link href="/shop" aria-label="Continue shopping">Continue Shopping</Link>
                </Button>
              </div>
            )
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
                            aria-label={`Decrease quantity of ${line.productTitle || line.merchandise.title || 'item'}`}
                          >
                            -
                          </Button>
                          <span className="body-text-sm w-8 text-center" aria-label={`Quantity: ${line.quantity}`}>{line.quantity}</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateQuantity(line.id, line.quantity + 1)}
                            className="h-8 w-8 p-0"
                            disabled={isPending}
                            aria-label={`Increase quantity of ${line.productTitle || line.merchandise.title || 'item'}`}
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
                          aria-label={`Remove ${line.productTitle || line.merchandise.title || 'item'} from cart`}
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
                  disabled={isPending || !optimisticCart?.checkoutUrl}
                  aria-label="Proceed to checkout"
                >
                  Checkout
                </Button>
                <Button variant="link" size="sm" className="w-full" onClick={() => setOpen(false)} asChild>
                  <Link href="/shop" aria-label="Continue shopping">Continue Shopping</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
