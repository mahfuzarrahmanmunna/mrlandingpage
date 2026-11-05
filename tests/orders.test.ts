import { randomBytes } from "node:crypto";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { connectDB, disconnectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { SiteSettings } from "@/lib/models/SiteSettings";
import { OrderError, changeOrderStatus, createOrder, lookupOrder } from "@/lib/orders/service";
import type { OrderRequest } from "@/lib/validation/order";

let mongo: MongoMemoryServer;
let productId: string;

const key = () => randomBytes(16).toString("hex");

function request(overrides: Partial<OrderRequest> = {}): OrderRequest {
  return {
    name: "Rahim Uddin",
    phone: "+880 1712-345678",
    address: "House 12, Road 5, Dhanmondi",
    city: "Dhaka",
    zoneId: "inside-dhaka",
    email: "",
    note: "",
    productId,
    variantKey: "steel",
    quantity: 1,
    paymentMethod: "cod",
    idempotencyKey: key(),
    attribution: { utm_source: "facebook" },
    ...overrides,
  };
}

async function stockOf(variantKey: string) {
  const p = await Product.findById(productId).lean();
  return p!.variants.find((v) => v.key === variantKey)!.stock;
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.AUTH_SECRET = "t".repeat(40);
  await connectDB(mongo.getUri(), "test");
  await Promise.all([Order.syncIndexes(), Product.syncIndexes(), SiteSettings.syncIndexes()]);
});

afterAll(async () => {
  await disconnectDB();
  await mongo?.stop();
});

beforeEach(async () => {
  await Promise.all([Order.deleteMany({}), Product.deleteMany({}), SiteSettings.deleteMany({})]);
  const p = await Product.create({
    title: "Test Watch",
    slug: "test-watch",
    price: 5000,
    sku: "TW",
    status: "active",
    variants: [
      { key: "steel", name: "Steel", sku: "TW-S", price: 5000, stock: 3 },
      { key: "gold", name: "Gold", sku: "TW-G", price: 7000, stock: 0 },
    ],
  });
  productId = String(p._id);
  await SiteSettings.create({
    key: "main",
    shippingZones: [
      { id: "inside-dhaka", label: "Inside Dhaka", fee: 80, active: true },
      { id: "outside-dhaka", label: "Outside Dhaka", fee: 150, active: true },
      { id: "disabled", label: "Disabled", fee: 1, active: false },
    ],
    codEnabled: true,
    maxQuantityPerOrder: 5,
  });
});

describe("createOrder", () => {
  it("calculates totals on the server and decrements stock", async () => {
    const { created, confirmation } = await createOrder(request({ quantity: 2, zoneId: "outside-dhaka" }));
    expect(created).toBe(true);
    expect(confirmation).toMatchObject({ subtotal: 10000, deliveryFee: 150, total: 10150, paymentStatus: "unpaid", status: "pending" });
    expect(confirmation.orderNumber).toMatch(/^MRI-\d{6}-[A-Z0-9]{5}$/);
    expect(await stockOf("steel")).toBe(1);

    const saved = await Order.findOne({ orderNumber: confirmation.orderNumber }).lean();
    expect(saved!.customer!.phone).toBe("01712345678");
    expect(saved!.items[0]!.unitPrice).toBe(5000);
    expect(saved!.attribution?.utm_source).toBe("facebook");
  });

  it("rejects quantities beyond stock without changing stock", async () => {
    await expect(createOrder(request({ quantity: 4 }))).rejects.toMatchObject({ code: "OUT_OF_STOCK", details: { available: 3 } });
    expect(await stockOf("steel")).toBe(3);
  });

  it("rejects sold-out variants, inactive zones, unknown products and online payment", async () => {
    await expect(createOrder(request({ variantKey: "gold" }))).rejects.toMatchObject({ code: "OUT_OF_STOCK" });
    await expect(createOrder(request({ zoneId: "disabled" }))).rejects.toMatchObject({ code: "INVALID_ZONE" });
    await expect(createOrder(request({ productId: "000000000000000000000000" }))).rejects.toMatchObject({ code: "PRODUCT_UNAVAILABLE" });
    await expect(createOrder(request({ paymentMethod: "online" }))).rejects.toMatchObject({ code: "PAYMENT_UNAVAILABLE" });
    await expect(createOrder(request({ quantity: 6 }))).rejects.toMatchObject({ code: "QUANTITY_LIMIT" });
  });

  it("rejects COD when disabled", async () => {
    await SiteSettings.updateOne({ key: "main" }, { $set: { codEnabled: false } });
    await expect(createOrder(request())).rejects.toBeInstanceOf(OrderError);
    expect(await stockOf("steel")).toBe(3);
  });

  it("never oversells under concurrent orders", async () => {
    const results = await Promise.allSettled(Array.from({ length: 8 }, () => createOrder(request())));
    const ok = results.filter((r) => r.status === "fulfilled");
    expect(ok).toHaveLength(3);
    expect(await stockOf("steel")).toBe(0);
    expect(await Order.countDocuments()).toBe(3);
  });

  it("is idempotent for retried submissions (sequential and concurrent)", async () => {
    const k = key();
    const first = await createOrder(request({ idempotencyKey: k }));
    const retry = await createOrder(request({ idempotencyKey: k, quantity: 2 }));
    expect(retry.created).toBe(false);
    expect(retry.confirmation.orderNumber).toBe(first.confirmation.orderNumber);
    expect(retry.confirmation.accessToken).toBe(first.confirmation.accessToken);

    const k2 = key();
    const concurrent = await Promise.all(Array.from({ length: 4 }, () => createOrder(request({ idempotencyKey: k2 }))));
    expect(new Set(concurrent.map((c) => c.confirmation.orderNumber)).size).toBe(1);
    expect(await Order.countDocuments()).toBe(2);
    expect(await stockOf("steel")).toBe(1); // 3 - 1 - 1: duplicates released their reservation
  });

  it("detects a price change between read and reservation", async () => {
    await Product.updateOne({ _id: productId, "variants.key": "steel" }, { $set: { "variants.$.price": 5500 } });
    const { confirmation } = await createOrder(request());
    expect(confirmation.subtotal).toBe(5500); // uses the live price, never a client one
  });
});

describe("order lookup & status changes", () => {
  it("requires the matching secret token", async () => {
    const { confirmation } = await createOrder(request());
    expect(await lookupOrder(confirmation.orderNumber, confirmation.accessToken)).toMatchObject({ total: 5080 });
    expect(await lookupOrder(confirmation.orderNumber, "wrong-token-wrong-token-xx")).toBeNull();
    expect(await lookupOrder("MRI-000000-AAAAA", confirmation.accessToken)).toBeNull();
  });

  it("restores stock exactly once on cancellation and blocks invalid transitions", async () => {
    const { confirmation } = await createOrder(request({ quantity: 2 }));
    const order = await Order.findOne({ orderNumber: confirmation.orderNumber }).lean();
    const id = String(order!._id);
    expect(await stockOf("steel")).toBe(1);

    await changeOrderStatus(id, "cancelled", "admin@test", "Customer request");
    expect(await stockOf("steel")).toBe(3);
    await expect(changeOrderStatus(id, "cancelled", "admin@test")).rejects.toBeInstanceOf(OrderError);
    await expect(changeOrderStatus(id, "confirmed", "admin@test")).rejects.toBeInstanceOf(OrderError);
    expect(await stockOf("steel")).toBe(3);

    const after = await Order.findById(id).lean();
    expect(after!.statusHistory.map((h) => h.status)).toEqual(["pending", "cancelled"]);
  });

  it("walks the happy path", async () => {
    const { confirmation } = await createOrder(request());
    const id = String((await Order.findOne({ orderNumber: confirmation.orderNumber }).lean())!._id);
    for (const s of ["confirmed", "shipped", "delivered"] as const) await changeOrderStatus(id, s, "admin@test");
    expect((await Order.findById(id).lean())!.status).toBe("delivered");
    expect(await stockOf("steel")).toBe(2);
  });
});
