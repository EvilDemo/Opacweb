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
    imageBuilder = imageBuilder.width(width).fit("max");
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
        src: getOptimizedImageUrl(source, 800, QUALITY.standard),
        srcSet: [
          `${getOptimizedImageUrl(source, 400, QUALITY.standard)} 400w`,
          `${getOptimizedImageUrl(source, 800, QUALITY.standard)} 800w`,
          `${getOptimizedImageUrl(source, 1200, QUALITY.standard)} 1200w`,
          `${getOptimizedImageUrl(source, 1600, QUALITY.standard)} 1600w`,
        ].join(", "),
        // Tailwind breakpoints: sm=640px (2 cols), md=768px (3 cols), lg=1024px (4 cols)
        // Conservative on mobile to save bandwidth on cellular networks
        sizes: "(max-width: 639px) 50vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw",
        width: 800,
        height: 600,
      };

    case "lightbox":
      return {
        ...baseProps,
        src: getOptimizedImageUrl(source, 1200, QUALITY.high),
        srcSet: [
          `${getOptimizedImageUrl(source, 800, QUALITY.high)} 800w`,
          `${getOptimizedImageUrl(source, 1200, QUALITY.high)} 1200w`,
          `${getOptimizedImageUrl(source, 1600, QUALITY.high)} 1600w`,
        ].join(", "),
        sizes: "(max-width: 768px) calc(95vw - 2rem), (max-width: 1024px) calc(90vw - 3rem), calc(80vw - 4rem)",
        width: 1600,
        height: 1200,
      };

    case "mediaCard":
      return {
        ...baseProps,
        src: getOptimizedImageUrl(source, 400, QUALITY.thumbnail),
        srcSet: [
          `${getOptimizedImageUrl(source, 300, QUALITY.thumbnail)} 300w`,
          `${getOptimizedImageUrl(source, 400, QUALITY.thumbnail)} 400w`,
          `${getOptimizedImageUrl(source, 600, QUALITY.thumbnail)} 600w`,
        ].join(", "),
        sizes: "(max-width: 640px) calc(100vw - 2rem), (max-width: 768px) calc(50vw - 1.5rem), calc(25vw - 0.75rem)",
        width: 400,
        height: 600,
      };

    case "radio":
      return {
        ...baseProps,
        src: getOptimizedImageUrl(source, 240, QUALITY.standard), // 2x the max display size (120px)
        srcSet: [
          `${getOptimizedImageUrl(source, 144, QUALITY.standard)} 144w`, // 2x for 72px
          `${getOptimizedImageUrl(source, 176, QUALITY.standard)} 176w`, // 2x for 88px
          `${getOptimizedImageUrl(source, 240, QUALITY.standard)} 240w`, // 2x for 120px
        ].join(", "),
        sizes: "(max-width: 768px) 72px, (max-width: 1024px) 88px, 120px",
        width: 120,
        height: 120,
      };

    default:
      return {
        ...baseProps,
        src: getOptimizedImageUrl(source, 500, QUALITY.standard),
        width: 500,
        height: 500,
      };
  }
};

// Note: All image handling is now done through getResponsiveImageProps
// This eliminates double transformations and uses Sanity's srcSet directly
