"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMediaQuery } from "@/lib/hooks";

interface AboutScrollingSectionProps {
  text?: string;
}

export const AboutScrollingSection = ({
  text = "Embracing individuality. Embracing the difference.",
}: AboutScrollingSectionProps = {}) => {
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  
  // Use media query for mobile detection (< 1024px to match lg breakpoint)
  const isMobile = useMediaQuery('(max-width: 1023px)');

  const { scrollYProgress: horizontalScrollProgress } = useScroll({
    target: horizontalScrollRef,
    offset: ["start start", "end start"],
  });

  // Only apply horizontal transform on desktop, disable on mobile
  const xTransform = useTransform(horizontalScrollProgress, [0, 1], isMobile ? ["0%", "0%"] : ["0%", "-100%"]);

  return (
    <motion.div
      className="h-[120vh] mt-[-70vh] lg:h-[120vh] lg:mt-[-70vh]"
      ref={horizontalScrollRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="sticky top-0 h-[calc(100vh-6rem)] mt-[-6rem] overflow-hidden">
        <div className="h-full flex items-end lg:justify-end justify-start">
          <motion.div
            className="overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <motion.h1
              className="display-text text-balance w-full lg:w-[450vw] uppercase padding-global  lg:whitespace-nowrap"
              style={{
                x: xTransform,
              }}
            >
              {text}
            </motion.h1>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
