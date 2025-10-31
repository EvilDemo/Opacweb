// Commerce types for Shopify integration

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  price: string;
  compareAtPrice?: string;
  currencyCode: string;
  availableForSale: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  options: ProductOption[];
  tags: string[];
  vendor?: string;
  productType?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  image?: ProductImage;
  sku?: string;
  weight?: number;
  weightUnit?: string;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLine[];
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface CartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  merchandise: ProductVariant;
}

export interface ShopifyError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: {
    code?: string;
    type?: string;
  };
}
