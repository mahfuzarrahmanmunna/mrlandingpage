/**
 * Signed admin session tokens (HS256 JWT via `jose`). Edge-safe: used by both
 * proxy.ts (optimistic redirect) and the server data-access layer (authoritative).
 */
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "mri_admin";
export const SESSION_TTL_SEC = 60 * 60 * 8; // 8 hours

export type SessionPayload = { sub: string; v: number; role: "owner" | "staff" };

function key(secret = process.env.AUTH_SECRET) {
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload, secret?: string) {
  return new SignJWT({ v: payload.v, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setIssuer("mr-imperial")
    .setAudience("mr-imperial-admin")
    .setExpirationTime(`${SESSION_TTL_SEC}s`)
    .sign(key(secret));
}

export async function verifySession(token: string | undefined, secret?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(secret), {
      issuer: "mr-imperial",
      audience: "mr-imperial-admin",
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string" || typeof payload.v !== "number") return null;
    return { sub: payload.sub, v: payload.v, role: payload.role === "staff" ? "staff" : "owner" };
  } catch {
    return null;
  }
}
