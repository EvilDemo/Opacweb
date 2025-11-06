import { createStorefrontApiClient, type StorefrontApiClient } from "@shopify/storefront-api-client";
import type {
  Product,
  ProductVariant,
  Cart,
  CartLine,
  ProductMedia,
  ProductImage,
  ProductVideo,
} from "@/types/commerce";

type ShopifyEdge<TNode> = {
  node: TNode;
};

type ShopifyPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};

type ShopifyMoneyV2 = {
  amount: string;
  currencyCode: string;
};

type ShopifySelectedOption = {
  name: string;
  value: string;
};

type ShopifyImageNode = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type ShopifyImageEdge = ShopifyEdge<ShopifyImageNode>;

type ShopifyProductVariantNode = {
  id: string;
  title: string;
  price: ShopifyMoneyV2;
  compareAtPrice?: ShopifyMoneyV2 | null;
  availableForSale: boolean;
  selectedOptions: ShopifySelectedOption[];
  image?: ShopifyImageNode | null;
  sku?: string | null;
  weight?: number | null;
  weightUnit?: string | null;
};

type ShopifyProductVariantEdge = ShopifyEdge<ShopifyProductVariantNode>;

type ShopifyProductOptionNode = {
  id: string;
  name: string;
  values: string[];
};

type ShopifyMediaVideoSource = {
  url: string;
  mimeType?: string | null;
};

type ShopifyMediaVideoNode = {
  mediaContentType: "VIDEO";
  previewImage?: ShopifyImageNode | null;
  sources: ShopifyMediaVideoSource[];
};

type ShopifyMediaImageNode = {
  mediaContentType: "IMAGE";
  previewImage?: ShopifyImageNode | null;
  image: ShopifyImageNode;
};

type ShopifyMediaExternalVideoNode = {
  mediaContentType: "EXTERNAL_VIDEO";
  previewImage?: ShopifyImageNode | null;
  embeddedUrl?: string | null;
  host?: string | null;
  originUrl?: string | null;
};

type ShopifyMediaNode =
  | ShopifyMediaVideoNode
  | ShopifyMediaImageNode
  | ShopifyMediaExternalVideoNode
  | {
      mediaContentType: string;
      previewImage?: ShopifyImageNode | null;
    };

type ShopifyMediaEdge = ShopifyEdge<ShopifyMediaNode>;

type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string | null;
  vendor?: string | null;
  productType?: string | null;
  tags?: string[];
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: ShopifyMoneyV2;
    maxVariantPrice: ShopifyMoneyV2;
  };
  images: {
    edges: ShopifyImageEdge[];
  };
  variants: {
    edges: ShopifyProductVariantEdge[];
  };
  options?: ShopifyProductOptionNode[];
  media?: {
    edges: ShopifyMediaEdge[];
  };
};

type ShopifyProductEdge = ShopifyEdge<ShopifyProductNode>;

type ShopifyProductsConnection = {
  edges: ShopifyProductEdge[];
  pageInfo: ShopifyPageInfo;
};

type ShopifyCartLineNode = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: ShopifyMoneyV2;
  };
  merchandise: {
    id: string;
    title: string;
    price: ShopifyMoneyV2;
    selectedOptions?: ShopifySelectedOption[] | null;
    product: {
      title: string;
      handle: string;
      images: {
        edges: Array<
          ShopifyEdge<{
            url: string;
            altText?: string | null;
          }>
        >;
      };
    };
  };
};

type ShopifyCartLineEdge = ShopifyEdge<ShopifyCartLineNode>;

type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: {
    edges: ShopifyCartLineEdge[];
  };
  cost: {
    totalAmount: ShopifyMoneyV2;
    subtotalAmount: ShopifyMoneyV2;
  };
};

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION || "2024-10";

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
          media(first: 5) {
            edges {
              node {
                mediaContentType
                previewImage {
                  id
                  url
                  altText
                  width
                  height
                }
                ... on MediaImage {
                  image {
                    id
                    url
                    altText
                    width
                    height
                  }
                }
                ... on Video {
                  sources {
                    url
                    mimeType
                  }
                }
                ... on ExternalVideo {
                  embeddedUrl
                  host
                }
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
      media(first: 10) {
        edges {
          node {
            mediaContentType
            previewImage {
              id
              url
              altText
              width
              height
            }
            ... on MediaImage {
              image {
                id
                url
                altText
                width
                height
              }
            }
            ... on Video {
              sources {
                url
                mimeType
              }
            }
            ... on ExternalVideo {
              embeddedUrl
              host
            }
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
                  selectedOptions {
                    name
                    value
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
                  selectedOptions {
                    name
                    value
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
                  selectedOptions {
                    name
                    value
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
                  selectedOptions {
                    name
                    value
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

const isVideoMediaNode = (node: ShopifyMediaNode): node is ShopifyMediaVideoNode =>
  node.mediaContentType === "VIDEO" && "sources" in node;

const isImageMediaNode = (node: ShopifyMediaNode): node is ShopifyMediaImageNode =>
  node.mediaContentType === "IMAGE" && "image" in node;

const createProductImage = (imageNode?: ShopifyImageNode | null): ProductImage | undefined => {
  if (!imageNode) {
    return undefined;
  }

  return {
    id: imageNode.id ?? "",
    url: imageNode.url,
    altText: imageNode.altText ?? undefined,
    width: imageNode.width ?? undefined,
    height: imageNode.height ?? undefined,
  };
};

const createProductVideo = (mediaNode: ShopifyMediaVideoNode): ProductVideo | undefined => {
  const source = mediaNode.sources.find((videoSource) => Boolean(videoSource.url));

  if (!source) {
    return undefined;
  }

  return {
    id: mediaNode.previewImage?.id ?? "",
    url: source.url,
    mimeType: source.mimeType ?? undefined,
    previewImage: createProductImage(mediaNode.previewImage),
  };
};

// Helper function to transform Shopify product to our Product type
function transformProduct(shopifyProduct: ShopifyProductNode): Product {
  const variants: ProductVariant[] = shopifyProduct.variants.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    price: node.price.amount,
    compareAtPrice: node.compareAtPrice?.amount ?? undefined,
    availableForSale: node.availableForSale,
    selectedOptions: node.selectedOptions.map((option) => ({
      name: option.name,
      value: option.value,
    })),
    image: createProductImage(node.image),
    sku: node.sku ?? undefined,
    weight: node.weight ?? undefined,
    weightUnit: node.weightUnit ?? undefined,
  }));

  const images = shopifyProduct.images.edges
    .map(({ node }) => createProductImage(node))
    .filter((image): image is ProductImage => Boolean(image));

  let featuredMedia: ProductMedia | undefined;
  const mediaEdges = shopifyProduct.media?.edges ?? [];

  for (const { node } of mediaEdges) {
    if (isVideoMediaNode(node)) {
      const video = createProductVideo(node);
      if (video) {
        featuredMedia = { kind: "video", video };
        break;
      }
    }

    if (!featuredMedia && isImageMediaNode(node)) {
      const image = createProductImage(node.image);
      if (image) {
        featuredMedia = { kind: "image", image };
      }
    }
  }

  if (!featuredMedia && images[0]) {
    featuredMedia = { kind: "image", image: images[0] };
  }

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
    descriptionHtml: shopifyProduct.descriptionHtml ?? undefined,
    price,
    compareAtPrice,
    currencyCode: shopifyProduct.priceRange.minVariantPrice.currencyCode,
    availableForSale: shopifyProduct.availableForSale,
    images,
    variants,
    options: shopifyProduct.options ?? [],
    tags: shopifyProduct.tags ?? [],
    vendor: shopifyProduct.vendor ?? undefined,
    productType: shopifyProduct.productType ?? undefined,
    featuredMedia,
  };
}

function transformCart(shopifyCart: ShopifyCart): Cart {
  const lines: CartLine[] = shopifyCart.lines.edges.map(({ node }) => {
    const firstImage = node.merchandise.product.images.edges[0]?.node;

    const merchandise: ProductVariant = {
      id: node.merchandise.id,
      title: node.merchandise.title,
      price: node.merchandise.price.amount,
      availableForSale: true,
      selectedOptions:
        node.merchandise.selectedOptions?.map((option) => ({
          name: option.name,
          value: option.value,
        })) ?? [],
      image: firstImage
        ? {
            id: node.merchandise.id,
            url: firstImage.url,
            altText: firstImage.altText ?? undefined,
          }
        : undefined,
    };

    return {
      id: node.id,
      quantity: node.quantity,
      cost: {
        totalAmount: {
          amount: node.cost.totalAmount.amount,
          currencyCode: node.cost.totalAmount.currencyCode,
        },
      },
      productTitle: node.merchandise.product.title,
      merchandise,
    };
  });

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

    const productsConnection = response.data.products as ShopifyProductsConnection;
    const products = productsConnection.edges.map(({ node }) => transformProduct(node));

    return {
      products,
      pageInfo: productsConnection.pageInfo,
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
