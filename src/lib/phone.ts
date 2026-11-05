/**
 * Bangladesh mobile numbers: 01[3-9]XXXXXXXX (11 digits).
 * Accepts +8801…, 8801…, 01…, with spaces/dashes. Returns canonical 01XXXXXXXXX or null.
 */
export function normalizeBdPhone(input: string): string | null {
  let digits = input.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return null;
  if (digits.startsWith("880")) digits = digits.slice(2);
  else if (digits.startsWith("00880")) digits = digits.slice(4);
  if (!/^01[3-9]\d{8}$/.test(digits)) return null;
  return digits;
}

export function isBdPhone(input: string) {
  return normalizeBdPhone(input) !== null;
}
