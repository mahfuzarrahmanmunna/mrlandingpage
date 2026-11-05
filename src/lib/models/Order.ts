import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;
export const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "failed", "refunded"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const ItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    variantKey: { type: String, required: true },
    variantName: { type: String, required: true },
    sku: { type: String, required: true },
    image: String,
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const HistorySchema = new Schema(
  {
    status: { type: String, required: true },
    note: String,
    by: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const NoteSchema = new Schema(
  {
    text: { type: String, required: true, maxlength: 2000 },
    by: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true },
    idempotencyKey: { type: String, required: true },
    accessTokenHash: { type: String, required: true, select: false },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      note: { type: String, trim: true },
    },
    deliveryZone: {
      id: { type: String, required: true },
      label: { type: String, required: true },
      fee: { type: Number, required: true, min: 0 },
    },
    items: { type: [ItemSchema], required: true },
    currency: {
      code: { type: String, default: "BDT" },
      symbol: { type: String, default: "৳" },
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["cod", "online"], required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "unpaid" },
    paymentRef: String,
    status: { type: String, enum: ORDER_STATUSES, default: "pending" },
    statusHistory: { type: [HistorySchema], default: [] },
    internalNotes: { type: [NoteSchema], default: [] },
    stockRestored: { type: Boolean, default: false },
    attribution: {
      utm_source: String,
      utm_medium: String,
      utm_campaign: String,
      utm_content: String,
      utm_term: String,
      referrer: String,
      landingPath: String,
    },
    ipHash: { type: String, select: false },
    userAgent: { type: String, select: false, maxlength: 300 },
  },
  { timestamps: true },
);

OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ idempotencyKey: 1 }, { unique: true });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ "customer.phone": 1 });

export type OrderDoc = InferSchemaType<typeof OrderSchema> & { _id: mongoose.Types.ObjectId };

export const Order: Model<OrderDoc> =
  (mongoose.models.Order as Model<OrderDoc>) || mongoose.model<OrderDoc>("Order", OrderSchema);
