"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/commerce";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const featuredMedia =
    product.featuredMedia ?? (product.images[0] ? { kind: "image" as const, image: product.images[0] } : undefined);
  const availableVariant = product.variants.find((v) => v.availableForSale);

  if (!availableVariant && !product.availableForSale) {
    return null;
  }

  return (
    <Link href={`/shop/${product.handle}`}>
      {featuredMedia && (
        <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-neutral-900 cursor-pointer group">
          {featuredMedia.kind === "video" ? (
            <video
              src={featuredMedia.video.url}
              poster={featuredMedia.video.previewImage?.url}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              aria-label={`${product.title} preview`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Image
              src={featuredMedia.image.url}
              alt={featuredMedia.image.altText || product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
      )}
    </Link>
  );
}
