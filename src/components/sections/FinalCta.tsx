import Image from "next/image";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ProductImage } from "@/lib/types";

/** Section 8a — a final, calm invitation back to the order form. */
export function FinalCta({ title, image }: { title: string; image?: ProductImage }) {
  return (
    <section aria-labelledby="final-cta-title" className="relative isolate overflow-hidden border-t border-rule">
      <div className="mx-auto grid w-full max-w-[1360px] items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-28">
        <div className="lg:col-span-7">
          <p className="label text-champagne-ink" data-reveal>
            {title}
          </p>
          <h2 id="final-cta-title" className="display mt-5 text-[clamp(3rem,9vw,7rem)] text-ink" data-reveal>
            Wear it
            <br />
            <span className="italic text-graphite">with intent.</span>
          </h2>
          <div className="mt-10 flex flex-wrap gap-3" data-reveal>
            <a href="#order" className={buttonClass("primary", "lg")}>
              <span>Order now</span>
              <Icon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#editions" className={buttonClass("secondary", "lg")}>
              <span>Compare editions</span>
            </a>
          </div>
        </div>
        {image ? (
          <div className="relative mx-auto aspect-square w-full max-w-md lg:col-span-5">
            <div aria-hidden className="absolute inset-[6%] rounded-full border border-rule" />
            <div aria-hidden className="absolute inset-[14%] rounded-full border border-dashed border-rule" />
            <div className="absolute inset-[18%] overflow-hidden rounded-full shadow-lift ring-1 ring-rule-soft">
              <Image
                src={image.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, 70vw"
                loading="lazy"
                unoptimized={image.url.endsWith(".svg")}
                className="scale-[1.35] object-cover"
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
