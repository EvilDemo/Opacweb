"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { type Pictures, type Gallery } from "@/lib/mediaData";
import { getResponsiveImageProps } from "@/sanity/lib/image";
import Lightbox from "@/components/Lightbox";

interface PictureGalleryContentProps {
  picture: Pictures;
  gallery: Gallery | null;
}

export default function PictureGalleryContent({ picture, gallery }: PictureGalleryContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Combine thumbnail and gallery images
  const allImages = [picture.thumbnailUrl, ...(gallery?.gallery || [])].filter(Boolean);
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
        setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1);
      } else {
        setSelectedImageIndex(selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0);
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

        {/* Back Button */}
        <div className="mb-8">
          <Link href="/media">
            <Button variant="ghost" className="mb-4" aria-label="Go back to media page">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Media
            </Button>
          </Link>
        </div>
      </div>
      {/* Header */}
      <header className="mb-8">
        <h1 className="heading-2 mb-4">{picture.title}</h1>
        <p className="body-text text-muted-foreground mb-2">{picture.description}</p>
        <p className="body-text-sm text-muted" aria-live="polite">
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
                aria-label={`View image ${index + 1} of ${imageCount}: ${picture.title}`}
                onClick={() => openLightbox(index)}
              >
                <img
                  {...getResponsiveImageProps(imageUrl, "gallery")}
                  alt={`${picture.title} - Image ${index + 1} of ${imageCount}`}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                  loading={index < 8 ? "eager" : "lazy"}
                />
              </button>
            </div>
          ))}
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
