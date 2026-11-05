import mongoose from "mongoose";
import { withAdmin } from "@/lib/auth/guard";
import { connectDB } from "@/lib/db";
import { errorJson, json, readJson } from "@/lib/http";
import { Order } from "@/lib/models/Order";
import { OrderError, changeOrderStatus } from "@/lib/orders/service";
import { revalidateStorefrontSoon } from "@/lib/revalidate";
import { orderUpdateSchema } from "@/lib/validation/admin";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAdmin<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return errorJson(404, "Order not found.");
  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) return errorJson(404, "Order not found.");
  return json({ ok: true, order });
});

export const PATCH = withAdmin<Ctx>(async (req, { params }, admin) => {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return errorJson(404, "Order not found.");
  const parsed = orderUpdateSchema.safeParse(await readJson(req, 8_000).catch(() => null));
  if (!parsed.success) return errorJson(422, parsed.error.issues[0]?.message ?? "Invalid update.");
  const { status, statusNote, paymentStatus, internalNote } = parsed.data;
  await connectDB();

  const order = await Order.findById(id).lean();
  if (!order) return errorJson(404, "Order not found.");

  try {
    if (status && status !== order.status) {
      await changeOrderStatus(id, status, admin.email, statusNote || undefined);
      if (status === "cancelled" || status === "returned") revalidateStorefrontSoon();
    }
    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      // Online payments are only ever marked paid by a verified gateway webhook.
      if (order.paymentMethod !== "cod") return errorJson(422, "Online payment status is set by the payment gateway only.");
      if (!["unpaid", "paid", "refunded"].includes(paymentStatus)) return errorJson(422, "Invalid payment status for COD.");
      await Order.updateOne(
        { _id: id },
        {
          $set: { paymentStatus },
          $push: { statusHistory: { status: `payment:${paymentStatus}`, by: admin.email, at: new Date() } },
        },
      );
    }
    if (internalNote) {
      await Order.updateOne({ _id: id }, { $push: { internalNotes: { text: internalNote, by: admin.email, at: new Date() } } });
    }
  } catch (err) {
    if (err instanceof OrderError) return errorJson(err.status, err.message);
    throw err;
  }
  const updated = await Order.findById(id).lean();
  return json({ ok: true, order: updated });
});
