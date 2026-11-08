import { connectDB } from "@/lib/db";
import { BadJsonError, PayloadTooLargeError, clientIp, errorJson, hashIp, json, readJson } from "@/lib/http";
import { Lead } from "@/lib/models/Lead";
import { normalizeBdPhone } from "@/lib/phone";
import { rateLimit } from "@/lib/rate-limit";
import { fieldErrors, leadRequestSchema } from "@/lib/validation/order";

export async function POST(req: Request) {
  const ipHash = hashIp(clientIp(req));
  const limit = await rateLimit("lead", ipHash, { limit: 5, windowSec: 600 });
  if (!limit.allowed) return errorJson(429, "Too many requests. Please try again later.");

  let body: unknown;
  try {
    body = await readJson(req, 8_000);
  } catch (err) {
    if (err instanceof PayloadTooLargeError) return errorJson(413, "Request too large.");
    if (err instanceof BadJsonError) return errorJson(400, "Invalid request.");
    throw err;
  }

  const parsed = leadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(422, "Please check the highlighted fields.", { fields: fieldErrors(parsed.error) });
  }
  const input = parsed.data;
  if (input.company || (input.elapsedMs !== undefined && input.elapsedMs < 1500)) {
    return errorJson(422, "আপনার অনুরোধটি যাচাই করা যায়নি। কয়েক সেকেন্ড পর আবার চেষ্টা করুন।");
  }
  if (!process.env.MONGODB_URI) {
    return errorJson(503, "Enquiries are not available yet. Please contact us directly.");
  }

  try {
    await connectDB();
    await Lead.create({
      name: input.name,
      phone: normalizeBdPhone(input.phone) ?? input.phone,
      ...(input.email ? { email: input.email } : {}),
      ...(input.message ? { message: input.message } : {}),
      ...(input.interest ? { interest: input.interest } : {}),
      source: "enquiry",
      attribution: input.attribution ?? {},
      ipHash,
    });
    return json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[api/leads]", (err as Error).message);
    return errorJson(500, "We couldn't send your enquiry. Please try again.");
  }
}
