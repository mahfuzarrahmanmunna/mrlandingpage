import { describe, expect, it } from "vitest";
import { calculateTotals, clampQuantity } from "@/lib/pricing";

describe("calculateTotals", () => {
  it("computes subtotal, fee and total", () => {
    expect(calculateTotals({ unitPrice: 8900, quantity: 2, deliveryFee: 80 })).toEqual({
      subtotal: 17800,
      deliveryFee: 80,
      discount: 0,
      total: 17880,
    });
  });

  it("supports free delivery", () => {
    expect(calculateTotals({ unitPrice: 1000, quantity: 1, deliveryFee: 0 }).total).toBe(1000);
  });

  it("clamps discount to the subtotal and never below zero", () => {
    expect(calculateTotals({ unitPrice: 500, quantity: 1, deliveryFee: 100, discount: 9999 })).toMatchObject({
      discount: 500,
      total: 100,
    });
    expect(calculateTotals({ unitPrice: 500, quantity: 1, deliveryFee: 0, discount: -50 }).discount).toBe(0);
  });

  it("rejects invalid inputs", () => {
    expect(() => calculateTotals({ unitPrice: -1, quantity: 1, deliveryFee: 0 })).toThrow();
    expect(() => calculateTotals({ unitPrice: 10, quantity: 0, deliveryFee: 0 })).toThrow();
    expect(() => calculateTotals({ unitPrice: 10, quantity: 1.5, deliveryFee: 0 })).toThrow();
    expect(() => calculateTotals({ unitPrice: 10, quantity: 1, deliveryFee: -5 })).toThrow();
    expect(() => calculateTotals({ unitPrice: Number.NaN, quantity: 1, deliveryFee: 0 })).toThrow();
  });
});

describe("clampQuantity", () => {
  it("enforces minimum 1 and maximum min(stock, cap)", () => {
    expect(clampQuantity(0, 10, 5)).toBe(1);
    expect(clampQuantity(-3, 10, 5)).toBe(1);
    expect(clampQuantity(9, 10, 5)).toBe(5);
    expect(clampQuantity(9, 3, 5)).toBe(3);
    expect(clampQuantity(2.7, 10, 5)).toBe(2);
  });
  it("returns 0 when nothing is in stock", () => {
    expect(clampQuantity(1, 0, 5)).toBe(0);
  });
});
