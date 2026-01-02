// Supported versions: 2025-04, 2025-07, 2025-10, 2026-01, 2026-04, unstable
// Using 2025-10 as it's stable and well-tested
export const SHOPIFY_API_VERSION = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION || "2025-10";
export const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
export const SHOPIFY_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export const CART_COOKIE = "cart_id";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 2; // its doign 60 secs * 60 mins * 24 hours * x(2) days

export function isShopifyConfigured(): boolean {
  return !!(SHOPIFY_DOMAIN && SHOPIFY_ACCESS_TOKEN);
}
