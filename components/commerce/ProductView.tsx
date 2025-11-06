"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Price } from "./Price";
import { AddToCartButton } from "./AddToCartButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product, ProductVariant } from "@/types/commerce";

interface ProductViewProps {
  product: Product;
}

export function ProductView({ product }: ProductViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants.find((v) => v.availableForSale) || product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
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

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const incrementQuantity = () => {
    setQuantity((prev) => (prev < 99 ? prev + 1 : 99));
  };

  const handleQuantityInput = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      setQuantity(1);
      return;
    }
    const clamped = Math.min(Math.max(parsed, 1), 99);
    setQuantity(clamped);
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] padding-global py-8 flex flex-col">
      <div className="mx-auto flex h-full w-full flex-1 flex-col">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
          <ol className="flex items-center space-x-2 body-text-sm">
            <li>
              <Link href="/shop" className="text-muted hover:text-white transition-colors">
                Shop
              </Link>
            </li>
            {product.productType && (
              <>
                <li aria-hidden="true" className="text-muted">
                  /
                </li>
                <li>
                  <span className="text-muted">{product.productType}</span>
                </li>
              </>
            )}
            <li aria-hidden="true" className="text-muted">
              /
            </li>
            <li aria-current="page" className="text-white">
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="flex flex-1">
          <div className="grid w-full max-w-6xl grid-cols-1 gap-12 md:items-center lg:grid-cols-2 mx-auto md:my-auto">
            {/* Product Images */}
            <div className="flex flex-col gap-4 lg:min-h-[65vh]">
              {selectedImage && (
                <div className="relative w-full overflow-hidden rounded-lg  h-[clamp(28vh,36vw,45vh)]">
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.altText || product.title}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              )}
              {product.images.length > 1 && (
                <div className="flex flex-wrap gap-3 lg:gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative overflow-hidden rounded-lg  border-2 transition-all aspect-square size-[clamp(10vw,12vw,14vw)] sm:size-[clamp(8vw,10vw,12vw)] lg:size-[clamp(5vw,6vw,8vw)] ${
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
              <div className="space-y-4">
                <h1 className="heading-2">{product.title}</h1>
                <Price
                  price={selectedVariant.price}
                  compareAtPrice={selectedVariant.compareAtPrice}
                  currencyCode={product.currencyCode}
                  size="lg"
                />
              </div>
              {product.description && (
                <div
                  className="product-description"
                  dangerouslySetInnerHTML={{
                    __html: product.descriptionHtml || product.description,
                  }}
                />
              )}

              <div className="flex flex-col gap-4">
                {/* Product Options */}
                {product.options.map((option) => (
                  <div key={option.id} className="space-y-3 flex flex-col gap-1">
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

                {/* Quantity Selector */}
                <div className="flex flex-col gap-3">
                  <label className="body-text-sm-md text-white">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={decrementQuantity} className="h-9 w-9 p-0">
                      -
                    </Button>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={99}
                      value={quantity}
                      onChange={(event) => handleQuantityInput(event.target.value)}
                      className="h-9 w-auto px-4 text-center font-medium bg-white text-neutral-900 dark:bg-white dark:text-black rounded-full"
                    />
                    <Button variant="secondary" size="sm" onClick={incrementQuantity} className="h-9 w-9 p-0">
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="pt-4">
                <AddToCartButton
                  variantId={selectedVariant.id}
                  availableForSale={selectedVariant.availableForSale}
                  className="w-full"
                  quantity={quantity}
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
    </div>
  );
}
