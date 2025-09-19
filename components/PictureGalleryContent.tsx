"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";
import { type Pictures } from "@/lib/mediaData";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface PictureGalleryContentProps {
  picture: Pictures;
}

export default function PictureGalleryContent({
  picture,
}: PictureGalleryContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isButtonSticky, setIsButtonSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Combine thumbnail and gallery images
  const allImages = useMemo(() => {
    return [picture.thumbnailUrl, ...(picture.gallery || [])].filter(Boolean);
  }, [picture.thumbnailUrl, picture.gallery]);

  const imageCount = allImages.length;

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
        <div
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
          role="grid"
          aria-label={`${picture.title} image gallery`}
        >
          {allImages.map((imageUrl, index) => {
            // Add optimization parameters for gallery preview
            const optimizedUrl = imageUrl.includes("?")
              ? imageUrl + "&w=800&q=85"
              : imageUrl + "?auto=format&w=800&q=85";

            return (
              <div
                key={index}
                role="gridcell"
                className="break-inside-avoid mb-4 bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 hover:scale-[1.02] transition-all duration-200 focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-black"
                onClick={() => openLightbox(index)}
              >
                <button
                  className="w-full focus:outline-none"
                  aria-label={`View image ${index + 1} of ${imageCount}: ${
                    picture.title
                  }`}
                  onClick={() => openLightbox(index)}
                >
                  <NextImage
                    src={optimizedUrl}
                    alt={`${picture.title} - Image ${
                      index + 1
                    } of ${imageCount}`}
                    width={800}
                    height={0}
                    className="w-full h-auto"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </button>
              </div>
            );
          })}
        </div>
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

              <NextImage
                src={(() => {
                  const imageUrl = allImages[selectedImageIndex];
                  // For lightbox, always use high quality regardless of existing params
                  const baseUrl = imageUrl.split("?")[0]; // Remove any existing params
                  return baseUrl + "?auto=format&w=2400&q=95";
                })()}
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
