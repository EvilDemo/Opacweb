"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { type Pictures, type Gallery } from "@/lib/mediaData";
import { getResponsiveImageProps } from "@/sanity/lib/image";
import Lightbox from "@/components/Lightbox";

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
  pictureTitle,
  imageCount,
}: {
  imageUrl: string;
  index: number;
  onImageClick: (index: number) => void;
  pictureTitle: string;
  imageCount: number;
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
        <img
          {...getResponsiveImageProps(imageUrl, "gallery")}
          alt={`${pictureTitle} - Image ${index + 1} of ${imageCount}`}
          className="w-full h-auto object-contain"
          loading={index < 8 ? "eager" : "lazy"} // Eager load first 8 images
        />
      )}
    </div>
  );
};

interface PictureGalleryContentProps {
  picture: Pictures;
  gallery: Gallery | null;
}

export default function PictureGalleryContent({ picture, gallery }: PictureGalleryContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
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
        setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1);
      } else {
        setSelectedImageIndex(selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0);
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
    if (!isLightboxOpen || selectedImageIndex === null || allImages.length === 0) {
      return;
    }

    const prefetchImage = (imageUrl: string) => {
      // Create a link element to prefetch the image
      const link = document.createElement("link");
      link.rel = "prefetch";
      const { src } = getResponsiveImageProps(imageUrl, "lightbox");
      link.href = src;
      link.as = "image";
      document.head.appendChild(link);

      // Clean up the link after a short delay to avoid memory leaks
      setTimeout(() => {
        document.head.removeChild(link);
      }, 100);
    };

    // Prefetch previous image
    if (allImages.length > 1) {
      const prevIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1;
      if (prevIndex !== selectedImageIndex) {
        prefetchImage(allImages[prevIndex]);
      }

      // Prefetch next image
      const nextIndex = selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0;
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
              <Link href="/media" className="text-muted hover:text-white transition-colors">
                Media
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted">
              /
            </li>
            <li>
              <Link href="/media" className="text-muted hover:text-white transition-colors">
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
        <p className="body-text text-muted-foreground mb-2">{picture.description}</p>
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
                pictureTitle={picture.title}
                imageCount={imageCount}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">No images found in gallery</div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={isLightboxOpen}
        images={allImages}
        currentIndex={selectedImageIndex ?? 0}
        onClose={closeLightbox}
        onNavigate={navigateImage}
        title={picture.title}
      />
    </div>
  );
}
