import { beforeEach, describe, expect, it, vi } from "vitest";
import { signSession, verifySession } from "@/lib/auth/token";

const SECRET = "x".repeat(40);

describe("session tokens", () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = SECRET;
  });

  it("round-trips a signed session", async () => {
    const token = await signSession({ sub: "u1", v: 3, role: "owner" });
    expect(await verifySession(token)).toEqual({ sub: "u1", v: 3, role: "owner" });
  });

  it("rejects tampered tokens and wrong secrets", async () => {
    const token = await signSession({ sub: "u1", v: 1, role: "staff" });
    const [h, p, s] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ sub: "admin", v: 1, role: "owner" })).toString("base64url");
    expect(await verifySession(`${h}.${forged}.${s}`)).toBeNull();
    expect(await verifySession(token, "y".repeat(40))).toBeNull();
    expect(await verifySession(undefined)).toBeNull();
    expect(await verifySession(`${h}.${p}`)).toBeNull();
  });

  it("refuses a short secret", async () => {
    await expect(signSession({ sub: "u", v: 1, role: "owner" }, "short")).rejects.toThrow();
  });
});

const getAdmin = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getAdmin: () => getAdmin() }));

describe("withAdmin guard", () => {
  it("enforces authentication, same-origin and owner role", async () => {
    const { withAdmin } = await import("@/lib/auth/guard");
    const handler = vi.fn(async () => Response.json({ ok: true }));
    const route = withAdmin(handler);
    const ownerOnly = withAdmin(handler, { ownerOnly: true });

    getAdmin.mockResolvedValue(null);
    expect((await route(new Request("http://localhost/api/admin/x"), {})).status).toBe(401);

    const crossOrigin = new Request("http://localhost/api/admin/x", { method: "PUT", headers: { origin: "https://evil.example" } });
    getAdmin.mockResolvedValue({ id: "1", email: "a@b.c", name: "A", role: "owner" });
    expect((await route(crossOrigin, {})).status).toBe(403);

    const noOrigin = new Request("http://localhost/api/admin/x", { method: "PUT" });
    expect((await route(noOrigin, {})).status).toBe(403);

    const sameOrigin = () => new Request("http://localhost/api/admin/x", { method: "PUT", headers: { origin: "http://localhost" } });
    getAdmin.mockResolvedValue({ id: "1", email: "s@b.c", name: "S", role: "staff" });
    expect((await ownerOnly(sameOrigin(), {})).status).toBe(403);

    getAdmin.mockResolvedValue({ id: "1", email: "a@b.c", name: "A", role: "owner" });
    expect((await ownerOnly(sameOrigin(), {})).status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
