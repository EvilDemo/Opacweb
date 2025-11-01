// Enhanced type definitions following Vercel Commerce pattern

import type { Product, ProductVariant, Cart, CartLine, ProductImage, SelectedOption } from "@/types/commerce";

// Money type for better reusability
export interface Money {
  amount: string;
  currencyCode: string;
}

// GraphQL connection pattern for paginated results
export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

// User error from Shopify mutations
export interface UserError {
  field: string[];
  message: string;
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

