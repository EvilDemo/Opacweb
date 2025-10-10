"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

interface AboutHeroSectionProps {
  text?: string;
}

export const AboutHeroSection = ({
  text = "Embracing individuality. Embracing the difference.",
}: AboutHeroSectionProps = {}) => {
  const horizontalScrollRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: horizontalScrollProgress } = useScroll({
    target: horizontalScrollRef,
    offset: ["start start", "end start"],
  });

  return (
    <motion.div
      className="h-[200vh]"
      ref={horizontalScrollRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="sticky top-0 h-[100vh] mt-[-6rem] overflow-hidden">
        <div className="h-full flex items-end justify-end">
          <motion.div
            className="overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <motion.h1
              className="display-text w-[450vw] uppercase padding-global whitespace-nowrap"
              style={{
                x: useTransform(horizontalScrollProgress, [0, 1], ["0%", "-100%"]),
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
