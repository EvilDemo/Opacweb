"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";

export const AboutHeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section ref={sectionRef} className="min-h-[150vh] relative" aria-label="About hero section">
      <div className="sticky top-0 h-screen flex items-center justify-center padding-global">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-4 w-full">
          {/* Left Column - Heading and Tagline */}
          <motion.div
            className="w-full lg:w-1/2 space-y-2"
            initial={{ opacity: 0, x: -100 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Inspired by you, created by me.
            </motion.h1>
            <motion.p
              className="body-text"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              A creative platform and label from Portugal.
            </motion.p>
          </motion.div>

          {/* Right Column - Body Text */}
          <motion.div
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: 100 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <motion.p
              className="body-text"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              Formerly Vanta, OPAC is the return of a long-standing idea conceived in adolescence, renewed with clarity
              and relevance. Emerging from an emotional and spiritual void, it carries a purposeful vision. From
              opacity, the name. From meaning, the acronym, One Purpose, Art and Culture. Black holds time and space,
              light reveals intent. Begun in 2021 as a university project, first a music EP, then something broader and
              multidimensional.
              <br />
              <br />
              Today, OPAC is a cross disciplinary platform with innovation and distinction at its core. Branches
              connect, purpose remains. To introduce new ideas and elevate creative freedom. OPAC stands as a creative
              platform and label shaping a new chapter in Portugal's contemporary landscape across music, arts, and
              fashion.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
