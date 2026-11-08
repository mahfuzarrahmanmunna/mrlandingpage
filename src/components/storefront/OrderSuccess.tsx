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
      <div className="rounded-[var(--radius-md)] border-2 border-champagne bg-white p-6 shadow-lift sm:p-10">
        <div className="flex items-center gap-3 text-success">
          <span className="grid size-12 place-items-center rounded-full bg-champagne text-white">
            <Icon name="check" size={24} strokeWidth={2.5} />
          </span>
          <p className="text-lg font-bold">{isCod ? "অর্ডার গ্রহণ করা হয়েছে" : order.paymentStatus === "paid" ? "পেমেন্ট সম্পন্ন হয়েছে" : "অর্ডার সম্পন্ন হয়েছে"}</p>
        </div>

        <h3 ref={headingRef} tabIndex={-1} className="display mt-5 text-3xl text-ink outline-none sm:text-4xl">
          ধন্যবাদ, {order.customerName}!
        </h3>
        <p className="mt-4 max-w-xl leading-relaxed text-graphite">
          {isCod
            ? "আপনার অর্ডারটি আমরা পেয়েছি। পাঠানোর আগে আমাদের টিম আপনাকে ফোন করে কনফার্ম করবে। পণ্য হাতে পেয়ে টাকা দেবেন।"
            : "আপনার অর্ডারটি আমরা পেয়েছি, শীঘ্রই কনফার্ম করা হবে।"}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--radius-sm)] bg-linen p-5">
            <p className="label text-mist">অর্ডার নম্বর</p>
            <p className="num mt-2 text-2xl font-extrabold tracking-wide text-ink">{order.orderNumber}</p>
            <p className="mt-1 text-xs text-mist">{formatDateTime(order.createdAt)}</p>
          </div>
          <div className="rounded-[var(--radius-sm)] bg-linen p-5">
            <p className="label text-mist">সর্বমোট পরিশোধ</p>
            <p className="num mt-2 text-2xl font-extrabold text-champagne-ink">{money(order.total)}</p>
            <p className="mt-1 text-xs text-mist">{isCod ? "ক্যাশ অন ডেলিভারি" : "অনলাইন পেমেন্ট"}</p>
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
            <dt className="text-graphite">ডেলিভারি চার্জ · {order.deliveryZone}</dt>
            <dd className="text-ink">{order.deliveryFee === 0 ? "ফ্রি" : money(order.deliveryFee)}</dd>
          </div>
          {order.discount > 0 ? (
            <div className="flex justify-between">
              <dt className="text-graphite">ছাড়</dt>
              <dd className="text-success">−{money(order.discount)}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-8 border-t border-rule-soft pt-6">
          <p className="text-base font-bold text-ink">এরপর কী হবে</p>
          <ol className="mt-4 space-y-3 text-sm text-graphite">
            <li className="flex gap-3">
              <span className="num grid size-6 shrink-0 place-items-center rounded-full bg-champagne-soft text-xs font-bold text-champagne-ink">১</span> আমরা আপনার মোবাইলে কল করে অর্ডার কনফার্ম করব।
            </li>
            <li className="flex gap-3">
              <span className="num grid size-6 shrink-0 place-items-center rounded-full bg-champagne-soft text-xs font-bold text-champagne-ink">২</span> ঘড়িটি প্যাক করে কুরিয়ারে পাঠানো হবে।
            </li>
            <li className="flex gap-3">
              <span className="num grid size-6 shrink-0 place-items-center rounded-full bg-champagne-soft text-xs font-bold text-champagne-ink">৩</span>
              {isCod ? "পার্সেল হাতে পেয়ে কুরিয়ারকে টাকা দিন।" : "আপনার ঠিকানায় পার্সেল বুঝে নিন।"}
            </li>
          </ol>
          <p className="mt-5 text-xs text-mist">এই অর্ডার নিয়ে কোনো প্রশ্ন থাকলে অর্ডার নম্বরটি সংরক্ষণ করুন।</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" onClick={onContinue} icon={<Icon name="arrow-left" size={16} />} className="whitespace-normal text-center">
            আবার ঘড়িটি দেখুন
          </Button>
          <ContactActions compact />
        </div>
      </div>
    </div>
  );
}
