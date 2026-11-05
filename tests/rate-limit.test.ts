import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit (memory fallback)", () => {
  it("allows up to the limit then blocks", async () => {
    delete process.env.MONGODB_URI;
    const id = `t-${Math.random()}`;
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await rateLimit("test", id, { limit: 3, windowSec: 60 }));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
    expect(results[3]!.retryAfterSec).toBeGreaterThan(0);
  });
});
