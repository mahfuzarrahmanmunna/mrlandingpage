import mongoose from "mongoose";
import { withAdmin } from "@/lib/auth/guard";
import { connectDB } from "@/lib/db";
import { errorJson, json, readJson } from "@/lib/http";
import { Lead } from "@/lib/models/Lead";
import { leadUpdateSchema } from "@/lib/validation/admin";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAdmin<Ctx>(async (req, { params }) => {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return errorJson(404, "Lead not found.");
  const parsed = leadUpdateSchema.safeParse(await readJson(req, 4_000).catch(() => null));
  if (!parsed.success) return errorJson(422, parsed.error.issues[0]?.message ?? "Invalid update.");
  const { status, followUpAt, followUpNote } = parsed.data;
  await connectDB();
  const set: Record<string, unknown> = {};
  const unset: Record<string, 1> = {};
  if (status) set.status = status;
  if (followUpNote !== undefined) set.followUpNote = followUpNote;
  if (followUpAt === "") unset.followUpAt = 1;
  else if (followUpAt) set.followUpAt = new Date(followUpAt);
  const lead = await Lead.findByIdAndUpdate(
    id,
    { ...(Object.keys(set).length ? { $set: set } : {}), ...(Object.keys(unset).length ? { $unset: unset } : {}) },
    { returnDocument: "after" },
  ).lean();
  if (!lead) return errorJson(404, "Lead not found.");
  return json({ ok: true, lead });
});
