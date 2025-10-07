"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Switch } from "@/components/ui/switch";
import { HomeInteractiveCanvas } from "@/components/three/HomeInteractiveCanvas";

// 3D Sphere video from your public folder
const sphereVideo = "/esfera3D_optimized.webm";

export default function HeroSection() {
  const [aotyMode, setAotyMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <section
      className={`relative w-full h-[calc(100vh-6rem)] flex flex-col justify-center overflow-hidden ${
        !aotyMode ? "padding-global" : ""
      }`}
    >
      {aotyMode ? (
        /* AOTY Mode - Interactive 3D Cross */
        <HomeInteractiveCanvas isMuted={isMuted} />
      ) : (
        /* Normal Mode - Original Hero Content */
        <>
          {/* Main Content Container - Responsive Two Column Layout */}
          <div className="relative flex flex-col lg:flex-row items-center lg:items-end  mx-auto">
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
                  <motion.div
                    className="absolute border-b-2 md:border-b-4 lg:border-b-[6px] border-solid border-white pointer-events-none"
                    style={{
                      bottom: "-0.5rem", // Increased offset from text
                      left: 0,
                      right: 0,
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                  />
                  <h1 className="heading-1 w-full">It&apos;s nothing.</h1>
                  <h1 className="heading-1 w-full">It&apos;s everything.</h1>
                </div>
              </motion.div>
            </div>

            {/* Right Column - 3D Sphere Video */}
            <div className="flex items-center justify-center flex-shrink-0 lg:ml-auto lg:-mt-32 order-1 lg:order-2">
              <motion.div
                className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96  2xl:w-[30rem] 2xl:h-[30rem] overflow-hidden rounded-full"
                initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              >
                <video src={sphereVideo} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </div>
        </>
      )}

      {/* Controls - AOTY Mode Toggle and Mute Button */}
      <motion.div
        className="absolute bottom-8 md:bottom-12 lg:bottom-16 right-4 md:right-8 lg:right-16 z-20 flex gap-3 items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
      >
        {/* Mute Button - only visible in AOTY mode */}
        {aotyMode && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-white pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-200 hover:scale-105 border border-neutral-200"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            )}
          </button>
        )}

        {/* AOTY Mode Toggle */}
        <div className="flex gap-2 items-center justify-start px-3 py-1 rounded-full border border-neutral-200 bg-black/20 transition-all duration-200 hover:scale-105">
          <Switch
            checked={aotyMode}
            onCheckedChange={setAotyMode}
            className="data-[state=checked]:bg-white border-neutral-200"
          />
          <p className="font-medium leading-[1.5] body-text-sm  text-white whitespace-nowrap">A0TY MODE</p>
        </div>
      </motion.div>
    </section>
  );
}
