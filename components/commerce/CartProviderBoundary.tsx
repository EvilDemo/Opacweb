"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/commerce/CartContext";
import { SHOP_CONFIG } from "@/lib/constants";

interface CartProviderBoundaryProps {
  children: React.ReactNode;
}

const CART_ROUTE_PREFIXES = ["/shop", "/cart", "/checkout"];

const needsCartProviderForRoute = (pathname: string | null) => {
  if (!pathname) return false;

  return CART_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

export function CartProviderBoundary({ children }: CartProviderBoundaryProps) {
  const pathname = usePathname();
  const shouldWrapWithCartProvider = SHOP_CONFIG.ENABLED || needsCartProviderForRoute(pathname);

  if (!shouldWrapWithCartProvider) {
    return <>{children}</>;
  }

  return <CartProvider>{children}</CartProvider>;
}
