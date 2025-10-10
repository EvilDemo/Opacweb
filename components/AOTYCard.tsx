"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
      className={`absolute top-8 left-8 z-20 ${className || ""}`}
      initial={{ opacity: 0, y: -20, x: -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        delay: 2.0, // Appears after the main text animation
      }}
    >
      <Card className="w-72 bg-black/90 border-neutral-800 backdrop-blur-sm" variant="default">
        <CardHeader className="pb-4">
          <CardTitle className="heading-4 font-bold tracking-tight text-white">AOTY</CardTitle>
          <CardTitle className="body-text-sm text-muted font-medium -mt-2">ALBUM OF THE YEAR</CardTitle>
          <div className="w-full h-px bg-neutral-700/20"></div>
        </CardHeader>

        <CardContent className="pt-0">
          <CardDescription className="body-text-xs text-muted leading-relaxed mb-3">
            Joya&apos;s debut project. A rare experimental sound exploring introspection, loss, and rebellion.
          </CardDescription>
          <div className="flex items-center justify-between min-h-[36px]">
            <div className="body-text-sm font-semibold text-white tracking-wide">OUT NOW</div>
            {showButton && (
              <Button
                variant="default"
                size="sm"
                className="animate-[fadeIn_0.3s_ease-out]"
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
