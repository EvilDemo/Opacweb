"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { MediaCard, type MediaItem } from "@/components/MediaCard";
import { type Pictures, type Video, type Music } from "@/lib/mediaData";
import { useEffect, useState } from "react";

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
  const [api, setApi] = useState<CarouselApi>();
  const [isAnimating, setIsAnimating] = useState(false);

  // Combine all media data and sort by updated date
  const allMediaData = [...transformPictures(pictures), ...transformVideos(videos), ...transformMusic(music)].sort(
    (a, b) => new Date(b._updatedAt).getTime() - new Date(a._updatedAt).getTime()
  );

  // Get the latest 5 items
  const latestItems = allMediaData.slice(0, 6);

  useEffect(() => {
    if (!api) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const handleSelect = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      setIsAnimating(true);
      // Reset animation state after transition
      timeoutId = setTimeout(() => setIsAnimating(false), 300);
    };

    api.on("select", handleSelect);
    // Trigger immediately to ensure state matches current slide
    handleSelect();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      api.off("select", handleSelect);
    };
  }, [api]);

  // Don't render if no items
  if (latestItems.length === 0) {
    return null;
  }

  return (
    <section className="padding-global mt-32 w-full ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className="w-full mx-auto flex  flex-col lg:flex-row items-center justify-center lg:justify-between"
      >
        {/* Section Header */}
        <div className="mb-8 flex flex-col  items-center lg:max-w-1/4 lg:items-start">
          <motion.h2
            className="heading-3 mb-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true }}
          >
            Latest Releases
          </motion.h2>
          <motion.p
            className="body-text-sm text-muted text-pretty"
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
          className="w-3/4 lg:w-2/3 lg:mr-12"
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              <AnimatePresence>
                {latestItems.map((item, index) => (
                  <CarouselItem
                    key={item._id}
                    className="  py-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
                  >
                    <motion.div
                      className="w-full"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{
                        opacity: isAnimating ? 0.7 : 1,
                        scale: isAnimating ? 0.95 : 1,
                        y: 0,
                      }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{
                        duration: isAnimating ? 0.2 : 0.5,
                        ease: "easeOut",
                        delay: isAnimating ? 0 : index * 0.1,
                      }}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <MediaCard item={item} index={index} />
                    </motion.div>
                  </CarouselItem>
                ))}
              </AnimatePresence>
            </CarouselContent>
            <CarouselPrevious className="flex -left-8 md:-left-12" />
            <CarouselNext className="flex -right-8 md:-right-12" />
          </Carousel>
        </motion.div>
      </motion.div>
    </section>
  );
}
