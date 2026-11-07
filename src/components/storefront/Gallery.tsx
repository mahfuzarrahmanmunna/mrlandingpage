"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { PublicVariant } from "@/lib/types";
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

type Mode = "photo" | "3d" | "video";

const AUTOPLAY_MS = 4500;

const thumbBase =
  "relative size-16 shrink-0 snap-start overflow-hidden rounded-[var(--radius-md)] bg-linen transition sm:size-[4.5rem]";
const thumbState = (active: boolean) =>
  active ? "ring-2 ring-ink ring-offset-2 ring-offset-ivory" : "opacity-75 ring-1 ring-rule hover:opacity-100";

export function Gallery() {
  const { product, settings, images: variantImages, variant, setVariantKey } = useStorefront();
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("photo");
  const [failed3D, setFailed3D] = useState(false);
  const reducedMotion = useReducedMotion();
  const pointer = useRef<{ x: number; y: number; id: number } | null>(null);
  // Autoplay: the user can stop it; hovering or focusing inside pauses it.
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // The selected colour's photos first, then the lead photo of every other
  // colour so the slider shows the whole range. `from` marks those extras.
  const images = useMemo(() => {
    const own = variantImages.map((img) => ({ ...img, from: undefined as PublicVariant | undefined }));
    const seen = new Set(own.map((img) => img.url));
    const others = product.variants.flatMap((v) => {
      const lead = v.images[0];
      if (v.key === variant.key || !lead || seen.has(lead.url)) return [];
      seen.add(lead.url);
      return [{ ...lead, from: v }];
    });
    return [...own, ...others];
  }, [variantImages, product.variants, variant.key]);

  // Reset to the first photo whenever the variant (and so the image set) changes.
  const [lastVariant, setLastVariant] = useState(variant.key);
  if (lastVariant !== variant.key) {
    setLastVariant(variant.key);
    setIndex(0);
    setMode("photo");
  }

  const count = images.length;
  const current = images[Math.min(index, count - 1)];
  const can3D = !failed3D && (Boolean(product.modelUrl) || settings.show3DPreview);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (count < 2) return;
      setMode("photo");
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  const autoplay = mode === "photo" && count > 1 && !reducedMotion && !stopped && !hovered && !focused;
  useEffect(() => {
    if (!autoplay) return;
    // Re-armed on every index change, so manual navigation restarts the wait.
    const id = window.setTimeout(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [autoplay, index, count]);

  const onFail = useCallback(() => {
    setFailed3D(true);
    setMode("photo");
  }, []);

  if (!current) {
    return <div className="aspect-square w-full bg-linen" aria-label="No product image available" role="img" />;
  }

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${product.title} images`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(e) => e.target.matches(":focus-visible") && setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
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
        className="paper relative aspect-square w-full touch-pan-y overflow-hidden rounded-[var(--radius-md)] bg-linen ring-1 ring-rule-soft"
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
              className={`absolute inset-0 transition-[opacity,transform] duration-500 ease-out ${
                i === index ? "scale-100 opacity-100" : "pointer-events-none scale-[1.02] opacity-0"
              }`}
              aria-hidden={i !== index}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                unoptimized={isSvg(img.url)}
                className="object-cover"
                draggable={false}
              />
            </div>
          ))
        ) : mode === "video" && product.videoUrl ? (
          <video
            key={product.videoUrl}
            className="absolute inset-0 size-full bg-ink object-contain"
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
            poster={current.url}
          >
            <source src={product.videoUrl} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        ) : (
          <WatchViewer
            modelUrl={product.modelUrl}
            dialColor={variant.swatch}
            onFail={onFail}
            reducedMotion={reducedMotion}
          />
        )}

        {mode === "photo" && current.from ? (
          current.from.available ? (
            <button
              type="button"
              onClick={() => setVariantKey(current.from!.key)}
              className="label absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-porcelain/90 py-1.5 pl-1.5 pr-3 text-[0.62rem] text-ink shadow-soft backdrop-blur transition hover:bg-porcelain"
            >
              <span
                aria-hidden
                className="size-4 rounded-full ring-1 ring-black/10"
                style={{ background: current.from.swatch ?? "var(--linen)" }}
              />
              {current.from.name} — select this colour
            </button>
          ) : (
            <span className="label absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-porcelain/90 py-1.5 pl-1.5 pr-3 text-[0.62rem] text-mist backdrop-blur">
              <span
                aria-hidden
                className="size-4 rounded-full ring-1 ring-black/10"
                style={{ background: current.from.swatch ?? "var(--linen)" }}
              />
              {current.from.name} · sold out
            </span>
          )
        ) : null}
        {mode === "photo" && current.placeholder ? (
          <span className="label absolute left-3 top-3 rounded-full bg-porcelain/90 px-3 py-1.5 text-[0.58rem] text-mist backdrop-blur-sm">
            Placeholder image
          </span>
        ) : null}
        {mode === "3d" && !product.modelUrl ? (
          <span className="label absolute left-3 top-3 max-w-[75%] rounded-[var(--radius-md)] bg-porcelain/90 px-3 py-1.5 text-[0.58rem] leading-relaxed text-mist backdrop-blur-sm">
            Illustrative 3D preview — not the actual product
          </span>
        ) : null}

        {mode === "photo" && count > 1 ? (
          <>
            <p
              className="num absolute right-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[0.7rem] font-semibold text-porcelain backdrop-blur"
              aria-live="polite"
            >
              {index + 1} / {count}
            </p>
            {!reducedMotion ? (
              <button
                type="button"
                onClick={() => setStopped((v) => !v)}
                className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-ink/70 text-porcelain backdrop-blur transition hover:bg-ink/85"
                aria-label={stopped ? "Start automatic slideshow" : "Stop automatic slideshow"}
              >
                <Icon name={stopped ? "play" : "pause"} size={14} strokeWidth={stopped ? 0 : 2} className={stopped ? "fill-current" : undefined} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-porcelain/90 text-ink shadow-soft backdrop-blur transition hover:bg-porcelain"
              aria-label="Previous image"
            >
              <Icon name="chevron-left" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-porcelain/90 text-ink shadow-soft backdrop-blur transition hover:bg-porcelain"
              aria-label="Next image"
            >
              <Icon name="chevron-right" />
            </button>
          </>
        ) : null}
      </div>

      {/* One scrollable strip for every view: photos, video and 3D. Never wraps. */}
      <div
        className="-mx-1 mt-3 flex snap-x gap-2.5 overflow-x-auto px-1 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Choose view"
      >
        {images.map((img, i) => (
          <button
            key={`${img.url}-${i}`}
            type="button"
            onClick={() => {
              setMode("photo");
              setIndex(i);
            }}
            aria-label={`Show image ${i + 1} of ${count}`}
            aria-current={mode === "photo" && i === index}
            className={`${thumbBase} ${thumbState(mode === "photo" && i === index)}`}
          >
            <Image src={img.url} alt="" fill sizes="72px" unoptimized={isSvg(img.url)} className="object-cover" />
          </button>
        ))}
        {product.videoUrl ? (
          <button
            type="button"
            onClick={() => setMode("video")}
            aria-pressed={mode === "video"}
            aria-label="Play product video"
            className={`${thumbBase} ${thumbState(mode === "video")}`}
          >
            <Image src={images[0]!.url} alt="" fill sizes="72px" unoptimized={isSvg(images[0]!.url)} className="object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-ink/45 text-porcelain">
              <span className="grid size-8 place-items-center rounded-full bg-porcelain/95 text-ink">
                <Icon name="play" size={14} strokeWidth={0} className="fill-current" />
              </span>
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-0.5 text-center text-[0.55rem] font-semibold uppercase tracking-wider text-porcelain">
              Video
            </span>
          </button>
        ) : null}
        {can3D ? (
          <button
            type="button"
            onClick={() => setMode("3d")}
            aria-pressed={mode === "3d"}
            aria-label={product.modelUrl ? "View in 3D" : "Show illustrative 3D preview"}
            className={`${thumbBase} grid place-items-center bg-porcelain text-graphite ${thumbState(mode === "3d")}`}
          >
            <span className="flex flex-col items-center gap-1">
              <Icon name="cube" size={22} />
              <span className="text-[0.6rem] font-semibold uppercase tracking-wider">3D</span>
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
