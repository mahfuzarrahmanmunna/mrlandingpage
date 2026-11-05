import "server-only";
import { errorJson, isSameOrigin } from "@/lib/http";
import { getAdmin, type AdminIdentity } from "./session";

/**
 * Wraps an admin Route Handler: enforces authentication on every request and
 * same-origin on every mutation. Returns 401/403 JSON instead of redirecting.
 */
export function withAdmin<Ctx>(
  handler: (req: Request, ctx: Ctx, admin: AdminIdentity) => Promise<Response>,
  opts: { ownerOnly?: boolean } = {},
) {
  return async (req: Request, ctx: Ctx) => {
    if (req.method !== "GET" && req.method !== "HEAD" && !isSameOrigin(req)) {
      return errorJson(403, "Cross-origin request rejected.");
    }
    const admin = await getAdmin();
    if (!admin) return errorJson(401, "Not authenticated.");
    if (opts.ownerOnly && admin.role !== "owner") return errorJson(403, "Owner permission required.");
    return handler(req, ctx, admin);
  };
}
