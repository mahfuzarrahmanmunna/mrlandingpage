import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Lead } from "@/lib/models/Lead";
import { Order, type OrderDoc, type OrderStatus } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { normalizeBdPhone } from "@/lib/phone";
import { calculateTotals } from "@/lib/pricing";
import { loadStorefrontLive } from "@/lib/storefront-live";
import type { OrderConfirmation } from "@/lib/types";
import type { OrderRequest } from "@/lib/validation/order";

export type OrderErrorCode =
  | "STORE_NOT_CONNECTED"
  | "RATE_LIMITED"
  | "STORE_NOT_READY"
  | "PRODUCT_UNAVAILABLE"
  | "VARIANT_UNAVAILABLE"
  | "OUT_OF_STOCK"
  | "QUANTITY_LIMIT"
  | "INVALID_ZONE"
  | "INVALID_PHONE"
  | "PAYMENT_UNAVAILABLE"
  | "PRICE_CHANGED";

export class OrderError extends Error {
  constructor(
    public code: OrderErrorCode,
    message: string,
    public status = 409,
    public details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "OrderError";
  }
}

function tokenSecret() {
  return process.env.AUTH_SECRET || process.env.IP_HASH_SALT || "mri-dev-only-order-token-secret";
}

/** Deterministic per idempotency key, so a retried request gets the same token back. */
export function deriveAccessToken(idempotencyKey: string) {
  return createHmac("sha256", tokenSecret()).update(`order-access:${idempotencyKey}`).digest("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function newOrderNumber(now = new Date()) {
  const dhaka = new Date(now.getTime() + 6 * 3600 * 1000);
  const ymd = dhaka.toISOString().slice(2, 10).replace(/-/g, "");
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = randomBytes(5);
  let suffix = "";
  for (const b of bytes) suffix += alphabet[b % alphabet.length];
  return `MRI-${ymd}-${suffix}`;
}

type Lean<T> = T & { _id: mongoose.Types.ObjectId; createdAt?: Date };

export function toConfirmation(order: Lean<OrderDoc>, accessToken: string): OrderConfirmation {
  return {
    orderNumber: order.orderNumber,
    accessToken,
    createdAt: (order.createdAt ?? new Date()).toISOString(),
    items: order.items.map((i) => ({
      title: i.title,
      variantName: i.variantName,
      sku: i.sku,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      lineTotal: i.lineTotal,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    discount: order.discount ?? 0,
    total: order.total,
    currency: { code: order.currency?.code ?? "BDT", symbol: order.currency?.symbol ?? "৳" },
    deliveryZone: order.deliveryZone?.label ?? "",
    paymentMethod: order.paymentMethod as "cod" | "online",
    paymentStatus: order.paymentStatus ?? "unpaid",
    status: order.status ?? "pending",
    customerName: order.customer?.name.split(/\s+/)[0] ?? "",
  };
}

function isDuplicateKey(err: unknown, field: string) {
  const e = err as { code?: number; keyPattern?: Record<string, unknown> };
  return e?.code === 11000 && Boolean(e.keyPattern && field in e.keyPattern);
}

async function restoreStock(productId: string, variantKey: string, quantity: number) {
  await Product.updateOne(
    { _id: productId, "variants.key": variantKey },
    { $inc: { "variants.$.stock": quantity } },
  );
}

export type CreateOrderContext = {
  ipHash?: string;
  userAgent?: string;
  /** Awaited after the read-only lookups and before anything is written (e.g. a rate-limit check). */
  beforeWrite?: Promise<void>;
};
export type CreateOrderResult = { created: boolean; confirmation: OrderConfirmation };

/**
 * Creates an order. Every money value and stock decision is derived here from
 * live database state — nothing price-related is read from the request.
 */
export async function createOrder(input: OrderRequest, ctx: CreateOrderContext = {}): Promise<CreateOrderResult> {
  if (!process.env.MONGODB_URI) {
    throw new OrderError("STORE_NOT_CONNECTED", "Online ordering is not available yet. Please contact us to order.", 503);
  }
  await connectDB();

  const accessToken = deriveAccessToken(input.idempotencyKey);

  // 1. Idempotency (a retried submission returns the original order) and
  // 2. live product/settings (never the cached page data) — fetched in parallel.
  const [existing, { product, settings }] = await Promise.all([
    Order.findOne({ idempotencyKey: input.idempotencyKey }).lean(),
    loadStorefrontLive(),
  ]);
  await ctx.beforeWrite;
  if (existing) return { created: false, confirmation: toConfirmation(existing, accessToken) };
  if (!product || product.id !== input.productId) {
    throw new OrderError("PRODUCT_UNAVAILABLE", "This watch is no longer available.", 409);
  }
  if (settings.shippingZones.length === 0) {
    throw new OrderError("STORE_NOT_READY", "Delivery areas are not configured yet. Please contact us to order.", 503);
  }
  const zone = settings.shippingZones.find((z) => z.id === input.zoneId);
  if (!zone) throw new OrderError("INVALID_ZONE", "Please choose a valid delivery area.", 422, { field: "zoneId" });

  if (input.paymentMethod === "online") {
    // No gateway is integrated yet. See README → Payments.
    throw new OrderError("PAYMENT_UNAVAILABLE", "Online payment is not available. Please choose cash on delivery.", 422);
  }
  if (!settings.codEnabled) {
    throw new OrderError("PAYMENT_UNAVAILABLE", "Cash on delivery is currently unavailable.", 422);
  }

  const variant = product.variants.find((v) => v.key === input.variantKey);
  if (!variant) throw new OrderError("VARIANT_UNAVAILABLE", "The selected option is no longer available.", 409);
  if (input.quantity > settings.maxQuantityPerOrder) {
    throw new OrderError(
      "QUANTITY_LIMIT",
      `You can order up to ${settings.maxQuantityPerOrder} per order.`,
      422,
      { max: settings.maxQuantityPerOrder },
    );
  }

  const phone = normalizeBdPhone(input.phone);
  if (!phone) throw new OrderError("INVALID_PHONE", "Enter a valid Bangladesh mobile number.", 422, { field: "phone" });

  const totals = calculateTotals({ unitPrice: variant.price, quantity: input.quantity, deliveryFee: zone.fee });

  // 3. Atomic reservation: only succeeds if enough stock AND the price is unchanged.
  const reserved = await Product.updateOne(
    {
      _id: product.id,
      status: "active",
      variants: {
        $elemMatch: {
          key: variant.key,
          active: { $ne: false },
          price: variant.price,
          stock: { $gte: input.quantity },
        },
      },
    },
    { $inc: { "variants.$.stock": -input.quantity } },
  );

  if (reserved.modifiedCount !== 1) {
    // A concurrent duplicate of this same submission may hold the stock and be
    // about to save the order. Give it a moment, and return its order if so.
    for (let i = 0; i < 6; i++) {
      const winner = await Order.findOne({ idempotencyKey: input.idempotencyKey }).lean();
      if (winner) return { created: false, confirmation: toConfirmation(winner, accessToken) };
      await new Promise((r) => setTimeout(r, 150));
    }
    const fresh = await Product.findById(product.id, { variants: 1 }).lean();
    const fv = fresh?.variants.find((v) => v.key === variant.key);
    if (fv && fv.price !== variant.price) {
      throw new OrderError("PRICE_CHANGED", "The price has just been updated. Please review your order.", 409, {
        price: fv.price,
      });
    }
    const available = Math.max(0, fv?.stock ?? 0);
    throw new OrderError(
      "OUT_OF_STOCK",
      available > 0 ? `Only ${available} left for this option.` : "This option has just sold out.",
      409,
      { available },
    );
  }

  // 4. Persist. On any failure, release the reserved stock.
  const image = (variant.images[0] ?? product.images[0])?.url;
  const base = {
    idempotencyKey: input.idempotencyKey,
    accessTokenHash: hashToken(accessToken),
    customer: {
      name: input.name,
      phone,
      ...(input.email ? { email: input.email } : {}),
      address: input.address,
      city: input.city,
      ...(input.note ? { note: input.note } : {}),
    },
    deliveryZone: { id: zone.id, label: zone.label, fee: zone.fee },
    items: [
      {
        productId: new mongoose.Types.ObjectId(product.id),
        title: product.title,
        variantKey: variant.key,
        variantName: variant.name,
        sku: variant.sku,
        ...(image ? { image } : {}),
        unitPrice: variant.price,
        quantity: input.quantity,
        lineTotal: totals.subtotal,
      },
    ],
    currency: settings.currency,
    ...totals,
    paymentMethod: "cod" as const,
    paymentStatus: "unpaid" as const,
    status: "pending" as const,
    statusHistory: [{ status: "pending", note: "Order placed by customer", by: "customer" }],
    attribution: input.attribution ?? {},
    ...(ctx.ipHash ? { ipHash: ctx.ipHash } : {}),
    ...(ctx.userAgent ? { userAgent: ctx.userAgent.slice(0, 300) } : {}),
  };

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const doc = await Order.create({ ...base, orderNumber: newOrderNumber() });
      return { created: true, confirmation: toConfirmation(doc.toObject() as Lean<OrderDoc>, accessToken) };
    } catch (err) {
      if (isDuplicateKey(err, "orderNumber")) continue;
      await restoreStock(product.id, variant.key, input.quantity);
      if (isDuplicateKey(err, "idempotencyKey")) {
        // A concurrent identical submission won the race; return that order.
        const winner = await Order.findOne({ idempotencyKey: input.idempotencyKey }).lean();
        if (winner) return { created: false, confirmation: toConfirmation(winner, accessToken) };
      }
      throw err;
    }
  }
  await restoreStock(product.id, variant.key, input.quantity);
  throw new Error("Could not allocate an order number");
}

/** Customer-side recovery: requires the order number AND its secret access token. */
export async function lookupOrder(orderNumber: string, accessToken: string): Promise<OrderConfirmation | null> {
  if (!process.env.MONGODB_URI) return null;
  await connectDB();
  const order = await Order.findOne({ orderNumber }).select("+accessTokenHash").lean();
  if (!order) return null;
  const a = Buffer.from(hashToken(accessToken), "hex");
  const b = Buffer.from(String(order.accessTokenHash), "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return toConfirmation(order, accessToken);
}

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export function allowedTransitions(status: OrderStatus) {
  return TRANSITIONS[status] ?? [];
}

/** Admin status change. Cancelling/returning restores stock exactly once. */
export async function changeOrderStatus(orderId: string, next: OrderStatus, by: string, note?: string) {
  await connectDB();
  const order = await Order.findById(orderId).lean();
  if (!order) throw new OrderError("PRODUCT_UNAVAILABLE", "Order not found.", 404);
  const current = (order.status ?? "pending") as OrderStatus;
  if (!allowedTransitions(current).includes(next)) {
    throw new OrderError("VARIANT_UNAVAILABLE", `Cannot move an order from ${current} to ${next}.`, 422);
  }

  const updated = await Order.findOneAndUpdate(
    { _id: orderId, status: current },
    {
      $set: { status: next },
      $push: { statusHistory: { status: next, note, by, at: new Date() } },
    },
    { returnDocument: "after" },
  ).lean();
  if (!updated) throw new OrderError("VARIANT_UNAVAILABLE", "The order was changed by someone else. Reload and retry.", 409);

  if (next === "cancelled" || next === "returned") {
    const flagged = await Order.findOneAndUpdate(
      { _id: orderId, stockRestored: false },
      { $set: { stockRestored: true } },
    ).lean();
    if (flagged) {
      for (const item of flagged.items) await restoreStock(String(item.productId), item.variantKey, item.quantity);
    }
  }
  return updated;
}

/** Records an order customer as a lead for follow-up/attribution reporting. */
export async function recordOrderLead(confirmation: OrderConfirmation, input: OrderRequest, ipHash?: string) {
  try {
    const phone = normalizeBdPhone(input.phone);
    if (!phone) return;
    await Lead.create({
      name: input.name,
      phone,
      ...(input.email ? { email: input.email } : {}),
      message: `Order ${confirmation.orderNumber}`,
      interest: `${confirmation.items[0]?.title} — ${confirmation.items[0]?.variantName}`,
      source: "order",
      status: "converted",
      attribution: input.attribution ?? {},
      ...(ipHash ? { ipHash } : {}),
    });
  } catch (err) {
    console.error("[orders] failed to record lead:", (err as Error).message);
  }
}
