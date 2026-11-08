import { OrderForm } from "@/components/storefront/OrderForm";

/** Section 6 — order form + live summary, and the same-page success state. */
export function OrderSection() {
  return (
    <section id="order" aria-labelledby="order-title" className="relative scroll-mt-[var(--header-h)] bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_40%)]">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="mx-auto mb-8 max-w-2xl text-center lg:mb-12">
          <p className="eyebrow">অর্ডার ফর্ম</p>
          <h2 id="order-title" className="display mt-4 text-[clamp(1.75rem,4.5vw,2.75rem)] text-ink">
            অর্ডার করতে নিচের <span className="text-champagne-ink">ফর্মটি পূরণ করুন</span>
          </h2>
          <p className="mt-3 text-[1.05rem] leading-relaxed text-graphite">
            মাত্র ১ মিনিট লাগবে। অর্ডারের পর আমরা ফোন করে কনফার্ম করব — পণ্য হাতে পেয়ে টাকা দিন।
          </p>
        </div>
        <OrderForm />
      </div>
    </section>
  );
}
