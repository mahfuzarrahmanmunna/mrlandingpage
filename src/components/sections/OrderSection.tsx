import { Icon } from "@/components/ui/Icon";
import { OrderForm } from "@/components/storefront/OrderForm";

/** Section 6 — order form + live summary, and the same-page success state. */
export function OrderSection() {
  return (
    <section id="order" aria-labelledby="order-title" className="relative scroll-mt-[var(--header-h)] border-t border-rule bg-linen">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto mb-8 max-w-2xl text-center lg:mb-12">
          <p className="eyebrow">অর্ডার ফর্ম</p>
          <h2 id="order-title" className="h-section mt-4 text-ink">
            অর্ডার করতে নিচের <span className="accent">ফর্মটি পূরণ করুন</span>
          </h2>
          <p className="mt-3 text-[1.05rem] leading-relaxed text-graphite">
            মাত্র ১ মিনিট লাগবে। অর্ডারের পর আমরা ফোন করে কনফার্ম করব — পণ্য হাতে পেয়ে টাকা দিন।
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-graphite">
            {["অগ্রিম টাকা লাগবে না", "ফোনে কনফার্মেশন", "পণ্য দেখে টাকা দিন"].map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <Icon name="check" size={15} strokeWidth={2.5} className="text-champagne-ink" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <OrderForm />
      </div>
    </section>
  );
}
