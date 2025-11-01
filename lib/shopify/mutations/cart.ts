import { IMAGE_FRAGMENT, MONEY_FRAGMENT, CART_LINE_FRAGMENT, CART_FRAGMENT } from "../fragments";

export const CREATE_CART_MUTATION = `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${CART_LINE_FRAGMENT}
  ${CART_FRAGMENT}
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...cart
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADD_TO_CART_MUTATION = `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${CART_LINE_FRAGMENT}
  ${CART_FRAGMENT}
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_CART_LINES_MUTATION = `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${CART_LINE_FRAGMENT}
  ${CART_FRAGMENT}
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const REMOVE_FROM_CART_MUTATION = `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${CART_LINE_FRAGMENT}
  ${CART_FRAGMENT}
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...cart
      }
      userErrors {
        field
        message
      }
    }
  }
`;

