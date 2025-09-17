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
    <div
      className="bg-cover bg-no-repeat box-border content-stretch flex flex-col gap-20 items-start justify-start px-16 py-20 relative size-full"
      style={{
        backgroundImage: "url('/esferagigante.gif')",
        backgroundPosition: "center -250px",
      }}
    >
      {/* Main Content Section */}
      <div className="content-stretch flex items-start justify-start relative shrink-0 w-full">
        {/* Left Column - Logo and Links */}
        <div className="basis-0 content-stretch flex flex-col gap-3 grow items-start justify-start min-h-px min-w-px relative shrink-0">
          {/* Company Logo */}
          <div className="content-stretch flex flex-col gap-2.5 h-9 items-center justify-center overflow-clip relative shrink-0 w-21">
            <div className="aspect-[84/36] bg-center bg-cover bg-no-repeat shrink-0 w-full">
              <Image
                src="/logo.png"
                alt="Opac Logo"
                width={84}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="content-center flex flex-wrap gap-1.5 items-center justify-start relative shrink-0 w-full">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="link"
                asChild
                className="paragraph-regular text-white hover:opacity-80 transition-opacity px-4 py-2"
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Right Column - Subscribe Section */}
        <div className="content-stretch flex flex-col gap-4 items-start justify-start relative shrink-0 w-96">
          <div className="w-full">
            <h2 className="heading-4">Subscribe</h2>
          </div>

          {/* Form Actions */}
          <div className="content-stretch flex flex-col gap-2 items-start justify-start relative shrink-0 w-full">
            {/* Form */}
            <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full">
              <Input
                type="email"
                placeholder="Enter your email"
                className="basis-0 bg-white grow min-h-9 min-w-px relative rounded-lg shrink-0 text-black placeholder:text-neutral-500"
              />
              <Button
                variant="default"
                className="bg-white text-black hover:bg-white/90 min-h-9 px-4 py-2 rounded-lg"
              >
                Subscribe
              </Button>
            </div>

            {/* Privacy Policy Text */}
            <div className="w-full">
              <p className="paragraph-mini-regular">
                <span>By subscribing you agree to with our </span>
                <span className="underline">Privacy Policy.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Credits Section */}
      <div className="content-stretch flex flex-col gap-4 items-start justify-start relative shrink-0 w-full">
        {/* Separator */}
        <div className="content-stretch flex h-px items-center justify-start relative shrink-0 w-full">
          <Separator className="bg-neutral-200" />
        </div>

        {/* Bottom Row */}
        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
          {/* Left Column - Legal Links */}
          <div className="basis-0 content-stretch flex flex-col gap-3 grow items-start justify-start min-h-px min-w-px relative shrink-0">
            <div className="content-stretch flex gap-1.5 items-center justify-start relative shrink-0 w-full">
              <Button
                variant="link"
                asChild
                className="text-small-link text-white hover:opacity-80 transition-opacity px-2 py-0.5 h-6"
              >
                <Link href="/privacy-policy">Privacy Policy</Link>
              </Button>
              <Button
                variant="link"
                asChild
                className="text-small-link text-white hover:opacity-80 transition-opacity px-2 py-0.5 h-6"
              >
                <Link href="/terms-of-service">Terms of Service</Link>
              </Button>
              <Button
                variant="link"
                asChild
                className="text-small-link text-white hover:opacity-80 transition-opacity px-2 py-0.5 h-6"
              >
                <Link href="/cookies-settings">Cookies Settings</Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Copyright */}
          <div className="content-stretch flex flex-col gap-4 items-start justify-start relative shrink-0">
            <div className="w-full text-right">
              <p className="text-small-normal">© 2025. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
