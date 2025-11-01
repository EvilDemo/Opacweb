"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Price } from "./Price";
import { AddToCartButton } from "./AddToCartButton";
import { Button } from "@/components/ui/button";
import type { Product, ProductVariant, SelectedOption } from "@/types/commerce";

interface ProductViewProps {
  product: Product;
}

export function ProductView({ product }: ProductViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants.find((v) => v.availableForSale) || product.variants[0]
  );
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (selectedVariant) {
      selectedVariant.selectedOptions.forEach((opt) => {
        initial[opt.name] = opt.value;
      });
    }
    return initial;
  });

  // Update selected variant when options change
  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);

    // Find matching variant
    const matchingVariant = product.variants.find((variant) => {
      return variant.selectedOptions.every((opt) => newOptions[opt.name] === opt.value);
    });

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      // Update selected image if variant has its own image
      if (matchingVariant.image) {
        const imageIndex = product.images.findIndex((img) => img.id === matchingVariant.image?.id);
        if (imageIndex !== -1) {
          setSelectedImageIndex(imageIndex);
        }
      }
    }
  };

  const selectedImage = product.images[selectedImageIndex] || product.images[0];

  return (
    <div className="padding-global py-8 md:py-12 lg:py-16">
      <div className=" mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
          <ol className="flex items-center space-x-2 body-text-sm">
            <li>
              <Link href="/" className="text-muted hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted">
              /
            </li>
            <li>
              <Link href="/shop" className="text-muted hover:text-white transition-colors">
                Shop
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted">
              /
            </li>
            <li aria-current="page" className="text-white">
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {selectedImage && (
              <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-900">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.altText || product.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg bg-neutral-900 border-2 transition-all ${
                      selectedImageIndex === index ? "border-white" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `${product.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 25vw, 12.5vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="heading-1 mb-4">{product.title}</h1>
              {product.vendor && <p className="body-text-lg text-neutral-400 mb-4">{product.vendor}</p>}
            </div>

            <Price
              price={selectedVariant.price}
              compareAtPrice={selectedVariant.compareAtPrice}
              currencyCode={product.currencyCode}
              size="lg"
            />

            {product.description && (
              <div
                className="body-text text-neutral-300 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: product.descriptionHtml || product.description,
                }}
              />
            )}

            {/* Product Options */}
            {product.options.map((option) => (
              <div key={option.id} className="space-y-3">
                <label className="body-text-sm-md text-white">{option.name}</label>
                <div className="flex flex-wrap gap-3">
                  {option.values.map((value) => (
                    <Button
                      key={value}
                      variant={selectedOptions[option.name] === value ? "default" : "secondary"}
                      onClick={() => handleOptionChange(option.name, value)}
                      className="min-w-[80px]"
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            {/* Add to Cart */}
            <div className="pt-4">
              <AddToCartButton
                variantId={selectedVariant.id}
                availableForSale={selectedVariant.availableForSale}
                className="w-full"
              />
            </div>

            {/* Additional Info */}
            {product.tags.length > 0 && (
              <div className="pt-6 border-t border-neutral-800">
                <p className="body-text-sm text-neutral-400">Tags: {product.tags.join(", ")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
