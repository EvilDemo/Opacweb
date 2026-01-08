"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/commerce";

interface ProductCardProps {
  product: Product;
  index?: number;
}

function ProductCardComponent({ product, index = 0 }: ProductCardProps) {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const isLCPCandidate = index === 0;
  const posterUrl =
    featuredMedia?.kind === "video" ? product.images[0]?.url || featuredMedia.video.previewImage?.url : null;

  // Auto-swap to video after poster image loads (for LCP optimization)
  useEffect(() => {
    if (featuredMedia?.kind === "video" && !showVideo && posterUrl) {
      // Small delay to ensure poster image loads first for LCP
      const timer = setTimeout(() => {
        setShowVideo(true);
        // Small delay to ensure video element is mounted
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => {
              // Handle autoplay restrictions gracefully
            });
          }
        }, 100);
      }, 300); // Delay to prioritize poster image for LCP

      return () => clearTimeout(timer);
    }
  }, [featuredMedia, showVideo, posterUrl]);

  return (
    <Link href={`/shop/${product.handle}`} className="group block">
      {featuredMedia ? (
        <div
          className={`relative w-full aspect-square overflow-hidden rounded-lg bg-transparent transition-opacity duration-300 ${
            isCompletelySoldOut ? "opacity-70" : ""
          }`}
        >
          {featuredMedia.kind === "video" ? (
            <>
              {!showVideo && posterUrl ? (
                // Show poster image first (LCP optimized)
                <Image
                  src={posterUrl}
                  alt={featuredMedia.video.previewImage?.altText || product.title}
                  fill
                  priority={isLCPCandidate}
                  fetchPriority={isLCPCandidate ? "high" : "auto"}
                  loading={index < 8 ? "eager" : "lazy"}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : null}
              {/* Video auto-swaps after poster loads */}
              {showVideo && (
                <video
                  ref={videoRef}
                  src={featuredMedia.video.url}
                  poster={posterUrl || undefined}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="none"
                  aria-label={`${product.title} preview`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </>
          ) : (
            <Image
              src={featuredMedia.image.url}
              alt={featuredMedia.image.altText || product.title}
              fill
              loading={index < 8 ? "eager" : "lazy"} // Eager load first 8 images
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
        <div className="flex h-full min-h-[280px] items-center justify-center rounded-lg bg-transparent text-neutral-500">
          No preview available
        </div>
      )}
    </Link>
  );
}

// Custom comparison function for React.memo
// Compares product ID, handle, featured media, and availability status
function areEqual(prevProps: ProductCardProps, nextProps: ProductCardProps): boolean {
  const prev = prevProps.product;
  const next = nextProps.product;

  // Compare IDs (most important - should be unique)
  if (prev.id !== next.id) return false;

  // Compare handles
  if (prev.handle !== next.handle) return false;

  // Compare featured media
  const prevFeaturedUrl =
    prev.featuredMedia?.kind === "image"
      ? prev.featuredMedia.image.url
      : prev.featuredMedia?.kind === "video"
      ? prev.featuredMedia.video.url
      : prev.images[0]?.url;
  const nextFeaturedUrl =
    next.featuredMedia?.kind === "image"
      ? next.featuredMedia.image.url
      : next.featuredMedia?.kind === "video"
      ? next.featuredMedia.video.url
      : next.images[0]?.url;
  if (prevFeaturedUrl !== nextFeaturedUrl) return false;

  // Compare availability status (check if any variant is available)
  const prevHasAvailable = prev.variants.some((v) => {
    if (!v.availableForSale) return false;
    if (typeof v.quantityAvailable === "number") return v.quantityAvailable > 0;
    return true;
  });
  const nextHasAvailable = next.variants.some((v) => {
    if (!v.availableForSale) return false;
    if (typeof v.quantityAvailable === "number") return v.quantityAvailable > 0;
    return true;
  });
  if (prevHasAvailable !== nextHasAvailable) return false;

  // If all key properties match, components are equal
  return true;
}

export const ProductCard = React.memo(ProductCardComponent, areEqual);
