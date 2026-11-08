import { after } from "next/server";
import { BadJsonError, PayloadTooLargeError, clientIp, errorJson, hashIp, json, readJson } from "@/lib/http";
import { OrderError, createOrder, recordOrderLead } from "@/lib/orders/service";
import { rateLimit } from "@/lib/rate-limit";
import { revalidateStorefrontSoon } from "@/lib/revalidate";
import { fieldErrors, orderRequestSchema } from "@/lib/validation/order";

/** Humans (even with autofill) need longer than this from page load to submit. */
const MIN_FILL_MS = 1500;

export async function POST(req: Request) {
  const ipHash = hashIp(clientIp(req));

  // Start the (database-backed) rate-limit check while the body is read and validated.
  const limitPromise = rateLimit("order", ipHash, { limit: 6, windowSec: 600 });
  // Avoid an unhandled rejection if we return early below; rateLimit itself never throws.
  limitPromise.catch(() => {});

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
  const honeypot = Boolean(input.company);
  const tooFast = input.elapsedMs !== undefined && input.elapsedMs < MIN_FILL_MS;
  if (honeypot || tooFast) {
    console.warn(`[api/orders] rejected as spam (${honeypot ? "honeypot" : `fast:${input.elapsedMs}ms`})`);
    return errorJson(422, "আপনার অর্ডারটি যাচাই করা যায়নি। কয়েক সেকেন্ড পর আবার চেষ্টা করুন অথবা আমাদের কল করুন।", {
      code: "SUBMISSION_UNVERIFIED",
    });
  }

  // The rate limit is checked in parallel with the order's read-only lookups and
  // enforced before any stock is reserved or an order is written.
  const gate = limitPromise.then((limit) => {
    if (!limit.allowed) {
      throw new OrderError(
        "RATE_LIMITED",
        "অনেকবার চেষ্টা করা হয়েছে। কয়েক মিনিট পর আবার চেষ্টা করুন অথবা সরাসরি আমাদের কল করুন।",
        429,
        { retryAfter: limit.retryAfterSec },
      );
    }
  });
  gate.catch(() => {});

  try {
    const result = await createOrder(input, {
      ipHash,
      userAgent: req.headers.get("user-agent") ?? undefined,
      beforeWrite: gate,
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
