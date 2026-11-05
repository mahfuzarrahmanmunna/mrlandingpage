import "server-only";
import { revalidateTag } from "next/cache";
import { STOREFRONT_TAG } from "@/lib/storefront";

/** After admin edits: expire immediately so the owner sees the change on next load. */
export function revalidateStorefrontNow() {
  revalidateTag(STOREFRONT_TAG, { expire: 0 });
}

/** After orders (stock changes): stale-while-revalidate is fine; the server enforces stock. */
export function revalidateStorefrontSoon() {
  revalidateTag(STOREFRONT_TAG, "max");
}
