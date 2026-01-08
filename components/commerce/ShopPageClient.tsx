"use client";

import { useState, useTransition } from "react";
import { ProductGrid } from "./ProductGrid";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/commerce";
import type { PageInfo } from "@/lib/shopify/types";

interface ShopPageClientProps {
  initialProducts: Product[];
  initialPageInfo: PageInfo;
}

export function ShopPageClient({ initialProducts, initialPageInfo }: ShopPageClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    if (!pageInfo.hasNextPage || isLoading) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        first: "20",
        ...(pageInfo.endCursor && { after: pageInfo.endCursor }),
      });

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load more products");
      }

      const data = await response.json();
      
      // Use startTransition for state updates (non-urgent)
      startTransition(() => {
        setProducts((prev) => [...prev, ...data.products]);
        setPageInfo(data.pageInfo);
      });
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ProductGrid products={products} />
      {pageInfo.hasNextPage && (
        <div className="padding-global pt-8 pb-16 flex justify-center">
          <Button
            onClick={loadMore}
            disabled={isPending || isLoading}
            variant="secondary"
            className="min-w-[200px]"
          >
            {isPending || isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </>
  );
}
