"use client";

import AotyHero from "@/components/AotyHero";
import AotyInfo from "@/components/AotyInfo";
import { motion } from "motion/react";
import { useState } from "react";

export default function A0TYPage() {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <>
      <AotyHero isMuted={isMuted} onMuteChange={setIsMuted} />
      <AotyInfo />

      {/* Fixed Mute Button */}
      <motion.div
        className="fixed bottom-8 md:bottom-9 lg:bottom-10 right-4 md:right-8 lg:right-16 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
      >
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-white pointer-events-auto bg-black/60 hover:bg-black/70 backdrop-blur-md rounded-full p-3 transition-all duration-200 hover:scale-105 border border-white/20 shadow-lg"
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
      </motion.div>
    </>
  );
}
