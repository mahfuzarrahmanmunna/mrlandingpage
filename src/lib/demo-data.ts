/**
 * PREVIEW CONTENT — NOT REAL PRODUCT DATA.
 *
 * Used when the database is not connected, and by `npm run seed` to create a
 * starting product the owner then edits in /admin. Product imagery and listed
 * specifications are supplied examples; seller-dependent details and price
 * still need confirmation before the product is published.
 *
 * Deliberately left empty (owner must supply): warranty,
 * water resistance, return policy, testimonials, ratings, announcement.
 */
import type { PublicProduct, PublicSettings } from "./types";
import { CONTACT_NUMBER } from "./contact";

const img = (file: string, alt: string) => ({
  url: `/images/${file}`,
  alt,
  placeholder: false,
});

const IMG = {
  blue: img("poydagar-blue.jpeg", "নীল ডায়ালের পোয়েডাগার ৯৩০ ঘড়ি"),
  white: img("poydagar-white.jpeg", "সাদা ডায়ালের পোয়েডাগার ৯৩০ ঘড়ি"),
  black: img("poydagar-black.jpeg", "কালো ডায়ালের পোয়েডাগার ৯৩০ ঘড়ি"),
  green: img("poydagar-green.jpeg", "সবুজ ডায়ালের পোয়েডাগার ৯৩০ ঘড়ি"),
  gold: img("poydagar-golden.jpeg", "সোনালি রঙের পোয়েডাগার ৯৩০ ঘড়ি"),
  size: img("product-parameters.jpeg", "পোয়েডাগার ৯৩০ ঘড়ির মাপ ও বিস্তারিত তথ্য"),
  water: img("water-proof-display.jpeg", "পোয়েডাগার ৯৩০ — পানির ছিটা সহনীয় গাইড"),
};

export const demoProduct: PublicProduct & { status: "active" } = {
  id: "demo",
  slug: "poedagar-930",
  title: "পোয়েডাগার ৯৩০",
  tagline: "ছেলেদের সুন্দর স্টিলের ঘড়ি — অফিস, ঘোরাঘুরি বা উপহার, সব কাজে মানানসই।",
  description: [
    "সহজ, সুন্দর আর মজবুত একটি ঘড়ি। অফিসে, বাইরে বা যেকোনো অনুষ্ঠানে পরতে পারবেন।",
    "যেখানে মানানসই:\n• অফিস ও মিটিং\n• প্রতিদিন পরার জন্য\n• ঘোরাঘুরি\n• জন্মদিন ও উপহার",
    "পানি নিয়ে: ঘাম, হালকা বৃষ্টি ও পানির ছিটায় সমস্যা নেই। তবে গোসল বা সাঁতারের সময় খুলে রাখুন।",
  ].join("\n\n"),
  price: 8900,
  sku: "POE-930",
  images: [IMG.blue, IMG.white, IMG.black, IMG.green, IMG.gold, IMG.size, IMG.water],
  specs: {
    brand: "পোয়েডাগার",
    model: "৯৩০",
    sku: "POE-930",
    powerSource: "ব্যাটারি",
    caseShape: "গোল",
    dialSize: "৪১.৫ মিমি",
    caseThickness: "প্রায় ১১ মিমি",
    caseMaterial: "অ্যালয়",
    strapMaterial: "স্টেইনলেস স্টিল",
    bandLength: "প্রায় ২৩০ মিমি",
    bandWidth: "২২–২৬ মিমি",
    clasp: "বাটারফ্লাই লক",
    movement: "কোয়ার্টজ",
    display: "কাঁটাওয়ালা (অ্যানালগ)",
    calendar: "বার ও তারিখ",
    luminous: "হ্যাঁ",
    waterResistance: "৩ এটিএম — পানির ছিটা সহনীয়, সাঁতার নয়",
    glass: "মিনারেল গ্লাস",
    origin: "চীন",
    warranty: "দোকানের ওয়ারেন্টি",
    dialColor: "নীল / সাদা / কালো / সবুজ / সোনালি",
    color: "নীল, সাদা, কালো, সবুজ ও সোনালি",
  },
  videoUrl: "/video/poydagar-video.mp4",
  variantLabel: "ডায়ালের রঙ",
  variants: [
    {
      key: "blue",
      name: "নীল",
      sku: "POE-930-BLU",
      price: 8900,
      stock: 12,
      swatch: "#1d5b7a",
      images: [IMG.blue, IMG.size, IMG.water],
      available: true,
    },
    {
      key: "white",
      name: "সাদা",
      sku: "POE-930-WHT",
      price: 9400,
      stock: 6,
      swatch: "#dedbd4",
      images: [IMG.white, IMG.size, IMG.water],
      available: true,
    },
    {
      key: "black",
      name: "কালো",
      sku: "POE-930-BLK",
      price: 10900,
      stock: 0,
      swatch: "#252525",
      images: [IMG.black, IMG.size, IMG.water],
      available: false,
    },
    {
      // Placeholder price/stock: set the real price and stock in /admin/product before selling it.
      key: "green",
      name: "সবুজ",
      sku: "POE-930-GRN",
      price: 8900,
      stock: 0,
      swatch: "#1f7a6e",
      images: [IMG.green, IMG.size, IMG.water],
      available: false,
    },
    {
      // Placeholder price/stock: set the real price and stock in /admin/product before selling it.
      key: "gold",
      name: "সোনালি",
      sku: "POE-930-GLD",
      price: 8900,
      stock: 0,
      swatch: "#c9a45c",
      images: [IMG.gold, IMG.size, IMG.water],
      available: false,
    },
  ],
  highlights: ["৪১.৫ মিমি গোল ডায়াল", "স্টেইনলেস স্টিলের বেল্ট", "বার ও তারিখ দেখায়", "পানির ছিটায় সমস্যা নেই"],
  seo: {},
  isDemo: true,
  status: "active",
};

export const demoSettings: PublicSettings = {
  brandName: "এমআর ইম্পেরিয়াল",
  hero: {
    eyebrow: "নতুন কালেকশন",
    subheadline: "অর্ডার করুন ঘরে বসে — ঘড়ি হাতে পেয়ে তারপর টাকা দিন।",
  },
  currency: { code: "BDT", symbol: "৳" },
  contact: { phone: CONTACT_NUMBER, whatsapp: CONTACT_NUMBER },
  social: {},
  trustHighlights: [
    { icon: "cash", title: "আগে টাকা লাগবে না", text: "ঘড়ি হাতে পেয়ে তারপর টাকা দিন।" },
    { icon: "headset", title: "প্রশ্ন থাকলে কল করুন", text: "কেনার আগে যেকোনো প্রশ্নের উত্তর দেব।" },
    { icon: "box", title: "ডেলিভারি চার্জ আগেই জানবেন", text: "অর্ডারের আগেই মোট খরচ দেখতে পাবেন।" },
  ],
  whyChoose: [
    {
      icon: "seal",
      title: "কোনো লুকানো খরচ নেই",
      text: "যে দাম দেখছেন, সেটাই দেবেন। দরজায় এসে বাড়তি টাকা চাওয়া হবে না।",
    },
    {
      icon: "clock",
      title: "প্রতিটি অর্ডারের নম্বর পাবেন",
      text: "অর্ডার করার সাথে সাথে একটি অর্ডার নম্বর পাবেন, যেটা দিয়ে পরে খোঁজ নিতে পারবেন।",
    },
    {
      icon: "cash",
      title: "হাতে পেয়ে টাকা দিন",
      text: "পার্সেল হাতে পাওয়ার পর কুরিয়ারকে টাকা দিন।",
    },
  ],
  testimonials: [],
  policies: {},
  shippingZones: [
    { id: "inside-dhaka", label: "ঢাকার ভিতরে", fee: 80, active: true },
    { id: "outside-dhaka", label: "ঢাকার বাইরে", fee: 150, active: true },
  ],
  codEnabled: true,
  onlinePaymentEnabled: false,
  show3DPreview: true,
  whatsappMessage: "আসসালামু আলাইকুম, আমি {product} ({variant}) — {quantity}টি অর্ডার করতে চাই।",
  maxQuantityPerOrder: 5,
};
