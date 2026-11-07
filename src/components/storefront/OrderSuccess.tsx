"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { OrderConfirmation } from "@/lib/types";
import { ContactActions } from "./PurchaseControls";

export function OrderSuccess({ order, onContinue }: { order: OrderConfirmation; onContinue: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const money = (n: number) => formatMoney(n, order.currency);
  const isCod = order.paymentMethod === "cod";

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="mx-auto max-w-3xl" role="status" aria-live="polite">
      <div className="rounded-[var(--radius-md)] border border-rule bg-porcelain p-6 shadow-lift sm:p-10">
        <div className="flex items-center gap-3 text-success">
          <span className="grid size-10 place-items-center rounded-full bg-success-soft">
            <Icon name="check" size={20} strokeWidth={1.8} />
          </span>
          <p className="label">{isCod ? "Order received" : order.paymentStatus === "paid" ? "Payment confirmed" : "Order placed"}</p>
        </div>

        <h3 ref={headingRef} tabIndex={-1} className="display mt-6 text-4xl text-ink outline-none sm:text-5xl">
          Thank you, {order.customerName}.
        </h3>
        <p className="mt-4 max-w-xl leading-relaxed text-graphite">
          {isCod
            ? "We have received your order. Our team will call you to confirm the details before dispatch. You'll pay in cash when it arrives."
            : "We have received your order and will confirm it shortly."}
        </p>

        <div className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-sm)] border border-rule bg-rule sm:grid-cols-2">
          <div className="bg-ivory p-5">
            <p className="label text-mist">Order number</p>
            <p className="num mt-2 font-serif text-2xl tracking-wide text-ink">{order.orderNumber}</p>
            <p className="mt-1 text-xs text-mist">{formatDateTime(order.createdAt)}</p>
          </div>
          <div className="bg-ivory p-5">
            <p className="label text-mist">Total payable</p>
            <p className="num mt-2 font-serif text-2xl text-ink">{money(order.total)}</p>
            <p className="mt-1 text-xs text-mist">{isCod ? "Cash on delivery" : "Online payment"}</p>
          </div>
        </div>

        <dl className="num mt-6 space-y-3 text-sm">
          {order.items.map((item) => (
            <div key={item.sku} className="flex justify-between gap-4">
              <dt className="text-graphite">
                {item.title} — {item.variantName} <span className="text-mist">× {item.quantity}</span>
              </dt>
              <dd className="text-ink">{money(item.lineTotal)}</dd>
            </div>
          ))}
          <div className="flex justify-between">
            <dt className="text-graphite">Delivery · {order.deliveryZone}</dt>
            <dd className="text-ink">{order.deliveryFee === 0 ? "Free" : money(order.deliveryFee)}</dd>
          </div>
          {order.discount > 0 ? (
            <div className="flex justify-between">
              <dt className="text-graphite">Discount</dt>
              <dd className="text-success">−{money(order.discount)}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-8 border-t border-rule-soft pt-6">
          <p className="label text-mist">What happens next</p>
          <ol className="mt-4 space-y-3 text-sm text-graphite">
            <li className="flex gap-3">
              <span className="num font-serif text-champagne-ink">01</span> We call your mobile number to confirm the order.
            </li>
            <li className="flex gap-3">
              <span className="num font-serif text-champagne-ink">02</span> Your watch is packed and handed to the courier.
            </li>
            <li className="flex gap-3">
              <span className="num font-serif text-champagne-ink">03</span>
              {isCod ? "Pay the courier when your parcel arrives." : "Receive your parcel at your address."}
            </li>
          </ol>
          <p className="mt-5 text-xs text-mist">Keep your order number for any questions about this order.</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" onClick={onContinue} icon={<Icon name="arrow-left" size={16} />} className="whitespace-normal text-center">
            Continue viewing this watch
          </Button>
          <ContactActions compact />
        </div>
      </div>
    </div>
  );
}
