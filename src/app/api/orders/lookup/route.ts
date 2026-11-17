import { z } from "zod";
import { clientIp, errorJson, hashIp, json, readJson } from "@/lib/http";
import { lookupOrder } from "@/lib/orders/service";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  orderNumber: z.string().trim().regex(/^MRI-\d{6}-[A-Z0-9]{5}$/),
  token: z.string().trim().min(20).max(100),
});

/** Restores the confirmation after a refresh. Requires the secret token issued with the order. */
export async function POST(req: Request) {
  const ipHash = hashIp(clientIp(req));
  const limit = await rateLimit("order-lookup", ipHash, { limit: 30, windowSec: 600 });
  if (!limit.allowed) return errorJson(429, "অনেকবার চেষ্টা করা হয়েছে।");

  const parsed = schema.safeParse(await readJson(req, 2_000).catch(() => null));
  if (!parsed.success) return errorJson(400, "অনুরোধটি সঠিক নয়।");

  try {
    const order = await lookupOrder(parsed.data.orderNumber, parsed.data.token);
    if (!order) return errorJson(404, "অর্ডার পাওয়া যায়নি।");
    return json({ ok: true, order });
  } catch (err) {
    console.error("[api/orders/lookup]", (err as Error).message);
    return errorJson(503, "এখন পাওয়া যাচ্ছে না।");
  }
}
