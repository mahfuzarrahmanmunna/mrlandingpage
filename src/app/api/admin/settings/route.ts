import { withAdmin } from "@/lib/auth/guard";
import { connectDB } from "@/lib/db";
import { errorJson, json, readJson } from "@/lib/http";
import { SiteSettings } from "@/lib/models/SiteSettings";
import { revalidateStorefrontNow } from "@/lib/revalidate";
import { fieldErrors } from "@/lib/validation/order";
import { settingsSchema } from "@/lib/validation/admin";

export const GET = withAdmin(async () => {
  await connectDB();
  const settings = await SiteSettings.findOne({ key: "main" }).lean();
  return json({ ok: true, settings });
});

export const PUT = withAdmin(
  async (req) => {
    const parsed = settingsSchema.safeParse(await readJson(req, 100_000).catch(() => null));
    if (!parsed.success) {
      return errorJson(422, "Please fix the highlighted fields.", { fields: fieldErrors(parsed.error) });
    }
    await connectDB();
    const saved = await SiteSettings.findOneAndUpdate(
      { key: "main" },
      { $set: { ...parsed.data, key: "main" } },
      { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    revalidateStorefrontNow();
    return json({ ok: true, settings: saved });
  },
  { ownerOnly: true },
);
