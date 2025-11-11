"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/commerce";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  if (product.variants.length === 0) {
    return null;
  }

  const featuredMedia =
    product.featuredMedia ?? (product.images[0] ? { kind: "image" as const, image: product.images[0] } : undefined);
  const hasAvailableVariant = product.variants.some((variant) => {
    if (!variant.availableForSale) {
      return false;
    }

    if (typeof variant.quantityAvailable === "number") {
      return variant.quantityAvailable > 0;
    }

    return true;
  });
  const isCompletelySoldOut = !hasAvailableVariant;

  return (
    <Link href={`/shop/${product.handle}`} className="group block">
      {featuredMedia ? (
        <div
          className={`relative w-full aspect-square overflow-hidden rounded-lg bg-neutral-900 transition-opacity duration-300 ${
            isCompletelySoldOut ? "opacity-70" : ""
          }`}
        >
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
          {isCompletelySoldOut && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] text-center text-white uppercase tracking-wide">
              <span className="body-text-sm font-semibold">Sold Out</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-full min-h-[280px] items-center justify-center rounded-lg bg-neutral-900 text-neutral-500">
          No preview available
        </div>
      )}
    </Link>
  );
}
