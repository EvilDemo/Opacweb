import createImageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from "../env";

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset });

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source);
};

export const getOptimizedImageUrl = (
  source: SanityImageSource,
  width: number | undefined,
  quality: number,
  format: "auto" | "webp" | "jpg" | "png" = "webp"
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

const QUALITY = {
  thumbnail: 75,
  standard: 80,
  high: 85,
} as const;

// Generate responsive srcSet directly from Sanity
export const getResponsiveImageProps = (
  source: SanityImageSource,
  type: "gallery" | "lightbox" | "mediaCard" | "radio"
) => {
  const baseProps = {
    alt: "",
  };

  switch (type) {
    case "gallery":
      return {
        ...baseProps,
        src: getOptimizedImageUrl(source, 600, QUALITY.standard, "webp"),
        srcSet: [
          `${getOptimizedImageUrl(source, 600, QUALITY.standard, "webp")} 600w`,
          `${getOptimizedImageUrl(source, 800, QUALITY.standard, "webp")} 800w`,
        ].join(", "),
        sizes: "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
      };

    case "lightbox":
      return {
        ...baseProps,
        src: getOptimizedImageUrl(source, 1200, QUALITY.high, "webp"),
        srcSet: [
          `${getOptimizedImageUrl(source, 800, QUALITY.high, "webp")} 800w`,
          `${getOptimizedImageUrl(source, 1200, QUALITY.high, "webp")} 1200w`,
          `${getOptimizedImageUrl(source, 1600, QUALITY.high, "webp")} 1600w`,
        ].join(", "),
        sizes: "(max-width: 768px) 95vw, (max-width: 1024px) 90vw, (max-width: 1440px) 80vw, 70vw",
      };

    case "mediaCard":
      return {
        ...baseProps,
        src: getOptimizedImageUrl(source, 400, QUALITY.thumbnail, "webp"),
        srcSet: [
          `${getOptimizedImageUrl(source, 400, QUALITY.thumbnail, "webp")} 400w`,
          `${getOptimizedImageUrl(source, 600, QUALITY.thumbnail, "webp")} 600w`,
        ].join(", "),
        sizes: "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw",
      };

    case "radio":
      return {
        ...baseProps,
        src: getOptimizedImageUrl(source, 240, QUALITY.standard, "webp"), // 2x the max display size (120px)
        srcSet: [
          `${getOptimizedImageUrl(source, 144, QUALITY.standard, "webp")} 144w`, // 2x for 72px
          `${getOptimizedImageUrl(source, 176, QUALITY.standard, "webp")} 176w`, // 2x for 88px
          `${getOptimizedImageUrl(source, 240, QUALITY.standard, "webp")} 240w`, // 2x for 120px
        ].join(", "),
        sizes: "(max-width: 768px) 72px, (max-width: 1024px) 88px, 120px",
      };

    default:
      return {
        ...baseProps,
        src: getOptimizedImageUrl(source, 500, QUALITY.standard, "webp"),
      };
  }
};

// Note: All image handling is now done through getResponsiveImageProps
// This eliminates double transformations and uses Sanity's srcSet directly
