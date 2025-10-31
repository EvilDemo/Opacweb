"use client";

import { cn } from "@/lib/utils";

interface PriceProps {
  price: string;
  compareAtPrice?: string;
  currencyCode?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Price({ price, compareAtPrice, currencyCode = "USD", className, size = "md" }: PriceProps) {
  const formatPrice = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(numAmount);
  };

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price) ? (
        <>
          <span className={cn("text-neutral-500 line-through", sizeClasses[size])}>
            {formatPrice(compareAtPrice)}
          </span>
          <span className={cn("text-white font-semibold", sizeClasses[size])}>{formatPrice(price)}</span>
        </>
      ) : (
        <span className={cn("text-white font-semibold", sizeClasses[size])}>{formatPrice(price)}</span>
      )}
    </div>
  );
}

