import { describe, expect, it } from "vitest";
import { fieldErrors, orderRequestSchema } from "@/lib/validation/order";

const valid = {
  name: "Rahim Uddin",
  phone: "01712345678",
  address: "House 12, Road 5, Dhanmondi",
  city: "Dhaka",
  zoneId: "inside-dhaka",
  productId: "abc",
  variantKey: "ivory-steel",
  quantity: 1,
  idempotencyKey: "a".repeat(32),
};

describe("orderRequestSchema", () => {
  it("accepts a valid order", () => {
    expect(orderRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("strips client-supplied money/stock/payment fields", () => {
    const parsed = orderRequestSchema.parse({ ...valid, total: 1, price: 1, deliveryFee: 0, paymentStatus: "paid", stock: 999 });
    expect(parsed).not.toHaveProperty("total");
    expect(parsed).not.toHaveProperty("price");
    expect(parsed).not.toHaveProperty("deliveryFee");
    expect(parsed).not.toHaveProperty("paymentStatus");
    expect(parsed).not.toHaveProperty("stock");
  });

  it("reports field errors", () => {
    const res = orderRequestSchema.safeParse({ ...valid, name: "", phone: "123", address: "short", quantity: 0 });
    expect(res.success).toBe(false);
    const errs = fieldErrors(res.error!);
    expect(Object.keys(errs)).toEqual(expect.arrayContaining(["name", "phone", "address", "quantity"]));
  });

  it("rejects malformed idempotency keys", () => {
    expect(orderRequestSchema.safeParse({ ...valid, idempotencyKey: "short" }).success).toBe(false);
    expect(orderRequestSchema.safeParse({ ...valid, idempotencyKey: "$".repeat(32) }).success).toBe(false);
  });

  it("allows empty optional email but rejects invalid email", () => {
    expect(orderRequestSchema.safeParse({ ...valid, email: "" }).success).toBe(true);
    expect(orderRequestSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });
});
