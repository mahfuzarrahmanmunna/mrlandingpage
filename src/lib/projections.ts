import type { ProductDoc } from "@/lib/models/Product";
import type { SiteSettingsDoc } from "@/lib/models/SiteSettings";
import type {
  Highlight,
  IconName,
  ProductImage,
  ProductSpecs,
  PublicProduct,
  PublicSettings,
  SpecKey,
} from "@/lib/types";

type Lean<T> = T & Record<string, unknown>;

const SPEC_KEYS: SpecKey[] = [
  "brand",
  "model",
  "sku",
  "powerSource",
  "caseShape",
  "dialSize",
  "caseMaterial",
  "caseThickness",
  "strapMaterial",
  "bandLength",
  "bandWidth",
  "clasp",
  "movement",
  "display",
  "calendar",
  "luminous",
  "waterResistance",
  "glass",
  "origin",
  "dialColor",
  "color",
  "warranty",
];

function images(list: unknown): ProductImage[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((i) => i && typeof i.url === "string" && i.url)
    .map((i) => ({
      url: String(i.url),
      alt: String(i.alt ?? ""),
      placeholder: Boolean(i.placeholder),
      ...(i.width ? { width: Number(i.width) } : {}),
      ...(i.height ? { height: Number(i.height) } : {}),
    }));
}

function specs(raw: unknown): ProductSpecs {
  const out: ProductSpecs = {};
  if (!raw || typeof raw !== "object") return out;
  for (const k of SPEC_KEYS) {
    const v = (raw as Record<string, unknown>)[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim();
  }
  return out;
}

export function toPublicProduct(doc: Lean<ProductDoc>): PublicProduct {
  const variants = (doc.variants ?? [])
    .filter((v) => v.active !== false)
    .map((v) => ({
      key: v.key,
      name: v.name,
      sku: v.sku,
      price: v.price,
      ...(v.compareAtPrice && v.compareAtPrice > v.price ? { compareAtPrice: v.compareAtPrice } : {}),
      stock: Math.max(0, v.stock ?? 0),
      ...(v.swatch ? { swatch: v.swatch } : {}),
      images: images(v.images),
      available: (v.stock ?? 0) > 0,
    }));

  return {
    id: String(doc._id),
    slug: doc.slug,
    title: doc.title,
    tagline: doc.tagline ?? "",
    description: doc.description ?? "",
    price: doc.price,
    ...(doc.compareAtPrice && doc.compareAtPrice > doc.price ? { compareAtPrice: doc.compareAtPrice } : {}),
    sku: doc.sku,
    images: images(doc.images),
    ...(doc.videoUrl ? { videoUrl: doc.videoUrl } : {}),
    ...(doc.modelUrl ? { modelUrl: doc.modelUrl } : {}),
    specs: specs(doc.specs),
    variants,
    variantLabel: doc.variantLabel || "Edition",
    highlights: (doc.highlights ?? []).filter(Boolean),
    seo: {
      ...(doc.seo?.title ? { title: doc.seo.title } : {}),
      ...(doc.seo?.description ? { description: doc.seo.description } : {}),
      ...(doc.seo?.ogImage ? { ogImage: doc.seo.ogImage } : {}),
    },
    isDemo: Boolean(doc.isDemo),
    ...(doc.updatedAt ? { updatedAt: new Date(doc.updatedAt as unknown as string).toISOString() } : {}),
  };
}

const ICONS: IconName[] = ["truck", "shield", "seal", "headset", "box", "return", "cash", "clock", "spark"];

function highlights(list: unknown): Highlight[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((h) => h && h.title)
    .map((h) => ({
      icon: (ICONS.includes(h.icon) ? h.icon : "spark") as IconName,
      title: String(h.title),
      text: String(h.text ?? ""),
    }));
}

const opt = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

function compact<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as {
    [K in keyof T]?: Exclude<T[K], undefined>;
  };
}

export function toPublicSettings(doc: Lean<SiteSettingsDoc>): PublicSettings {
  return {
    brandName: doc.brandName || "MR Imperial",
    ...(opt(doc.logoUrl) ? { logoUrl: opt(doc.logoUrl) } : {}),
    ...(opt(doc.announcement) ? { announcement: opt(doc.announcement) } : {}),
    hero: {
      eyebrow: doc.hero?.eyebrow ?? "",
      ...(opt(doc.hero?.headline) ? { headline: opt(doc.hero?.headline) } : {}),
      subheadline: doc.hero?.subheadline ?? "",
    },
    currency: { code: doc.currency?.code || "BDT", symbol: doc.currency?.symbol || "৳" },
    contact: compact({
      phone: opt(doc.contact?.phone),
      whatsapp: opt(doc.contact?.whatsapp),
      email: opt(doc.contact?.email),
      address: opt(doc.contact?.address),
      hours: opt(doc.contact?.hours),
    }),
    social: compact({
      facebook: opt(doc.social?.facebook),
      instagram: opt(doc.social?.instagram),
      tiktok: opt(doc.social?.tiktok),
      youtube: opt(doc.social?.youtube),
    }),
    trustHighlights: highlights(doc.trustHighlights),
    whyChoose: highlights(doc.whyChoose),
    testimonials: (doc.testimonials ?? [])
      .filter((t) => t.approved && t.text && t.name)
      .map((t) => ({ name: t.name, ...(t.location ? { location: t.location } : {}), text: t.text, approved: true })),
    policies: compact({
      shipping: opt(doc.policies?.shipping),
      returns: opt(doc.policies?.returns),
      warranty: opt(doc.policies?.warranty),
      privacy: opt(doc.policies?.privacy),
    }),
    shippingZones: (doc.shippingZones ?? [])
      .filter((z) => z.active !== false)
      .map((z) => ({
        id: z.id,
        label: z.label,
        fee: z.fee,
        ...(z.description ? { description: z.description } : {}),
        active: true,
      })),
    codEnabled: doc.codEnabled !== false,
    onlinePaymentEnabled: Boolean(doc.onlinePaymentEnabled),
    show3DPreview: doc.show3DPreview !== false,
    whatsappMessage: doc.whatsappMessage || "Hello MR Imperial, I'd like to order {product} ({variant}) × {quantity}.",
    maxQuantityPerOrder: doc.maxQuantityPerOrder || 5,
  };
}
