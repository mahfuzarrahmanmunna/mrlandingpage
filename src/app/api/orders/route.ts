import { after } from "next/server";
import { BadJsonError, PayloadTooLargeError, clientIp, errorJson, hashIp, json, readJson } from "@/lib/http";
import { OrderError, createOrder, recordOrderLead } from "@/lib/orders/service";
import { rateLimit } from "@/lib/rate-limit";
import { revalidateStorefrontSoon } from "@/lib/revalidate";
import { fieldErrors, orderRequestSchema } from "@/lib/validation/order";

const MIN_FILL_MS = 2500;

export async function POST(req: Request) {
  const ipHash = hashIp(clientIp(req));

  const limit = await rateLimit("order", ipHash, { limit: 6, windowSec: 600 });
  if (!limit.allowed) {
    return errorJson(429, "Too many order attempts. Please wait a few minutes or contact us directly.", {
      retryAfter: limit.retryAfterSec,
    });
  }

  let body: unknown;
  try {
    body = await readJson(req, 16_000);
  } catch (err) {
    if (err instanceof PayloadTooLargeError) return errorJson(413, "Request too large.");
    if (err instanceof BadJsonError) return errorJson(400, "Invalid request.");
    throw err;
  }

  const parsed = orderRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(422, "Please check the highlighted fields.", { fields: fieldErrors(parsed.error) });
  }
  const input = parsed.data;

  // Spam heuristics: honeypot filled, or submitted implausibly fast.
  if (input.company || (input.elapsedMs !== undefined && input.elapsedMs < MIN_FILL_MS)) {
    return errorJson(422, "We couldn't verify this submission. Please try again.");
  }

  try {
    const result = await createOrder(input, {
      ipHash,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
    if (result.created) {
      revalidateStorefrontSoon();
      after(() => recordOrderLead(result.confirmation, input, ipHash));
    }
    return json({ ok: true, order: result.confirmation }, { status: result.created ? 201 : 200 });
  } catch (err) {
    if (err instanceof OrderError) {
      return errorJson(err.status, err.message, { code: err.code, ...err.details });
    }
    console.error("[api/orders] unexpected error:", err);
    return errorJson(500, "We couldn't place your order right now. Please try again or contact us.");
  }
}
