"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { ProductMedia } from "@/types/commerce";

interface ProductGalleryProps {
  mediaItems: ProductMedia[];
  selectedMediaIndex: number;
  onMediaSelect: (index: number) => void;
  productTitle: string;
}

export function ProductGallery({
  mediaItems,
  selectedMediaIndex,
  onMediaSelect,
  productTitle,
}: ProductGalleryProps) {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const selectedMedia = mediaItems[selectedMediaIndex];

  // Reset video state when selected media changes
  useEffect(() => {
    setShowVideo(false);
  }, [selectedMediaIndex]);

  // LCP optimization: first media item should be prioritized
  const isLCPCandidate = selectedMediaIndex === 0;
  const posterUrl = selectedMedia?.kind === "video" 
    ? selectedMedia.video.previewImage?.url
    : null;

  // Auto-swap to video after poster image loads (for LCP optimization)
  useEffect(() => {
    if (selectedMedia?.kind === "video" && !showVideo && posterUrl) {
      // Small delay to ensure poster image loads first for LCP
      const timer = setTimeout(() => {
        setShowVideo(true);
        // Small delay to ensure video element is mounted
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => {
              // Handle autoplay restrictions gracefully
            });
          }
        }, 100);
      }, 300); // Delay to prioritize poster image for LCP
      
      return () => clearTimeout(timer);
    }
  }, [selectedMedia, showVideo, posterUrl, selectedMediaIndex]);

  return (
    <div className="flex flex-col gap-4 lg:min-h-[65vh] w-full">
      {selectedMedia ? (
        <div 
          className="relative w-full overflow-hidden rounded-lg h-[clamp(28vh,36vw,45vh)] min-w-0"
        >
          {selectedMedia.kind === "video" ? (
            <>
              {!showVideo && posterUrl ? (
                // Show poster image first (LCP optimized)
                <Image
                  src={posterUrl}
                  alt={selectedMedia.video.previewImage?.altText || productTitle}
                  fill
                  priority={isLCPCandidate}
                  fetchPriority={isLCPCandidate ? "high" : "auto"}
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : null}
              {/* Video loads on hover */}
              {showVideo && (
                <video
                  ref={videoRef}
                  key={selectedMedia.video.url}
                  src={selectedMedia.video.url}
                  poster={posterUrl}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="none"
                  aria-label={`${productTitle} preview`}
                  className="h-full w-full object-contain"
                />
              )}
            </>
          ) : (
            <Image
              src={selectedMedia.image.url}
              alt={selectedMedia.image.altText || productTitle}
              fill
              className="object-contain"
              priority={isLCPCandidate}
              fetchPriority={isLCPCandidate ? "high" : "auto"}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
        </div>
      ) : (
        <div className="flex h-[clamp(28vh,36vw,45vh)] items-center justify-center rounded-lg text-neutral-500">
          No media available
        </div>
      )}
      {mediaItems.length > 1 && (
        <div className="flex flex-wrap gap-3 lg:gap-4">
          {mediaItems.map((media, index) => {
            const isActive = selectedMediaIndex === index;
            const key = media.kind === "video" ? `video-${media.video.url}` : `image-${media.image.id}`;
            return (
              <button
                key={key}
                onClick={() => onMediaSelect(index)}
                className={`relative overflow-hidden rounded-lg  border-2 transition-all aspect-square size-[clamp(10vw,12vw,14vw)] sm:size-[clamp(8vw,10vw,12vw)] lg:size-[clamp(5vw,6vw,8vw)] ${
                  isActive ? "border-white" : "border-transparent"
                }`}
                aria-label={`View ${productTitle} ${media.kind === "video" ? "video" : "image"} ${index + 1} of ${mediaItems.length}${isActive ? ", currently selected" : ""}`}
                aria-pressed={isActive}
              >
                {media.kind === "video" ? (
                  <>
                    {media.video.previewImage ? (
                      <Image
                        src={media.video.previewImage.url}
                        alt={media.video.previewImage.altText || `${productTitle} preview`}
                        fill
                        loading="lazy"
                        className="object-cover"
                        sizes="(max-width: 1024px) 25vw, 12.5vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-xs uppercase tracking-wide text-white">
                        Video
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[10px] font-medium uppercase text-white">
                      Video
                    </span>
                  </>
                ) : (
                  <Image
                    src={media.image.url}
                    alt={media.image.altText || `${productTitle} - Image ${index + 1}`}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="(max-width: 1024px) 25vw, 12.5vw"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
