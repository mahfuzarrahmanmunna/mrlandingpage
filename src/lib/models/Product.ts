import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true, maxlength: 600 },
    alt: { type: String, required: true, trim: true, maxlength: 200 },
    placeholder: { type: Boolean, default: false },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
  },
  { _id: false },
);

const VariantSchema = new Schema(
  {
    key: { type: String, required: true, trim: true, maxlength: 64, match: /^[a-z0-9-]+$/ },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    sku: { type: String, required: true, trim: true, maxlength: 64 },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    swatch: { type: String, trim: true, maxlength: 32 },
    images: { type: [ImageSchema], default: [] },
    active: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, min: 0, default: 3 },
  },
  { _id: false },
);

const SpecsSchema = new Schema(
  {
    brand: String,
    model: String,
    sku: String,
    dialSize: String,
    caseMaterial: String,
    caseThickness: String,
    strapMaterial: String,
    movement: String,
    waterResistance: String,
    glass: String,
    dialColor: String,
    color: String,
    warranty: String,
  },
  { _id: false },
);

const ProductSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 120, match: /^[a-z0-9-]+$/ },
    tagline: { type: String, trim: true, maxlength: 200, default: "" },
    description: { type: String, trim: true, maxlength: 4000, default: "" },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    sku: { type: String, required: true, trim: true, maxlength: 64 },
    images: { type: [ImageSchema], default: [] },
    modelUrl: { type: String, trim: true, maxlength: 600 },
    specs: { type: SpecsSchema, default: {} },
    variantLabel: { type: String, trim: true, maxlength: 40, default: "Edition" },
    variants: {
      type: [VariantSchema],
      validate: {
        validator: (v: unknown[]) => Array.isArray(v) && v.length > 0,
        message: "A product needs at least one variant.",
      },
    },
    highlights: { type: [String], default: [] },
    status: { type: String, enum: ["active", "draft", "archived"], default: "draft", index: true },
    featured: { type: Boolean, default: true, index: true },
    isDemo: { type: Boolean, default: false },
    seo: {
      title: { type: String, trim: true, maxlength: 120 },
      description: { type: String, trim: true, maxlength: 300 },
      ogImage: { type: String, trim: true, maxlength: 600 },
    },
  },
  { timestamps: true },
);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ "variants.sku": 1 });

export type ProductDoc = InferSchemaType<typeof ProductSchema> & { _id: mongoose.Types.ObjectId };

export const Product: Model<ProductDoc> =
  (mongoose.models.Product as Model<ProductDoc>) || mongoose.model<ProductDoc>("Product", ProductSchema);
