"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

interface TextBlock {
  text: string;
  group: number;
}

interface AboutManifestoSectionProps {
  textBlocks?: TextBlock[];
  minHeight?: string;
  marginTop?: string;
}

export const AboutManifestoSection = ({
  textBlocks = [
    { text: "We are not here to fill silence.", group: 0 },
    { text: "We are here to bend it.", group: 0 },
    { text: "Music is the signal.", group: 1 },
    { text: "Clothing is the carrier.", group: 1 },
    { text: "Together they create residue,", group: 2 },
    { text: "a trace of something unspoken.", group: 2 },
  ],
  minHeight = "min-h-[400vh]",
  marginTop = "mt-[-100vh]",
}: AboutManifestoSectionProps = {}) => {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Helper function to create scroll-driven styles
  const getScrollStyles = (index: number) => {
    const start = 0.25 + index * 0.08; // Delayed start for overlap compensation
    const end = start + 0.12; // Animation duration
    return {
      opacity: useTransform(scrollYProgress, [start, end, 1], [0, 1, 1]),
      y: useTransform(scrollYProgress, [start, end], [300, 0]),
    };
  };

  // Get unique groups from textBlocks
  const uniqueGroups = [
    ...new Set(textBlocks.map((block) => block.group)),
  ].sort();

  return (
    <motion.section
      ref={sectionRef}
      className={`${minHeight} ${marginTop} flex items-center justify-end bg-black text-white padding-global`}
      aria-label="Manifesto section"
    >
      <article className="text-right space-y-8 sticky top-0 flex flex-col items-end justify-center h-screen">
        {uniqueGroups.map((groupIndex) => (
          <div key={groupIndex}>
            {textBlocks
              .filter((block) => block.group === groupIndex)
              .map((block, blockIndex) => {
                const globalIndex = textBlocks.findIndex((b) => b === block);
                return (
                  <motion.p
                    key={globalIndex}
                    className="heading-4 text-white"
                    style={getScrollStyles(globalIndex)}
                  >
                    {block.text}
                  </motion.p>
                );
              })}
          </div>
        ))}
      </article>
    </motion.section>
  );
};
