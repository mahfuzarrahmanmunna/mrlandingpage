import "server-only";
import { createHash } from "node:crypto";
import { env, siteUrl } from "@/lib/env";

export function json(data: unknown, init?: ResponseInit & { headers?: Record<string, string> }) {
  return Response.json(data, {
    ...init,
    headers: { "Cache-Control": "no-store", ...(init?.headers ?? {}) },
  });
}

export function errorJson(status: number, message: string, extra?: Record<string, unknown>) {
  return json({ ok: false, error: message, ...extra }, { status });
}

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function hashIp(ip: string) {
  return createHash("sha256").update(`${env.ipHashSalt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * CSRF defence for cookie-authenticated mutations: require a same-origin
 * Origin (or Referer) header. Admin cookies are also SameSite=Strict.
 */
export function isSameOrigin(req: Request) {
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!origin) return false;
  try {
    const o = new URL(origin);
    const self = new URL(req.url);
    const allowed = new Set([self.host]);
    try {
      allowed.add(new URL(siteUrl()).host);
    } catch {}
    const fwdHost = req.headers.get("x-forwarded-host");
    if (fwdHost) allowed.add(fwdHost);
    return allowed.has(o.host);
  } catch {
    return false;
  }
}

export async function readJson(req: Request, maxBytes = 32_000): Promise<unknown> {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > maxBytes) throw new PayloadTooLargeError();
  const text = await req.text();
  if (text.length > maxBytes) throw new PayloadTooLargeError();
  try {
    return JSON.parse(text);
  } catch {
    throw new BadJsonError();
  }
}

export class PayloadTooLargeError extends Error {}
export class BadJsonError extends Error {}
