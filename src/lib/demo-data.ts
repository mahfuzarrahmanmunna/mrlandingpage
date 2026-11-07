/**
 * PREVIEW CONTENT — NOT REAL PRODUCT DATA.
 *
 * Used when the database is not connected, and by `npm run seed` to create a
 * starting product the owner then edits in /admin. Product imagery and listed
 * specifications are supplied examples; seller-dependent details and price
 * still need confirmation before the product is published.
 *
 * Deliberately left empty (owner must supply): phone, WhatsApp, warranty,
 * water resistance, return policy, testimonials, ratings, announcement.
 */
import type { PublicProduct, PublicSettings } from "./types";

const img = (file: string, alt: string) => ({
  url: `/images/${file}`,
  alt,
  placeholder: false,
});

export const demoProduct: PublicProduct & { status: "active" } = {
  id: "demo",
  slug: "poedagar-930",
  title: "POEDAGAR 930",
  tagline: "Premium Men's Business Watch — একটি ঘড়ি, আপনার প্রতিদিনের স্টাইলে নতুন মাত্রা!",
  description: [
    "POEDAGAR 930 একটি স্টাইলিশ Men's Fashion Watch — Business, Office, Casual এবং Party Wear-এর সঙ্গে মানানসই। আপনার ব্যক্তিত্বে যোগ করুন স্মার্টনেস ও আভিজাত্যের ছোঁয়া!",
    "প্রধান ফিচারসমূহ:\n• Premium-looking Stainless Steel Bracelet\n• Stylish Round Dial Design\n• Quartz Battery Movement\n• Day & Date Display\n• Luminous Hands\n• Mineral Reinforced Glass\n• Adjustable Stainless Steel Strap with Butterfly Clasp\n• 3 ATM Splash Resistance\n• Elegant Business & Casual Look",
    "Perfect For:\n• Office & Business Meetings\n• Daily Wear\n• Casual Outfits\n• Birthday & Special Gifts",
    "Water Resistance (3 ATM / 30 m): ঘাম, হালকা বৃষ্টি ও সাধারণ পানির ছিটা সাধারণত ঠিক আছে। হাত ধোয়ার সময় খুলে রাখা ভালো। গোসল, সুইমিং ও ডাইভিং — না। 3 ATM মানে ৩০ মিটার পানির নিচে ব্যবহারযোগ্য নয়।",
    "দ্রষ্টব্য: বিভিন্ন বিক্রেতার স্পেসিফিকেশনে Case Material, Glass ও Band Width নিয়ে অমিল রয়েছে; চূড়ান্ত তথ্য হাতে আসা ব্যাচ অনুযায়ী।",
    "একটি ঘড়ি, আপনার প্রতিদিনের স্টাইলে নতুন মাত্রা!",
  ].join("\n\n"),
  price: 8900,
  sku: "POE-930",
  images: [
    img("poydagar-blue.jpeg", "POEDAGAR 930 with blue dial"),
    img("poydagar-white.jpeg", "POEDAGAR 930 with white dial"),
    img("poydagar-black.jpeg", "POEDAGAR 930 with black dial"),
    img("poydagar-green.jpeg", "POEDAGAR 930 with green dial"),
    img("poydagar-golden.jpeg", "POEDAGAR 930 with gold case and gold dial"),
    img("product-parameters.jpeg", "Supplier-listed POEDAGAR 930 size and product specifications"),
    img("water-proof-display.jpeg", "POEDAGAR 930 3 ATM water resistance guide"),
  ],
  specs: {
    brand: "POEDAGAR",
    model: "930",
    sku: "POE-930",
    powerSource: "Battery",
    caseShape: "Round",
    dialSize: "41.5 mm",
    caseThickness: "প্রায় 11 mm",
    caseMaterial: "Alloy",
    strapMaterial: "Stainless steel",
    bandLength: "প্রায় 230 mm",
    bandWidth: "22–26 mm (তালিকা অনুযায়ী)",
    clasp: "Butterfly double snap clasp (stainless steel)",
    movement: "Quartz (SL28)",
    display: "Analog (pointer)",
    calendar: "Day & Date",
    luminous: "হ্যাঁ (তালিকাভুক্ত)",
    waterResistance: "3 ATM / 30 m — ছিটা সহনীয়; সাঁতার নয়",
    glass: "Mineral reinforced glass",
    origin: "China (Guangdong)",
    warranty: "Store warranty",
    dialColor: "Blue / white / black / green / gold",
    color: "Blue, white, black, green and gold variants",
  },
  videoUrl: "/video/poydagar-video.mp4",
  variantLabel: "Dial colour",
  variants: [
    {
      key: "blue",
      name: "Blue",
      sku: "POE-930-BLU",
      price: 8900,
      stock: 12,
      swatch: "#1d5b7a",
      images: [
        img("poydagar-blue.jpeg", "POEDAGAR 930 with blue dial"),
        img("product-parameters.jpeg", "Supplier-listed POEDAGAR 930 size and product specifications"),
        img("water-proof-display.jpeg", "POEDAGAR 930 3 ATM water resistance guide"),
      ],
      available: true,
    },
    {
      key: "white",
      name: "White",
      sku: "POE-930-WHT",
      price: 9400,
      stock: 6,
      swatch: "#dedbd4",
      images: [
        img("poydagar-white.jpeg", "POEDAGAR 930 with white dial"),
        img("product-parameters.jpeg", "Supplier-listed POEDAGAR 930 size and product specifications"),
        img("water-proof-display.jpeg", "POEDAGAR 930 3 ATM water resistance guide"),
      ],
      available: true,
    },
    {
      key: "black",
      name: "Black",
      sku: "POE-930-BLK",
      price: 10900,
      stock: 0,
      swatch: "#252525",
      images: [
        img("poydagar-black.jpeg", "POEDAGAR 930 with black dial"),
        img("product-parameters.jpeg", "Supplier-listed POEDAGAR 930 size and product specifications"),
        img("water-proof-display.jpeg", "POEDAGAR 930 3 ATM water resistance guide"),
      ],
      available: false,
    },
    {
      // Steel case, green dial, steel bracelet. Placeholder price/stock: set the
      // real price and stock in /admin/product before selling it.
      key: "green",
      name: "Green",
      sku: "POE-930-GRN",
      price: 8900,
      stock: 0,
      swatch: "#1f7a6e",
      images: [
        img("poydagar-green.jpeg", "POEDAGAR 930 with green dial"),
        img("product-parameters.jpeg", "Supplier-listed POEDAGAR 930 size and product specifications"),
        img("water-proof-display.jpeg", "POEDAGAR 930 3 ATM water resistance guide"),
      ],
      available: false,
    },
    {
      // Gold case, gold dial, gold bracelet. Placeholder price/stock: set the
      // real price and stock in /admin/product before selling it.
      key: "gold",
      name: "Gold",
      sku: "POE-930-GLD",
      price: 8900,
      stock: 0,
      swatch: "#c9a45c",
      images: [
        img("poydagar-golden.jpeg", "POEDAGAR 930 with gold case and gold dial"),
        img("product-parameters.jpeg", "Supplier-listed POEDAGAR 930 size and product specifications"),
        img("water-proof-display.jpeg", "POEDAGAR 930 3 ATM water resistance guide"),
      ],
      available: false,
    },
  ],
  highlights: ["41.5 mm কেস", "Quartz movement", "Day & Date", "3 ATM splash resistance"],
  seo: {},
  isDemo: true,
  status: "active",
};

export const demoSettings: PublicSettings = {
  brandName: "MR Imperial",
  hero: {
    eyebrow: "POEDAGAR 930",
    subheadline: "কোয়ার্টজ মুভমেন্ট, Day & Date ডিসপ্লে এবং Stainless Steel ব্রেসলেট।",
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
