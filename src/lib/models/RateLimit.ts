import mongoose, { Schema, type Model } from "mongoose";

type RateLimitDoc = { key: string; count: number; expiresAt: Date };

const RateLimitSchema = new Schema<RateLimitDoc>({
  key: { type: String, required: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

RateLimitSchema.index({ key: 1 }, { unique: true });
// MongoDB TTL monitor removes expired windows automatically.
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimit: Model<RateLimitDoc> =
  (mongoose.models.RateLimit as Model<RateLimitDoc>) || mongoose.model<RateLimitDoc>("RateLimit", RateLimitSchema);
