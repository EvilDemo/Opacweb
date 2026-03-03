"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { getCartAction } from "@/lib/shopify/actions";
import type { Cart } from "@/types/commerce";

interface CartDataContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
  updateCart: (newCart: Cart | null) => void;
}

interface CartUIContextType {
  openCartSidebar: () => void;
  setOpenCartSidebar: (open: (() => void) | null) => void;
}

interface CartContextType extends CartDataContextType, CartUIContextType {}

const CartDataContext = createContext<CartDataContextType | null>(null);
const CartUIContext = createContext<CartUIContextType | null>(null);

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

  const dataValue: CartDataContextType = {
    cart,
    isLoading,
    error,
    refreshCart,
    updateCart,
  };

  const uiValue: CartUIContextType = {
    openCartSidebar,
    setOpenCartSidebar,
  };

  return (
    <CartDataContext.Provider value={dataValue}>
      <CartUIContext.Provider value={uiValue}>{children}</CartUIContext.Provider>
    </CartDataContext.Provider>
  );
}

export function useCartData() {
  const context = useContext(CartDataContext);
  if (!context) {
    throw new Error("useCartData must be used within CartProvider");
  }
  return context;
}

export function useCartUI() {
  const context = useContext(CartUIContext);
  if (!context) {
    throw new Error("useCartUI must be used within CartProvider");
  }
  return context;
}

export function useCart(): CartContextType {
  const data = useCartData();
  const ui = useCartUI();
  return { ...data, ...ui };
}

// Hook for getting cart item count
export function useCartItemCount() {
  const { cart } = useCartData();
  return cart?.totalQuantity || 0;
}
