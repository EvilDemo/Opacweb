"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";
import { type Pictures, type Gallery } from "@/lib/mediaData";
import { getOptimizedImageUrl } from "@/sanity/lib/image";

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

  // Combine thumbnail and gallery images
  const allImages = [picture.thumbnailUrl, ...(gallery?.gallery || [])].filter(
    Boolean
  );
  const imageCount = allImages.length;

  const openLightbox = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-6rem)] padding-global py-8">
      <div className="flex flex-col gap-4">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
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

        {/* Back Button */}
        <div className="mb-8">
          <Link href="/media">
            <Button
              variant="ghost"
              className="mb-4"
              aria-label="Go back to media page"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Media
            </Button>
          </Link>
        </div>
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
      <main>
        <h2 className="sr-only">Picture Gallery</h2>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          role="grid"
          aria-label={`${picture.title} image gallery`}
        >
          {allImages.map((imageUrl, index) => (
            <div
              key={index}
              role="gridcell"
              className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 hover:scale-[1.02] transition-all duration-200 focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-black"
              onClick={() => openLightbox(index)}
            >
              <button
                className="w-full h-full focus:outline-none"
                aria-label={`View image ${index + 1} of ${imageCount}: ${
                  picture.title
                }`}
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={getOptimizedImageUrl(imageUrl, 546, 75)}
                  alt={`${picture.title} - Image ${index + 1} of ${imageCount}`}
                  width={546}
                  height={546}
                  className="w-full h-full object-cover"
                  loading={index < 8 ? "eager" : "lazy"} // Eager load first 8 images
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized
                />
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          aria-describedby="lightbox-description"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-[95vw] max-h-[95vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
              <div className="bg-black bg-opacity-70 rounded-full px-3 py-1">
                <span
                  id="lightbox-title"
                  className="text-white paragraph-small-regular font-medium"
                  aria-live="polite"
                >
                  {selectedImageIndex + 1} / {imageCount}
                </span>
              </div>
              <button
                onClick={closeLightbox}
                className="bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close image viewer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation buttons */}
            {imageCount > 1 && (
              <>
                <button
                  onClick={() => navigateImage("prev")}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => navigateImage("next")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Main Image */}
            <div className="flex items-center justify-center h-full">
              <Image
                src={getOptimizedImageUrl(
                  allImages[selectedImageIndex],
                  1200,
                  80
                )}
                alt={`${picture.title} - Image ${
                  selectedImageIndex + 1
                } of ${imageCount}`}
                width={1200}
                height={900}
                className="max-w-[95vw] max-h-[80vh] object-contain"
                priority
                sizes="95vw"
                unoptimized
              />
            </div>

            {/* Hidden description for screen readers */}
            <span id="lightbox-description" className="sr-only">
              Image {selectedImageIndex + 1} of {imageCount} from{" "}
              {picture.title}. Use arrow keys to navigate, escape to close.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
