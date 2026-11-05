import { OrderForm } from "@/components/storefront/OrderForm";

/** Section 6 — order form + live summary, and the same-page success state. */
export function OrderSection() {
  return (
    <section id="order" aria-labelledby="order-title" className="relative scroll-mt-[var(--header-h)] border-t border-rule">
      <div className="mx-auto w-full max-w-[1360px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-12 max-w-2xl lg:mb-16">
          <p className="label text-champagne-ink">Order</p>
          <h2 id="order-title" className="display mt-5 text-[clamp(2.5rem,6vw,4.5rem)] text-ink">
            Reserve yours <span className="italic text-graphite">in a minute.</span>
          </h2>
          <p className="mt-5 max-w-lg leading-relaxed text-graphite">
            Fill in your details and we&rsquo;ll confirm by phone before dispatch.
          </p>
        </div>
        <OrderForm />
      </div>
    </section>
  );
}
