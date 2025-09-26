"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { getRadio, type Radio } from "@/lib/mediaData";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RadioCard } from "@/components/RadioCard";

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

  // Sort by updated date (newest first)
  const displayData: Radio[] = radio.sort(
    (a, b) =>
      new Date(b._updatedAt).getTime() - new Date(a._updatedAt).getTime()
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

  return <RadioScrollContent displayData={displayData} />;
}

// Separate component for scroll content that only renders on client
function RadioScrollContent({ displayData }: { displayData: Radio[] }) {
  const horizontalScrollRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: horizontalScrollProgress } = useScroll({
    target: horizontalScrollRef,
    offset: ["start start", "end start"],
  });

  const horizontalTransform = useTransform(
    horizontalScrollProgress,
    [0, 0.7],
    ["0%", "-100%"]
  );

  return (
    <>
      <motion.div className="h-auto lg:h-[600vh]" ref={horizontalScrollRef}>
        <div className="sticky top-0 lg:h-[100vh] -mt-[6rem]">
          <div className="h-full flex items-center pt-[6rem] pb-20">
            <motion.div className="overflow-hidden h-full">
              <motion.div
                className="flex flex-col lg:flex-row items-center w-full h-full radio-horizontal-scroll"
                style={
                  {
                    "--horizontal-transform": horizontalTransform,
                  } as React.CSSProperties
                }
              >
                {/* Fixed Title Section */}
                <div className="flex-shrink-0 padding-global w-full lg:max-w-[40vw]">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <div>
                      <motion.h1
                        className="heading-4 !leading-[1]"
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

                {/* Playlist Cards */}
                <motion.div
                  className="pb-20 pt-10 padding-global grid grid-cols-1 md:grid-cols-2 md:pt-36 lg:flex lg:flex-row lg:flex-nowrap lg:pt-0 lg:pb-0 gap-0 md:gap-12 md:gap-y-34 lg:gap-12"
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
                        <RadioCard
                          _id={item._id}
                          title={item.title}
                          description={item.description}
                          coverImageUrl={item.coverImageUrl}
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
    </>
  );
}
