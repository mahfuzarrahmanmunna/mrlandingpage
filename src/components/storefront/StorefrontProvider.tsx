"use client";

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";
import { clampQuantity } from "@/lib/pricing";
import type { PublicProduct, PublicSettings, PublicVariant } from "@/lib/types";

type Ctx = {
  product: PublicProduct;
  settings: PublicSettings;
  connected: boolean;
  variant: PublicVariant;
  setVariantKey: (key: string) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  maxQuantity: number;
  unitPrice: number;
  compareAtPrice?: number;
  subtotal: number;
  /** Images for the current variant, falling back to product images. */
  images: PublicProduct["images"];
  /** Server may report fresher stock (e.g. after a sold-out error). */
  applyStock: (variantKey: string, stock: number) => void;
};

const StorefrontContext = createContext<Ctx | null>(null);

function firstAvailable(variants: PublicVariant[]) {
  return variants.find((v) => v.available) ?? variants[0]!;
}

export function StorefrontProvider({
  product: initialProduct,
  settings,
  connected,
  children,
}: {
  product: PublicProduct;
  settings: PublicSettings;
  connected: boolean;
  children: ReactNode;
}) {
  const [product, setProduct] = useState(initialProduct);
  const [variantKey, setVariantKeyState] = useState(() => firstAvailable(initialProduct.variants).key);
  const [rawQuantity, setRawQuantity] = useState(1);

  const variant = product.variants.find((v) => v.key === variantKey) ?? firstAvailable(product.variants);
  const maxQuantity = Math.max(0, Math.min(variant.stock, settings.maxQuantityPerOrder));
  const quantity = clampQuantity(rawQuantity, variant.stock, settings.maxQuantityPerOrder) || 1;

  const setVariantKey = useCallback((key: string) => setVariantKeyState(key), []);
  const setQuantity = useCallback((q: number) => setRawQuantity(q), []);

  const applyStock = useCallback((key: string, stock: number) => {
    setProduct((p) => ({
      ...p,
      variants: p.variants.map((v) => (v.key === key ? { ...v, stock, available: stock > 0 } : v)),
    }));
  }, []);

  const value = useMemo<Ctx>(() => {
    const unitPrice = variant.price;
    return {
      product,
      settings,
      connected,
      variant,
      setVariantKey,
      quantity,
      setQuantity,
      maxQuantity,
      unitPrice,
      compareAtPrice: variant.compareAtPrice,
      subtotal: unitPrice * quantity,
      images: variant.images.length ? variant.images : product.images,
      applyStock,
    };
  }, [product, settings, connected, variant, setVariantKey, quantity, setQuantity, maxQuantity, applyStock]);

  return <StorefrontContext value={value}>{children}</StorefrontContext>;
}

export function useStorefront() {
  const ctx = use(StorefrontContext);
  if (!ctx) throw new Error("useStorefront must be used within StorefrontProvider");
  return ctx;
}
