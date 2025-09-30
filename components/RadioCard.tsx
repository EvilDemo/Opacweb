"use client";

import { motion, useInView } from "motion/react";
import { Radio as RadioIcon, Play } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { Card } from "@/components/ui/card";

interface RadioCardProps {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  spotifyUrl: string;
  _updatedAt: string;
  index?: number;
}

export function RadioCard({
  title,
  description,
  thumbnailUrl,
  spotifyUrl,
  index = 0,
}: RadioCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Calculate cascading delay based on index
  const cascadingDelay = index * 0.1;

  return (
    <div className="relative h-55 ">
      {/* Cover Image - Centered and 50% outside card on top */}
      <motion.div
        className="relative left-1/2  top-20 md:absolute z-20 md:left-1/2 md:transform md:-translate-x-1/2 md:-top-20 lg:-top-28"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={
          isInView
            ? { scale: 1, opacity: 1, y: 0 }
            : { scale: 0.8, opacity: 0, y: 20 }
        }
        transition={{
          duration: 0.6,
          ease: "easeOut",
          delay: cascadingDelay,
        }}
        whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
      >
        {thumbnailUrl ? (
          <motion.div
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.15 }}
          >
            <Image
              src={thumbnailUrl}
              alt={`${title} cover`}
              width={120}
              height={185}
              className="w-18 md:w-22 lg:w-30"
              sizes="(max-width: 768px) 72px, (max-width: 1024px) 88px, 120px"
              loading={index < 2 ? "eager" : "lazy"}
              priority={index < 2}
              unoptimized // Already optimized by Sanity CDN
            />
          </motion.div>
        ) : (
          <div className="w-56 h-56 rounded-2xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
            <RadioIcon className="h-24 w-24 text-white" />
          </div>
        )}
      </motion.div>

      {/* Main Card */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
          delay: cascadingDelay,
        }}
      >
        <Card variant="radio">
          {/* Content */}
          <motion.div
            className="flex-1 flex flex-col p-4 md:pt-14"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Centered Heading */}
            <motion.h2 className="heading-4 text-white text-left  mb-2 group-hover:scale-105 transition-transform duration-200">
              {title}
            </motion.h2>

            {/* Description and Play Button Container */}
            <div className="flex flex-row items-center justify-center gap-2 flex-1 ">
              <motion.p
                className="paragraph-small-regular text-muted line-clamp-3 text-left flex-1"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 0.7 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {description}
              </motion.p>

              {/* Play Button */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.7,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                }}
              >
                <motion.button
                  onClick={() =>
                    spotifyUrl && window.open(spotifyUrl, "_blank")
                  }
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center hover:from-green-400 hover:to-emerald-500 relative overflow-hidden shadow-lg hover:shadow-green-500/25 transition-shadow duration-300 flex-shrink-0 cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    duration: 0.15,
                  }}
                  aria-label={`Play ${title} on Spotify`}
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
                    className="w-7 h-7 text-white ml-1 relative z-10"
                    fill="currentColor"
                  />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
