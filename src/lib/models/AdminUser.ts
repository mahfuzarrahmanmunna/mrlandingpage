import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AdminUserSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    name: { type: String, trim: true, maxlength: 80, default: "Admin" },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["owner", "staff"], default: "owner" },
    active: { type: Boolean, default: true },
    /** bumped on password change / forced logout; embedded in session tokens */
    sessionVersion: { type: Number, default: 1 },
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    lastLoginAt: Date,
  },
  { timestamps: true },
);

AdminUserSchema.index({ email: 1 }, { unique: true });

export type AdminUserDoc = InferSchemaType<typeof AdminUserSchema> & { _id: mongoose.Types.ObjectId };

export const AdminUser: Model<AdminUserDoc> =
  (mongoose.models.AdminUser as Model<AdminUserDoc>) ||
  mongoose.model<AdminUserDoc>("AdminUser", AdminUserSchema);
