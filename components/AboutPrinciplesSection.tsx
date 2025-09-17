"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { WaveUnspoken } from "./waves/WaveUnspoken";
import { WaveOpacity } from "./waves/WaveOpacity";
import { WaveUtility } from "./waves/WaveUtility";
import { WaveRitual } from "./waves/WaveRitual";
import { WaveLongevity } from "./waves/WaveLongevity";
import { WaveSignal } from "./waves/WaveSignal";

interface Principle {
  id: string;
  title: string;
  subtitle: string;
  waveComponent: React.ComponentType;
}

interface PrinciplesSectionProps {
  title?: string;
  subtitle?: string;
  principles?: Principle[];
  className?: string;
}

const defaultPrinciples: Principle[] = [
  {
    id: "unspoken",
    title: "Unspoken",
    subtitle: "What you don't say matters more.",
    waveComponent: WaveUnspoken,
  },
  {
    id: "opacity",
    title: "Opacity",
    subtitle: "Mystery is the interface.",
    waveComponent: WaveOpacity,
  },
  {
    id: "utility",
    title: "Utility",
    subtitle: "Every seam, every sound, has a function.",
    waveComponent: WaveUtility,
  },
  {
    id: "ritual",
    title: "Ritual",
    subtitle: "Drops are gatherings, not transactions.",
    waveComponent: WaveRitual,
  },
  {
    id: "longevity",
    title: "Longevity",
    subtitle: "No seasons, only chapters.",
    waveComponent: WaveLongevity,
  },
  {
    id: "signal",
    title: "Signal",
    subtitle: "Every piece carries a frequency.",
    waveComponent: WaveSignal,
  },
];

interface PrincipleItemProps {
  principle: Principle;
  index: number;
}

function PrincipleItem({ principle, index }: PrincipleItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Check if more than 50% visible to activate
          if (entry.intersectionRatio > 0.5) {
            setIsActive(true);
          }
        } else {
          setIsActive(false);
        }
      },
      {
        threshold: [0.1, 0.5, 0.9],
        rootMargin: "-10% 0px -10% 0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const WaveComponent = principle.waveComponent;

  return (
    <article ref={ref} className="w-full flex flex-col md:space-y-4">
      {/* Principle Title and Subtitle */}
      <header>
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.9 }}
          animate={
            isVisible
              ? { opacity: 1, x: 0, scale: 1 }
              : { opacity: 0, x: 60, scale: 0.9 }
          }
          transition={{
            duration: 1.2,
            delay: index === 0 ? 0.5 : 0.2,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <motion.div
            animate={isActive ? { y: 0 } : { y: 20 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="heading-3 text-left">{principle.title}</h1>
          </motion.div>
          <motion.div
            animate={isActive ? { y: 0, opacity: 1 } : { y: 30, opacity: 0.7 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <p className="text-body text-left">{principle.subtitle}</p>
          </motion.div>
        </motion.div>
      </header>

      {/* Wave Visualization */}
      <figure className="h-40 w-full relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={
            isVisible && isActive
              ? { opacity: 1, y: 0, scale: 1.05 }
              : isVisible
              ? { opacity: 0.8, y: 0, scale: 0.95 }
              : { opacity: 0, y: 40, scale: 0.8 }
          }
          transition={{
            duration: isVisible ? 0.8 : 1.4,
            delay: index === 0 ? 0.8 : 0.4,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="w-full h-full"
        >
          <WaveComponent />
        </motion.div>
      </figure>
    </article>
  );
}

export function PrinciplesSection({
  title = "Principles",
  subtitle = "Six Guiding Forces",
  principles = defaultPrinciples,
  className = "",
}: PrinciplesSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={sectionRef}
      className={`min-h-[700vh] relative padding-global ${className}`}
    >
      <div className="sticky top-0 h-screen flex items-center">
        <div className="w-full">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-16 h-full lg:items-center">
            {/* Left Column - Static Header */}
            <motion.header
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="lg:col-span-4 flex flex-col justify-center order-1 lg:order-none h-full"
            >
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-small-normal uppercase tracking-wide text-muted md:mb-1 lg:mb-2"
              >
                {subtitle}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, delay: 0.7 }}
                className="heading-4"
              >
                {title}
              </motion.h1>

              {/* Progress indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="text-small-normal text-muted"
              >
                <div className="relative flex items-center gap-1">
                  {/* Animated current principle number */}
                  <div className="relative">
                    {principles.map((_, index) => {
                      const sectionSize = 1 / principles.length;
                      const start = index * sectionSize;
                      const end = (index + 1) * sectionSize;

                      const opacity = useTransform(
                        scrollYProgress,
                        [
                          start,
                          start + sectionSize * 0.15,
                          end - sectionSize * 0.15,
                          end,
                        ],
                        [0, 1, 1, 0]
                      );

                      return (
                        <motion.span
                          key={index}
                          className="tabular-nums absolute left-0"
                          style={{ opacity }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </motion.span>
                      );
                    })}
                    {/* Invisible placeholder to maintain width */}
                    <span className="tabular-nums opacity-0">00</span>
                  </div>
                  {/* Static total */}
                  <span className="tabular-nums">
                    {" "}
                    / {String(principles.length).padStart(2, "0")}
                  </span>
                </div>
              </motion.div>
            </motion.header>

            {/* Right Column - Dynamic Principle Content */}
            <main className="lg:col-span-8 flex-1 lg:h-full flex items-center justify-center relative order-2 lg:order-none min-h-[60vh] lg:min-h-0">
              {principles.map((principle, index) => {
                // Each principle gets more scroll space to hang longer
                const sectionSize = 1 / principles.length;
                const start = index * sectionSize;
                const end = (index + 1) * sectionSize;

                // Shorter transition periods, longer hold time
                const fadeInEnd = start + sectionSize * 0.15; // 15% for fade in
                const fadeOutStart = end - sectionSize * 0.15; // 15% for fade out

                const opacity = useTransform(
                  scrollYProgress,
                  [start, fadeInEnd, fadeOutStart, end],
                  [0, 1, 1, 0]
                );

                const scale = useTransform(
                  scrollYProgress,
                  [start, fadeInEnd, fadeOutStart, end],
                  [0.9, 1, 1, 0.9]
                );

                return (
                  <motion.div
                    key={principle.id}
                    className="absolute inset-0 flex items-center justify-center lg:p-0"
                    style={{ opacity, scale }}
                  >
                    <PrincipleItem principle={principle} index={index} />
                  </motion.div>
                );
              })}
            </main>
          </div>
        </div>
      </div>
    </section>
  );
}
