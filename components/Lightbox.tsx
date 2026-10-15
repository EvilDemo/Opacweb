"use client";

import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
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
  const imageCount = images.length;
  if (!isOpen || imageCount === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="top-[var(--navbar-height)] flex items-center justify-center padding-global py-4"
        aria-describedby={undefined}
        onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            onNavigate(event.key === "ArrowLeft" ? "prev" : "next");
          }
        }}
      >
        <DialogTitle className="sr-only">{title} image viewer</DialogTitle>
        {/* Counter - top left */}
        <div className="absolute top-4 left-4 sm:left-6 md:left-8 lg:left-12 xl:left-16 z-10">
          <div className="bg-black/70 rounded-full px-3 py-1">
            <span aria-live="polite" className="text-white body-text-sm font-medium">
              {currentIndex + 1} / {imageCount}
            </span>
          </div>
        </div>

        {/* Close button - top right */}
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 sm:right-6 md:right-8 lg:right-12 xl:right-16 z-10"
            aria-label="Close image viewer"
          >
            <X aria-hidden="true" />
          </Button>
        </DialogClose>

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
              <ChevronLeft aria-hidden="true" />
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
              <ChevronRight aria-hidden="true" />
            </Button>
          </>
        )}

        {/* Main image - centered by parent flexbox, only image blocks clicks */}
        {/* Sanity provides optimized URLs and responsive srcSet directly. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...getResponsiveImageProps(images[currentIndex], "lightbox")}
          alt={`${title} - Image ${currentIndex + 1} of ${imageCount}`}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </DialogContent>
    </Dialog>
  );
}
