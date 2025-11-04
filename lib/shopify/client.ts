import { createStorefrontApiClient, type StorefrontApiClient } from "@shopify/storefront-api-client";
import { isShopifyConfigured, SHOPIFY_DOMAIN, SHOPIFY_ACCESS_TOKEN, SHOPIFY_API_VERSION } from "./constants";

// Initialize Shopify Storefront API client lazily
let _shopifyClient: StorefrontApiClient | null = null;

export function getShopifyClient(): StorefrontApiClient {
  if (!isShopifyConfigured()) {
    throw new Error(
      "Missing Shopify configuration. Please set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN in your .env.local file"
    );
  }

  if (!_shopifyClient) {
    _shopifyClient = createStorefrontApiClient({
      storeDomain: SHOPIFY_DOMAIN!,
      apiVersion: SHOPIFY_API_VERSION,
      publicAccessToken: SHOPIFY_ACCESS_TOKEN!,
    });
  }

  return _shopifyClient;
}

// Export for backwards compatibility
export const shopifyClient = new Proxy({} as StorefrontApiClient, {
  get() {
    return getShopifyClient();
  },
});



