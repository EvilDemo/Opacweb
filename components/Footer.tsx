import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getVisibleNavItems } from "@/lib/constants";

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
          className="w-full h-full object-cover object-center animate-[pulse_2s_ease-in-out_infinite]"
          style={{
            objectPosition: "center bottom",
          }}
        >
          <source src="/sphere-lowheight2_small.webm" type="video/webm" />
          {/* Fallback to WebP for browsers that don't support WebM */}
          <Image
            src="/opac-word-short.webp"
            alt="Opac background"
            fill
            className="object-cover object-center"
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
          <div className="content-stretch flex flex-col gap-2.5 h-9 items-center justify-center lg:justify-start overflow-clip relative shrink-0 w-21">
            <div className="aspect-[84/36] bg-center bg-cover bg-no-repeat shrink-0 w-full">
              <Image
                src="/logo.webp"
                alt="Opac Logo"
                width={84}
                height={36}
                className="w-full h-auto object-cover"
                priority
                quality={40}
              />
            </div>
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
            {/* Form */}
            <div className="content-stretch flex flex-col sm:flex-row gap-4 items-center justify-start relative shrink-0 w-full">
              <Input
                type="email"
                placeholder="Enter your email"
                className="basis-0 grow min-h-9 min-w-px relative shrink-0 w-full sm:w-auto"
              />
              <Button
                variant="default"
                className="hover:bg-white/90 w-full sm:w-auto"
              >
                Subscribe
              </Button>
            </div>

            {/* Privacy Policy Text */}
            <div className="w-full text-center lg:text-left">
              <p className="paragraph-mini-regular">
                <span>By subscribing you agree to with our </span>
                <span className="underline">Privacy Policy.</span>
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
              className="text-small-link hover:opacity-80 transition-opacity px-1 sm:px-2 py-0.5 h-6"
            >
              <Link href="/privacy-policy">Privacy Policy</Link>
            </Button>
            <Button
              variant="link"
              asChild
              className="text-small-link hover:opacity-80 transition-opacity px-1 sm:px-2 py-0.5 h-6"
            >
              <Link href="/terms-of-service">Terms of Service</Link>
            </Button>
            <Button
              variant="link"
              asChild
              className="text-small-link hover:opacity-80 transition-opacity px-1 sm:px-2 py-0.5 h-6"
            >
              <Link href="/cookies-settings">Cookies Settings</Link>
            </Button>
          </div>

          {/* Copyright */}
          <div className="w-full text-center">
            <p className="text-small-normal">© 2025. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
