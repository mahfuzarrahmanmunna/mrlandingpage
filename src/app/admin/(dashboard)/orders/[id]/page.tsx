import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminSkeleton } from "@/components/admin/AdminSkeleton";
import { OrderActions } from "@/components/admin/OrderActions";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { getOrder } from "@/lib/admin/queries";
import { requireAdminPage } from "@/lib/auth/session";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { OrderStatus } from "@/lib/models/Order";
import { allowedTransitions } from "@/lib/orders/service";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <OrderDetail params={params} />
    </Suspense>
  );
}

async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  const money = (n: number) => formatMoney(n, { code: order.currency?.code ?? "BDT", symbol: order.currency?.symbol ?? "৳" });
  const attribution = Object.entries(order.attribution ?? {}).filter(([, v]) => v);

  return (
    <>
      <Link href="/admin/orders" className="text-sm text-graphite hover:text-ink">
        ← Orders
      </Link>
      <PageHeader
        title={order.orderNumber}
        subtitle={`Placed ${formatDateTime(order.createdAt as unknown as string)}`}
        actions={
          <>
            <Badge value={order.status ?? "pending"} />
            <Badge value={order.paymentStatus ?? "unpaid"} />
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="grid content-start gap-6 xl:col-span-2">
          <Card title="Items">
            {order.items.map((i) => (
              <div key={i.sku} className="flex justify-between gap-4 border-b border-rule-soft py-3 text-sm last:border-0">
                <div>
                  <p className="font-semibold text-ink">{i.title}</p>
                  <p className="text-graphite">
                    {i.variantName} · SKU {i.sku}
                  </p>
                  <p className="text-xs text-mist">
                    {i.quantity} × {money(i.unitPrice)}
                  </p>
                </div>
                <p className="num">{money(i.lineTotal)}</p>
              </div>
            ))}
            <dl className="num mt-3 space-y-1.5 border-t border-rule pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-graphite">Subtotal</dt>
                <dd>{money(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-graphite">Delivery · {order.deliveryZone?.label}</dt>
                <dd>{money(order.deliveryFee)}</dd>
              </div>
              {order.discount ? (
                <div className="flex justify-between">
                  <dt className="text-graphite">Discount</dt>
                  <dd>−{money(order.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd>{money(order.total)}</dd>
              </div>
              <div className="flex justify-between text-xs text-mist">
                <dt>Payment method</dt>
                <dd>{order.paymentMethod === "cod" ? "Cash on delivery" : "Online"}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Customer & delivery">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-mist">Name</dt>
                <dd className="text-ink">{order.customer?.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-mist">Phone</dt>
                <dd>
                  <a className="text-ink underline-offset-4 hover:underline" href={`tel:${order.customer?.phone}`}>
                    {order.customer?.phone}
                  </a>
                </dd>
              </div>
              {order.customer?.email ? (
                <div>
                  <dt className="text-xs text-mist">Email</dt>
                  <dd className="text-ink">{order.customer.email}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs text-mist">District / city</dt>
                <dd className="text-ink">{order.customer?.city}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-mist">Address</dt>
                <dd className="whitespace-pre-line text-ink">{order.customer?.address}</dd>
              </div>
              {order.customer?.note ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-mist">Customer note</dt>
                  <dd className="text-ink">{order.customer.note}</dd>
                </div>
              ) : null}
            </dl>
          </Card>

          <Card title="Status history">
            <ol className="space-y-3 text-sm">
              {[...(order.statusHistory ?? [])].reverse().map((h, i) => (
                <li key={i} className="flex flex-wrap justify-between gap-2 border-b border-rule-soft pb-2 last:border-0">
                  <span>
                    <span className="font-semibold capitalize text-ink">{h.status}</span>
                    {h.note ? <span className="text-graphite"> — {h.note}</span> : null}
                  </span>
                  <span className="text-xs text-mist">
                    {h.by} · {formatDateTime(h.at as unknown as string)}
                  </span>
                </li>
              ))}
            </ol>
          </Card>

          {order.internalNotes?.length ? (
            <Card title="Internal notes">
              <ul className="space-y-3 text-sm">
                {[...order.internalNotes].reverse().map((n, i) => (
                  <li key={i} className="border-b border-rule-soft pb-2 last:border-0">
                    <p className="whitespace-pre-line text-ink">{n.text}</p>
                    <p className="text-xs text-mist">
                      {n.by} · {formatDateTime(n.at as unknown as string)}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {attribution.length ? (
            <Card title="Attribution">
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                {attribution.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-mist">{k}</dt>
                    <dd className="break-all text-ink">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ) : null}
        </div>

        <OrderActions
          orderId={String(order._id)}
          status={order.status ?? "pending"}
          transitions={allowedTransitions((order.status ?? "pending") as OrderStatus)}
          paymentMethod={order.paymentMethod}
          paymentStatus={order.paymentStatus ?? "unpaid"}
        />
      </div>
    </>
  );
}
