"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { type Pictures, type Video, type Music } from "@/lib/mediaData";
import { MediaCard, type MediaItem } from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
} from "lucide-react";

// Helper functions to transform data to MediaCard format
const transformPictures = (pictures: Pictures[]): MediaItem[] =>
  pictures.map((item) => ({ ...item, type: "picture" as const }));

const transformVideos = (videos: Video[]): MediaItem[] =>
  videos.map((item) => ({ ...item, type: "video" as const }));

const transformMusic = (music: Music[]): MediaItem[] =>
  music.map((item) => ({ ...item, type: "music" as const }));

type FilterType = "all" | "picture" | "video" | "music";

interface MediaPageContentProps {
  initialData: {
    pictures: Pictures[];
    videos: Video[];
    music: Music[];
  };
}

export function MediaPageContent({ initialData }: MediaPageContentProps) {
  // Combine all media data and sort by updated date
  const allMediaData = [
    ...transformPictures(initialData.pictures),
    ...transformVideos(initialData.videos),
    ...transformMusic(initialData.music),
  ].sort(
    (a, b) =>
      new Date(b._updatedAt).getTime() - new Date(a._updatedAt).getTime()
  );

  return <MediaScrollContent allMediaData={allMediaData} />;
}

// Props interface for MediaScrollContent component
interface MediaScrollContentProps {
  allMediaData: MediaItem[];
}

// Separate component for scroll content that only renders on client
function MediaScrollContent({ allMediaData }: MediaScrollContentProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    contentWidth: 0,
    viewportWidth: 0,
    scrollDistance: 0,
    sectionHeight: 0,
  });
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Simple filtering logic
  const getFilteredData = useCallback(
    (filter: FilterType): MediaItem[] => {
      if (filter === "all") {
        // For "all", only show videos with thumbnails
        return allMediaData.filter((item) => {
          if (item.type === "video") {
            return item.thumbnailUrl;
          }
          return true;
        });
      }
      // For specific filters, show all items of that type
      return allMediaData.filter((item) => item.type === filter);
    },
    [allMediaData]
  );

  // Make displayData stable to prevent infinite loops
  const displayData = useMemo(
    () => getFilteredData(activeFilter),
    [activeFilter, getFilteredData]
  );

  // Set up scroll tracking with sticky container
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"],
  });

  // Calculate dimensions and scroll distance (same as radio page)
  const calculateDimensions = useCallback(() => {
    if (!contentRef.current || !scrollRef.current) return;

    const contentWidth = contentRef.current.scrollWidth;
    const viewportWidth = scrollRef.current.offsetWidth;
    const isLargeScreenCheck = window.innerWidth >= 1024; // lg breakpoint
    setIsLargeScreen(isLargeScreenCheck);

    // Only apply horizontal scroll calculations on large screens
    if (isLargeScreenCheck) {
      // Calculate expected width based on card count and dimensions
      const cardWidth = 320; // lg:w-80 = 320px
      const cardGap = 48; // lg:gap-12 = 48px
      const titleSectionWidth = Math.min(viewportWidth * 0.4, 600); // 40vw max 600px
      const expectedContentWidth =
        titleSectionWidth +
        displayData.length * cardWidth +
        (displayData.length - 1) * cardGap;

      // Use the larger of actual scrollWidth or expected width
      const finalContentWidth = Math.max(contentWidth, expectedContentWidth);

      // Add extra padding to ensure we can scroll past the last card
      const extraPadding = 500; // Additional pixels to scroll past the last card
      const scrollDistance = Math.max(
        0,
        finalContentWidth - viewportWidth + extraPadding
      );
      const viewportHeight = window.innerHeight;
      const sectionHeight = viewportHeight + scrollDistance;

      setDimensions({
        contentWidth: finalContentWidth,
        viewportWidth,
        scrollDistance,
        sectionHeight,
      });
    } else {
      // On smaller screens, use auto height to adapt to content
      setDimensions({
        contentWidth,
        viewportWidth,
        scrollDistance: 0,
        sectionHeight: 0, // 0 means auto height
      });
    }
  }, [displayData]);

  // Recalculate dimensions when filter changes or window resizes
  useEffect(() => {
    calculateDimensions();

    const handleResize = () => calculateDimensions();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [activeFilter, calculateDimensions]); // Only recalculate when filter changes

  // Transform horizontal scroll from 0 to -scrollDistance
  // Complete the horizontal scroll by 80% of the vertical scroll
  // Only apply on large screens (lg and above)
  const xTransform = useTransform(
    scrollYProgress,
    [0, 0.8, 1],
    [
      0,
      isLargeScreen ? -dimensions.scrollDistance : 0,
      isLargeScreen ? -dimensions.scrollDistance : 0,
    ]
  );

  const filterButtons = [
    { type: "all" as const, label: "All", icon: null },
    { type: "picture" as const, label: "Pictures", icon: ImageIcon },
    { type: "video" as const, label: "Videos", icon: VideoIcon },
    { type: "music" as const, label: "Music", icon: MusicIcon },
  ];

  if (displayData.length === 0) {
    return (
      <div className="min-h-[calc(100vh-6rem)]">
        <motion.div
          ref={scrollRef}
          className="w-full relative"
          style={{
            height: isLargeScreen
              ? dimensions.sectionHeight || "100vh"
              : "auto",
          }}
        >
          {/* Sticky container that pins during vertical scroll */}
          <div
            className={`${
              isLargeScreen ? "sticky top-0 h-screen -mt-[6rem]" : ""
            }`}
          >
            <div
              className={`${
                isLargeScreen
                  ? "h-full flex items-center pt-[6rem]"
                  : "pt-[6rem]"
              }`}
            >
              <motion.div
                className={`overflow-hidden w-full relative ${
                  isLargeScreen ? "h-full" : ""
                }`}
              >
                <motion.div
                  ref={contentRef}
                  className={`flex flex-col lg:flex-row items-center lg:w-max padding-global ${
                    isLargeScreen ? "h-full" : ""
                  }`}
                  style={{ x: isLargeScreen ? xTransform : 0 }}
                >
                  {/* Fixed Title Section */}
                  <div className="flex-shrink-0 w-full lg:max-w-[25vw]">
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      <div>
                        <motion.h1
                          className="heading-3 mb-6"
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.5,
                            duration: 0.8,
                            ease: "easeOut",
                          }}
                        >
                          What can&apos;t be seen must be heard.
                        </motion.h1>

                        {/* Filter Buttons */}
                        <motion.div
                          className="flex flex-wrap gap-3"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.7,
                            duration: 0.6,
                            ease: "easeOut",
                          }}
                        >
                          {filterButtons.map(({ type, label, icon: Icon }) => (
                            <Button
                              key={type}
                              variant={
                                activeFilter === type ? "default" : "secondary"
                              }
                              size="sm"
                              onClick={() => setActiveFilter(type)}
                            >
                              {Icon && <Icon className="h-4 w-4" />}
                              {label}
                            </Button>
                          ))}
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Empty State Content Area */}
                  <motion.div
                    className="pb-20 pt-10 padding-global"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-center">
                      <div className="text-center lg:text-left">
                        <p className="body-text text-muted">
                          No{" "}
                          {activeFilter === "all"
                            ? "media"
                            : activeFilter + "s"}{" "}
                          available yet.
                        </p>
                        <p className="body-text-sm text-muted-foreground mt-2">
                          Check back soon!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)]">
      <motion.div
        ref={scrollRef}
        className="w-full relative"
        style={{
          height: isLargeScreen ? dimensions.sectionHeight || "100vh" : "auto",
        }}
      >
        {/* Sticky container that pins during vertical scroll */}
        <div
          className={`${
            isLargeScreen ? "sticky top-0 h-screen -mt-[6rem]" : ""
          }`}
        >
          <div
            className={`${
              isLargeScreen ? "h-full flex items-center pt-[6rem]" : "pt-[6rem]"
            }`}
          >
            <motion.div
              className={`overflow-hidden w-full relative ${
                isLargeScreen ? "h-full" : ""
              }`}
            >
              <motion.div
                ref={contentRef}
                className={`flex flex-col lg:flex-row items-center lg:w-max padding-global ${
                  isLargeScreen ? "h-full" : ""
                }`}
                style={{ x: isLargeScreen ? xTransform : 0 }}
              >
                {/* Fixed Title Section */}
                <div className="flex-shrink-0 w-full lg:max-w-[25vw]">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <div>
                      <motion.h1
                        className="heading-3 mb-6"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.5,
                          duration: 0.8,
                          ease: "easeOut",
                        }}
                      >
                        What can&apos;t be seen must be heard.
                      </motion.h1>

                      {/* Filter Buttons */}
                      <motion.div
                        className="flex flex-wrap gap-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.7,
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                      >
                        {filterButtons.map(({ type, label, icon: Icon }) => (
                          <Button
                            key={type}
                            variant={
                              activeFilter === type ? "default" : "secondary"
                            }
                            size="sm"
                            onClick={() => setActiveFilter(type)}
                          >
                            {Icon && <Icon className="h-4 w-4" />}
                            {label}
                          </Button>
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Horizontal Scrollable Cards Container */}
                <motion.div
                  key={activeFilter} // Force re-render on filter change
                  className="relative pb-20 pt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-row lg:flex-nowrap lg:pt-0 lg:pb-0 md:gap-6 lg:gap-4 lg:min-w-max  xl:gap-5 2xl:gap-6 "
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatePresence>
                    {displayData.map((item, index) => (
                      <motion.div
                        key={item._id}
                        className="lg:flex-shrink-0 lg:w-68 2xl:w-72"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{
                          delay: index * 0.05,
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                        whileHover={{
                          y: -10,
                          scale: 1.02,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <MediaCard item={item} index={index} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
