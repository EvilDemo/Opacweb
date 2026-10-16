import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getShopifyClient } from "./client";
import { isShopifyConfigured } from "./constants";
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY } from "./queries/product";
import { transformProduct } from "./utils";
import type { Product } from "@/types/commerce";
import type { PageInfo } from "./types";

type ProductInput = Parameters<typeof transformProduct>[0];
interface ProductQueryData { product?: unknown }
interface ProductsQueryData { products?: unknown }
const invalidResponseMessage = "Shopify returned an invalid product response";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getQueryData(response: unknown, field: "product" | "products"): Record<string, unknown> {
  if (!isRecord(response)) {
    throw new Error(invalidResponseMessage);
  }
  // The SDK can return partial data alongside errors; that is not a successful read.
  if (response.errors !== undefined) {
    throw new Error("Shopify product query failed");
  }
  if (!isRecord(response.data) || !Object.hasOwn(response.data, field)) {
    throw new Error(invalidResponseMessage);
  }
  return response.data;
}

function isPageInfo(value: unknown): value is PageInfo {
  return isRecord(value) &&
    typeof value.hasNextPage === "boolean" &&
    typeof value.hasPreviousPage === "boolean" &&
    (value.startCursor === null || typeof value.startCursor === "string") &&
    (value.endCursor === null || typeof value.endCursor === "string");
}

function mapProduct(value: unknown): Product {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(invalidResponseMessage);
  }
  return transformProduct(value as ProductInput);
}

const fetchProducts = unstable_cache(
  async (first: number = 20, after?: string) => {
    if (!isShopifyConfigured()) {
      return {
        products: [],
        pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
      };
    }

    try {
      const client = getShopifyClient();
      const response = await client.request<ProductsQueryData>(PRODUCTS_QUERY, {
        variables: { first, after },
      });
      const connection = getQueryData(response, "products").products;

      if (!isRecord(connection) || !Array.isArray(connection.edges) || !isPageInfo(connection.pageInfo)) {
        throw new Error(invalidResponseMessage);
      }

      const products = connection.edges.map((edge: unknown) => {
        if (!isRecord(edge) || !Object.hasOwn(edge, "node")) {
          throw new Error(invalidResponseMessage);
        }
        return mapProduct(edge.node);
      });

      return {
        products,
        pageInfo: connection.pageInfo,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },
  ["shopify-products"],
  { tags: ["shopify-products"] }
);

export async function getProducts(first: number = 20, after?: string) {
  return fetchProducts(first, after);
}

const fetchProductByHandle = cache(async (handle: string) => {
  if (!isShopifyConfigured()) {
    return null;
  }

  try {
    const client = getShopifyClient();
    const response = await client.request<ProductQueryData>(PRODUCT_BY_HANDLE_QUERY, {
      variables: { handle },
    });
    const product = getQueryData(response, "product").product;

    if (product === null) {
      return null;
    }
    return mapProduct(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
});

export async function getProductByHandle(handle: string): Promise<Product | null> {
  return fetchProductByHandle(handle);
}
