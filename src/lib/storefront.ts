import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { demoProduct, demoSettings } from "@/lib/demo-data";
import { isDatabaseConfigured } from "@/lib/env";
import { loadStorefrontLive } from "@/lib/storefront-live";
import type { Storefront } from "@/lib/types";

export const STOREFRONT_TAG = "storefront";

/**
 * Cached read for the statically generated landing page. Tagged so admin
 * changes and orders (stock) can revalidate it on demand.
 */
export async function getStorefront(): Promise<Storefront> {
  "use cache";
  cacheTag(STOREFRONT_TAG);

  if (!isDatabaseConfigured()) {
    cacheLife("max");
    return { product: demoProduct, settings: demoSettings, connected: false };
  }

  try {
    const data = await loadStorefrontLive();
    cacheLife("max");
    return data;
  } catch (err) {
    // DB unreachable (e.g. a build without network access). Serve the preview
    // briefly and retry soon instead of caching the failure for long.
    console.error("[storefront] failed to load from database:", (err as Error).message);
    cacheLife("minutes");
    return { product: demoProduct, settings: demoSettings, connected: false };
  }
}
