import { connectDB } from "@/lib/db";
import { clientIp, errorJson, hashIp, isSameOrigin, json, readJson } from "@/lib/http";
import { AdminUser } from "@/lib/models/AdminUser";
import { dummyHash, verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation/admin";

const LOCK_AFTER = 5;
const LOCK_MINUTES = 15;
const GENERIC = "Incorrect email or password.";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return errorJson(403, "Cross-origin request rejected.");
  if (!process.env.MONGODB_URI || !process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    return errorJson(503, "Admin is not configured. Set MONGODB_URI and AUTH_SECRET (32+ chars).");
  }

  const ipHash = hashIp(clientIp(req));
  const limit = await rateLimit("login", ipHash, { limit: 10, windowSec: 900 });
  if (!limit.allowed) return errorJson(429, "Too many attempts. Try again later.", { retryAfter: limit.retryAfterSec });

  const parsed = loginSchema.safeParse(await readJson(req, 2_000).catch(() => null));
  if (!parsed.success) return errorJson(400, GENERIC);
  const { email, password } = parsed.data;

  await connectDB();
  const user = await AdminUser.findOne({ email: email.toLowerCase() }).select("+passwordHash");

  if (!user || !user.active) {
    await verifyPassword(password, await dummyHash()); // equalise timing
    return errorJson(401, GENERIC);
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return errorJson(423, "This account is temporarily locked after repeated failed attempts. Try again later.");
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    const attempts = (user.failedAttempts ?? 0) + 1;
    await AdminUser.updateOne(
      { _id: user._id },
      {
        $set: {
          failedAttempts: attempts >= LOCK_AFTER ? 0 : attempts,
          ...(attempts >= LOCK_AFTER ? { lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) } : {}),
        },
      },
    );
    return errorJson(401, GENERIC);
  }

  await AdminUser.updateOne({ _id: user._id }, { $set: { failedAttempts: 0, lastLoginAt: new Date() }, $unset: { lockedUntil: 1 } });
  await setSessionCookie({ id: String(user._id), sessionVersion: user.sessionVersion ?? 1, role: user.role ?? "owner" });
  return json({ ok: true });
}
