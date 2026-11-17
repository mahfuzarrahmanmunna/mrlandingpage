export function formatMoney(amount: number, currency: { code: string; symbol: string }) {
  const n = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(amount);
  return `${currency.symbol}${n}`;
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** ASCII digits → Bangla digits ("8,900" → "৮,৯০০"). */
export function bn(value: string | number) {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]!);
}

/** Money for the customer-facing site, with Bangla digits ("৳৮,৯০০"). */
export function bnMoney(amount: number, currency: { code: string; symbol: string }) {
  return bn(formatMoney(amount, currency));
}

/** Date & time in Bangla ("১৫ নভেম্বর, ২০২৬, ৩:২০ PM" style, Dhaka time). */
export function bnDateTime(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  }).format(d);
}

export function formatDateTime(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  }).format(d);
}

/** wa.me requires digits only, including country code. */
export function whatsappHref(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function telHref(number: string) {
  const cleaned = number.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : null;
}

export function fillTemplate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : ""));
}
