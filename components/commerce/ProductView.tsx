"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Price } from "./Price";
import { AddToCartButton } from "./AddToCartButton";
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
      const alreadyIncluded = media.some(
        (item) => item.kind === "image" && item.image.id === image.id
      );
      if (!alreadyIncluded) {
        media.push({ kind: "image", image });
      }
    }

    return media;
  }, [product]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const selectedMedia = mediaItems[selectedMediaIndex];

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
  };

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

  const variantAvailable = Boolean(selectedVariant?.availableForSale);
  const productHasAvailableVariants = product.variants.some((variant) => variant.availableForSale);
  const entireProductSoldOut = product.variants.length === 0 || !productHasAvailableVariants || !product.availableForSale;
  const filteredOptions = product.options.filter(
    (option) => !(option.name === "Title" && option.values.length === 1 && option.values[0] === "Default Title")
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
            <div className="flex flex-col gap-4 lg:min-h-[65vh]">
              {selectedMedia ? (
                <div className="relative w-full overflow-hidden rounded-lg h-[clamp(28vh,36vw,45vh)]">
                  {selectedMedia.kind === "video" ? (
                    <video
                      key={selectedMedia.video.url}
                      src={selectedMedia.video.url}
                      poster={selectedMedia.video.previewImage?.url}
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="metadata"
                      aria-label={`${product.title} preview`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Image
                      src={selectedMedia.image.url}
                      alt={selectedMedia.image.altText || product.title}
                      fill
                      className="object-contain"
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )}
                </div>
              ) : (
                <div className="flex h-[clamp(28vh,36vw,45vh)] items-center justify-center rounded-lg text-neutral-500">No media available</div>
              )}
              {mediaItems.length > 1 && (
                <div className="flex flex-wrap gap-3 lg:gap-4">
                  {mediaItems.map((media, index) => {
                    const isActive = selectedMediaIndex === index;
                    const key =
                      media.kind === "video"
                        ? `video-${media.video.url}`
                        : `image-${media.image.id}`;
                    return (
                    <button
                      key={key}
                      onClick={() => setSelectedMediaIndex(index)}
                      className={`relative overflow-hidden rounded-lg  border-2 transition-all aspect-square size-[clamp(10vw,12vw,14vw)] sm:size-[clamp(8vw,10vw,12vw)] lg:size-[clamp(5vw,6vw,8vw)] ${
                        isActive ? "border-white" : "border-transparent"
                      }`}
                    >
                        {media.kind === "video" ? (
                          <>
                            {media.video.previewImage ? (
                              <Image
                                src={media.video.previewImage.url}
                                alt={media.video.previewImage.altText || `${product.title} preview`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 25vw, 12.5vw"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-xs uppercase tracking-wide text-white">
                                Video
                              </div>
                            )}
                            <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[10px] font-medium uppercase text-white">
                              Video
                            </span>
                          </>
                        ) : (
                          <Image
                            src={media.image.url}
                            alt={media.image.altText || `${product.title} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 25vw, 12.5vw"
                          />
                        )}
                    </button>
                    );
                  })}
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
                      >
                        -
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
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={incrementQuantity}
                        className="h-9 w-9 p-0"
                        disabled={!variantAvailable}
                      >
                        +
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
                  <p className="text-sm text-neutral-400">
                    This product is not currently available for purchase.
                  </p>
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
