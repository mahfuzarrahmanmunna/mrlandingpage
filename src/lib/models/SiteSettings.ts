import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const HighlightSchema = new Schema(
  {
    icon: {
      type: String,
      enum: ["truck", "shield", "seal", "headset", "box", "return", "cash", "clock", "spark"],
      default: "spark",
    },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    text: { type: String, trim: true, maxlength: 240, default: "" },
  },
  { _id: false },
);

const ZoneSchema = new Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 40, match: /^[a-z0-9-]+$/ },
    label: { type: String, required: true, trim: true, maxlength: 60 },
    fee: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, maxlength: 160 },
    active: { type: Boolean, default: true },
  },
  { _id: false },
);

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    location: { type: String, trim: true, maxlength: 60 },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    approved: { type: Boolean, default: false },
  },
  { _id: false },
);

/** Singleton document (key: "main"). */
const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "main" },
    brandName: { type: String, default: "MR Imperial", trim: true, maxlength: 60 },
    logoUrl: { type: String, trim: true, maxlength: 600 },
    announcement: { type: String, trim: true, maxlength: 160 },
    hero: {
      eyebrow: { type: String, trim: true, maxlength: 80, default: "" },
      headline: { type: String, trim: true, maxlength: 120 },
      subheadline: { type: String, trim: true, maxlength: 240, default: "" },
    },
    currency: {
      code: { type: String, default: "BDT", maxlength: 3 },
      symbol: { type: String, default: "৳", maxlength: 4 },
    },
    contact: {
      phone: { type: String, trim: true, maxlength: 20 },
      whatsapp: { type: String, trim: true, maxlength: 20 },
      email: { type: String, trim: true, maxlength: 120 },
      address: { type: String, trim: true, maxlength: 240 },
      hours: { type: String, trim: true, maxlength: 120 },
    },
    social: {
      facebook: { type: String, trim: true, maxlength: 300 },
      instagram: { type: String, trim: true, maxlength: 300 },
      tiktok: { type: String, trim: true, maxlength: 300 },
      youtube: { type: String, trim: true, maxlength: 300 },
    },
    trustHighlights: { type: [HighlightSchema], default: [] },
    whyChoose: { type: [HighlightSchema], default: [] },
    testimonials: { type: [TestimonialSchema], default: [] },
    policies: {
      shipping: { type: String, trim: true, maxlength: 3000 },
      returns: { type: String, trim: true, maxlength: 3000 },
      warranty: { type: String, trim: true, maxlength: 3000 },
      privacy: { type: String, trim: true, maxlength: 3000 },
    },
    shippingZones: { type: [ZoneSchema], default: [] },
    codEnabled: { type: Boolean, default: true },
    onlinePaymentEnabled: { type: Boolean, default: false },
    show3DPreview: { type: Boolean, default: true },
    whatsappMessage: {
      type: String,
      trim: true,
      maxlength: 400,
      default: "Hello MR Imperial, I'd like to order {product} ({variant}) × {quantity}.",
    },
    maxQuantityPerOrder: { type: Number, min: 1, max: 99, default: 5 },
  },
  { timestamps: true },
);

SiteSettingsSchema.index({ key: 1 }, { unique: true });

export type SiteSettingsDoc = InferSchemaType<typeof SiteSettingsSchema> & { _id: mongoose.Types.ObjectId };

export const SiteSettings: Model<SiteSettingsDoc> =
  (mongoose.models.SiteSettings as Model<SiteSettingsDoc>) ||
  mongoose.model<SiteSettingsDoc>("SiteSettings", SiteSettingsSchema);
