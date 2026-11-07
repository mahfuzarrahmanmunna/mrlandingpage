import { withAdmin } from "@/lib/auth/guard";
import { connectDB } from "@/lib/db";
import { errorJson, json, readJson } from "@/lib/http";
import { Product } from "@/lib/models/Product";
import { revalidateStorefrontNow } from "@/lib/revalidate";
import { fieldErrors } from "@/lib/validation/order";
import { productSchema } from "@/lib/validation/admin";

/** The storefront sells one featured product; admin edits that document. */
export const GET = withAdmin(async () => {
  await connectDB();
  const product = await Product.findOne().sort({ featured: -1, updatedAt: -1 }).lean();
  return json({ ok: true, product: product ? { ...product, _id: String(product._id) } : null });
});

export const PUT = withAdmin(async (req) => {
  const parsed = productSchema.safeParse(await readJson(req, 200_000).catch(() => null));
  if (!parsed.success) {
    return errorJson(422, "Please fix the highlighted fields.", { fields: fieldErrors(parsed.error) });
  }
  const data = parsed.data;
  await connectDB();

  const clean = {
    ...data,
    compareAtPrice: data.compareAtPrice ?? undefined,
    videoUrl: data.videoUrl || undefined,
    modelUrl: data.modelUrl || undefined,
    variants: data.variants.map((v) => ({ ...v, compareAtPrice: v.compareAtPrice ?? undefined, swatch: v.swatch || undefined })),
    highlights: data.highlights.filter(Boolean),
    featured: true,
  };

  const existing = await Product.findOne().sort({ featured: -1, updatedAt: -1 }).select("_id").lean();
  try {
    const saved = existing
      ? await Product.findByIdAndUpdate(
          existing._id,
          {
            $set: clean,
            $unset: {
              ...(clean.compareAtPrice === undefined ? { compareAtPrice: 1 } : {}),
              ...(clean.videoUrl ? {} : { videoUrl: 1 }),
              ...(clean.modelUrl ? {} : { modelUrl: 1 }),
            },
          },
          { returnDocument: "after", runValidators: true },
        ).lean()
      : (await Product.create(clean)).toObject();
    revalidateStorefrontNow();
    return json({ ok: true, product: saved ? { ...saved, _id: String(saved._id) } : null });
  } catch (err) {
    const e = err as { code?: number; message?: string };
    if (e.code === 11000) return errorJson(409, "That slug is already used by another product.", { fields: { slug: "Slug already in use." } });
    console.error("[admin/product]", e.message);
    return errorJson(500, "Could not save the product.");
  }
});
