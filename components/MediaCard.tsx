"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Music as MusicIcon, Images } from "lucide-react";
import { motion, useInView } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { getOptimizedImageUrl } from "@/sanity/lib/image";

// Image optimization constants
const MEDIA_CARD_IMAGE_SIZES = {
  THUMBNAIL: 400, // Base thumbnail size for cards
  THUMBNAIL_RETINA: 800, // 2x for retina displays
} as const;

const QUALITY_SETTINGS = {
  THUMBNAIL: 75, // Optimized quality for thumbnails
} as const;

// Base interface for all media items
interface BaseMediaItem {
  _id: string;
  title: string;
  description: string;
  _updatedAt: string;
}

// Specific interfaces for each media type
interface PictureItem extends BaseMediaItem {
  type: "picture";
  thumbnailUrl: string;
}

interface VideoItem extends BaseMediaItem {
  type: "video";
  thumbnailUrl?: string;
  videoUrl: string;
}

interface MusicItem extends BaseMediaItem {
  type: "music";
  thumbnailUrl?: string;
  spotifyUrl: string;
}

// Union type for all media items
type MediaItem = PictureItem | VideoItem | MusicItem;

interface MediaCardProps {
  item: MediaItem;
  index?: number;
}

export function MediaCard({ item, index = 0 }: MediaCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Calculate cascading delay based on index
  const cascadingDelay = index * 0.1;

  // Common card classes for responsive design
  const cardClasses = "w-full flex flex-col";
  const headerClasses = "flex-1 flex flex-col min-h-0 pt-3 ";
  const titleClasses = "body-text-md !font-medium  line-clamp-1 leading-tight";
  const descriptionClasses =
    "paragraph-mini-regular text-muted line-clamp-3 flex-1 min-h-[4.5rem]";
  const contentClasses = "pb-4 pt-3";

  // Render image based on media type
  const renderImage = () => {
    switch (item.type) {
      case "picture":
        return (
          <Image
            src={getOptimizedImageUrl(
              item.thumbnailUrl,
              MEDIA_CARD_IMAGE_SIZES.THUMBNAIL,
              QUALITY_SETTINGS.THUMBNAIL
            )}
            alt={`${item.title} - ${item.description}`}
            width={MEDIA_CARD_IMAGE_SIZES.THUMBNAIL}
            height={MEDIA_CARD_IMAGE_SIZES.THUMBNAIL}
            className="w-full h-full object-cover"
            loading={index < 6 ? "eager" : "lazy"}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        );

      case "video":
        if (!item.thumbnailUrl) {
          return null;
        }

        return (
          <Image
            src={getOptimizedImageUrl(
              item.thumbnailUrl,
              MEDIA_CARD_IMAGE_SIZES.THUMBNAIL,
              QUALITY_SETTINGS.THUMBNAIL
            )}
            alt={`${item.title} - ${item.description}`}
            width={MEDIA_CARD_IMAGE_SIZES.THUMBNAIL}
            height={MEDIA_CARD_IMAGE_SIZES.THUMBNAIL}
            className="w-full h-full object-cover"
            loading={index < 6 ? "eager" : "lazy"}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        );

      case "music":
        return item.thumbnailUrl ? (
          <Image
            src={getOptimizedImageUrl(
              item.thumbnailUrl,
              MEDIA_CARD_IMAGE_SIZES.THUMBNAIL,
              QUALITY_SETTINGS.THUMBNAIL
            )}
            alt={`${item.title} cover`}
            width={MEDIA_CARD_IMAGE_SIZES.THUMBNAIL}
            height={MEDIA_CARD_IMAGE_SIZES.THUMBNAIL}
            className="w-full h-full object-cover"
            loading={index < 6 ? "eager" : "lazy"}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <MusicIcon className="h-16 w-16 text-muted-foreground" />
        );

      default:
        return null;
    }
  };

  // Render title based on media type
  const renderTitle = () => {
    switch (item.type) {
      case "music":
        return (
          <CardTitle
            className={`${titleClasses} flex items-center gap-2`}
            title={item.title}
          >
            <MusicIcon className="h-4 w-4 flex-shrink-0" />
            <span>{item.title}</span>
          </CardTitle>
        );

      default:
        return (
          <CardTitle className={titleClasses} title={item.title}>
            {item.title}
          </CardTitle>
        );
    }
  };

  // Render action button based on media type
  const renderAction = () => {
    switch (item.type) {
      case "picture":
        return (
          <CardContent className={contentClasses}>
            <Link
              href={`/media/pictures/${item._id}`}
              aria-label={`View gallery for ${item.title}`}
            >
              <Button variant="secondary" size="sm" className="w-full">
                <Images className="mr-2 h-3 w-3" />
                View Gallery
              </Button>
            </Link>
          </CardContent>
        );

      case "video":
        return (
          <CardContent className={contentClasses}>
            <a
              href={item.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              aria-label={`Watch ${item.title} video on external platform`}
            >
              <Button variant="secondary" size="sm" className="w-full">
                Watch Video
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </a>
          </CardContent>
        );

      case "music":
        return (
          <CardContent className={contentClasses}>
            <a
              href={item.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              aria-label={`Listen to ${item.title} on Spotify`}
            >
              <Button variant="secondary" size="sm" className="w-full">
                Listen on Spotify
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </a>
          </CardContent>
        );

      default:
        return null;
    }
  };

  // Default card layout for other media types
  return (
    <motion.div
      ref={ref}
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: cascadingDelay,
      }}
    >
      <Card variant="media" background="media" className={cardClasses}>
        <div className="aspect-square overflow-hidden -m-6 mb-0 rounded-t-xl">
          {renderImage()}
        </div>
        <CardHeader className={headerClasses}>
          {renderTitle()}
          <CardDescription
            className={descriptionClasses}
            title={item.description}
          >
            {item.description}
          </CardDescription>
        </CardHeader>
        {renderAction()}
      </Card>
    </motion.div>
  );
}

// Export types for use in other components
export type { MediaItem, PictureItem, VideoItem, MusicItem };
