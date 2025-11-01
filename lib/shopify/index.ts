// Main exports for Shopify integration

export { shopifyClient, getShopifyClient } from "./client";
export { isShopifyConfigured, CART_COOKIE, CART_COOKIE_MAX_AGE } from "./constants";
export { getProducts, getProductByHandle } from "./products";
export { createCart, addToCart, getCart, updateCartLines, removeFromCart } from "./cart";
export * from "./types";

