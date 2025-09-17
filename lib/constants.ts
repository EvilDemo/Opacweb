// Feature flags and configuration
export const SHOP_CONFIG = {
  // Main shop toggle - change this to enable/disable shop functionality
  ENABLED: process.env.NEXT_PUBLIC_SHOP_ENABLED === "true",

  // Shop-related navigation items
  NAV_ITEMS: [
    {
      label: "Media",
      href: "/media",
      icon: "/menu-media.gif",
      requiresShop: false,
    },
    {
      label: "Radio",
      href: "/radio",
      icon: "/menu-radio.gif",
      requiresShop: false,
    },
    {
      label: "About Us",
      href: "/about",
      icon: "/menu-about.gif",
      requiresShop: false,
    },
    {
      label: "Contact",
      href: "/contact",
      icon: "/menu-contact.gif",
      requiresShop: false,
    },
  ],

  // Shopify configuration (only loaded when shop is enabled)
  SHOPIFY: {
    STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
    STOREFRONT_ACCESS_TOKEN:
      process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  },
};

// Helper function to get visible navigation items
export const getVisibleNavItems = () => {
  return SHOP_CONFIG.NAV_ITEMS.filter(
    (item) => !item.requiresShop || SHOP_CONFIG.ENABLED
  );
};

// Helper function to check if shop features should be shown
export const isShopEnabled = () => SHOP_CONFIG.ENABLED;
