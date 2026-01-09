import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getVisibleNavItems } from "@/lib/constants";
import NewsletterForm from "@/components/NewsletterForm";

export default function Footer() {
  const navItems = getVisibleNavItems();

  return (
    <div className="box-border flex flex-col gap-8 md:gap-20 items-start justify-start padding-global py-8 relative w-full min-h-fits mt-30 overflow-hidden">
      {/* WebM Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-label="OPAC world background animation"
          className="w-full h-full object-cover object-center animate-[pulse_2s_ease-in-out_infinite]"
          style={{
            objectPosition: "center bottom",
          }}
        >
          <source src="/opac-world.webm" type="video/webm" />
          {/* Fallback to WebP for browsers that don't support WebM */}
          <Image
            src="/opac-word-short.webp"
            alt="Opac background"
            fill
            style={{
              objectPosition: "center bottom",
              objectFit: "cover",
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            priority={false}
            quality={60}
          />
        </video>
      </div>

      {/* Main Content Section */}
      <div className="flex flex-col lg:flex-row items-start justify-start relative w-full gap-8 md:gap-10 lg:gap-0 z-10">
        {/* Left Column - Logo and Links */}
        <div className="flex flex-col gap-4 md:gap-6 lg:gap-4 lg:grow items-start justify-start relative w-full lg:w-auto">
          {/* Company Logo */}
          <div>
            <Image src="/logo.webp" alt="Opac Logo" width={84} height={36} loading="lazy" quality={40} />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-2 items-center justify-center lg:justify-start relative w-full">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="link"
                asChild
                className="text-white hover:opacity-80 transition-opacity px-2 sm:px-4 py-2 underline-offset-4"
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Right Column - Subscribe Section */}
        <div className="flex flex-col gap-4 items-start justify-start relative w-full lg:w-6/12 lg:pl-16">
          <div className="w-full text-center lg:text-left">
            <h2 className="heading-4 mix-blend-difference">Subscribe</h2>
          </div>

          {/* Form Actions */}
          <div className="content-stretch flex flex-col gap-2 items-start justify-start relative shrink-0 w-full">
            {/* Newsletter Form */}
            <NewsletterForm />

            {/* Privacy Policy Text */}
            <div className="w-full text-center lg:text-left">
              <p className="body-text-xs">
                <span>By subscribing you agree with our </span>
                <Link href="/privacy-policy" className="underline hover:opacity-80 transition-opacity">
                  Privacy Policy
                </Link>
                <span>.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Credits Section */}
      <div className="content-stretch flex flex-col gap-4 items-start justify-start relative shrink-0 w-full z-10">
        {/* Separator */}
        <div className="content-stretch flex h-px items-center justify-start relative shrink-0 w-full">
          <Separator className="bg-neutral-200" />
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col gap-3 items-center justify-center relative w-full">
          {/* Legal Links */}
          <div className="flex flex-wrap gap-1.5 items-center justify-center relative w-full">
            <Button
              variant="link"
              asChild
              className="body-text-sm-link hover:opacity-80 transition-opacity px-1 sm:px-2 py-0.5 h-6"
            >
              <Link href="/privacy-policy">Privacy Policy</Link>
            </Button>
            <Button
              variant="link"
              asChild
              className="body-text-sm-link hover:opacity-80 transition-opacity px-1 sm:px-2 py-0.5 h-6"
            >
              <Link href="/terms-of-service">Terms of Service</Link>
            </Button>
          </div>

          {/* Copyright */}
          <div className="w-full text-center">
            <p className="body-text-sm">© 2025. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
