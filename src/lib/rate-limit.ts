import { connectDB } from "@/lib/db";
import { RateLimit } from "@/lib/models/RateLimit";

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSec: number };

const memory = new Map<string, { count: number; resetAt: number }>();

function memoryHit(key: string, limit: number, windowMs: number, now: number): RateLimitResult {
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    if (memory.size > 5000) {
      for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
    }
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  entry.count += 1;
  const allowed = entry.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSec: allowed ? 0 : Math.ceil((entry.resetAt - now) / 1000),
  };
}

/**
 * Fixed-window limiter. Uses MongoDB (shared across serverless instances, TTL
 * cleaned) when available, falling back to per-instance memory.
 */
export async function rateLimit(
  bucket: string,
  id: string,
  { limit, windowSec }: { limit: number; windowSec: number },
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = `${bucket}:${id}:${windowStart}`;

  if (!process.env.MONGODB_URI) return memoryHit(key, limit, windowMs, now);

  try {
    await connectDB();
    const doc = await RateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(windowStart + windowMs) } },
      { upsert: true, new: true, projection: { count: 1 } },
    ).lean();
    const count = doc?.count ?? 1;
    const allowed = count <= limit;
    return {
      allowed,
      remaining: Math.max(0, limit - count),
      retryAfterSec: allowed ? 0 : Math.ceil((windowStart + windowMs - now) / 1000),
    };
  } catch {
    return memoryHit(key, limit, windowMs, now);
  }
}
