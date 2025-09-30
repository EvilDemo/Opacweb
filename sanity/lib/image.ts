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
  format?: "auto" | "webp" | "jpg" | "png"
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

// Responsive image presets optimized for actual display sizes
export const imagePresets = {
  // Gallery thumbnails - optimized for actual display dimensions
  galleryThumb: (source: SanityImageSource) =>
    getOptimizedImageUrl(source, 546, 75), // Matches display size exactly
  galleryThumbRetina: (source: SanityImageSource) =>
    getOptimizedImageUrl(source, 1092, 75), // 2x for retina displays

  // Lightbox images - higher quality for detailed viewing
  lightbox: (source: SanityImageSource) =>
    getOptimizedImageUrl(source, 1200, 80),
  lightboxRetina: (source: SanityImageSource) =>
    getOptimizedImageUrl(source, 2400, 80), // 2x for retina displays

  // Legacy presets for backward compatibility
  thumbnail: (source: SanityImageSource) =>
    getOptimizedImageUrl(source, 400, 75),
  medium: (source: SanityImageSource) => getOptimizedImageUrl(source, 800, 75),
  large: (source: SanityImageSource) => getOptimizedImageUrl(source, 1200, 75),
  fullSize: (source: SanityImageSource) =>
    getOptimizedImageUrl(source, 1920, 75),
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
