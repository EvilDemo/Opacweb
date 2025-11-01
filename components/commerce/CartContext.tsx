"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { getCartAction } from "@/lib/shopify/actions";
import type { Cart } from "@/types/commerce";

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
  updateCart: (newCart: Cart | null) => void;
  openCartSidebar: () => void;
  setOpenCartSidebar: (open: (() => void) | null) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const openCartSidebarFnRef = useRef<(() => void) | null>(null);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getCartAction();

      if (result.error) {
        setError(result.error);
        setCart(null);
      } else {
        setCart(result.cart);
      }
    } catch (err) {
      console.error("Error refreshing cart:", err);
      setError("Failed to load cart");
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCart = useCallback((newCart: Cart | null) => {
    setCart(newCart);
  }, []);

  const openCartSidebar = useCallback(() => {
    if (openCartSidebarFnRef.current) {
      openCartSidebarFnRef.current();
    }
  }, []);

  const setOpenCartSidebar = useCallback((open: (() => void) | null) => {
    openCartSidebarFnRef.current = open;
  }, []);

  // Initial cart fetch
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        refreshCart,
        updateCart,
        openCartSidebar,
        setOpenCartSidebar,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

// Hook for just getting cart data (no loading state)
export function useCartData() {
  const { cart } = useCart();
  return cart;
}

// Hook for getting cart item count
export function useCartItemCount() {
  const { cart } = useCart();
  return cart?.totalQuantity || 0;
}
