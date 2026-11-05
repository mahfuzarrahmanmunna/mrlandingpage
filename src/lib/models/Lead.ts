import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

const LeadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, maxlength: 120 },
    message: { type: String, trim: true, maxlength: 800 },
    interest: { type: String, trim: true, maxlength: 120 },
    source: { type: String, enum: ["enquiry", "order"], default: "enquiry" },
    status: { type: String, enum: LEAD_STATUSES, default: "new", index: true },
    followUpAt: Date,
    followUpNote: { type: String, maxlength: 1000 },
    attribution: {
      utm_source: String,
      utm_medium: String,
      utm_campaign: String,
      utm_content: String,
      utm_term: String,
      referrer: String,
      landingPath: String,
    },
    ipHash: { type: String, select: false },
  },
  { timestamps: true },
);

LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ phone: 1 });

export type LeadDoc = InferSchemaType<typeof LeadSchema> & { _id: mongoose.Types.ObjectId };

export const Lead: Model<LeadDoc> =
  (mongoose.models.Lead as Model<LeadDoc>) || mongoose.model<LeadDoc>("Lead", LeadSchema);
