"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  getPictures,
  getVideos,
  getMusic,
  type Pictures,
  type Video,
  type Music,
} from "@/lib/mediaData";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MediaCard, type MediaItem } from "@/components/MediaCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function Media2PageContent() {
  const [pictures, setPictures] = useState<Pictures[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [music, setMusic] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("pictures");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [picturesData, videosData, musicData] = await Promise.all([
          getPictures(),
          getVideos(),
          getMusic(),
        ]);

        setPictures(picturesData);
        setVideos(videosData);
        setMusic(musicData);
      } catch (error) {
        console.error("Error fetching media data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center h-[calc(100vh-6rem)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <LoadingSpinner />
        </motion.div>
      </motion.div>
    );
  }

  if (!isClient) {
    return (
      <motion.div
        className="flex items-center justify-center h-[calc(100vh-6rem)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <LoadingSpinner />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Navigation */}
        <div className="sticky top-[6rem] z-40 bg-background/95 backdrop-blur-sm">
          <div className="px-4 sm:px-8 md:px-12 lg:px-16 py-4">
            <TabsList className="grid w-full grid-cols-3 h-auto gap-2">
              <TabsTrigger value="pictures" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Pictures
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <VideoIcon className="h-4 w-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="by-us" className="flex items-center gap-2">
                <MusicIcon className="h-4 w-4" />
                By Us
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Content based on active tab */}
        <TabsContent value="pictures" className="mt-0">
          <Media2ScrollContent
            data={transformPictures(pictures)}
            title="What can't be seen must be heard."
            emptyMessage="No pictures available yet."
          />
        </TabsContent>

        <TabsContent value="videos" className="mt-0">
          <Media2ScrollContent
            data={transformVideos(videos).filter(
              (item) =>
                item.type === "video" &&
                (item.coverImageUrl || item.animatedCoverImageUrl)
            )}
            title="What can't be seen must be heard."
            emptyMessage="No videos available yet."
          />
        </TabsContent>

        <TabsContent value="by-us" className="mt-0">
          <Media2ScrollContent
            data={transformMusic(music)}
            title="What can't be seen must be heard."
            emptyMessage="No music tracks available yet."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Separate component for scroll content that only renders on client
function Media2ScrollContent({
  data,
  title,
  emptyMessage,
}: {
  data: MediaItem[];
  title: string;
  emptyMessage: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);

  // Enhanced scroll-based animations
  const titleY = useTransform(scrollYProgress, [0, 0.3], ["0%", "-20%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const cardsScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // Sort by updated date (newest first)
  const displayData = data.sort(
    (a, b) =>
      new Date(b._updatedAt).getTime() - new Date(a._updatedAt).getTime()
  );

  if (displayData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)] px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="text-center">
          <p className="body-text text-muted-foreground">{emptyMessage}</p>
          <p className="body-text-sm text-muted-foreground mt-2">
            Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div className="h-[500vh]" ref={scrollRef}>
        <div className="h-[calc(100vh-12rem)] overflow-hidden sticky top-[12rem]">
          <motion.div
            className="flex items-center h-full"
            style={{ x, scale: cardsScale }}
          >
            {/* Fixed Title Section */}
            <motion.div
              ref={titleRef}
              className="flex-shrink-0 padding-global mr-8 max-w-[40vw]"
              style={{ y: titleY, opacity: titleOpacity }}
            >
              <motion.div
                className="flex items-start gap-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="flex items-start gap-3 mb-2">
                  <motion.h1
                    className="heading-4 !leading-[1]"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  >
                    {title}
                  </motion.h1>
                </div>
              </motion.div>
            </motion.div>

            {/* Media Cards */}
            <motion.div
              ref={cardsRef}
              className="flex gap-4 sm:gap-6 md:gap-8 pl-4 sm:pl-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <AnimatePresence>
                {displayData.map((item, index) => (
                  <motion.div
                    key={item._id}
                    className="flex-shrink-0 w-72 sm:w-110"
                    initial={{ opacity: 0, y: 100, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 1 + index * 0.1,
                      duration: 0.6,
                      ease: "easeOut",
                      type: "spring",
                      stiffness: 100,
                    }}
                    whileHover={{
                      y: -10,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <MediaCard item={item} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator for Mobile */}
          <motion.div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 sm:hidden z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            <motion.div
              className="bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 border border-border"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span>Scroll to explore</span>
                <motion.div
                  className="w-2 h-2 rounded-full bg-green-500"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
