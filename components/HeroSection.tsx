"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Switch } from "@/components/ui/switch";

// 3D Sphere video from your public folder
const sphereVideo = "/esfera3D.mp4";

export default function HeroSection() {
  const [aotyMode, setAotyMode] = useState(false);

  return (
    <section className="relative w-full h-[calc(100vh-6rem)] flex flex-col justify-center overflow-hidden padding-global ">
      {/* Main Content Container - Responsive Two Column Layout */}
      <div className="relative flex flex-col lg:flex-row items-end  mx-auto">
        {/* Left Column - Text Content */}
        <div className="flex flex-col flex-shrink-0 order-2 lg:order-1">
          <motion.div
            className="flex flex-col  pb-3 pt-0 relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Main Heading with responsive border */}
            <div className="relative w-full">
              <div className="absolute border-b-2 md:border-b-4 lg:border-b-[6px] border-solid border-white inset-0 pointer-events-none" />
              <h1 className="heading-1 w-full">It&apos;s nothing.</h1>
              <h1 className="heading-1 w-full">It&apos;s everything.</h1>
            </div>
          </motion.div>
        </div>

        {/* Right Column - 3D Sphere Video */}
        <div className="flex items-center justify-center flex-shrink-0 lg:ml-auto lg:-mt-32 order-1 lg:order-2">
          <motion.div
            className="relative w-[280px] h-[280px] md:w-[400px] md:h-[400px] lg:w-[561px] lg:h-[561px] overflow-hidden rounded-full"
            initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          >
            <video
              src={sphereVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </motion.div>
        </div>
      </div>

      {/* AOTY Mode Toggle Button */}
      <motion.div
        className="absolute bottom-8 md:bottom-12 lg:bottom-16 right-4 md:right-8 lg:right-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
      >
        <div className="flex gap-2 items-center justify-start px-3 py-1 rounded-full border border-neutral-200 bg-black/20 transition-all duration-200 hover:scale-105">
          <Switch
            checked={aotyMode}
            onCheckedChange={setAotyMode}
            className="data-[state=checked]:bg-white border-neutral-200"
          />
          <p className="font-medium leading-[1.5] body-text-sm  text-white whitespace-nowrap">
            AOTY MODE
          </p>
        </div>
      </motion.div>
    </section>
  );
}
