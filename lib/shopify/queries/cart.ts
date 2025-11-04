import { IMAGE_FRAGMENT, MONEY_FRAGMENT, CART_LINE_FRAGMENT, CART_FRAGMENT } from "../fragments";

export const GET_CART_QUERY = `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${CART_LINE_FRAGMENT}
  ${CART_FRAGMENT}
  query getCart($id: ID!) {
    cart(id: $id) {
      ...cart
    }
  }
`;



