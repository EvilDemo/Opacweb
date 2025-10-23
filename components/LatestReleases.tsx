"use client";

import { motion } from "motion/react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MediaCard, type MediaItem } from "@/components/MediaCard";
import { type Pictures, type Video, type Music } from "@/lib/mediaData";

// Helper functions to transform data to MediaCard format (from MediaPageContent.tsx)
const transformPictures = (pictures: Pictures[]): MediaItem[] =>
  pictures.map((item) => ({ ...item, type: "picture" as const }));

const transformVideos = (videos: Video[]): MediaItem[] => videos.map((item) => ({ ...item, type: "video" as const }));

const transformMusic = (music: Music[]): MediaItem[] => music.map((item) => ({ ...item, type: "music" as const }));

interface LatestReleasesProps {
  pictures: Pictures[];
  videos: Video[];
  music: Music[];
}

export function LatestReleases({ pictures, videos, music }: LatestReleasesProps) {
  // Combine all media data and sort by updated date
  const allMediaData = [...transformPictures(pictures), ...transformVideos(videos), ...transformMusic(music)].sort(
    (a, b) => new Date(b._updatedAt).getTime() - new Date(a._updatedAt).getTime()
  );

  // Get the latest 5 items
  const latestItems = allMediaData.slice(0, 6);

  // Don't render if no items
  if (latestItems.length === 0) {
    return null;
  }

  return (
    <section className="padding-global py-16 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className="w-full mx-auto"
      >
        {/* Section Header */}
        <div className="mb-8">
          <motion.h2
            className="heading-2 mb-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true }}
          >
            Latest Releases
          </motion.h2>
          <motion.p
            className="body-text text-muted"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
          >
            Discover our most recent creative work
          </motion.p>
        </div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          viewport={{ once: true }}
          className="flex items-center"
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {latestItems.map((item, index) => (
                <CarouselItem key={item._id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="w-full">
                    <MediaCard item={item} index={index} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12" />
            <CarouselNext className="hidden md:flex -right-12" />
          </Carousel>
        </motion.div>
      </motion.div>
    </section>
  );
}
