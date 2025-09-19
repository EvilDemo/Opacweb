"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Music as MusicIcon,
  Radio as RadioIcon,
  Images,
} from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";

// Base interface for all media items
interface BaseMediaItem {
  _id: string;
  title: string;
  description: string;
}

// Specific interfaces for each media type
interface PictureItem extends BaseMediaItem {
  type: "picture";
  thumbnailUrl: string;
}

interface VideoItem extends BaseMediaItem {
  type: "video";
  coverImageUrl?: string;
  animatedCoverImageUrl?: string;
  videoUrl: string;
}

interface MusicItem extends BaseMediaItem {
  type: "music";
  coverImageUrl?: string;
  spotifyUrl: string;
}

interface RadioItem extends BaseMediaItem {
  type: "radio";
  coverImageUrl?: string;
  spotifyUrl: string;
}

// Union type for all media items
type MediaItem = PictureItem | VideoItem | MusicItem | RadioItem;

interface MediaCardProps {
  item: MediaItem;
}

export function MediaCard({ item }: MediaCardProps) {
  // Common card classes for responsive design
  const cardClasses =
    "overflow-hidden hover:shadow-lg transition-shadow pt-0 pb-0 w-full flex flex-col";
  const headerClasses = "px-3 flex-1 flex flex-col min-h-0";
  const titleClasses = "body-text-md !font-medium  line-clamp-1 leading-tight";
  const descriptionClasses =
    "paragraph-mini-regular text-muted line-clamp-3 flex-1 mt-1";
  const contentClasses = "px-3 pb-3 pt-0 mt-auto";

  // Render image based on media type
  const renderImage = () => {
    switch (item.type) {
      case "picture":
        return (
          <NextImage
            src={item.thumbnailUrl}
            alt={`${item.title} - ${item.description}`}
            width={200}
            height={200}
            className="w-full h-full object-cover"
            // unoptimized={true}
          />
        );

      case "video":
        const primaryImageUrl = item.animatedCoverImageUrl;
        const fallbackImageUrl = item.coverImageUrl;

        if (!fallbackImageUrl && !primaryImageUrl) {
          return null;
        }

        return (
          <NextImage
            src={primaryImageUrl || fallbackImageUrl || ""}
            alt={`${item.title} - ${item.description}`}
            width={200}
            height={200}
            className="w-full h-full object-cover"
            // unoptimized={true}
            onLoad={() => {
              // If we're on mobile, don't do any additional loading logic
              if (window.innerWidth <= 768) {
                return;
              }
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;

              // If primary image fails to load, try fallback
              if (fallbackImageUrl && target.src !== fallbackImageUrl) {
                target.src = fallbackImageUrl;
              }
            }}
          />
        );

      case "music":
        return item.coverImageUrl ? (
          <NextImage
            src={item.coverImageUrl}
            alt={`${item.title} cover`}
            width={200}
            height={200}
            className="w-full h-full object-cover"
            // unoptimized={true}
          />
        ) : (
          <MusicIcon className="h-16 w-16 text-muted-foreground" />
        );

      case "radio":
        return item.coverImageUrl ? (
          <NextImage
            src={item.coverImageUrl}
            alt={`${item.title} cover`}
            width={200}
            height={200}
            className="w-full h-full object-cover"
            // unoptimized={true}
          />
        ) : (
          <RadioIcon className="h-16 w-16 text-muted-foreground" />
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
            <MusicIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>{item.title}</span>
          </CardTitle>
        );

      case "radio":
        return (
          <CardTitle
            className={`${titleClasses} flex items-center gap-2`}
            title={item.title}
          >
            <RadioIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
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

      case "radio":
        return (
          <CardContent className={contentClasses}>
            <a
              href={item.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              aria-label={`Open ${item.title} playlist on Spotify`}
            >
              <Button variant="default" size="sm" className="w-full">
                Open Playlist
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </a>
          </CardContent>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={cardClasses}>
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
        <div className="w-full h-full">{renderImage()}</div>
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
  );
}

// Export types for use in other components
export type { MediaItem, PictureItem, VideoItem, MusicItem, RadioItem };
