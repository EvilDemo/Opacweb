import type { Product, ProductVariant, Cart, CartLine } from "@/types/commerce";

// Shopify API response types
interface ShopifyImage {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

interface ShopifyPrice {
  amount: string;
  currencyCode: string;
}

interface ShopifySelectedOption {
  name: string;
  value: string;
}

interface ShopifyVariant {
  id: string;
  title: string;
  price: ShopifyPrice;
  compareAtPrice?: ShopifyPrice;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  selectedOptions: ShopifySelectedOption[];
  image?: ShopifyImage;
  sku?: string;
  weight?: number;
  weightUnit?: string;
}

interface ShopifyProduct {
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
    minVariantPrice: ShopifyPrice;
    maxVariantPrice: ShopifyPrice;
  };
  images: {
    edges: Array<{ node: ShopifyImage }>;
  };
  variants: {
    edges: Array<{ node: ShopifyVariant }>;
  };
  options: Array<{
    id: string;
    name: string;
    values: string[];
  }>;
}

interface ShopifyCartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: ShopifyPrice;
  };
  merchandise: {
    id: string;
    title: string;
    price: ShopifyPrice;
    selectedOptions: ShopifySelectedOption[];
    product: {
      title: string;
      handle: string;
      images: {
        edges: Array<{ node: ShopifyImage }>;
      };
    };
  };
}

interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: {
    edges: Array<{ node: ShopifyCartLine }>;
  };
  cost: {
    totalAmount: ShopifyPrice;
    subtotalAmount: ShopifyPrice;
  };
}

// Helper function to transform Shopify product to our Product type
export function transformProduct(shopifyProduct: ShopifyProduct): Product {
  const variants = shopifyProduct.variants.edges.map((edge) => ({
    id: edge.node.id,
    title: edge.node.title,
    price: edge.node.price.amount,
    compareAtPrice: edge.node.compareAtPrice?.amount,
    availableForSale: edge.node.availableForSale,
    quantityAvailable: edge.node.quantityAvailable,
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

  const images = shopifyProduct.images.edges.map((edge) => ({
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

export function transformCart(shopifyCart: ShopifyCart): Cart {
  const lines: CartLine[] = shopifyCart.lines.edges.map((edge) => ({
    id: edge.node.id,
    quantity: edge.node.quantity,
    cost: {
      totalAmount: {
        amount: edge.node.cost.totalAmount.amount,
        currencyCode: edge.node.cost.totalAmount.currencyCode,
      },
    },
    productTitle: edge.node.merchandise.product.title,
    merchandise: {
      id: edge.node.merchandise.id,
      title: edge.node.merchandise.title,
      price: edge.node.merchandise.price.amount,
      currencyCode: edge.node.merchandise.price.currencyCode,
      availableForSale: true,
      selectedOptions: edge.node.merchandise.selectedOptions,
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

