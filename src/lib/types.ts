/**
 * Shared, serialisable shapes used across server and client.
 * These are the PUBLIC projections — never add private/admin-only fields here.
 */

export type ProductImage = {
  url: string;
  alt: string;
  /** true when the image is a stand-in that must be replaced with real photography */
  placeholder?: boolean;
  width?: number;
  height?: number;
};

export type SpecKey =
  | "brand"
  | "model"
  | "sku"
  | "dialSize"
  | "caseMaterial"
  | "caseThickness"
  | "strapMaterial"
  | "movement"
  | "waterResistance"
  | "glass"
  | "dialColor"
  | "color"
  | "warranty";

export type ProductSpecs = Partial<Record<SpecKey, string>>;

export type PublicVariant = {
  key: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  swatch?: string;
  images: ProductImage[];
  available: boolean;
};

export type PublicProduct = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  images: ProductImage[];
  modelUrl?: string;
  specs: ProductSpecs;
  variants: PublicVariant[];
  variantLabel: string;
  highlights: string[];
  seo: { title?: string; description?: string; ogImage?: string };
  isDemo: boolean;
};

export type IconName =
  | "truck"
  | "shield"
  | "seal"
  | "headset"
  | "box"
  | "return"
  | "cash"
  | "clock"
  | "spark";

export type Highlight = { icon: IconName; title: string; text: string };

export type ShippingZone = {
  id: string;
  label: string;
  fee: number;
  description?: string;
  active: boolean;
};

export type Testimonial = { name: string; location?: string; text: string; approved: boolean };

export type SocialLinks = Partial<Record<"facebook" | "instagram" | "tiktok" | "youtube", string>>;

export type PublicSettings = {
  brandName: string;
  logoUrl?: string;
  announcement?: string;
  hero: { eyebrow: string; headline?: string; subheadline: string };
  currency: { code: string; symbol: string };
  contact: { phone?: string; whatsapp?: string; email?: string; address?: string; hours?: string };
  social: SocialLinks;
  trustHighlights: Highlight[];
  whyChoose: Highlight[];
  testimonials: Testimonial[];
  policies: { shipping?: string; returns?: string; warranty?: string; privacy?: string };
  shippingZones: ShippingZone[];
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  show3DPreview: boolean;
  whatsappMessage: string;
  maxQuantityPerOrder: number;
};

export type Storefront = {
  product: PublicProduct | null;
  settings: PublicSettings;
  /** false when MONGODB_URI is missing/unreachable and preview content is shown */
  connected: boolean;
};

export type OrderConfirmation = {
  orderNumber: string;
  accessToken: string;
  createdAt: string;
  items: { title: string; variantName: string; sku: string; quantity: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  currency: { code: string; symbol: string };
  deliveryZone: string;
  paymentMethod: "cod" | "online";
  paymentStatus: string;
  status: string;
  customerName: string;
};
