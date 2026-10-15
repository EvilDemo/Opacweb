"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartData } from "./CartContext";

interface AddToCartButtonProps {
  variantId: string;
  availableForSale: boolean;
  className?: string;
  quantity?: number;
}

export function AddToCartButton({ variantId, availableForSale, className, quantity = 1 }: AddToCartButtonProps) {
  const { isLoading, isPending, addItem } = useCartData();
  const handleAddToCart = () => {
    if (availableForSale && !isLoading && !isPending) addItem(variantId, quantity);
  };
  const isDisabled = !availableForSale || isLoading || isPending;
  const buttonVariant = availableForSale ? "default" : "secondary";
  const buttonClassName = cn(
    className,
    !availableForSale
      ? "border border-neutral-800 bg-transparent text-neutral-500 disabled:opacity-100 cursor-not-allowed hover:text-neutral-500 hover:bg-transparent hover:scale-100"
      : ""
  );

  const buttonText = isPending ? "Adding..." : availableForSale ? "Add to Cart" : "Sold Out";
  const ariaLabel = isPending
    ? "Adding item to cart"
    : availableForSale
    ? `Add ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`
    : "Item is sold out";

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={buttonClassName}
      variant={buttonVariant}
      aria-disabled={isDisabled}
      aria-label={ariaLabel}
    >
      {buttonText}
    </Button>
  );
}
