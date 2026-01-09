"use client";

import { useMemo, useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { Price } from "./Price";
import { AddToCartButton } from "./AddToCartButton";
import { ProductGallery } from "./ProductGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product, ProductMedia, ProductVariant } from "@/types/commerce";

interface ProductViewProps {
  product: Product;
}

export function ProductView({ product }: ProductViewProps) {
  const initialVariant = product.variants.find((variant) => variant.availableForSale) ?? product.variants[0] ?? null;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(initialVariant);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (initialVariant) {
      initialVariant.selectedOptions.forEach((opt) => {
        initial[opt.name] = opt.value;
      });
    }
    return initial;
  });
  const mediaItems = useMemo<ProductMedia[]>(() => {
    const media: ProductMedia[] = [];

    if (product.featuredMedia) {
      media.push(product.featuredMedia);
    }

    for (const image of product.images) {
      const alreadyIncluded = media.some((item) => item.kind === "image" && item.image.id === image.id);
      if (!alreadyIncluded) {
        media.push({ kind: "image", image });
      }
    }

    return media;
  }, [product]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Update selected variant when options change
  // Use startTransition to mark variant selection as non-urgent and batch state updates
  const handleOptionChange = useCallback(
    (optionName: string, value: string) => {
      const newOptions = { ...selectedOptions, [optionName]: value };

      startTransition(() => {
        setSelectedOptions(newOptions);

        // Find matching variant
        const matchingVariant = product.variants.find((variant) => {
          return variant.selectedOptions.every((opt) => newOptions[opt.name] === opt.value);
        });

        if (matchingVariant) {
          setSelectedVariant(matchingVariant);
          // Update selected image if variant has its own image
          if (matchingVariant.image) {
            const mediaIndex = mediaItems.findIndex(
              (item) => item.kind === "image" && item.image.id === matchingVariant.image?.id
            );
            if (mediaIndex !== -1) {
              setSelectedMediaIndex(mediaIndex);
            }
          }
        } else {
          setSelectedVariant(null);
        }
      });
    },
    [selectedOptions, product.variants, mediaItems]
  );

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  }, []);

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => (prev < 99 ? prev + 1 : 99));
  }, []);

  const handleQuantityInput = useCallback((value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      setQuantity(1);
      return;
    }
    const clamped = Math.min(Math.max(parsed, 1), 99);
    setQuantity(clamped);
  }, []);

  const handleMediaSelection = useCallback(
    (index: number) => {
      setSelectedMediaIndex(index);
    },
    []
  );

  const variantAvailable = Boolean(selectedVariant?.availableForSale);
  const productHasAvailableVariants = product.variants.some((variant) => variant.availableForSale);
  const entireProductSoldOut =
    product.variants.length === 0 || !productHasAvailableVariants || !product.availableForSale;
  const filteredOptions = useMemo(
    () =>
      product.options.filter(
        (option) => !(option.name === "Title" && option.values.length === 1 && option.values[0] === "Default Title")
      ),
    [product.options]
  );

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
            <ProductGallery
              mediaItems={mediaItems}
              selectedMediaIndex={selectedMediaIndex}
              onMediaSelect={handleMediaSelection}
              productTitle={product.title}
            />

            {/* Product Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="heading-2">{product.title}</h1>
                {selectedVariant ? (
                  <Price
                    price={selectedVariant.price}
                    compareAtPrice={selectedVariant.compareAtPrice}
                    currencyCode={product.currencyCode}
                    size="lg"
                  />
                ) : (
                  <p className="body-text-sm text-neutral-400">Price unavailable for selected options.</p>
                )}
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
                {filteredOptions.length > 0 && selectedVariant && (
                  <>
                    {filteredOptions.map((option) => (
                      <div key={option.id} className="space-y-3 flex flex-col gap-1">
                        <label className="body-text-sm-md text-white">{option.name}</label>
                        <div className="flex flex-wrap gap-3">
                          {option.values.map((value) => (
                            <Button
                              key={value}
                              variant={selectedOptions[option.name] === value ? "default" : "secondary"}
                              onClick={() => handleOptionChange(option.name, value)}
                              className="min-w-[80px]"
                              disabled={entireProductSoldOut}
                            >
                              {value}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Quantity Selector */}
                {selectedVariant && (
                  <div className="flex flex-col gap-3">
                    <label className="body-text-sm-md text-white">Quantity</label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={decrementQuantity}
                        className="h-9 w-9 p-0"
                        disabled={!variantAvailable}
                        aria-label="Decrease quantity"
                      >
                        <span aria-hidden="true">-</span>
                      </Button>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={99}
                        value={quantity}
                        onChange={(event) => handleQuantityInput(event.target.value)}
                        disabled={!variantAvailable}
                        className="h-9 w-auto px-4 text-center font-medium bg-white text-neutral-900 dark:bg-white dark:text-black rounded-full"
                        aria-label="Product quantity"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={incrementQuantity}
                        className="h-9 w-9 p-0"
                        disabled={!variantAvailable}
                        aria-label="Increase quantity"
                      >
                        <span aria-hidden="true">+</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add to Cart */}
              <div className="pt-4">
                {selectedVariant ? (
                  <>
                    <AddToCartButton
                      variantId={selectedVariant.id}
                      availableForSale={variantAvailable}
                      className="w-full"
                      quantity={quantity}
                    />
                    {!variantAvailable && (
                      <p className="mt-3 text-sm text-neutral-400">
                        {entireProductSoldOut
                          ? "This product is currently out of stock. Follow us for future restocks."
                          : "The selected options are out of stock. Please choose a different combination."}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-neutral-400">This product is not currently available for purchase.</p>
                )}
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
