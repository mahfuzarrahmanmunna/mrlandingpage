/**
 * PREVIEW CONTENT — NOT REAL PRODUCT DATA.
 *
 * Used when the database is not connected, and by `npm run seed` to create a
 * starting product the owner then edits in /admin. Every image is an
 * illustrated placeholder (flagged `placeholder: true`), and the product is
 * flagged `isDemo: true` so the public page shows a "preview content" notice.
 *
 * Deliberately left empty (owner must supply): phone, WhatsApp, warranty,
 * water resistance, return policy, testimonials, ratings, announcement.
 */
import type { PublicProduct, PublicSettings } from "./types";

const img = (file: string, alt: string) => ({
  url: `/placeholder/${file}`,
  alt,
  placeholder: true,
  width: 1200,
  height: 1500,
});

export const demoProduct: PublicProduct & { status: "active" } = {
  id: "demo",
  slug: "imperial-meridian",
  title: "Imperial Meridian",
  tagline: "A quiet, architectural dress watch for everyday ceremony.",
  description:
    "Preview description. Replace this text in the admin dashboard with the real story of the watch: what it is made of, how it wears, and who it is for. Keep claims factual — materials, dimensions and movement as specified by the manufacturer.",
  price: 8900,
  sku: "MRI-MER-001",
  images: [
    img("meridian-ivory.svg", "Imperial Meridian with ivory dial, front view (placeholder illustration)"),
    img("meridian-angle.svg", "Imperial Meridian three-quarter view (placeholder illustration)"),
    img("meridian-detail.svg", "Imperial Meridian dial detail (placeholder illustration)"),
  ],
  specs: {
    brand: "MR Imperial",
    model: "Meridian",
    sku: "MRI-MER-001",
    dialSize: "40 mm",
    caseMaterial: "Stainless steel",
    strapMaterial: "Steel bracelet / leather (by edition)",
    movement: "Quartz",
    glass: "Mineral crystal",
    color: "By edition",
  },
  variantLabel: "Edition",
  variants: [
    {
      key: "ivory-steel",
      name: "Ivory · Steel",
      sku: "MRI-MER-IVS",
      price: 8900,
      stock: 12,
      swatch: "#efe7d8",
      images: [
        img("meridian-ivory.svg", "Ivory dial, steel bracelet (placeholder illustration)"),
        img("meridian-angle.svg", "Three-quarter view (placeholder illustration)"),
        img("meridian-detail.svg", "Dial detail (placeholder illustration)"),
      ],
      available: true,
    },
    {
      key: "midnight-leather",
      name: "Midnight · Leather",
      sku: "MRI-MER-MDL",
      price: 9400,
      stock: 6,
      swatch: "#1f2430",
      images: [
        img("meridian-midnight.svg", "Midnight dial, leather strap (placeholder illustration)"),
        img("meridian-angle.svg", "Three-quarter view (placeholder illustration)"),
      ],
      available: true,
    },
    {
      key: "champagne-two-tone",
      name: "Champagne · Two-tone",
      sku: "MRI-MER-CHT",
      price: 10900,
      stock: 0,
      swatch: "#cdb07a",
      images: [img("meridian-champagne.svg", "Champagne dial, two-tone bracelet (placeholder illustration)")],
      available: false,
    },
  ],
  highlights: ["40 mm case", "Quartz movement", "Three editions"],
  seo: {},
  isDemo: true,
  status: "active",
};

export const demoSettings: PublicSettings = {
  brandName: "MR Imperial",
  hero: {
    eyebrow: "The Meridian Collection",
    subheadline: "Clean proportions, a sunray dial and a case that sits close to the wrist.",
  },
  currency: { code: "BDT", symbol: "৳" },
  contact: {},
  social: {},
  trustHighlights: [
    { icon: "cash", title: "Cash on delivery", text: "Pay when your watch arrives at your door." },
    { icon: "headset", title: "Ask before you buy", text: "Questions answered before you place an order." },
    { icon: "box", title: "Delivery fee shown upfront", text: "Your exact delivery charge appears before you confirm." },
  ],
  whyChoose: [
    {
      icon: "seal",
      title: "Transparent pricing",
      text: "Every total is calculated on our server from the live price and your delivery area — no surprise charges at the door.",
    },
    {
      icon: "clock",
      title: "A reference for every order",
      text: "You receive an order number the moment we receive your order, so you can follow up with confidence.",
    },
    {
      icon: "cash",
      title: "Pay on arrival",
      text: "Choose cash on delivery and pay only when the parcel is in your hands.",
    },
  ],
  testimonials: [],
  policies: {},
  shippingZones: [
    { id: "inside-dhaka", label: "Inside Dhaka", fee: 80, description: "Preview fee — set real fee in admin", active: true },
    { id: "outside-dhaka", label: "Outside Dhaka", fee: 150, description: "Preview fee — set real fee in admin", active: true },
  ],
  codEnabled: true,
  onlinePaymentEnabled: false,
  show3DPreview: true,
  whatsappMessage: "Hello MR Imperial, I'd like to order {product} ({variant}) × {quantity}.",
  maxQuantityPerOrder: 5,
};
