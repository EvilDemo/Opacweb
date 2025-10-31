import { createStorefrontApiClient, type StorefrontApiClient } from "@shopify/storefront-api-client";
import type { Product, ProductVariant, Cart, CartLine } from "@/types/commerce";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION || "2025-01";

// Helper to check if Shopify is configured
export function isShopifyConfigured(): boolean {
  return !!(domain && storefrontAccessToken);
}

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
      storeDomain: domain!,
      apiVersion,
      publicAccessToken: storefrontAccessToken!,
    });
  }

  return _shopifyClient;
}

// Export for backwards compatibility, but it will throw if not configured
export const shopifyClient = new Proxy({} as StorefrontApiClient, {
  get() {
    return getShopifyClient();
  },
});

// GraphQL Queries and Mutations
const PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          handle
          title
          description
          descriptionHtml
          vendor
          productType
          tags
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
                image {
                  id
                  url
                  altText
                  width
                  height
                }
                sku
                weight
                weightUnit
              }
            }
          }
          options {
            id
            name
            values
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      vendor
      productType
      tags
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
            image {
              id
              url
              altText
              width
              height
            }
            sku
            weight
            weightUnit
          }
        }
      }
      options {
        id
        name
        values
      }
    }
  }
`;

const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADD_TO_CART_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const GET_CART_QUERY = `
  query getCart($id: ID!) {
    cart(id: $id) {
      id
      checkoutUrl
      totalQuantity
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                product {
                  title
                  handle
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
      }
    }
  }
`;

const UPDATE_CART_LINES_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const REMOVE_FROM_CART_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Helper function to transform Shopify product to our Product type
function transformProduct(shopifyProduct: any): Product {
  const variants = shopifyProduct.variants.edges.map((edge: any) => ({
    id: edge.node.id,
    title: edge.node.title,
    price: edge.node.price.amount,
    compareAtPrice: edge.node.compareAtPrice?.amount,
    availableForSale: edge.node.availableForSale,
    selectedOptions: edge.node.selectedOptions,
    image: edge.node.image
      ? {
          id: edge.node.image.id,
          url: edge.node.image.url,
          altText: edge.node.image.altText,
          width: edge.node.image.width,
          height: edge.node.image.height,
        }
      : undefined,
    sku: edge.node.sku,
    weight: edge.node.weight,
    weightUnit: edge.node.weightUnit,
  }));

  const images = shopifyProduct.images.edges.map((edge: any) => ({
    id: edge.node.id,
    url: edge.node.url,
    altText: edge.node.altText,
    width: edge.node.width,
    height: edge.node.height,
  }));

  const price = shopifyProduct.priceRange.minVariantPrice.amount;
  const compareAtPrice =
    shopifyProduct.priceRange.maxVariantPrice.amount !== price
      ? shopifyProduct.priceRange.maxVariantPrice.amount
      : variants.find((v: ProductVariant) => v.compareAtPrice)?.compareAtPrice;

  return {
    id: shopifyProduct.id,
    handle: shopifyProduct.handle,
    title: shopifyProduct.title,
    description: shopifyProduct.description,
    descriptionHtml: shopifyProduct.descriptionHtml,
    price,
    compareAtPrice,
    currencyCode: shopifyProduct.priceRange.minVariantPrice.currencyCode,
    availableForSale: shopifyProduct.availableForSale,
    images,
    variants,
    options: shopifyProduct.options || [],
    tags: shopifyProduct.tags || [],
    vendor: shopifyProduct.vendor,
    productType: shopifyProduct.productType,
  };
}

function transformCart(shopifyCart: any): Cart {
  const lines: CartLine[] = shopifyCart.lines.edges.map((edge: any) => ({
    id: edge.node.id,
    quantity: edge.node.quantity,
    cost: {
      totalAmount: {
        amount: edge.node.cost.totalAmount.amount,
        currencyCode: edge.node.cost.totalAmount.currencyCode,
      },
    },
    merchandise: {
      id: edge.node.merchandise.id,
      title: edge.node.merchandise.title,
      price: edge.node.merchandise.price.amount,
      currencyCode: edge.node.merchandise.price.currencyCode,
      availableForSale: true,
      selectedOptions: [],
      image: edge.node.merchandise.product.images.edges[0]?.node
        ? {
            id: "",
            url: edge.node.merchandise.product.images.edges[0].node.url,
            altText: edge.node.merchandise.product.images.edges[0].node.altText,
          }
        : undefined,
    },
  }));

  return {
    id: shopifyCart.id,
    checkoutUrl: shopifyCart.checkoutUrl,
    totalQuantity: shopifyCart.totalQuantity,
    lines,
    cost: {
      totalAmount: {
        amount: shopifyCart.cost.totalAmount.amount,
        currencyCode: shopifyCart.cost.totalAmount.currencyCode,
      },
      subtotalAmount: {
        amount: shopifyCart.cost.subtotalAmount.amount,
        currencyCode: shopifyCart.cost.subtotalAmount.currencyCode,
      },
    },
  };
}

// Commerce API functions
export async function getProducts(first: number = 20, after?: string) {
  if (!isShopifyConfigured()) {
    return {
      products: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
    };
  }

  try {
    const client = getShopifyClient();
    const response = await client.request(PRODUCTS_QUERY, {
      variables: { first, after },
    });

    const products = response.data.products.edges.map((edge: any) => transformProduct(edge.node));

    return {
      products,
      pageInfo: response.data.products.pageInfo,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
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
}

export async function createCart(variantId: string, quantity: number = 1): Promise<Cart> {
  if (!isShopifyConfigured()) {
    throw new Error("Shopify is not configured");
  }

  try {
    const client = getShopifyClient();
    const response = await client.request(CREATE_CART_MUTATION, {
      variables: {
        input: {
          lines: [
            {
              merchandiseId: variantId,
              quantity,
            },
          ],
        },
      },
    });

    if (response.data.cartCreate.userErrors?.length > 0) {
      throw new Error(response.data.cartCreate.userErrors[0].message);
    }

    return transformCart(response.data.cartCreate.cart);
  } catch (error) {
    console.error("Error creating cart:", error);
    throw error;
  }
}

export async function addToCart(cartId: string, variantId: string, quantity: number = 1): Promise<Cart> {
  if (!isShopifyConfigured()) {
    throw new Error("Shopify is not configured");
  }

  try {
    const client = getShopifyClient();
    const response = await client.request(ADD_TO_CART_MUTATION, {
      variables: {
        cartId,
        lines: [
          {
            merchandiseId: variantId,
            quantity,
          },
        ],
      },
    });

    if (response.data.cartLinesAdd.userErrors?.length > 0) {
      throw new Error(response.data.cartLinesAdd.userErrors[0].message);
    }

    return transformCart(response.data.cartLinesAdd.cart);
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}

export async function getCart(cartId: string): Promise<Cart | null> {
  if (!isShopifyConfigured()) {
    return null;
  }

  try {
    const client = getShopifyClient();
    const response = await client.request(GET_CART_QUERY, {
      variables: { id: cartId },
    });

    if (!response.data.cart) {
      return null;
    }

    return transformCart(response.data.cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
}

export async function updateCartLines(cartId: string, updates: Array<{ id: string; quantity: number }>): Promise<Cart> {
  if (!isShopifyConfigured()) {
    throw new Error("Shopify is not configured");
  }

  try {
    const client = getShopifyClient();
    const response = await client.request(UPDATE_CART_LINES_MUTATION, {
      variables: {
        cartId,
        lines: updates.map((update) => ({
          id: update.id,
          quantity: update.quantity,
        })),
      },
    });

    if (response.data.cartLinesUpdate.userErrors?.length > 0) {
      throw new Error(response.data.cartLinesUpdate.userErrors[0].message);
    }

    return transformCart(response.data.cartLinesUpdate.cart);
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  if (!isShopifyConfigured()) {
    throw new Error("Shopify is not configured");
  }

  try {
    const client = getShopifyClient();
    const response = await client.request(REMOVE_FROM_CART_MUTATION, {
      variables: {
        cartId,
        lineIds,
      },
    });

    if (response.data.cartLinesRemove.userErrors?.length > 0) {
      throw new Error(response.data.cartLinesRemove.userErrors[0].message);
    }

    return transformCart(response.data.cartLinesRemove.cart);
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
}
