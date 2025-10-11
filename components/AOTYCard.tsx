"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

interface AOTYCardProps {
  className?: string;
}

export function AOTYCard({ className }: AOTYCardProps) {
  const [showButton, setShowButton] = useState(false);

  // Listen for wall impacts
  useEffect(() => {
    const handleWallImpact = (event: CustomEvent) => {
      const { wallType } = event.detail;

      // Only show button for side walls (left or right)
      if (wallType === "left" || wallType === "right") {
        setShowButton(true);

        // Hide button after 10 seconds
        const timer = setTimeout(() => {
          setShowButton(false);
        }, 10000);

        return () => clearTimeout(timer);
      }
    };

    window.addEventListener("wallImpact", handleWallImpact as EventListener);

    return () => {
      window.removeEventListener("wallImpact", handleWallImpact as EventListener);
    };
  }, []);
  return (
    <motion.div
      className={`fixed inset-0 flex items-center justify-between padding-global z-20 ${className || ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        delay: 2.0, // Appears after the main text animation
      }}
    >
      {/* Left side - AOTY Content */}
      <div className="text-white text-left max-w-lg">
        <div className="space-y-8">
          {/* Title */}
          <div className="heading-2 font-bold tracking-tight">A0TY</div>
          <div className="body-text-sm text-muted font-medium uppercase tracking-wide">
            ACRONYM FOR ALBUM OF THE YEAR
          </div>

          {/* Text Blocks */}
          <div className="space-y-6">
            <div className="body-text-lg leading-relaxed">This project embraces a rare and experimental sound.</div>

            <div className="body-text-lg leading-relaxed">A dark atmosphere showcasing unconventional territories.</div>

            <div className="body-text-lg leading-relaxed">
              Joya's debut project showcases a fusion of different genres.
            </div>

            <div className="body-text-lg leading-relaxed">
              Rap music mixed with electronic sounds landing into psychedelic rock vibes.
            </div>

            <div className="body-text-lg leading-relaxed">
              A style that will undoubtedly set him apart in the rap scene.
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Minimalist Design */}
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* OUT NOW Text */}
        <div className="text-white">
          <div className="heading-3 font-bold tracking-widest text-center">OUT NOW</div>
        </div>

        {/* Button */}
        {showButton && (
          <Button
            variant="outline"
            size="lg"
            className="animate-[fadeIn_0.3s_ease-out] border-white text-white hover:bg-white hover:text-black transition-all duration-300 px-8 py-3"
            onClick={() => {
              // Dispatch custom event to trigger RouteLoader animation
              window.dispatchEvent(
                new CustomEvent("requestNavigation", {
                  detail: { href: "/a0ty" },
                })
              );
            }}
          >
            Learn More
          </Button>
        )}

        {/* Decorative Elements */}
        <div className="flex space-x-4 opacity-60">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    </motion.div>
  );
}
