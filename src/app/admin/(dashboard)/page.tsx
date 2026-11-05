import Link from "next/link";
import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { getOverview } from "@/lib/admin/queries";
import { requireAdminPage } from "@/lib/auth/session";
import { formatDateTime, formatMoney } from "@/lib/format";

const BDT = { code: "BDT", symbol: "৳" };

export default function OverviewPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Overview />
    </Suspense>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-rule bg-porcelain p-5">
      <p className="label text-mist">{label}</p>
      <p className="num mt-3 font-serif text-4xl text-ink">{value}</p>
      {sub ? <p className="mt-1 text-xs text-mist">{sub}</p> : null}
    </div>
  );
}

async function Overview() {
  const admin = await requireAdminPage();
  const o = await getOverview();
  return (
    <>
      <PageHeader title="Overview" subtitle={`Signed in as ${admin.email}`} />
      {o.isDemo ? (
        <p className="mb-6 rounded-[var(--radius-sm)] border-l-2 border-champagne bg-porcelain px-4 py-3 text-sm text-graphite">
          The product is marked as preview/demo content. Replace the placeholders in{" "}
          <Link className="underline" href="/admin/product">
            Product
          </Link>{" "}
          and untick &ldquo;demo&rdquo; before launch.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue · 7 days" value={formatMoney(o.revenue7d, BDT)} sub={`${o.orders7d} orders (excl. cancelled/returned)`} />
        <Stat label="Revenue · 30 days" value={formatMoney(o.revenue30d, BDT)} sub={`${o.orders30d} orders`} />
        <Stat label="Orders today" value={o.ordersToday} sub={`${o.counts.pending} awaiting confirmation`} />
        <Stat label="New leads" value={o.newLeads} sub={o.followUpsDue ? `${o.followUpsDue} follow-ups due` : "No follow-ups due"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          title="Recent orders"
          className="xl:col-span-2"
          actions={
            <Link href="/admin/orders" className="text-sm text-graphite hover:text-ink">
              All orders →
            </Link>
          }
        >
          {o.recentOrders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="text-xs text-mist">
                  <tr>
                    <th className="py-2 font-medium">Order</th>
                    <th className="py-2 font-medium">Customer</th>
                    <th className="py-2 font-medium">Total</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {o.recentOrders.map((r) => (
                    <tr key={String(r._id)} className="border-t border-rule-soft">
                      <td className="py-3">
                        <Link href={`/admin/orders/${r._id}`} className="font-semibold text-ink hover:underline">
                          {r.orderNumber}
                        </Link>
                        <p className="text-xs text-mist">{formatDateTime(r.createdAt as unknown as string)}</p>
                      </td>
                      <td className="py-3 text-graphite">{r.customer?.name}</td>
                      <td className="num py-3">{formatMoney(r.total, BDT)}</td>
                      <td className="py-3">
                        <Badge value={r.status ?? "pending"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-mist">No orders yet.</p>
          )}
        </Card>

        <div className="grid content-start gap-6">
          <Card title="Stock alerts">
            {o.stockAlerts.length ? (
              <ul className="space-y-2 text-sm">
                {o.stockAlerts.map((s) => (
                  <li key={s.sku} className="flex justify-between gap-3">
                    <span className="text-graphite">{s.name}</span>
                    <span className={`num font-semibold ${s.stock === 0 ? "text-danger" : "text-champagne-ink"}`}>
                      {s.stock === 0 ? "Sold out" : `${s.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-mist">All variants are above their alert level.</p>
            )}
          </Card>
          <Card title="Orders by status">
            <ul className="space-y-2 text-sm">
              {Object.entries(o.counts).map(([k, v]) => (
                <li key={k} className="flex justify-between">
                  <Link href={`/admin/orders?status=${k}`} className="capitalize text-graphite hover:text-ink">
                    {k}
                  </Link>
                  <span className="num">{v}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Storefront product">
            <p className="text-sm text-graphite">{o.productTitle ?? "No product yet"}</p>
            {o.productStatus ? (
              <div className="mt-2">
                <Badge value={o.productStatus} />
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </>
  );
}
