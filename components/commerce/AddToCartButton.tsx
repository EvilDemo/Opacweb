"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  variantId: string;
  availableForSale: boolean;
  className?: string;
  quantity?: number;
}

export function AddToCartButton({
  variantId,
  availableForSale,
  className,
  quantity = 1,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!availableForSale || loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      // Refresh cart count in navbar (will be handled by cart context later)
      router.refresh();

      // Show success feedback (you can add a toast notification here)
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={!availableForSale || loading}
      className={className}
      variant="default"
    >
      {loading ? "Adding..." : availableForSale ? "Add to Cart" : "Sold Out"}
    </Button>
  );
}

