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
  Play,
  User,
} from "lucide-react";
import { motion } from "motion/react";
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
  _createdAt: string;
}

// Union type for all media items
type MediaItem = PictureItem | VideoItem | MusicItem | RadioItem;

interface MediaCardProps {
  item: MediaItem;
}

export function MediaCard({ item }: MediaCardProps) {
  // Common card classes for responsive design
  const cardClasses =
    "overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-neutral-600 transition-all duration-300 ease-in-out hover:duration-150 pt-0 pb-0 w-full flex flex-col";
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

  // Special handling for radio items
  if (item.type === "radio") {
    return (
      <motion.div
        className="relative w-full h-96 rounded-2xl p-6 text-white bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 overflow-hidden group touch-manipulation"
        whileHover={{
          scale: 1.02,
          rotateY: 2,
          rotateX: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.15,
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Animated Background Pattern */}
        <motion.div
          className="absolute inset-0 opacity-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl" />
        </motion.div>

        {/* Cover Image */}
        <motion.div
          className="flex justify-center mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
        >
          {item.coverImageUrl ? (
            <motion.div
              className="w-24 h-24 rounded-2xl overflow-hidden"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.15 }}
            >
              <NextImage
                src={item.coverImageUrl}
                alt={`${item.title} cover`}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ) : (
            <motion.div
              className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.15 }}
            >
              <RadioIcon className="h-12 w-12 text-muted-foreground" />
            </motion.div>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          className="space-y-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.h3
            className="text-xl font-bold"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.15 }}
          >
            {item.title}
          </motion.h3>

          <motion.p
            className="text-sm opacity-70 leading-relaxed line-clamp-3"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 0.7 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {item.description}
          </motion.p>
        </motion.div>

        {/* Play Button */}
        <motion.div
          className="absolute bottom-6 right-6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.7,
            duration: 0.5,
            type: "spring",
            stiffness: 200,
          }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.15 }}
            >
              <User className="w-4 h-4" />
            </motion.div>
            <motion.button
              onClick={() =>
                item.spotifyUrl && window.open(item.spotifyUrl, "_blank")
              }
              className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-400 relative overflow-hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                duration: 0.15,
              }}
            >
              {/* Ripple Effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-white/20"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{
                  scale: [0, 1.5],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                }}
              />
              <Play
                className="w-5 h-5 text-white ml-0.5 relative z-10"
                fill="currentColor"
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5 blur-2xl"></div>
      </motion.div>
    );
  }

  // Default card layout for other media types
  return (
    <Card className={cardClasses}>
      <div className="aspect-square bg-muted overflow-hidden -m-6 mb-0 rounded-t-xl">
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
  );
}

// Export types for use in other components
export type { MediaItem, PictureItem, VideoItem, MusicItem, RadioItem };
