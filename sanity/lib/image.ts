import createImageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from "../env";

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset });

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source);
};

// Enhanced image optimization with responsive sizing
export const getOptimizedImageUrl = (
  source: SanityImageSource,
  width?: number,
  quality: number = 80,
  format: "auto" | "webp" | "jpg" | "png" = "webp" // Default to WebP for better compression
) => {
  let imageBuilder = builder.image(source);

  if (width) {
    imageBuilder = imageBuilder.width(width);
  }

  const optimizedBuilder = imageBuilder.quality(quality);

  if (format && format !== "auto") {
    return optimizedBuilder.format(format).url();
  }

  return optimizedBuilder.auto("format").url(); // Automatically choose best format (WebP when supported)
};

// Unified image presets for all components - WebP optimized
export const imagePresets = {
  // Media Card presets
  mediaCard: {
    thumbnail: (source: SanityImageSource) =>
      getOptimizedImageUrl(source, 576, 80, "webp"), // MediaCard thumbnails
  },

  // Picture Gallery presets
  gallery: {
    thumb: (source: SanityImageSource) =>
      getOptimizedImageUrl(source, 546, 75, "webp"), // Gallery grid thumbnails
    thumbRetina: (source: SanityImageSource) =>
      getOptimizedImageUrl(source, 1092, 75, "webp"), // 2x for retina
    lightbox: (source: SanityImageSource) =>
      getOptimizedImageUrl(source, 1200, 80, "webp"), // Lightbox view
    lightboxRetina: (source: SanityImageSource) =>
      getOptimizedImageUrl(source, 2400, 80, "webp"), // 2x retina lightbox
  },

  // Radio Card presets
  radio: {
    cover: (source: SanityImageSource) =>
      getOptimizedImageUrl(source, 240, 80, "webp"), // Radio cover art
    coverRetina: (source: SanityImageSource) =>
      getOptimizedImageUrl(source, 480, 80, "webp"), // 2x for retina
  },

  // General purpose presets
  general: {
    small: (source: SanityImageSource) =>
      getOptimizedImageUrl(source, 400, 75, "webp"),
    medium: (source: SanityImageSource) =>
      getOptimizedImageUrl(source, 800, 75, "webp"),
    large: (source: SanityImageSource) =>
      getOptimizedImageUrl(source, 1200, 75, "webp"),
    fullSize: (source: SanityImageSource) =>
      getOptimizedImageUrl(source, 1920, 75, "webp"),
  },
};

// Generate responsive srcset for different screen sizes
export const getResponsiveImageSrcSet = (
  source: SanityImageSource,
  baseWidth: number,
  quality: number = 75
) => {
  const sizes = [baseWidth, baseWidth * 2]; // 1x and 2x for retina
  return sizes
    .map((size) => `${getOptimizedImageUrl(source, size, quality)} ${size}w`)
    .join(", ");
};
