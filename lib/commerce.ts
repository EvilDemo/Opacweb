// Commerce provider exports
// This file exports commerce utilities and hooks for use throughout the app

export {
  shopifyClient,
  getProducts,
  getProductByHandle,
  createCart,
  addToCart,
  getCart,
  updateCartLines,
  removeFromCart,
} from "./shopify/index";

export type {
  Product,
  ProductImage,
  ProductVariant,
  ProductOption,
  SelectedOption,
  Cart,
  CartLine,
} from "@/types/commerce";

