import Image from "next/image";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ProductImage } from "@/lib/types";

/** Section 8a — a final, calm invitation back to the order form. */
export function FinalCta({ title, image, cod }: { title: string; image?: ProductImage; cod?: boolean }) {
  return (
    <section aria-labelledby="final-cta-title" className="relative isolate overflow-hidden bg-champagne text-white">
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 px-4 py-14 sm:px-8 lg:grid-cols-12 lg:px-10 lg:py-20">
        <div className="lg:col-span-7">
          <p className="text-[0.95rem] font-semibold text-white/85" data-reveal>
            {title}
          </p>
          <h2 id="final-cta-title" className="display mt-3 text-[clamp(2rem,6vw,3.5rem)] text-white" data-reveal>
            আজই অর্ডার করুন
          </h2>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-white/90" data-reveal>
            ঘরে বসেই ঘড়িটি হাতে পান।{cod ? " পণ্য হাতে পেয়ে টাকা পরিশোধ করুন।" : ""}
          </p>
          <div className="mt-8 flex flex-wrap gap-3" data-reveal>
            <a href="#order" className={buttonClass("ghost", "lg", "border-white bg-white text-champagne-ink hover:bg-champagne-soft")}>
              <span>অর্ডার করুন</span>
              <Icon name="arrow-right" size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#editions" className={buttonClass("ghost", "lg", "border-white/70 bg-transparent text-white hover:border-white hover:text-white")}>
              <span>রঙ দেখুন</span>
            </a>
          </div>
        </div>
        {image ? (
          <div className="relative mx-auto aspect-square w-full max-w-md lg:col-span-5">
            <div aria-hidden className="absolute inset-[8%] rounded-full bg-white/15" />
            <div className="absolute inset-[16%] overflow-hidden rounded-full bg-white shadow-lift ring-4 ring-white">
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
