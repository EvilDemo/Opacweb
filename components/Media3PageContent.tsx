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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  ExternalLink,
  Images,
  Video as VideoIcon,
  Music as MusicIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

// Type for transformed media items
interface TransformedMediaItem {
  _id: string;
  title: string;
  description: string;
  _updatedAt: string;
  type: "picture" | "video" | "music";
  thumbnailUrl?: string;
  coverImageUrl?: string;
  animatedCoverImageUrl?: string;
  videoUrl?: string;
  spotifyUrl?: string;
}

// Helper functions to transform data to MediaCard format
const transformPictures = (pictures: Pictures[]): TransformedMediaItem[] =>
  pictures.map((item) => ({ ...item, type: "picture" as const }));

const transformVideos = (videos: Video[]): TransformedMediaItem[] =>
  videos.map((item) => ({ ...item, type: "video" as const }));

const transformMusic = (music: Music[]): TransformedMediaItem[] =>
  music.map((item) => ({ ...item, type: "music" as const }));

// Custom Radio-style Card Component for all media types
function RadioStyleCard({
  item,
  index,
}: {
  item: TransformedMediaItem;
  index: number;
}) {
  const ref = useRef(null);

  // Calculate cascading delay based on index
  const cascadingDelay = index * 0.1;

  // Get appropriate icon and action based on media type
  const getMediaIcon = () => {
    switch (item.type) {
      case "picture":
        return <Images className="h-12 w-12 text-muted-foreground" />;
      case "video":
        return <VideoIcon className="h-12 w-12 text-muted-foreground" />;
      case "music":
        return <MusicIcon className="h-12 w-12 text-muted-foreground" />;
      default:
        return <User className="h-12 w-12 text-muted-foreground" />;
    }
  };

  const getCoverImage = () => {
    switch (item.type) {
      case "picture":
        return item.thumbnailUrl;
      case "video":
        return item.animatedCoverImageUrl || item.coverImageUrl;
      case "music":
        return item.coverImageUrl;
      default:
        return null;
    }
  };

  const getActionButton = () => {
    switch (item.type) {
      case "picture":
        return (
          <Link
            href={`/media/pictures/${item._id}`}
            aria-label={`View gallery for ${item.title}`}
          >
            <Button variant="secondary" size="sm" className="w-full">
              <Images className="mr-2 h-3 w-3" />
              View Gallery
            </Button>
          </Link>
        );
      case "video":
        return (
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
        );
      case "music":
        return (
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
        );
      default:
        return null;
    }
  };

  const coverImageUrl = getCoverImage();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: cascadingDelay,
      }}
      className="relative w-full h-96 rounded-2xl p-6 text-white bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 overflow-hidden group touch-manipulation"
      whileHover={{
        scale: 1.02,
        rotateY: 2,
        rotateX: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.15,
        },
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
        {coverImageUrl ? (
          <motion.div
            className="w-24 h-24 rounded-2xl overflow-hidden"
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.15 }}
          >
            <Image
              src={coverImageUrl}
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
            {getMediaIcon()}
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

      {/* Action Button */}
      <motion.div
        className="absolute bottom-6 left-6 right-6"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.7,
          duration: 0.5,
          type: "spring",
          stiffness: 200,
        }}
      >
        {getActionButton()}
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 blur-xl"></div>
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5 blur-2xl"></div>
    </motion.div>
  );
}

export function Media3PageContent() {
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
      {/* Tab Bar */}
      <div className="sticky top-[6rem] z-40 bg-background/95 backdrop-blur-sm">
        <div className="px-4 sm:px-8 md:px-12 lg:px-16 py-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 bg-neutral-200">
              <TabsTrigger value="pictures" className="flex items-center gap-2">
                <Images className="h-4 w-4" />
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
          </Tabs>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="w-full">
        {activeTab === "pictures" && (
          <Media3ScrollContent
            data={transformPictures(pictures)}
            title="What can't be seen must be heard."
            emptyMessage="No pictures available yet."
          />
        )}

        {activeTab === "videos" && (
          <Media3ScrollContent
            data={transformVideos(videos).filter(
              (item) =>
                item.type === "video" &&
                (item.coverImageUrl || item.animatedCoverImageUrl)
            )}
            title="What can't be seen must be heard."
            emptyMessage="No videos available yet."
          />
        )}

        {activeTab === "by-us" && (
          <Media3ScrollContent
            data={transformMusic(music)}
            title="What can't be seen must be heard."
            emptyMessage="No music tracks available yet."
          />
        )}
      </div>
    </div>
  );
}

// Separate component for scroll content that only renders on client
function Media3ScrollContent({
  data,
  title,
  emptyMessage,
}: {
  data: TransformedMediaItem[];
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
                    className="flex-shrink-0 w-72 sm:w-80"
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
                    <RadioStyleCard item={item} index={index} />
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
