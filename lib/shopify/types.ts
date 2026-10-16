// Enhanced type definitions following Vercel Commerce pattern

import type { Product, ProductVariant, Cart, CartLine, ProductImage, SelectedOption } from "@/types/commerce";

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

// Re-export main types for convenience
export type {
  Product,
  ProductVariant,
  Cart,
  CartLine,
  ProductImage,
  SelectedOption,
};








