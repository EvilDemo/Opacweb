import type { Cart } from "@/types/commerce";

export type CartOptimisticUpdate =
  | { type: "update"; lineId: string; quantity: number }
  | { type: "remove"; lineId: string };

export function applyCartUpdate(cart: Cart | null, update: CartOptimisticUpdate): Cart | null {
  if (!cart) return cart;
  const lines = update.type === "remove"
    ? cart.lines.filter((line) => line.id !== update.lineId)
    : cart.lines.map((line) => line.id === update.lineId ? { ...line, quantity: update.quantity } : line);
  return { ...cart, lines, totalQuantity: lines.reduce((total, line) => total + line.quantity, 0) };
}

export function createCartMutationLock() {
  let busy = false;
  return async (task: () => Promise<void>) => {
    if (busy) return;
    busy = true;
    try {
      await task();
    } finally {
      busy = false;
    }
  };
}
