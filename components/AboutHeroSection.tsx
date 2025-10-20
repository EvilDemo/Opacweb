"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";

export const AboutHeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section ref={sectionRef} className="min-h-[calc(100vh-6rem)] relative mt-[-6rem]" aria-label="About hero section">
      <div className="sticky top-0 h-screen flex items-center justify-center padding-global">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-4 w-full">
          {/* Left Column - Heading and Tagline */}
          <motion.div
            className="w-full lg:w-1/3 space-y-2"
            initial={{ opacity: 0, x: -100 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-balance heading-3"
            >
              Born to be different.
            </motion.h1>
            <motion.p
              className="body-text-sm text-muted"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              A creative platform and label from Portugal.
            </motion.p>
          </motion.div>

          {/* Right Column - Body Text */}
          <motion.div
            className="w-full lg:w-2/3"
            initial={{ opacity: 0, x: 100 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <motion.p
              className="body-text text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              Formerly known as Vanta, OPAC marks the return of a long standing vision conceived in early years, now
              renewed with clarity, relevance, and intention.
              <br />
              <br />
              What began in 2021 as a university project soon evolved into a named and intentional musical endeavour.
              Over time, it expanded becoming broader, multidimensional, and future-facing.
              <br />
              <br /> Born from an emotional and spiritual void, it emerges with purpose. The name evokes depth, the
              acronym defines our mission. Black holds time and space, light reveals intent.
              <br />
              <br /> Today, OPAC is a cross disciplinary platform, where innovation and distinction drive every
              initiative. We exist to introduce new ideas, elevate creative freedom, and shape meaningful narratives.
              Branches connect. Purpose remains. Positioned as both a creative platform and an independent label, OPAC
              stands at the intersection of music, arts, and fashion - writing a new chapter in Portugal’s contemporary
              cultural landscape.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
