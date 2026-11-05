import "server-only";

/** Server-only environment access. Never import this from a client component. */
export const env = {
  get mongoUri() {
    return process.env.MONGODB_URI?.trim() || "";
  },
  get mongoDb() {
    return process.env.MONGODB_DB?.trim() || "mrimperial";
  },
  get authSecret() {
    return process.env.AUTH_SECRET?.trim() || "";
  },
  get ipHashSalt() {
    return process.env.IP_HASH_SALT?.trim() || process.env.AUTH_SECRET?.trim() || "mri";
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
};

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function isDatabaseConfigured() {
  return env.mongoUri.length > 0;
}
