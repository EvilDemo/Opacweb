"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Images } from "lucide-react";
import { motion, useInView } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { getResponsiveImageProps } from "@/sanity/lib/image";

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
  albumWebsite?: string;
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

  // this adds delay on the default card animation
  const cascadingDelay = index * 0.1;

  // Common card classes for responsive design
  const cardClasses = "w-full flex flex-col";
  const headerClasses = "flex-1 flex flex-col min-h-0 pt-3 ";
  const titleClasses = "body-text-sm-md line-clamp-1 leading-tight";
  const contentClasses = "pb-1 pt-3";

  // Render image based on media type
  const renderImage = () => {
    // Handle cases without thumbnail
    if (!item.thumbnailUrl) {
      return null;
    }
    // Render optimized image for all media types using responsive preset
    return (
      <Image
        {...getResponsiveImageProps(item.thumbnailUrl, "mediaCard")}
        alt={`${item.title} - ${item.description}`}
        className="w-full h-full object-cover"
        loading={index < 8 ? "eager" : "lazy"} // Eager load first 8 images
      />
    );
  };

  // Render title
  const renderTitle = () => {
    return (
      <CardTitle className={titleClasses} title={item.title}>
        {item.title}
      </CardTitle>
    );
  };

  // Render action button based on media type
  const renderAction = () => {
    const getActionConfig = () => {
      switch (item.type) {
        case "picture":
          return {
            href: `/media/pictures/${item._id}`,
            label: `View gallery for ${item.title}`,
            text: "View Gallery",
            icon: <Images className="mr-2 h-3 w-3" />,
            isExternal: false,
          };
        case "video":
          return {
            href: item.videoUrl,
            label: `Watch ${item.title} video on external platform`,
            text: "Watch Video",
            icon: <ExternalLink className="ml-2 h-3 w-3" />,
            isExternal: true,
          };
        case "music":
          // Check if albumWebsite exists, otherwise use Spotify
          const hasAlbumWebsite = item.albumWebsite && item.albumWebsite.trim() !== "";
          return {
            href: (hasAlbumWebsite ? item.albumWebsite : item.spotifyUrl) as string,
            label: hasAlbumWebsite ? `Visit ${item.title} album page` : `Listen to ${item.title} on Spotify`,
            text: hasAlbumWebsite ? "Check Album Page" : "Listen on Spotify",
            icon: <ExternalLink className="ml-2 h-3 w-3" />,
            isExternal: true,
          };
        default:
          return null;
      }
    };

    const config = getActionConfig();
    if (!config) return null;

    const button = (
      <Button variant="secondary" size="sm" className="w-full">
        {config.icon}
        {config.text}
      </Button>
    );

    return (
      <CardContent className={contentClasses}>
        {config.isExternal ? (
          <a href={config.href} target="_blank" rel="noopener noreferrer" className="block" aria-label={config.label}>
            {button}
          </a>
        ) : (
          <Link href={config.href} aria-label={config.label}>
            {button}
          </Link>
        )}
      </CardContent>
    );
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
        <div className="aspect-[3/2] overflow-hidden -m-6 mb-0 rounded-t-xl">{renderImage()}</div>
        <CardHeader className={headerClasses}>
          {renderTitle()}
          <CardDescription title={item.description}>
            <p
              className="body-text-xs text-muted line-clamp-3"
              style={{ minHeight: "calc(1em * var(--line-height-normal) * 3)" }}
            >
              {item.description}
            </p>
          </CardDescription>
        </CardHeader>
        {renderAction()}
      </Card>
    </motion.div>
  );
}

// Export types for use in other components
export type { MediaItem, PictureItem, VideoItem, MusicItem };
