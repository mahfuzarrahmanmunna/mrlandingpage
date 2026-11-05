import { clearSessionCookie } from "@/lib/auth/session";
import { errorJson, isSameOrigin, json } from "@/lib/http";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return errorJson(403, "Cross-origin request rejected.");
  await clearSessionCookie();
  return json({ ok: true });
}
