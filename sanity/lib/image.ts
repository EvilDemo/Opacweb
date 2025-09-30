import createImageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from "../env";

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset });

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source);
};

// Simple helper functions for optimized images
export const getOptimizedImageUrl = (
  source: SanityImageSource,
  width?: number,
  quality: number = 80
) => {
  let imageBuilder = builder.image(source);

  if (width) {
    imageBuilder = imageBuilder.width(width);
  }

  return imageBuilder
    .auto("format") // Automatically choose best format (WebP when supported)
    .quality(quality)
    .url();
};

// Preset sizes for common use cases
export const imagePresets = {
  thumbnail: (source: SanityImageSource) =>
    getOptimizedImageUrl(source, 400, 80),
  medium: (source: SanityImageSource) => getOptimizedImageUrl(source, 800, 75),
  large: (source: SanityImageSource) => getOptimizedImageUrl(source, 1200, 75),
  fullSize: (source: SanityImageSource) =>
    getOptimizedImageUrl(source, 1920, 75),
};
