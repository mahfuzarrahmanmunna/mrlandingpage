import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { AdminUser } from "@/lib/models/AdminUser";
import { SESSION_COOKIE, SESSION_TTL_SEC, signSession, verifySession } from "./token";

export type AdminIdentity = { id: string; email: string; name: string; role: "owner" | "staff" };

export async function setSessionCookie(user: { id: string; sessionVersion: number; role: "owner" | "staff" }) {
  const token = await signSession({ sub: user.id, v: user.sessionVersion, role: user.role });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * Authoritative check (Data Access Layer). Verifies the signature AND that the
 * user still exists, is active, and the session version matches (so password
 * changes / deactivation revoke sessions immediately).
 */
export async function getAdmin(): Promise<AdminIdentity | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = await verifySession(token).catch(() => null);
  if (!payload) return null;
  try {
    await connectDB();
    const user = await AdminUser.findById(payload.sub).lean();
    if (!user || !user.active || user.sessionVersion !== payload.v) return null;
    return { id: String(user._id), email: user.email, name: user.name ?? "Admin", role: user.role ?? "owner" };
  } catch {
    return null;
  }
}

/** For admin pages: redirect to login when not authenticated. */
export async function requireAdminPage(): Promise<AdminIdentity> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
