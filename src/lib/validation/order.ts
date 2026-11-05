import { z } from "zod";
import { normalizeBdPhone } from "@/lib/phone";

const trimmed = (max: number) => z.string().trim().max(max);

export const attributionSchema = z
  .object({
    utm_source: trimmed(120).optional(),
    utm_medium: trimmed(120).optional(),
    utm_campaign: trimmed(160).optional(),
    utm_content: trimmed(160).optional(),
    utm_term: trimmed(160).optional(),
    referrer: trimmed(300).optional(),
    landingPath: trimmed(300).optional(),
  })
  .partial()
  .optional();

/** Fields a customer fills in. Used for inline client validation and on the server. */
export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(80, "Name is too long."),
  phone: z
    .string()
    .trim()
    .min(1, "Please enter your mobile number.")
    .refine((v) => normalizeBdPhone(v) !== null, "Enter a valid Bangladesh mobile number, e.g. 01712345678."),
  address: z
    .string()
    .trim()
    .min(10, "Please enter your full delivery address (house, road, area).")
    .max(300, "Address is too long."),
  city: z
    .string()
    .trim()
    .min(2, "Please enter your district or city.")
    .max(60, "District/city is too long."),
  zoneId: z.string().trim().min(1, "Please choose a delivery area.").max(40),
  email: z
    .union([z.literal(""), z.email("Enter a valid email address.").max(120)])
    .optional(),
  note: trimmed(500).optional(),
});

/**
 * Full order request. Note what is NOT here: price, fee, discount, total, stock or
 * payment status. The server derives all of them.
 */
export const orderRequestSchema = customerSchema.extend({
  productId: z.string().trim().min(1).max(64),
  variantKey: z.string().trim().min(1).max(64),
  quantity: z.coerce.number().int("Quantity must be a whole number.").min(1).max(99),
  paymentMethod: z.enum(["cod", "online"]).default("cod"),
  idempotencyKey: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{16,80}$/, "Invalid request key."),
  attribution: attributionSchema,
  /** honeypot — real users never fill this */
  company: z.string().max(200).optional(),
  /** ms since form became interactive (bot heuristic) */
  elapsedMs: z.coerce.number().int().nonnegative().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type OrderRequest = z.infer<typeof orderRequestSchema>;

export const leadRequestSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizeBdPhone(v) !== null, "Enter a valid Bangladesh mobile number."),
  email: z.union([z.literal(""), z.email("Enter a valid email address.").max(120)]).optional(),
  message: z.string().trim().max(800).optional(),
  interest: trimmed(120).optional(),
  attribution: attributionSchema,
  company: z.string().max(200).optional(),
  elapsedMs: z.coerce.number().int().nonnegative().optional(),
});

export type LeadRequest = z.infer<typeof leadRequestSchema>;

/** Flatten a ZodError into { field: firstMessage } for inline form errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
