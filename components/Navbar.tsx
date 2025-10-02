"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { getVisibleNavItems, getShopItem } from "@/lib/constants";
import { Instagram, Youtube, Music, CloudRain } from "lucide-react";

// Types
interface NavItem {
  label: string;
  href: string;
  icon: string;
  requiresShop?: boolean;
}

// Components
const Logo = ({ className = "" }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
    transition={{
      duration: 0.8,
      ease: "easeOut",
      delay: 0.2,
    }}
    whileHover={{
      scale: 1.05,
      rotateY: 5,
      transition: { duration: 0.2, ease: "easeOut" },
    }}
    className="relative"
  >
    <Image
      src="/logo.webp"
      alt="OPAC Logo"
      width={125}
      height={62}
      className={`object-contain ${className}`}
      priority
      fetchPriority="high" // LCP optimization for logo
      quality={75} // Good quality for logo
    />
  </motion.div>
);

const AnimatedNavLink = ({ item, index }: { item: NavItem; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: 0.4 + index * 0.1, // Staggered animation
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.15, ease: "easeOut" },
      }}
    >
      <Link href={item.href} className="block">
        <Button variant="secondary" className="">
          {item.label}
        </Button>
      </Link>
    </motion.div>
  );
};

const NavigationLinks = ({
  items,
  className = "",
}: {
  items: NavItem[];
  className?: string;
}) => (
  <div
    className={`hidden lg:flex items-center justify-start space-x-2.5 ${className}`}
  >
    {items.map((item, index) => (
      <AnimatedNavLink key={item.label} item={item} index={index} />
    ))}
  </div>
);

const ShopButton = () => {
  const shopItem = getShopItem();

  if (!shopItem) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: 0.6,
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.15, ease: "easeOut" },
      }}
      className="hidden lg:block"
    >
      <Link href={shopItem.href} className="block">
        <Button variant="default" className="">
          {shopItem.label}
        </Button>
      </Link>
    </motion.div>
  );
};

const MobileMenuButton = ({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
      duration: 0.6,
      ease: "easeOut",
      delay: 0.8,
    }}
    whileHover={{
      scale: 1.05,
      transition: { duration: 0.15, ease: "easeOut" },
    }}
  >
    <Sheet onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" className="lg:hidden">
          MENU
        </Button>
      </SheetTrigger>
      <MobileMenu setIsOpen={setIsOpen} />
    </Sheet>
  </motion.div>
);

const MobileMenu = ({ setIsOpen }: { setIsOpen: (open: boolean) => void }) => {
  const visibleItems = getVisibleNavItems();
  const shopItem = getShopItem();

  return (
    <SheetContent
      side="right"
      className="w-full h-full bg-black border-none sm:max-w-none"
    >
      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
      <div className="flex flex-col h-full padding-global">
        {/* Mobile navigation */}
        <nav className="flex-1 flex flex-col justify-center">
          <div className="space-y-8 text-center">
            {/* Regular navigation items */}
            {visibleItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  delay: 0.3 + index * 0.1, // Staggered animation
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.15, ease: "easeOut" },
                }}
              >
                <Link
                  href={item.href}
                  className="block text-white heading-2 hover:text-gray-300 transition-colors py-4 uppercase"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}

            {/* Shop button */}
            {shopItem && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  delay: 0.3 + visibleItems.length * 0.1, // After regular items
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.15, ease: "easeOut" },
                }}
                className="pt-4 flex justify-center"
              >
                <div className="w-32">
                  <Link href={shopItem.href} onClick={() => setIsOpen(false)}>
                    <Button variant="default" className="w-full">
                      {shopItem.label}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </nav>

        {/* Social Icons */}
        <motion.div
          className="py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            delay: 0.8,
          }}
        >
          <div className="flex items-center justify-center space-x-4">
            {[
              {
                href: "https://www.instagram.com/opac.__/",
                label: "Follow OPAC on Instagram @opac.label",
                icon: Instagram,
                index: 0,
              },
              {
                href: "https://www.youtube.com/channel/UCzN054ZKiTzEgrjxaIch3zQ",
                label: "Subscribe to OPAC Label on YouTube",
                icon: Youtube,
                index: 1,
              },
              {
                href: "https://open.spotify.com/user/3123jk5vvrcjh2pljngwtmlulhsq",
                label: "Listen to OPAC on Spotify",
                icon: Music,
                index: 2,
              },
              {
                href: "https://soundcloud.com/opac-label",
                label: "Listen to OPAC Label on SoundCloud",
                icon: CloudRain,
                index: 3,
              },
            ].map((social) => {
              const IconComponent = social.icon;
              return (
                <motion.a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  aria-label={social.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                    delay: 1.0 + social.index * 0.1,
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.15, ease: "easeOut" },
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center group-hover:bg-neutral-600 transition-colors duration-300">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </SheetContent>
  );
};

// Main Component
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const visibleItems = getVisibleNavItems();

  return (
    <motion.nav
      className="sticky top-0 left-0 right-0 z-50 h-auto bg-background"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mx-auto padding-global py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation items (hidden on mobile) */}
          <NavigationLinks items={visibleItems} className="" />

          {/* Center - Logo */}
          <Link
            href="/"
            className="flex justify-center items-center bg-transparent hover:scale-105 hover:bg-transparent transition-all duration-300"
          >
            <Logo />
          </Link>

          {/* Right side - Shop button (desktop) and Mobile menu button */}
          <div className="flex items-center justify-end space-x-2.5">
            <ShopButton />
            <MobileMenuButton setIsOpen={setIsOpen} />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
