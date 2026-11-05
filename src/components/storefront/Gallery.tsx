"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useStorefront } from "./StorefrontProvider";

const WatchViewer = dynamic(() => import("./WatchViewer"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <span className="label text-mist" role="status">
        Preparing 3D view…
      </span>
    </div>
  ),
});

const isSvg = (url: string) => /\.svg($|\?)/i.test(url);

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function Gallery() {
  const { product, settings, images, variant } = useStorefront();
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"photo" | "3d">("photo");
  const [failed3D, setFailed3D] = useState(false);
  const reducedMotion = useReducedMotion();
  const pointer = useRef<{ x: number; y: number; id: number } | null>(null);

  // Reset to first image whenever the variant (and so the image set) changes.
  const [lastVariant, setLastVariant] = useState(variant.key);
  if (lastVariant !== variant.key) {
    setLastVariant(variant.key);
    setIndex(0);
  }

  const count = images.length;
  const current = images[Math.min(index, count - 1)];
  const can3D = !failed3D && (Boolean(product.modelUrl) || settings.show3DPreview);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (count < 2) return;
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  const onFail = useCallback(() => {
    setFailed3D(true);
    setMode("photo");
  }, []);

  if (!current) {
    return <div className="aspect-[4/5] w-full bg-linen" aria-label="No product image available" role="img" />;
  }

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${product.title} images`}
      onKeyDown={(e) => {
        if (mode !== "photo") return;
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        }
      }}
    >
      <div
        className="paper relative aspect-square w-full touch-pan-y sm:aspect-[4/5] overflow-hidden rounded-[var(--radius-sm)] ring-1 ring-rule-soft"
        onPointerDown={(e) => {
          if (mode !== "photo" || e.pointerType === "mouse") return;
          pointer.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        }}
        onPointerUp={(e) => {
          const start = pointer.current;
          pointer.current = null;
          if (!start || start.id !== e.pointerId) return;
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => (pointer.current = null)}
      >
        {mode === "photo" ? (
          images.map((img, i) => (
            <div
              key={`${variant.key}-${img.url}-${i}`}
              className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out ${
                i === index ? "scale-100 opacity-100" : "pointer-events-none scale-[1.02] opacity-0"
              }`}
              aria-hidden={i !== index}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="(min-width: 1280px) 46vw, (min-width: 1024px) 52vw, 100vw"
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                unoptimized={isSvg(img.url)}
                className="object-cover"
                draggable={false}
              />
            </div>
          ))
        ) : (
          <WatchViewer
            modelUrl={product.modelUrl}
            dialColor={variant.swatch}
            onFail={onFail}
            reducedMotion={reducedMotion}
          />
        )}

        {mode === "photo" && current.placeholder ? (
          <span className="label absolute left-3 top-3 rounded-[var(--radius-sm)] bg-porcelain/85 px-2.5 py-1.5 text-[0.58rem] text-mist backdrop-blur-sm">
            Placeholder image
          </span>
        ) : null}
        {mode === "3d" && !product.modelUrl ? (
          <span className="label absolute left-3 top-3 max-w-[70%] rounded-[var(--radius-sm)] bg-porcelain/85 px-2.5 py-1.5 text-[0.58rem] leading-relaxed text-mist backdrop-blur-sm">
            Illustrative 3D preview — not the actual product
          </span>
        ) : null}

        {mode === "photo" && count > 1 ? (
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => go(-1)}
              className="grid size-11 place-items-center rounded-full bg-porcelain/90 text-ink shadow-soft backdrop-blur transition hover:bg-porcelain"
              aria-label="Previous image"
            >
              <Icon name="chevron-left" />
            </button>
            <p className="num label rounded-full bg-porcelain/80 px-3 py-1.5 text-graphite backdrop-blur" aria-live="polite">
              {String(index + 1).padStart(2, "0")} <span className="text-steel">/ {String(count).padStart(2, "0")}</span>
            </p>
            <button
              type="button"
              onClick={() => go(1)}
              className="grid size-11 place-items-center rounded-full bg-porcelain/90 text-ink shadow-soft backdrop-blur transition hover:bg-porcelain"
              aria-label="Next image"
            >
              <Icon name="chevron-right" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {mode === "photo" && count > 1 ? (
          <div className="flex gap-2" role="group" aria-label="Choose image">
            {images.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index}
                className={`relative size-14 overflow-hidden rounded-[var(--radius-sm)] bg-linen transition sm:size-16 ${
                  i === index ? "ring-1 ring-ink ring-offset-2 ring-offset-ivory" : "opacity-70 ring-1 ring-rule hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt="" fill sizes="64px" unoptimized={isSvg(img.url)} className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
        {can3D ? (
          <button
            type="button"
            onClick={() => setMode((m) => (m === "photo" ? "3d" : "photo"))}
            aria-pressed={mode === "3d"}
            className="label ml-auto inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-rule px-3.5 text-graphite transition hover:border-ink hover:text-ink"
          >
            <Icon name={mode === "photo" ? "cube" : "image"} size={16} />
            {mode === "photo" ? (product.modelUrl ? "View in 3D" : "3D preview") : "Back to photos"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
