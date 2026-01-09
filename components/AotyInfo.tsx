"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { motion, useInView } from "motion/react";

export default function AotyInfo() {
  const headerRef = useRef(null);
  const aboutRef = useRef(null);
  const carouselRef = useRef(null);
  const ctaRef = useRef(null);

  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });
  const aboutInView = useInView(aboutRef, { once: true, margin: "-100px" });
  const carouselInView = useInView(carouselRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  return (
    <div className="w-full padding-global">
      {/* Album Header Section */}
      <motion.section
        ref={headerRef}
        className=" py-16 md:py-20 lg:py-28"
        initial={{ opacity: 0, y: 50 }}
        animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className=" mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-10">
            {/* Left Column - Album Info */}
            <div className="flex flex-col gap-6 flex-1 max-w-2/3">
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="heading-1 !font-semibold !tracking-tight">A0TY</h1>
                  <p className="body-text !font-medium text-muted mt-1">ACRONYM FOR ALBUM OF THE YEAR</p>
                </div>
                <p className="body-text !font-medium text-balance">
                  Joya&apos;s debut project explores introspection, loss, and rebellion through a fusion of rap,
                  electronic, and psychedelic rock sounds. His effortless flow and distinctive approach showcase his
                  versatility and influence beyond traditional rap.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="relative bg-gradient-to-br from-neutral-900 to-black text-white border border-neutral-800 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-br from-blue-500/25 to-emerald-400/25 opacity-10"></span>
                  <span className="relative z-10 font-medium">2025 Release</span>
                </Badge>
                <Badge
                  variant="secondary"
                  className="relative bg-gradient-to-br from-neutral-900 to-black text-white border border-neutral-800 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-br from-blue-500/25 to-emerald-400/25 opacity-10"></span>
                  <span className="relative z-10 font-medium">Release</span>
                </Badge>
                <Badge
                  variant="secondary"
                  className="relative bg-gradient-to-br from-neutral-900 to-black text-white border border-neutral-800 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-br from-blue-500/25 to-emerald-400/25 opacity-10"></span>
                  <span className="relative z-10 font-medium">Rap</span>
                </Badge>
              </div>
            </div>

            {/* Right Column - Metadata */}
            <div className="flex flex-row gap-8 lg:gap-20 w-full max-w-1/3 2xl:max-w-1/2">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2 ">
                  <p className="body-text-sm !font-bold text-muted uppercase">Artists</p>
                  <p className="body-text-sm !font-medium">Joyaboi</p>
                </div>
                <div className="flex flex-col gap-2 ">
                  <p className="body-text-sm !font-bold text-muted uppercase">Release Date</p>
                  <p className="body-text-sm !font-medium text-muted">October 1st</p>
                </div>
              </div>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2 ">
                  <p className="body-text-sm !font-bold text-muted uppercase">Genre</p>
                  <p className="body-text-sm !font-medium">Alt-Trap</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="body-text-sm !font-bold uppercase text-muted">Spotify</p>
                  <a
                    href="https://open.spotify.com/album/0Uem3wM8ZJ6rLwPhNNB1NS?si=QY3LksNNR3-3t7RLyMFxCQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="body-text-sm !font-medium hover:underline underline-offset-4"
                  >
                    joyaboi
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* About the Album Section */}
      <motion.section
        ref={aboutRef}
        className=" py-16 md:py-20 lg:py-28"
        initial={{ opacity: 0, y: 50 }}
        animate={aboutInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start justify-center">
            {/* Left Column - Text Content */}
            <motion.div
              className="flex flex-col gap-6 flex-1 w-full lg:max-w-1/3 "
              initial={{ opacity: 0, x: -50 }}
              animate={aboutInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <h2 className="heading-2">About the album.</h2>
              <div className="flex flex-col gap-4 text-pretty ">
                <p className="body-text !font-medium">
                  This project embraces a rare and experimental sound. A dark atmosphere showcasing the artist
                  willingness to explore unconventional territories. This extended play delves into themes of
                  introspection and loss as well as undisciplined and rebellious feelings.
                </p>
                <p className="body-text !font-medium">
                  Joya debut project showcases a fusion of different genres, as rap music mixed with electronic sounds
                  landing into psychedelic rock vibes.
                </p>
                <p className="body-text !font-medium">
                  His delivery is characterized by an effortless flow and distinctive approach, revealing a more
                  vulnerable side of the artist, while simultaneously a dynamic boundless and pioneer part of him
                  proving his versatility and refusal to be confined into a single style.
                </p>
                <p className="body-text !font-medium">
                  Collaborations with different artist demonstrate his ability to connect to a diverse range of
                  musicians, further solidifying his influence beyond traditional rap. This evolution speaks to his
                  ability to adapt, creativity and his enduring impact not only in music but also in fashion.
                </p>
                <p className="body-text !font-medium">
                  The electro sound has navigated him to a new and refreshing direction not only to survive but to
                  thrive in this environment. Influences that contribute to a distinctive style that is heavily
                  noticeable throughout the project.{" "}
                </p>
                <p className="body-text !font-medium">A style that will undoubtedly set him apart in the rap scene.</p>
              </div>
            </motion.div>

            {/* Right Column - Image Gallery */}
            <div className="flex flex-col gap-8 lg:gap-36 2xl:gap-16 w-full lg:max-w-2/3 lg:pt-[5%]">
              <motion.div
                className="relative aspect-video"
                initial={{ opacity: 0, x: 50 }}
                animate={aboutInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              >
                <Image src="/aoty-img/image-1.webp" alt="Album artwork" fill className="object-cover" />
              </motion.div>
              <motion.div
                className="relative aspect-video"
                initial={{ opacity: 0, x: 50 }}
                animate={aboutInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              >
                <Image src="/aoty-img/image-2.webp" alt="Album artwork" fill className="object-cover" />
              </motion.div>
              <motion.div
                className="relative aspect-video"
                initial={{ opacity: 0, x: 50 }}
                animate={aboutInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
              >
                <Image src="/aoty-img/image-3.webp" alt="Album artwork" fill className="object-cover" />
              </motion.div>
              <motion.div
                className="relative aspect-video"
                initial={{ opacity: 0, x: 50 }}
                animate={aboutInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
              >
                <Image src="/aoty-img/image-4.webp" alt="Album artwork" fill className="object-cover" />
              </motion.div>
              <motion.div
                className="relative aspect-video"
                initial={{ opacity: 0, x: 50 }}
                animate={aboutInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
              >
                <Image src="/aoty-img/image-5.jpg" alt="Album artwork" fill className="object-cover" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* video Gallery Slider Section */}
      <motion.section
        ref={carouselRef}
        className="padding-global pb-16 md:pb-20 lg:pb-28 mt-16 mb-16"
        initial={{ opacity: 0, y: 50 }}
        animate={carouselInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-[1280px] mx-auto">
          <Carousel className="w-full lg:max-w-[60%] mx-auto">
            <CarouselContent>
              <CarouselItem>
                <div className="relative w-full aspect-video">
                  <iframe
                    src="https://www.youtube.com/embed/i2WwdBgxZtU"
                    title="YouTube video 1"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="relative w-full aspect-video">
                  <iframe
                    src="https://www.youtube.com/embed/TKbC6dgKbmw"
                    title="YouTube video 2"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="-left-4 md:-left-10 lg:-left-14" />
            <CarouselNext className="-right-4 md:-right-10 lg:-right-14" />
          </Carousel>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        ref={ctaRef}
        className="w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex flex-col md:flex-row items-stretch">
          {/* Left Content */}
          <motion.div
            className="flex-1 py-16 md:py-20 lg:py-28 flex items-center justify-start lg:justify-end md:max-w-1/3"
            initial={{ opacity: 0, x: -50 }}
            animate={ctaInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="flex flex-col gap-8 w-full ">
              <div className="flex flex-col gap-6">
                <h2 className="heading-2 text-white">A0TY Merch</h2>
                <p className="body-text text-white text-pretty">
                  Edition pieces inspired by the album’s dark pulse. <br />
                  Wear the sound, not the trend.
                </p>
                <Button variant="secondary" size="default" className="w-fit" asChild>
                  <Link href="/shop" aria-label="Visit shop">Visit Shop</Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            className="flex-1 relative aspect-video "
            initial={{ opacity: 0, x: 50 }}
            animate={ctaInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <Image src="/aoty-img/image-6.webp" alt="OPAC Merch" fill className="object-contain" />
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
