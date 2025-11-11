// Reusable GraphQL fragments for Shopify Storefront API

export const IMAGE_FRAGMENT = `
  fragment image on Image {
    id
    url
    altText
    width
    height
  }
`;

export const MONEY_FRAGMENT = `
  fragment money on MoneyV2 {
    amount
    currencyCode
  }
`;

export const PRODUCT_VARIANT_FRAGMENT = `
  fragment productVariant on ProductVariant {
    id
    title
    price {
      ...money
    }
    compareAtPrice {
      ...money
    }
    availableForSale
    quantityAvailable
    selectedOptions {
      name
      value
    }
    image {
      ...image
    }
    sku
    weight
    weightUnit
  }
`;

export const PRODUCT_OPTION_FRAGMENT = `
  fragment productOption on ProductOption {
    id
    name
    values
  }
`;

export const PRODUCT_IMAGE_FRAGMENT = `
  fragment productImage on Image {
    ...image
  }
`;

export const CART_LINE_FRAGMENT = `
  fragment cartLine on CartLine {
    id
    quantity
    cost {
      totalAmount {
        ...money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        price {
          ...money
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
                ...image
              }
            }
          }
        }
      }
    }
  }
`;

export const CART_FRAGMENT = `
  fragment cart on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 100) {
      edges {
        node {
          ...cartLine
        }
      }
    }
    cost {
      totalAmount {
        ...money
      }
      subtotalAmount {
        ...money
      }
    }
  }
`;

