"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Price } from "./Price";
import type { Cart } from "@/types/commerce";

interface CartSidebarProps {
  children?: React.ReactNode;
}

export function CartSidebar({ children }: CartSidebarProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

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

  const cartItemCount = cart?.totalQuantity || 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="secondary" className="relative">
            CART
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                {cartItemCount}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="heading-2">Shopping Cart</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="body-text text-neutral-400">Loading cart...</p>
            </div>
          ) : !cart || cart.lines.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <p className="body-text-lg text-neutral-400">Your cart is empty</p>
              <Button variant="secondary" onClick={() => setOpen(false)} asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-6 py-6">
                {cart.lines.map((line) => (
                  <div key={line.id} className="flex gap-4 pb-6 border-b border-neutral-800">
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
                      <h3 className="body-text-sm-md text-white mb-1">{line.merchandise.title}</h3>
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
                          >
                            -
                          </Button>
                          <span className="body-text-sm w-8 text-center">{line.quantity}</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateQuantity(line.id, line.quantity + 1)}
                            className="h-8 w-8 p-0"
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

              <div className="border-t border-neutral-800 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="body-text-lg text-neutral-400">Subtotal</span>
                  <Price
                    price={cart.cost.subtotalAmount.amount}
                    currencyCode={cart.cost.subtotalAmount.currencyCode}
                    size="lg"
                  />
                </div>
                <Button variant="default" className="w-full" asChild>
                  <Link href="/checkout" onClick={() => setOpen(false)}>
                    Checkout
                  </Link>
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => setOpen(false)} asChild>
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

