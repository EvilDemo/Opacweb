"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "./Price";
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
      <Card variant="media" className="h-full cursor-pointer">
        <CardHeader>
          {firstImage && (
            <div className="relative w-full aspect-square overflow-hidden rounded-lg mb-4 bg-neutral-900">
              <Image
                src={firstImage.url}
                alt={firstImage.altText || product.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          <CardTitle className="heading-4 mb-2">{product.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {product.vendor && (
            <p className="body-text-sm text-neutral-400 mb-2">{product.vendor}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Price
            price={availableVariant?.price || product.price}
            compareAtPrice={availableVariant?.compareAtPrice || product.compareAtPrice}
            currencyCode={product.currencyCode}
          />
          {!product.availableForSale && (
            <span className="body-text-sm text-neutral-500">Sold out</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

