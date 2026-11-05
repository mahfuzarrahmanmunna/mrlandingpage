import { describe, expect, it } from "vitest";
import { normalizeBdPhone } from "@/lib/phone";

describe("normalizeBdPhone", () => {
  it.each([
    ["01712345678", "01712345678"],
    ["+8801712345678", "01712345678"],
    ["8801712345678", "01712345678"],
    ["017-1234-5678", "01712345678"],
    ["017 1234 5678", "01712345678"],
    ["01312345678", "01312345678"],
  ])("accepts %s", (input, out) => expect(normalizeBdPhone(input)).toBe(out));

  it.each(["0171234567", "017123456789", "01212345678", "1712345678", "abc", "", "+1 555 123 4567"])(
    "rejects %s",
    (input) => expect(normalizeBdPhone(input)).toBeNull(),
  );
});
