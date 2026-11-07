import { z } from "zod";
import { LEAD_STATUSES } from "@/lib/models/Lead";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/models/Order";

const str = (max: number) => z.string().trim().max(max);
const optStr = (max: number) => z.string().trim().max(max).optional().default("");
const money = z.coerce.number().int("Use whole Taka amounts.").min(0).max(10_000_000);
const optMoney = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().int().min(0).max(10_000_000).optional(),
);

/** Relative paths (/placeholder/x.svg) or https URLs only — no javascript:, data:, etc. */
export const urlOrPath = z
  .string()
  .trim()
  .max(600)
  .refine((v) => v === "" || v.startsWith("/") || /^https:\/\/[^\s]+$/i.test(v), "Use an https:// URL or a /path.");

const imageSchema = z.object({
  url: urlOrPath.refine((v) => v.length > 0, "Image URL is required."),
  alt: str(200).min(1, "Alt text is required for accessibility."),
  placeholder: z.boolean().optional().default(false),
});

const variantSchema = z
  .object({
    key: str(64).regex(/^[a-z0-9-]+$/, "Key: lowercase letters, numbers and dashes only."),
    name: str(80).min(1, "Variant name is required."),
    sku: str(64).min(1, "SKU is required."),
    price: money,
    compareAtPrice: optMoney,
    stock: z.coerce.number().int().min(0).max(100_000),
    swatch: z
      .string()
      .trim()
      .regex(/^(#[0-9a-fA-F]{3,8})?$/, "Swatch must be a hex colour like #1f2430.")
      .optional()
      .default(""),
    images: z.array(imageSchema).max(12).default([]),
    active: z.boolean().default(true),
    lowStockThreshold: z.coerce.number().int().min(0).max(1000).default(3),
  })
  .refine((v) => !v.compareAtPrice || v.compareAtPrice > v.price, {
    message: "Compare-at price must be higher than the price (or leave it empty).",
    path: ["compareAtPrice"],
  });

const specs = z.object({
  brand: optStr(80),
  model: optStr(80),
  sku: optStr(64),
  powerSource: optStr(80),
  caseShape: optStr(40),
  dialSize: optStr(40),
  caseMaterial: optStr(80),
  caseThickness: optStr(40),
  strapMaterial: optStr(80),
  bandLength: optStr(40),
  bandWidth: optStr(40),
  clasp: optStr(80),
  movement: optStr(80),
  display: optStr(40),
  calendar: optStr(80),
  luminous: optStr(40),
  waterResistance: optStr(40),
  glass: optStr(60),
  origin: optStr(60),
  dialColor: optStr(60),
  color: optStr(60),
  warranty: optStr(120),
});

export const productSchema = z
  .object({
    title: str(120).min(2, "Title is required."),
    slug: str(120).regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and dashes."),
    tagline: optStr(200),
    description: optStr(4000),
    price: money,
    compareAtPrice: optMoney,
    sku: str(64).min(1, "SKU is required."),
    images: z.array(imageSchema).max(12),
    videoUrl: urlOrPath
      .refine((v) => v === "" || /\.(mp4|webm|ogg)(\?.*)?$/i.test(v), "Use an MP4, WebM or Ogg video URL.")
      .optional()
      .default(""),
    modelUrl: urlOrPath
      .refine((v) => v === "" || /\.(glb|gltf)(\?.*)?$/i.test(v), "3D model must be a .glb or .gltf file.")
      .optional()
      .default(""),
    specs,
    variantLabel: str(40).min(1).default("Edition"),
    variants: z.array(variantSchema).min(1, "Add at least one variant.").max(24),
    highlights: z.array(str(60)).max(8).default([]),
    status: z.enum(["active", "draft", "archived"]),
    isDemo: z.boolean().default(false),
    seo: z
      .object({ title: optStr(120), description: optStr(300), ogImage: urlOrPath.optional().default("") })
      .default({ title: "", description: "", ogImage: "" }),
  })
  .refine((p) => new Set(p.variants.map((v) => v.key)).size === p.variants.length, {
    message: "Variant keys must be unique.",
    path: ["variants"],
  })
  .refine((p) => !p.compareAtPrice || p.compareAtPrice > p.price, {
    message: "Compare-at price must be higher than the price.",
    path: ["compareAtPrice"],
  });

export type ProductInput = z.infer<typeof productSchema>;

const iconEnum = z.enum(["truck", "shield", "seal", "headset", "box", "return", "cash", "clock", "spark"]);
const highlightSchema = z.object({ icon: iconEnum, title: str(80).min(1), text: optStr(240) });
const phoneLike = z
  .string()
  .trim()
  .max(20)
  .regex(/^(\+?[0-9 \-]{6,20})?$/, "Use digits, spaces, dashes and an optional leading +.")
  .optional()
  .default("");
const httpsOrEmpty = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/i.test(v), "Use a full https:// link.")
  .optional()
  .default("");

export const settingsSchema = z
  .object({
    brandName: str(60).min(1),
    logoUrl: urlOrPath.optional().default(""),
    announcement: optStr(160),
    hero: z.object({ eyebrow: optStr(80), headline: optStr(120), subheadline: optStr(240) }),
    currency: z.object({ code: str(3).min(3), symbol: str(4).min(1) }),
    contact: z.object({
      phone: phoneLike,
      whatsapp: phoneLike,
      email: z.union([z.literal(""), z.email().max(120)]).optional().default(""),
      address: optStr(240),
      hours: optStr(120),
    }),
    social: z.object({
      facebook: httpsOrEmpty,
      instagram: httpsOrEmpty,
      tiktok: httpsOrEmpty,
      youtube: httpsOrEmpty,
    }),
    trustHighlights: z.array(highlightSchema).max(6),
    whyChoose: z.array(highlightSchema).max(8),
    testimonials: z
      .array(z.object({ name: str(60).min(1), location: optStr(60), text: str(500).min(1), approved: z.boolean() }))
      .max(20),
    policies: z.object({
      shipping: optStr(3000),
      returns: optStr(3000),
      warranty: optStr(3000),
      privacy: optStr(3000),
    }),
    shippingZones: z
      .array(
        z.object({
          id: str(40).regex(/^[a-z0-9-]+$/, "Zone id: lowercase letters, numbers and dashes."),
          label: str(60).min(1),
          fee: money,
          description: optStr(160),
          active: z.boolean(),
        }),
      )
      .max(20),
    codEnabled: z.boolean(),
    onlinePaymentEnabled: z.literal(false, { error: "Online payment needs a gateway integration first." }),
    show3DPreview: z.boolean(),
    whatsappMessage: str(400).min(1),
    maxQuantityPerOrder: z.coerce.number().int().min(1).max(99),
  })
  .refine((s) => new Set(s.shippingZones.map((z) => z.id)).size === s.shippingZones.length, {
    message: "Zone ids must be unique.",
    path: ["shippingZones"],
  });

export type SettingsInput = z.infer<typeof settingsSchema>;

export const orderUpdateSchema = z
  .object({
    status: z.enum(ORDER_STATUSES).optional(),
    statusNote: optStr(500),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
    internalNote: optStr(2000),
  })
  .refine((v) => v.status || v.paymentStatus || v.internalNote, { message: "Nothing to update." });

export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  followUpAt: z
    .union([z.literal(""), z.iso.date(), z.iso.datetime({ local: true })])
    .optional(),
  followUpNote: z.string().trim().max(1000).optional(),
});

export const loginSchema = z.object({
  email: z.email().max(120),
  password: z.string().min(1).max(200),
});
