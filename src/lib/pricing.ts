/**
 * Order total calculation. Pure, deterministic and shared by:
 *  - the client (display only)
 *  - the server (authoritative; the only numbers ever persisted)
 * All amounts are whole currency units (Taka) to avoid floating-point drift.
 */

export type PricingInput = {
  unitPrice: number;
  quantity: number;
  deliveryFee: number;
  discount?: number;
};

export type PricingResult = {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
};

const round = (n: number) => Math.round(n);

export function calculateTotals({ unitPrice, quantity, deliveryFee, discount = 0 }: PricingInput): PricingResult {
  if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error("Invalid unit price");
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Invalid quantity");
  if (!Number.isFinite(deliveryFee) || deliveryFee < 0) throw new Error("Invalid delivery fee");
  const subtotal = round(unitPrice * quantity);
  const safeDiscount = Math.min(Math.max(0, round(discount)), subtotal);
  const fee = round(deliveryFee);
  return {
    subtotal,
    deliveryFee: fee,
    discount: safeDiscount,
    total: subtotal - safeDiscount + fee,
  };
}

/** Clamp a requested quantity into [1, min(stock, cap)]. Returns 0 when nothing can be bought. */
export function clampQuantity(requested: number, stock: number, cap: number) {
  const max = Math.min(Math.max(0, Math.floor(stock)), Math.max(1, Math.floor(cap)));
  if (max < 1) return 0;
  if (!Number.isFinite(requested)) return 1;
  return Math.min(Math.max(1, Math.floor(requested)), max);
}
