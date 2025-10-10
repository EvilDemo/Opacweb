"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getResponsiveImageProps } from "@/sanity/lib/image";

interface LightboxProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
  title: string;
}

export default function Lightbox({ isOpen, images, currentIndex, onClose, onNavigate, title }: LightboxProps) {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onNavigate("prev");
          break;
        case "ArrowRight":
          onNavigate("next");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const imageCount = images.length;

  return (
    // PARENT: Fixed positioning with flexbox centering and responsive padding
    <div
      className="fixed left-0 right-0 top-[94px] h-[calc(100vh-94px)] bg-black/95 z-50 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      onClick={onClose}
    >
      {/* CHILD: Absolute positioning with responsive padding values */}
      {/* Counter - top left */}
      <div className="absolute top-4 left-4 sm:left-6 md:left-8 lg:left-12 xl:left-16 z-10">
        <div className="bg-black/70 rounded-full px-3 py-1">
          <span id="lightbox-title" className="text-white body-text-sm font-medium">
            {currentIndex + 1} / {imageCount}
          </span>
        </div>
      </div>

      {/* Close button - top right */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 sm:right-6 md:right-8 lg:right-12 xl:right-16 z-10"
        aria-label="Close image viewer"
      >
        <X className="size-6" />
      </Button>

      {/* Navigation buttons - centered left/right with responsive padding */}
      {imageCount > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate("prev");
            }}
            className="absolute left-4 sm:left-6 md:left-8 lg:left-12 xl:left-16 top-1/2 -translate-y-1/2 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="size-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate("next");
            }}
            className="absolute right-4 sm:right-6 md:right-8 lg:right-12 xl:right-16 top-1/2 -translate-y-1/2 z-10"
            aria-label="Next image"
          >
            <ChevronRight className="size-6" />
          </Button>
        </>
      )}

      {/* Main image - centered by parent flexbox, only image blocks clicks */}
      <img
        {...getResponsiveImageProps(images[currentIndex], "lightbox")}
        alt={`${title} - Image ${currentIndex + 1} of ${imageCount}`}
        className="max-w-full max-h-full w-auto h-auto object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
