"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import Link from "next/link";
import { getVisibleNavItems, getShopItem } from "@/lib/constants";
import { Instagram, Youtube, Music, ShoppingCart } from "lucide-react";
import { CartSidebar } from "@/components/commerce/CartSidebar";
import { SHOP_CONFIG } from "@/lib/constants";
import { useCartItemCount } from "./commerce/CartContext";

// Custom TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

// Types
interface SubItem {
  label: string;
  href: string;
  icon?: string;
  requiresShop?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
  requiresShop?: boolean;
  subItems?: SubItem[];
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
    className="relative w-[125px] h-[62px]"
  >
    <Image
      src="/logo.webp"
      alt="OPAC Logo"
      width={125}
      height={62}
      className={`object-contain ${className}`}
      style={{ width: "auto", height: "auto" }}
      priority
      fetchPriority="high" // LCP optimization for logo
      quality={75} // Good quality for logo
    />
  </motion.div>
);

const AnimatedNavLink = ({ item, index }: { item: NavItem; index: number }) => {
  // Check if item has sub-items for dropdown
  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: 0.4 + index * 0.1,
      }}
    >
      {hasSubItems ? (
        // Render dropdown for items with subItems
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className=" text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 text-sm font-medium">
                {item.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-1 p-2">
                  {item.subItems!.map((subItem) => (
                    <li key={subItem.href}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={subItem.href}
                          className="text-white hover:bg-white hover:text-black focus:bg-white focus:text-black data-[active=true]:bg-white data-[active=true]:text-black focus-visible:ring-white/50 flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1"
                        >
                          <div className="text-sm font-medium leading-none">{subItem.label}</div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      ) : (
        // Render regular button for items without subItems
        <motion.div
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
      )}
    </motion.div>
  );
};

const NavigationLinks = ({ items, className = "" }: { items: NavItem[]; className?: string }) => (
  <div className={`hidden lg:flex items-center justify-start space-x-2.5 ${className}`}>
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

const CartIcon = () => {
  const cartItemCount = useCartItemCount();

  if (!SHOP_CONFIG.ENABLED) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: 0.7,
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.15, ease: "easeOut" },
      }}
    >
      <CartSidebar>
        <div className="relative inline-block focus:outline-none focus-visible:outline-none focus-visible:ring-0 [&:has(button:focus-visible)]:outline-none [&:has(button:focus-visible)]:ring-0">
          <Button 
            variant="secondary" 
            className="h-10 w-10 p-0"
            aria-label={`Shopping cart${cartItemCount > 0 ? `, ${cartItemCount} item${cartItemCount !== 1 ? 's' : ''} in cart` : ', empty'}`}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          </Button>
          {cartItemCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold z-10 pointer-events-none focus-visible:outline-none"
              style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
              tabIndex={-1}
              aria-hidden="true"
            >
              {cartItemCount}
            </span>
          )}
        </div>
      </CartSidebar>
    </motion.div>
  );
};

const MobileMenuButton = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) => (
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" className="lg:hidden" aria-label="Open navigation menu">
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
    <SheetContent side="right" className="w-full h-full bg-black border-none sm:max-w-none z-[100]">
      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
      <div className="flex flex-col h-full padding-global">
        {/* Mobile navigation */}
        <nav className="flex-1 flex flex-col justify-center">
          <div className="space-y-8 text-center">
            {/* Regular navigation items */}
            {visibleItems.map((item, index) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                    delay: 0.3 + index * 0.1,
                  }}
                >
                  {hasSubItems ? (
                    // Show parent label + sub-items in mobile
                    <div className="space-y-3">
                      <div className="text-white text-base uppercase opacity-50 font-medium">{item.label}</div>
                      <div className="space-y-2">
                        {item.subItems!.map((subItem) => (
                          <motion.div
                            key={subItem.href}
                            whileHover={{
                              scale: 1.05,
                              transition: { duration: 0.15, ease: "easeOut" },
                            }}
                          >
                            <Link
                              href={subItem.href}
                              className="block text-white text-2xl hover:text-gray-300 transition-colors py-2 uppercase"
                              onClick={() => setIsOpen(false)}
                            >
                              {subItem.label}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Regular menu item
                    <motion.div
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
                  )}
                </motion.div>
              );
            })}

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
                href: "https://www.tiktok.com/@opacweb?_t=ZG-90RboIyLltx&_r=1",
                label: "Follow OPAC on TikTok",
                icon: TikTokIcon,
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
      className="sticky top-0 left-0 right-0 z-[90] h-auto bg-background"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mx-auto padding-global py-4">
        <div className="flex items-center justify-between lg:justify-between">
          {/* Left side - Navigation items (hidden on mobile) */}
          <div className="hidden lg:flex flex-1 max-w-1/3">
            <NavigationLinks items={visibleItems} className="" />
          </div>

          {/* Center - Logo */}
          <Link
            href="/"
            className="flex justify-center items-center bg-transparent hover:scale-105 hover:bg-transparent transition-all duration-300 lg:flex-1"
          >
            <Logo />
          </Link>

          {/* Right side - Shop button (desktop), Cart icon, and Mobile menu button */}
          <div className="flex-1 max-w-1/3 flex items-center justify-end space-x-2.5">
            <ShopButton />
            <CartIcon />
            <MobileMenuButton isOpen={isOpen} setIsOpen={setIsOpen} />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
