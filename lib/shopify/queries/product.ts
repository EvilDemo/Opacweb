import { IMAGE_FRAGMENT, MONEY_FRAGMENT, PRODUCT_VARIANT_FRAGMENT, PRODUCT_OPTION_FRAGMENT, PRODUCT_IMAGE_FRAGMENT } from "../fragments";

export const PRODUCTS_QUERY = `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  ${PRODUCT_OPTION_FRAGMENT}
  ${PRODUCT_IMAGE_FRAGMENT}
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
              ...money
            }
            maxVariantPrice {
              ...money
            }
          }
          images(first: 5) {
            edges {
              node {
                ...productImage
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                ...productVariant
              }
            }
          }
          options {
            ...productOption
          }
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  ${PRODUCT_OPTION_FRAGMENT}
  ${PRODUCT_IMAGE_FRAGMENT}
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
          ...money
        }
        maxVariantPrice {
          ...money
        }
      }
      images(first: 10) {
        edges {
          node {
            ...productImage
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            ...productVariant
          }
        }
      }
      options {
        ...productOption
      }
    }
  }
`;

