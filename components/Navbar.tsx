"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { getVisibleNavItems, isShopEnabled } from "@/lib/constants";

// Types
interface NavItem {
  label: string;
  href: string;
  icon: string;
  requiresShop?: boolean;
}

// Components
const Logo = ({ className = "" }: { className?: string }) => (
  <Image
    src="/logo.png"
    alt="OPAC Logo"
    width={125}
    height={62}
    className={`object-contain w-auto h-auto  ${className}`}
    priority
  />
);

const AnimatedNavLink = ({ item }: { item: NavItem }) => {
  return (
    <Link href={item.href} className="block">
      <Button variant="secondary" className="">
        {item.label}
      </Button>
    </Link>
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
    {items.map((item) => (
      <AnimatedNavLink key={item.label} item={item} />
    ))}
  </div>
);

const Cart = ({ className = "" }: { className?: string }) => {
  // Only show cart when shop is enabled
  if (!isShopEnabled()) return null;

  return (
    <div
      className={`hidden lg:flex items-center space-x-2 text-white ${className}`}
    >
      <Image src="/cart.svg" alt="Cart" width={20} height={20} />
      <span className="text-white body-text-sm">CART</span>
    </div>
  );
};

const MobileMenuButton = ({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void;
}) => (
  <Sheet onOpenChange={setIsOpen}>
    <SheetTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden text-white hover:bg-gray-800"
      >
        <Image src="/menu.svg" alt="Menu" width={24} height={24} />
      </Button>
    </SheetTrigger>
    <MobileMenu setIsOpen={setIsOpen} />
  </Sheet>
);

const MobileMenu = ({ setIsOpen }: { setIsOpen: (open: boolean) => void }) => {
  const visibleItems = getVisibleNavItems();

  return (
    <SheetContent
      side="right"
      className="w-96 bg-black border-l border-white-50"
    >
      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
      <div className="flex flex-col h-full">
        {/* Mobile navigation */}
        <nav className="flex-1 mt-10 padding-global py-6">
          <div className="space-y-4">
            {visibleItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-1 text-white body-text-lg hover:text-gray-300 transition-colors py-2 "
                onClick={() => setIsOpen(false)}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={80}
                  height={80}
                />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile cart - only show when shop is enabled */}
        {isShopEnabled() && (
          <div className="border-t border-white-50 py-6 padding-global">
            <div className="flex items-center space-x-2 text-white">
              <Image src="/cart.svg" alt="Cart" width={24} height={24} />
              <span className="body-text-lg">CART</span>
            </div>
          </div>
        )}
      </div>
    </SheetContent>
  );
};

// Main Component
export function Navbar() {
  const [, setIsOpen] = useState(false);
  const visibleItems = getVisibleNavItems();

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 h-auto bg-background ">
      <div className="mx-auto padding-global py-4">
        <div className="grid grid-cols-2 lg:grid-cols-[1fr_0.5fr_1fr] items-center ">
          {/* Left side - Navigation items (hidden on mobile) */}
          <NavigationLinks items={visibleItems} className="" />

          {/* Center - Logo (Desktop only) */}
          <Link
            href="/"
            className="flex justify-start lg:justify-center items-center bg-transparent hover:scale-105  hover:bg-transparent transition-all duration-300"
          >
            <Logo />
          </Link>

          {/* Right side - Cart and Mobile menu */}
          <div className="flex items-center justify-end w-full">
            <Cart className="mr-4" />
            <MobileMenuButton setIsOpen={setIsOpen} />
          </div>
        </div>
      </div>
    </nav>
  );
}
