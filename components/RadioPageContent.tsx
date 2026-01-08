"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { type Radio } from "@/lib/mediaData";
import { RadioCard } from "@/components/RadioCard";
import { useMediaQuery } from "@/lib/hooks";

interface RadioPageContentProps {
  initialData: Radio[];
}

export function RadioPageContent({ initialData }: RadioPageContentProps) {
  // Sort by updated date (newest first)
  const displayData: Radio[] = initialData.sort(
    (a, b) =>
      new Date(b._updatedAt).getTime() - new Date(a._updatedAt).getTime()
  );

  return <RadioScrollContent displayData={displayData} />;
}

// Props interface for RadioScrollContent component
interface RadioScrollContentProps {
  displayData: Radio[];
}

// Separate component for scroll content that only renders on client
function RadioScrollContent({ displayData }: RadioScrollContentProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Use media query for large screen detection
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  
  // Calculate initial estimate to prevent CLS
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window !== "undefined") {
      const isLargeScreenInitial = window.innerWidth >= 1024;
      if (isLargeScreenInitial) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const cardWidth = 320; // lg:w-80 = 320px
        const cardGap = 48; // lg:gap-12 = 48px
        const titleSectionWidth = Math.min(viewportWidth * 0.4, 600); // 40vw max 600px
        const estimatedContentWidth =
          titleSectionWidth + displayData.length * cardWidth + (displayData.length - 1) * cardGap;
        const estimatedScrollDistance = Math.max(0, estimatedContentWidth - viewportWidth + 500);
        return {
          contentWidth: estimatedContentWidth,
          viewportWidth,
          scrollDistance: estimatedScrollDistance,
          sectionHeight: viewportHeight + estimatedScrollDistance,
        };
      }
    }
    return {
      contentWidth: 0,
      viewportWidth: 0,
      scrollDistance: 0,
      sectionHeight: 0,
    };
  });

  // Set up scroll tracking with sticky container
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"],
  });

  // Calculate dimensions and scroll distance
  const calculateDimensions = useCallback(() => {
    if (!contentRef.current || !scrollRef.current) return;

    const contentWidth = contentRef.current.scrollWidth;
    const viewportWidth = scrollRef.current.offsetWidth;

    // Only apply horizontal scroll calculations on large screens
    if (isLargeScreen) {
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

      // Debug logging
      console.log("Scroll calculation (large screen):", {
        contentWidth,
        expectedContentWidth,
        finalContentWidth,
        viewportWidth,
        scrollDistance,
        extraPadding,
        cardCount: displayData.length,
        titleSectionWidth,
        cardWidth,
        cardGap,
      });

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
  }, [displayData, isLargeScreen]);

  // Recalculate dimensions when data changes or window resizes
  useEffect(() => {
    calculateDimensions();

    const handleResize = () => calculateDimensions();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [calculateDimensions]);

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

  return (
    <div className="min-h-[calc(100vh-6rem)]">
      <motion.div
        ref={scrollRef}
        className="w-full"
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
              className={`overflow-hidden w-full ${
                isLargeScreen ? "h-full" : ""
              }`}
            >
              <motion.div
                ref={contentRef}
                className={`flex flex-col lg:flex-row items-center lg:w-max padding-global ${
                  isLargeScreen ? "h-full" : ""
                }`}
                style={{ x: xTransform }}
              >
                {/* Fixed Title Section */}
                <div className="flex-shrink-0  w-full lg:max-w-[25vw]">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <div>
                      <motion.h1
                        className=" heading-3"
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
                    </div>
                  </motion.div>
                </div>

                {/* Horizontal Scrollable Cards Container */}
                <motion.div
                  className="pb-20 pt-10 padding-global grid grid-cols-1 md:grid-cols-3 md:pt-36 lg:flex lg:flex-row lg:flex-nowrap lg:pt-0 lg:pb-0 gap-0 md:gap-6 md:gap-y-34 lg:gap-12 lg:min-w-max"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <AnimatePresence>
                    {displayData.map((item, index) => (
                      <motion.div
                        key={item._id}
                        className="lg:flex-shrink-0 lg:w-80"
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: 1 + index * 0.05,
                          duration: 0.4,
                          ease: "easeOut",
                        }}
                        whileHover={{
                          y: -10,
                          scale: 1.02,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <RadioCard
                          _id={item._id}
                          title={item.title}
                          description={item.description}
                          thumbnailUrl={item.thumbnailUrl}
                          spotifyUrl={item.spotifyUrl}
                          _updatedAt={item._updatedAt}
                          index={index}
                        />
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
