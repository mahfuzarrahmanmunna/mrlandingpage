/** Client-side capture of UTM parameters + referrer, sanitised and kept per session. */
const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const STORAGE_KEY = "mri:attribution";

export type Attribution = Partial<Record<(typeof KEYS)[number] | "referrer" | "landingPath", string>>;

const clean = (v: string, max: number) =>
  v
    .replace(/[^\p{L}\p{N}\s._\-+/:]/gu, "")
    .trim()
    .slice(0, max);

export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Attribution;
  } catch {}

  const out: Attribution = {};
  const params = new URLSearchParams(window.location.search);
  for (const k of KEYS) {
    const v = params.get(k);
    if (v) out[k] = clean(v, 160);
  }
  if (document.referrer) {
    try {
      const ref = new URL(document.referrer);
      // Keep origin + path only: query strings can carry personal data.
      if (ref.host !== window.location.host) out.referrer = clean(`${ref.origin}${ref.pathname}`, 300);
    } catch {}
  }
  out.landingPath = clean(window.location.pathname, 300) || "/";
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(out));
  } catch {}
  return out;
}
