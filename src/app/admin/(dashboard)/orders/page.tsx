import Link from "next/link";
import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { Badge, PageHeader, inputCls } from "@/components/admin/ui";
import { listOrders } from "@/lib/admin/queries";
import { requireAdminPage } from "@/lib/auth/session";
import { formatDateTime, formatMoney } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/models/Order";

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default function OrdersPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}

async function Orders({ searchParams }: { searchParams: SP }) {
  await requireAdminPage();
  const sp = await searchParams;
  const status = one(sp.status);
  const q = one(sp.q);
  const page = Math.max(1, parseInt(one(sp.page), 10) || 1);
  const data = await listOrders({ status, q, page });
  const qs = (p: number) =>
    `?${new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <>
      <PageHeader title="Orders" subtitle={`${data.total} order${data.total === 1 ? "" : "s"}`} />
      <form className="mb-6 flex flex-wrap gap-3" role="search">
        <input name="q" defaultValue={q} placeholder="Order no., phone or name" className={`${inputCls} max-w-xs`} aria-label="Search orders" />
        <select name="status" defaultValue={status} className={`${inputCls} max-w-[180px]`} aria-label="Filter by status">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="min-h-10 rounded-[var(--radius-sm)] bg-ink px-4 text-sm text-porcelain">Filter</button>
      </form>

      {data.orders.length ? (
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-rule bg-porcelain">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-rule text-xs text-mist">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Zone</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o) => (
                <tr key={String(o._id)} className="border-t border-rule-soft hover:bg-ivory">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o._id}`} className="font-semibold text-ink hover:underline">
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-mist">{formatDateTime(o.createdAt as unknown as string)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink">{o.customer?.name}</p>
                    <p className="text-xs text-mist">{o.customer?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-graphite">
                    {o.items[0]?.variantName} × {o.items[0]?.quantity}
                  </td>
                  <td className="px-4 py-3 text-graphite">{o.deliveryZone?.label}</td>
                  <td className="num px-4 py-3">{formatMoney(o.total, { code: "BDT", symbol: o.currency?.symbol ?? "৳" })}</td>
                  <td className="px-4 py-3">
                    <Badge value={o.paymentStatus ?? "unpaid"} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge value={o.status ?? "pending"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-[var(--radius-md)] border border-rule bg-porcelain p-8 text-center text-sm text-mist">No orders match.</p>
      )}

      {data.pages > 1 ? (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={qs(page - 1)}>← Previous</Link> : <span />}
          <span className="text-mist">
            Page {page} of {data.pages}
          </span>
          {page < data.pages ? <Link href={qs(page + 1)}>Next →</Link> : <span />}
        </nav>
      ) : null}
    </>
  );
}
