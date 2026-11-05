import { errorJson, json } from "@/lib/http";
import { loadStorefrontLive } from "@/lib/storefront-live";

/** Live public product + settings (fresh stock/price). Used by the client before checkout. */
export async function GET() {
  try {
    const { product, settings, connected } = await loadStorefrontLive();
    if (!product) return errorJson(404, "No product is currently available.");
    return json({ ok: true, connected, product, settings });
  } catch (err) {
    console.error("[api/product]", (err as Error).message);
    return errorJson(503, "Product information is temporarily unavailable.");
  }
}
