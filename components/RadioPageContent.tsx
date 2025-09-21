"use client";

import { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "motion/react";
import { getRadio, type Radio } from "@/lib/mediaData";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MediaCard, type RadioItem } from "@/components/MediaCard";
import { Radio as RadioIcon, User, ChevronDown } from "lucide-react";

// Placeholder data for demo purposes - this will be replaced with real data
const placeholderPlaylists: RadioItem[] = [
  {
    _id: "1",
    type: "radio",
    title: "Locked In",
    description:
      "A carefully curated playlist for designers. Hit play to discover some new sounds...",
    coverImageUrl: "https://via.placeholder.com/96x96/00d4aa/ffffff?text=LI",
    spotifyUrl: "#",
    _createdAt: "2024-01-15T10:00:00Z",
  },
  {
    _id: "2",
    type: "radio",
    title: "Contrast",
    description:
      "A carefully curated playlist for designers. Hit play to discover some new sounds...",
    coverImageUrl: "https://via.placeholder.com/96x96/ec4899/ffffff?text=C",
    spotifyUrl: "#",
    _createdAt: "2024-01-10T14:30:00Z",
  },
  {
    _id: "3",
    type: "radio",
    title: "Brain Food",
    description:
      "A carefully curated playlist for designers. Hit play to discover some new sounds...",
    coverImageUrl: "https://via.placeholder.com/96x96/facc15/000000?text=BF",
    spotifyUrl: "#",
    _createdAt: "2024-01-20T09:15:00Z",
  },
  {
    _id: "4",
    type: "radio",
    title: "Into the Frame",
    description:
      "A carefully curated playlist for designers. Hit play to discover some new sounds...",
    coverImageUrl: "https://via.placeholder.com/96x96/4ade80/000000?text=IF",
    spotifyUrl: "#",
    _createdAt: "2024-01-05T16:45:00Z",
  },
  {
    _id: "5",
    type: "radio",
    title: "Pixels",
    description:
      "A carefully curated playlist for designers. Hit play to discover some new sounds...",
    coverImageUrl: "https://via.placeholder.com/96x96/22d3ee/000000?text=P",
    spotifyUrl: "#",
    _createdAt: "2024-01-25T11:20:00Z",
  },
  {
    _id: "6",
    type: "radio",
    title: "Deadline",
    description:
      "A carefully curated playlist for designers. Hit play to discover some new sounds...",
    coverImageUrl: "https://via.placeholder.com/96x96/000000/facc15?text=D",
    spotifyUrl: "#",
    _createdAt: "2024-01-12T13:10:00Z",
  },
];

// Helper function to transform Radio data to RadioItem
const transformRadioToRadioItem = (radio: Radio[]): RadioItem[] => {
  return radio.map((item) => ({
    ...item,
    type: "radio" as const,
  }));
};

export function RadioPageContent() {
  const [radio, setRadio] = useState<Radio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function fetchRadioData() {
      try {
        const radioData = await getRadio();
        setRadio(radioData);
      } catch (error) {
        console.error("Error fetching radio data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRadioData();
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

  // Use real data if available, otherwise use placeholder, and sort by publish date (newest first)
  const displayData: RadioItem[] =
    radio.length > 0
      ? transformRadioToRadioItem(radio).sort(
          (a, b) =>
            new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
        )
      : placeholderPlaylists.sort(
          (a, b) =>
            new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
        );

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

  return <RadioScrollContent displayData={displayData} radio={radio} />;
}

// Separate component for scroll content that only renders on client
function RadioScrollContent({
  displayData,
  radio,
}: {
  displayData: RadioItem[];
  radio: Radio[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);

  // Enhanced scroll-based animations
  const titleY = useTransform(scrollYProgress, [0, 0.3], ["0%", "-20%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const cardsScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <>
      <motion.div className="h-[500vh]" ref={scrollRef}>
        <div className="h-[calc(100vh-6rem)] overflow-hidden sticky top-24">
          <motion.div
            className="flex items-center h-full"
            style={{ x, scale: cardsScale }}
          >
            {/* Fixed Title Section */}
            <motion.div
              ref={titleRef}
              className="flex-shrink-0 px-4 sm:px-8 md:px-12 lg:px-16 mr-8 max-w-[35vw]"
              style={{ y: titleY, opacity: titleOpacity }}
            >
              <motion.div
                className="flex items-start gap-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                  >
                    <RadioIcon className="h-8 w-8 text-green-500" />
                  </motion.div>
                  <motion.h1
                    className="heading-1"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  >
                    Where silence becomes frequency
                  </motion.h1>
                </div>
              </motion.div>
            </motion.div>

            {/* Playlist Cards */}
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

          {/* Empty State */}
          <AnimatePresence>
            {radio.length === 0 && (
              <motion.div
                className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 bg-background/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-border z-20"
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Using placeholder data for demo
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
