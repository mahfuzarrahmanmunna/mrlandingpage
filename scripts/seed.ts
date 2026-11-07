/**
 * Seeds PREVIEW content: one demo product (flagged isDemo)
 * and default settings. Never overwrites existing data unless --force is given.
 *
 *   npm run seed            # insert only what is missing
 *   npm run seed -- --force # replace product + settings with preview content
 */
import { connectDB, disconnectDB } from "../src/lib/db";
import { demoProduct, demoSettings } from "../src/lib/demo-data";
import { Product } from "../src/lib/models/Product";
import { SiteSettings } from "../src/lib/models/SiteSettings";

async function main() {
  const force = process.argv.includes("--force");
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set (add it to .env.local)");
  await connectDB();
  await Promise.all([Product.syncIndexes(), SiteSettings.syncIndexes()]);

  const { id: _id, ...product } = demoProduct;
  const productDoc = {
    ...product,
    variants: product.variants.map(({ available: _a, ...v }) => ({ ...v, active: true, lowStockThreshold: 3 })),
    featured: true,
  };

  const existingProduct = await Product.countDocuments();
  if (existingProduct === 0 || force) {
    if (force) await Product.deleteMany({});
    await Product.create(productDoc);
    console.log("✓ Preview product created (marked as demo — replace it in /admin/product).");
  } else {
    console.log("• Product already exists — skipped (use --force to replace).");
  }

  const existingSettings = await SiteSettings.countDocuments({ key: "main" });
  if (existingSettings === 0 || force) {
    await SiteSettings.findOneAndUpdate({ key: "main" }, { $set: { key: "main", ...demoSettings } }, { upsert: true });
    console.log("✓ Settings created. Set real contact numbers, delivery fees and policies in /admin/settings.");
  } else {
    console.log("• Settings already exist — skipped.");
  }
  await disconnectDB();
}

main().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
