import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { LEAD_STATUSES, Lead, type LeadStatus } from "@/lib/models/Lead";
import { ORDER_STATUSES, Order, type OrderStatus } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { SiteSettings } from "@/lib/models/SiteSettings";

/** Server → client serialisation (ObjectIds/Dates → strings). */
export function plain<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

const REVENUE_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

export async function getOverview() {
  await connectDB();
  const now = new Date();
  const startOfDay = new Date(now.getTime() + 6 * 3600_000);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const todayStart = new Date(startOfDay.getTime() - 6 * 3600_000); // midnight Asia/Dhaka
  const weekStart = new Date(now.getTime() - 7 * 86400_000);
  const monthStart = new Date(now.getTime() - 30 * 86400_000);

  const [revenue, statusCounts, ordersToday, newLeads, followUpsDue, product, recentOrders] = await Promise.all([
    Order.aggregate<{ _id: string; total: number; count: number }>([
      { $match: { status: { $in: REVENUE_STATUSES }, createdAt: { $gte: monthStart } } },
      {
        $group: {
          _id: { $cond: [{ $gte: ["$createdAt", weekStart] }, "week", "older"] },
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate<{ _id: OrderStatus; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    Lead.countDocuments({ status: "new" }),
    Lead.countDocuments({ followUpAt: { $lte: now }, status: { $in: ["new", "contacted", "qualified"] } }),
    Product.findOne().sort({ featured: -1, updatedAt: -1 }).lean(),
    Order.find().sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  const week = revenue.find((r) => r._id === "week");
  const older = revenue.find((r) => r._id === "older");
  const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
  for (const c of statusCounts) counts[c._id] = c.count;

  const stockAlerts = (product?.variants ?? [])
    .filter((v) => v.active !== false && v.stock <= (v.lowStockThreshold ?? 3))
    .map((v) => ({ name: v.name, sku: v.sku, stock: v.stock }));

  return plain({
    revenue7d: week?.total ?? 0,
    orders7d: week?.count ?? 0,
    revenue30d: (week?.total ?? 0) + (older?.total ?? 0),
    orders30d: (week?.count ?? 0) + (older?.count ?? 0),
    ordersToday,
    counts,
    newLeads,
    followUpsDue,
    stockAlerts,
    productTitle: product?.title ?? null,
    productStatus: product?.status ?? null,
    isDemo: Boolean(product?.isDemo),
    recentOrders,
  });
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function listOrders({ status, q, page }: { status?: string; q?: string; page: number }) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (status && ORDER_STATUSES.includes(status as OrderStatus)) filter.status = status;
  if (q) {
    const rx = new RegExp(escapeRegex(q.trim().slice(0, 40)), "i");
    filter.$or = [{ orderNumber: rx }, { "customer.phone": rx }, { "customer.name": rx }];
  }
  const perPage = 25;
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    Order.countDocuments(filter),
  ]);
  return plain({ orders, total, page, pages: Math.max(1, Math.ceil(total / perPage)) });
}

export async function getOrder(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const order = await Order.findById(id).lean();
  return order ? plain(order) : null;
}

export async function listLeads({ status, page }: { status?: string; page: number }) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (status && LEAD_STATUSES.includes(status as LeadStatus)) filter.status = status;
  const perPage = 30;
  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    Lead.countDocuments(filter),
  ]);
  return plain({ leads, total, page, pages: Math.max(1, Math.ceil(total / perPage)) });
}

export async function getAdminProduct() {
  await connectDB();
  const p = await Product.findOne().sort({ featured: -1, updatedAt: -1 }).lean();
  return p ? plain(p) : null;
}

export async function getAdminSettings() {
  await connectDB();
  const s = await SiteSettings.findOne({ key: "main" }).lean();
  return s ? plain(s) : null;
}
