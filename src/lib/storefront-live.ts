import { connectDB } from "@/lib/db";
import { demoProduct, demoSettings } from "@/lib/demo-data";
import { Product } from "@/lib/models/Product";
import { SiteSettings } from "@/lib/models/SiteSettings";
import { toPublicProduct, toPublicSettings } from "@/lib/projections";
import type { PublicSettings, Storefront } from "@/lib/types";

/** Settings shown when the DB is connected but the owner has not saved settings yet. */
export const unconfiguredSettings: PublicSettings = {
  ...demoSettings,
  shippingZones: [],
  trustHighlights: [],
  whyChoose: [],
};

/**
 * Uncached read used by API routes and the order service, which must always
 * see live data (stock, price, fees).
 */
export async function loadStorefrontLive(): Promise<Storefront> {
  if (!process.env.MONGODB_URI) {
    return { product: demoProduct, settings: demoSettings, connected: false };
  }
  await connectDB();
  const [settingsDoc, productDoc] = await Promise.all([
    SiteSettings.findOne({ key: "main" }).lean(),
    Product.findOne({ status: "active" }).sort({ featured: -1, updatedAt: -1 }).lean(),
  ]);
  return {
    product: productDoc ? toPublicProduct(productDoc) : null,
    settings: settingsDoc ? toPublicSettings(settingsDoc) : unconfiguredSettings,
    connected: true,
  };
}
