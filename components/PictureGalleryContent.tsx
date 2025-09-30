"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";
import { type Pictures, type Gallery } from "@/lib/mediaData";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { motion, useInView } from "motion/react";
import { getOptimizedImageUrl } from "@/sanity/lib/image";

// Simplified image sizing strategy
const IMAGE_SIZES = {
  GALLERY: 600, // Same size for all gallery images
  LIGHTBOX: 1920, // Larger for lightbox viewing
  BLUR_PLACEHOLDER: 50, // Blur placeholder
} as const;

// Create a smaller version of LoadingSpinner for cards
const CardLoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400"></div>
  </div>
);

// Individual image card component with loading states
const ImageCard = ({
  imageUrl,
  index,
  imageCount,
  pictureTitle,
  onImageClick,
  isPriority = false,
}: {
  imageUrl: string;
  index: number;
  imageCount: number;
  pictureTitle: string;
  onImageClick: (index: number) => void;
  isPriority?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Calculate cascading delay based on index (same as other cards)
  const cascadingDelay = index * 0.1;

  // Generate optimized image URLs for gallery (same size, different quality)
  const optimizedImageUrl = useMemo(() => {
    // Gallery: Same size for all images, optimized quality for better compression
    const quality = isPriority ? 60 : 50; // Lower quality for better compression
    return getOptimizedImageUrl(imageUrl, IMAGE_SIZES.GALLERY, quality);
  }, [imageUrl, isPriority]);

  // Generate blur placeholder URL (small, low quality version)
  const blurImageUrl = useMemo(() => {
    return getOptimizedImageUrl(imageUrl, IMAGE_SIZES.BLUR_PLACEHOLDER, 25);
  }, [imageUrl]);

  // Pre-load image dimensions to prevent content shift
  useEffect(() => {
    if (!isInView && !isPriority) return; // Don't load if not in view and not priority

    const img = new window.Image();
    img.onload = () => {
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };

    // For priority images, start loading immediately
    if (isPriority) {
      img.src = optimizedImageUrl;
    } else if (isInView) {
      // For non-priority images, only load when in view
      const timer = setTimeout(() => {
        img.src = optimizedImageUrl;
      }, 100); // Small delay to let priority images load first
      return () => clearTimeout(timer);
    }
  }, [optimizedImageUrl, isPriority, isInView]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup any pending image loads
      setIsLoading(false);
      setHasError(false);
    };
  }, []);

  // Calculate aspect ratio for container
  const aspectRatio = imageDimensions
    ? imageDimensions.width / imageDimensions.height
    : 0.75; // Default 3:4 ratio

  return (
    <motion.div
      ref={ref}
      className="break-inside-avoid mb-4 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:opacity-90 hover:scale-[1.02] hover:shadow-lg focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black focus:outline-none group"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: cascadingDelay,
      }}
      onClick={() => onImageClick(index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onImageClick(index);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View image ${index + 1} of ${imageCount}: ${pictureTitle}`}
    >
      {/* Container with exact aspect ratio to prevent shift */}
      <div className="relative w-full" style={{ aspectRatio }}>
        {/* Loading state overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center z-10 rounded-lg">
            <CardLoadingSpinner />
          </div>
        )}

        {/* Error state with retry option */}
        {hasError && !isLoading && (
          <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-500 rounded-lg">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 opacity-50">⚠</div>
              <p className="text-xs mb-2">Failed to load</p>
              <button
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  // Retry loading the image
                  const img = new window.Image();
                  img.onload = () => {
                    setImageDimensions({
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                    });
                    setIsLoading(false);
                  };
                  img.onerror = () => {
                    setHasError(true);
                    setIsLoading(false);
                  };
                  img.src = optimizedImageUrl;
                }}
                className="text-xs underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Blur placeholder */}
        {isLoading && (
          <Image
            src={blurImageUrl}
            alt=""
            fill
            className="object-cover rounded-lg filter blur-sm scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            unoptimized // Let Sanity handle optimization, not Next.js
            priority={isPriority}
          />
        )}

        {/* Actual image */}
        <Image
          src={optimizedImageUrl}
          alt={`${pictureTitle} - Image ${index + 1} of ${imageCount}`}
          fill
          className={`
            object-cover transition-all duration-500 rounded-lg
            ${isLoading ? "opacity-0" : "opacity-100"}
            group-hover:scale-105
          `}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onLoad={handleImageLoad}
          onError={handleImageError}
          unoptimized // Let Sanity handle optimization, not Next.js
          priority={isPriority} // Next.js priority loading
          loading={isPriority ? "eager" : "lazy"} // Eager loading for priority images
          fetchPriority={isPriority ? "high" : "auto"} // High priority for LCP images
        />

        {/* Overlay for better interaction feedback */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200 rounded-lg" />
      </div>
    </motion.div>
  );
};

interface PictureGalleryContentProps {
  picture: Pictures;
  gallery: Gallery | null;
}

export default function PictureGalleryContent({
  picture,
  gallery,
}: PictureGalleryContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isButtonSticky, setIsButtonSticky] = useState(false);
  const [isGalleryLoaded, setIsGalleryLoaded] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Use gallery images from the separate gallery data
  const allImages = useMemo(() => {
    const galleryImages = (gallery?.gallery || []).filter(Boolean);
    console.log("PictureGalleryContent - allImages:");
    console.log("  gallery:", gallery?.gallery);
    console.log("  galleryLength:", gallery?.gallery?.length || 0);
    console.log("  allImages:", galleryImages);
    console.log("  allImagesLength:", galleryImages.length);
    return galleryImages;
  }, [gallery?.gallery]);

  const imageCount = allImages.length;

  // Preload first 6 images for faster initial display with optimized URLs
  // LCP optimization: First 3 images get fetchpriority="high" for better LCP
  useEffect(() => {
    if (allImages.length > 0) {
      const priorityImages = allImages.slice(0, 6); // Reduced to 6 for better performance
      priorityImages.forEach((imageUrl, index) => {
        // Preload optimized versions with LCP optimization
        const optimizedUrl = getOptimizedImageUrl(
          imageUrl,
          IMAGE_SIZES.GALLERY,
          60
        );
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = optimizedUrl;
        // LCP optimization: First 3 images get high priority
        link.setAttribute("fetchpriority", index < 3 ? "high" : "low");
        document.head.appendChild(link);
      });
    }
  }, [allImages]);

  // Initialize gallery loading
  useEffect(() => {
    console.log("PictureGalleryContent - useEffect loading:");
    console.log("  isGalleryLoaded:", isGalleryLoaded);
    console.log("  allImagesLength:", allImages.length);
    console.log("  pictureTitle:", picture.title);
    const timer = setTimeout(() => {
      console.log("PictureGalleryContent - setting isGalleryLoaded to true");
      setIsGalleryLoaded(true);
    }, 300); // Slightly longer delay for better UX
    return () => clearTimeout(timer);
  }, [isGalleryLoaded, allImages.length, picture.title]);

  const openLightbox = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
    setIsImageLoading(true); // Start loading state
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedImageIndex(null);
    setIsLightboxOpen(false);
    // Restore body scroll
    document.body.style.overflow = "unset";
  }, []);

  const navigateImage = useCallback(
    (direction: "prev" | "next") => {
      if (selectedImageIndex === null) return;

      setIsImageLoading(true); // Start loading state for navigation

      if (direction === "prev") {
        setSelectedImageIndex(
          selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1
        );
      } else {
        setSelectedImageIndex(
          selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0
        );
      }
    },
    [selectedImageIndex, allImages.length]
  );

  // Touch handling for swipe navigation
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && imageCount > 1) {
      navigateImage("next");
    }
    if (isRightSwipe && imageCount > 1) {
      navigateImage("prev");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      switch (event.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          navigateImage("prev");
          break;
        case "ArrowRight":
          navigateImage("next");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, closeLightbox, navigateImage]);

  // Intersection Observer to detect when button should become sticky
  useEffect(() => {
    const sentinelElement = sentinelRef.current;
    if (!sentinelElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the sentinel is not intersecting (scrolled out of view),
        // the button should become sticky
        setIsButtonSticky(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "-96px 0px 0px 0px", // Account for the sticky top-24 position
        threshold: 0,
      }
    );

    observer.observe(sentinelElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-6rem)] padding-global py-8 relative">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 justify-between">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 paragraph-small-regular">
            <li>
              <Link
                href="/media"
                className="text-muted hover:text-white transition-colors"
              >
                Media
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted">
              /
            </li>
            <li>
              <Link
                href="/media"
                className="text-muted hover:text-white transition-colors"
              >
                Pictures
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted">
              /
            </li>
            <li aria-current="page" className="text-white">
              {picture.title}
            </li>
          </ol>
        </nav>
      </div>

      {/* Header */}
      <header className="mb-8">
        <h1 className="heading-2 mb-4">{picture.title}</h1>
        <p className="body-text text-muted-foreground mb-2">
          {picture.description}
        </p>
        <p className="paragraph-small-regular text-muted" aria-live="polite">
          {imageCount} {imageCount === 1 ? "image" : "images"} in this gallery
        </p>
      </header>

      {/* Gallery Grid */}
      <main className="relative">
        {/* Sentinel element positioned at the top of the gallery */}
        <div ref={sentinelRef} className="h-px w-full" />

        {/* Back Button - only show when sticky */}
        <div className="sticky top-24 left-4 z-50 pointer-events-none">
          <div
            className={`transition-all duration-300 ease-in-out ${
              isButtonSticky
                ? "opacity-100 transform translate-y-0 pointer-events-auto"
                : "opacity-0 transform -translate-y-2 pointer-events-none"
            }`}
          >
            <Link href="/media">
              <Button
                variant="default"
                aria-label="Go back to media page"
                className="mix-blend-difference"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Media
              </Button>
            </Link>
          </div>
        </div>

        <h2 className="sr-only">Picture Gallery</h2>

        {/* Show loading state initially */}
        {!isGalleryLoaded ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        ) : (
          <div
            className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
            style={{
              columnFill: "balance",
              orphans: 1,
              widows: 1,
            }}
            role="group"
            aria-label={`${picture.title} image gallery`}
          >
            {allImages.length > 0 ? (
              allImages.map((imageUrl, index) => (
                <ImageCard
                  key={index}
                  imageUrl={imageUrl}
                  index={index}
                  imageCount={imageCount}
                  pictureTitle={picture.title}
                  onImageClick={openLightbox}
                  isPriority={index < 3} // First 3 images get priority loading for LCP optimization
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                No images found in gallery
              </div>
            )}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          aria-describedby="lightbox-description"
        >
          {/* Clickable Background - Only empty areas close lightbox */}
          <div className="absolute inset-0" onClick={closeLightbox} />
          {/* Fixed Header - Top Left: Counter, Top Right: Close */}
          <div className="fixed top-2 left-2 sm:top-4 sm:left-4 z-20">
            <div className="bg-black bg-opacity-70 rounded-full px-3 py-1">
              <span
                id="lightbox-title"
                className="text-white paragraph-small-regular font-medium"
                aria-live="polite"
              >
                {selectedImageIndex + 1} / {imageCount}
              </span>
            </div>
          </div>

          <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-20">
            <Button
              variant="ghost"
              size="icon"
              onClick={closeLightbox}
              className="bg-black bg-opacity-70 text-white hover:bg-black hover:bg-opacity-90 rounded-full h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
              aria-label="Close image viewer"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>

          {/* Fixed Navigation Buttons */}
          {imageCount > 1 && (
            <>
              <div className="fixed left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateImage("prev")}
                  className="bg-black bg-opacity-70 text-white hover:bg-black hover:bg-opacity-90 rounded-full h-12 w-12 sm:h-12 sm:w-12 touch-manipulation"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 sm:h-6 sm:w-6" />
                </Button>
              </div>

              <div className="fixed right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateImage("next")}
                  className="bg-black bg-opacity-70 text-white hover:bg-black hover:bg-opacity-90 rounded-full h-12 w-12 sm:h-12 sm:w-12 touch-manipulation"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 sm:h-6 sm:w-6" />
                </Button>
              </div>
            </>
          )}

          {/* Main Image Container - Centered with dynamic sizing */}
          <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-20 pointer-events-none">
            <div
              className="pointer-events-auto max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] sm:max-w-[calc(100vw-4rem)] sm:max-h-[calc(100vh-4rem)] md:max-w-[90vw] md:max-h-[90vh] relative"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Loading Spinner */}
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg z-10">
                  <LoadingSpinner />
                </div>
              )}

              <Image
                src={getOptimizedImageUrl(
                  allImages[selectedImageIndex],
                  IMAGE_SIZES.LIGHTBOX, // Lightbox: Larger size for detailed viewing
                  70 // Lightbox: Optimized quality for better compression
                )}
                alt={`${picture.title} - Image ${
                  selectedImageIndex + 1
                } of ${imageCount}`}
                width={2400}
                height={0}
                className={`w-auto h-auto max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] sm:max-w-[calc(100vw-4rem)] sm:max-h-[calc(100vh-4rem)] md:max-w-[90vw] md:max-h-[90vh] object-contain transition-opacity duration-300 ${
                  isImageLoading ? "opacity-0" : "opacity-100"
                }`}
                priority
                sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 768px) calc(100vw - 4rem), 90vw"
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
                unoptimized // Let Sanity handle optimization, not Next.js
              />
            </div>
          </div>

          {/* Hidden description for screen readers */}
          <span id="lightbox-description" className="sr-only">
            Image {selectedImageIndex + 1} of {imageCount} from {picture.title}.
            Use arrow keys to navigate, escape to close.
          </span>
        </div>
      )}
    </div>
  );
}
