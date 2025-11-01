"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/commerce";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images[0];
  const availableVariant = product.variants.find((v) => v.availableForSale);

  if (!availableVariant && !product.availableForSale) {
    return null;
  }

  return (
    <Link href={`/shop/${product.handle}`}>
      {firstImage && (
        <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-neutral-900 cursor-pointer group">
          <Image
            src={firstImage.url}
            alt={firstImage.altText || product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
    </Link>
  );
}
