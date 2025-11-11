import { unstable_cache } from "next/cache";
import { getShopifyClient } from "./client";
import { isShopifyConfigured } from "./constants";
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY } from "./queries/product";
import { transformProduct } from "./utils";
import type { Product } from "@/types/commerce";
import type { PageInfo } from "./types";

interface ShopifyProductsResponse {
  data: {
    products: {
      pageInfo: PageInfo;
      edges: Array<{
        node: {
          id: string;
          handle: string;
          title: string;
          description: string;
          descriptionHtml: string;
          vendor?: string;
          productType?: string;
          tags: string[];
          availableForSale: boolean;
          priceRange: {
            minVariantPrice: { amount: string; currencyCode: string };
            maxVariantPrice: { amount: string; currencyCode: string };
          };
          images: {
            edges: Array<{
              node: {
                id: string;
                url: string;
                altText?: string;
                width?: number;
                height?: number;
              };
            }>;
          };
          variants: {
            edges: Array<{
              node: {
                id: string;
                title: string;
                price: { amount: string; currencyCode: string };
                compareAtPrice?: { amount: string; currencyCode: string };
                availableForSale: boolean;
                selectedOptions: Array<{ name: string; value: string }>;
                image?: {
                  id: string;
                  url: string;
                  altText?: string;
                  width?: number;
                  height?: number;
                };
                sku?: string;
                weight?: number;
                weightUnit?: string;
              };
            }>;
          };
          options: Array<{
            id: string;
            name: string;
            values: string[];
          }>;
        };
      }>;
    };
  };
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
      const response = (await client.request(PRODUCTS_QUERY, {
        variables: { first, after },
      })) as ShopifyProductsResponse;

      const products = response.data.products.edges.map((edge) => transformProduct(edge.node));

      return {
        products,
        pageInfo: response.data.products.pageInfo,
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

const fetchProductByHandle = async (handle: string) => {
  if (!isShopifyConfigured()) {
    return null;
  }

  try {
    const client = getShopifyClient();
    const response = await client.request(PRODUCT_BY_HANDLE_QUERY, {
      variables: { handle },
    });

    if (!response.data.product) {
      return null;
    }

    return transformProduct(response.data.product);
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export async function getProductByHandle(handle: string): Promise<Product | null> {
  return fetchProductByHandle(handle);
}

