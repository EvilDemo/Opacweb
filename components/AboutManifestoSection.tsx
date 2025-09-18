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

  // Create individual useTransform calls for each text block
  const opacity0 = useTransform(scrollYProgress, [0.25, 0.37, 1], [0, 1, 1]);
  const y0 = useTransform(scrollYProgress, [0.25, 0.37], [300, 0]);

  const opacity1 = useTransform(scrollYProgress, [0.33, 0.45, 1], [0, 1, 1]);
  const y1 = useTransform(scrollYProgress, [0.33, 0.45], [300, 0]);

  const opacity2 = useTransform(scrollYProgress, [0.41, 0.53, 1], [0, 1, 1]);
  const y2 = useTransform(scrollYProgress, [0.41, 0.53], [300, 0]);

  const opacity3 = useTransform(scrollYProgress, [0.49, 0.61, 1], [0, 1, 1]);
  const y3 = useTransform(scrollYProgress, [0.49, 0.61], [300, 0]);

  const opacity4 = useTransform(scrollYProgress, [0.57, 0.69, 1], [0, 1, 1]);
  const y4 = useTransform(scrollYProgress, [0.57, 0.69], [300, 0]);

  const opacity5 = useTransform(scrollYProgress, [0.65, 0.77, 1], [0, 1, 1]);
  const y5 = useTransform(scrollYProgress, [0.65, 0.77], [300, 0]);

  const scrollStyles = [
    { opacity: opacity0, y: y0 },
    { opacity: opacity1, y: y1 },
    { opacity: opacity2, y: y2 },
    { opacity: opacity3, y: y3 },
    { opacity: opacity4, y: y4 },
    { opacity: opacity5, y: y5 },
  ];

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
              .map((block) => {
                const globalIndex = textBlocks.findIndex((b) => b === block);
                return (
                  <motion.p
                    key={globalIndex}
                    className="heading-4 text-white"
                    style={scrollStyles[globalIndex]}
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
