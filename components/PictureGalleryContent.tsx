"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { type Pictures, type Gallery } from "@/lib/mediaData";
import { getOptimizedImageUrl } from "@/sanity/lib/image";

// Responsive image sizes optimized for actual display dimensions
const RESPONSIVE_IMAGE_SIZES = {
  // Gallery thumbnails - optimized for actual display size (546px)
  GALLERY_SMALL: 400, // Mobile - smaller for faster loading
  GALLERY_MEDIUM: 546, // Tablet/Desktop - matches actual display size
  GALLERY_LARGE: 546, // Desktop - matches actual display size
  GALLERY_RETINA: 1092, // Retina displays - 2x the display size

  // Lightbox - higher quality but still optimized
  LIGHTBOX_SMALL: 800, // Mobile lightbox
  LIGHTBOX_MEDIUM: 1000, // Tablet lightbox
  LIGHTBOX_LARGE: 1000, // Desktop lightbox
  LIGHTBOX_RETINA: 1200, // Retina lightbox - 2x for crisp display
} as const;

// Quality settings optimized for performance and visual quality
const QUALITY_SETTINGS = {
  GALLERY: 75, // Balanced quality for gallery thumbnails
  LIGHTBOX: 80, // Higher quality for detailed view
} as const;

// Intersection observer hook for lazy loading
const useIntersectionObserver = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible] as const;
};

// Simple image card component with intersection observer
const ImageCard = ({
  imageUrl,
  index,
  onImageClick,
}: {
  imageUrl: string;
  index: number;
  onImageClick: (index: number) => void;
}) => {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className="break-inside-avoid mb-4 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:opacity-90 hover:scale-[1.02] hover:shadow-lg group"
      onClick={() => onImageClick(index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onImageClick(index);
        }
      }}
    >
      {isVisible && (
        <Image
          src={getOptimizedImageUrl(
            imageUrl,
            RESPONSIVE_IMAGE_SIZES.GALLERY_MEDIUM,
            QUALITY_SETTINGS.GALLERY
          )}
          alt={`Gallery image ${index + 1}`}
          width={546}
          height={400}
          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          unoptimized
        />
      )}
    </div>
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

  // Get gallery images
  const allImages = (gallery?.gallery || []).filter(Boolean);
  const imageCount = allImages.length;

  const openLightbox = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedImageIndex(null);
    setIsLightboxOpen(false);
    document.body.style.overflow = "unset";
  }, []);

  const navigateImage = useCallback(
    (direction: "prev" | "next") => {
      if (selectedImageIndex === null) return;

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

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
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
    },
    [isLightboxOpen, closeLightbox, navigateImage]
  );

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prefetch previous and next images when lightbox is open
  useEffect(() => {
    if (
      !isLightboxOpen ||
      selectedImageIndex === null ||
      allImages.length === 0
    ) {
      return;
    }

    const prefetchImage = (imageUrl: string) => {
      // Create a link element to prefetch the image
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = getOptimizedImageUrl(
        imageUrl,
        RESPONSIVE_IMAGE_SIZES.LIGHTBOX_LARGE,
        QUALITY_SETTINGS.LIGHTBOX
      );
      link.as = "image";
      document.head.appendChild(link);

      // Clean up the link after a short delay to avoid memory leaks
      setTimeout(() => {
        document.head.removeChild(link);
      }, 100);
    };

    // Prefetch previous image
    if (allImages.length > 1) {
      const prevIndex =
        selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1;
      if (prevIndex !== selectedImageIndex) {
        prefetchImage(allImages[prevIndex]);
      }

      // Prefetch next image
      const nextIndex =
        selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0;
      if (nextIndex !== selectedImageIndex) {
        prefetchImage(allImages[nextIndex]);
      }
    }
  }, [isLightboxOpen, selectedImageIndex, allImages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-6rem)] padding-global py-8">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 justify-between">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 body-text-sm">
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
        <p className="body-text-sm text-muted">
          {imageCount} {imageCount === 1 ? "image" : "images"} in this gallery
        </p>
      </header>

      {/* Gallery Grid */}
      <main>
        <div
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4"
          role="group"
          aria-label={`${picture.title} image gallery`}
        >
          {allImages.length > 0 ? (
            allImages.map((imageUrl, index) => (
              <ImageCard
                key={index}
                imageUrl={imageUrl}
                index={index}
                onImageClick={openLightbox}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              No images found in gallery
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal with responsive sizing */}
      {isLightboxOpen && selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
        >
          {/* Background click to close */}
          <div className="absolute inset-0" onClick={closeLightbox} />

          {/* Header with counter and close button */}
          <div className="fixed top-4 left-4 z-20">
            <div className="bg-black bg-opacity-70 rounded-full px-3 py-1">
              <span
                id="lightbox-title"
                className="text-white body-text-sm font-medium"
              >
                {selectedImageIndex + 1} / {imageCount}
              </span>
            </div>
          </div>

          <div className="fixed top-4 right-4 z-20">
            <Button
              variant="ghost"
              size="icon"
              onClick={closeLightbox}
              className="bg-black bg-opacity-70 text-white hover:bg-black hover:bg-opacity-90 rounded-full"
              aria-label="Close image viewer"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Navigation buttons */}
          {imageCount > 1 && (
            <>
              <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateImage("prev")}
                  className="bg-black bg-opacity-70 text-white hover:bg-black hover:bg-opacity-90 rounded-full"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>

              <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-20">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateImage("next")}
                  className="bg-black bg-opacity-70 text-white hover:bg-black hover:bg-opacity-90 rounded-full"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </>
          )}

          {/* Main image with responsive sizing */}
          <div className="fixed inset-0 flex items-center justify-center p-8">
            <Image
              src={getOptimizedImageUrl(
                allImages[selectedImageIndex],
                RESPONSIVE_IMAGE_SIZES.LIGHTBOX_RETINA,
                QUALITY_SETTINGS.LIGHTBOX
              )}
              alt={`${picture.title} - Image ${
                selectedImageIndex + 1
              } of ${imageCount}`}
              width={1200}
              height={900}
              className="max-w-[95vw] max-h-[80vh] object-contain"
              priority
              unoptimized
              sizes="95vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
