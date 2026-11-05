"use client";

import type { ReactNode } from "react";

/** Generic add/remove/reorder list used by the product and settings editors. */
export function ListEditor<T>({
  items,
  onChange,
  render,
  create,
  addLabel,
  max = 50,
  empty,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  create: () => T;
  addLabel: string;
  max?: number;
  empty?: string;
}) {
  const update = (i: number) => (patch: Partial<T>) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };
  return (
    <div className="grid gap-3">
      {items.length === 0 && empty ? <p className="text-sm text-mist">{empty}</p> : null}
      {items.map((item, i) => (
        <div key={i} className="rounded-[var(--radius-sm)] border border-rule-soft bg-ivory p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="label text-mist">#{i + 1}</span>
            <div className="flex gap-1 text-xs">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="min-h-8 rounded px-2 text-graphite hover:bg-linen disabled:opacity-30" aria-label="Move up">
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="min-h-8 rounded px-2 text-graphite hover:bg-linen disabled:opacity-30" aria-label="Move down">
                ↓
              </button>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="min-h-8 rounded px-2 text-danger hover:bg-danger-soft">
                Remove
              </button>
            </div>
          </div>
          {render(item, update(i), i)}
        </div>
      ))}
      {items.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...items, create()])}
          className="min-h-11 rounded-[var(--radius-sm)] border border-dashed border-steel text-sm text-graphite transition hover:border-ink hover:text-ink"
        >
          + {addLabel}
        </button>
      ) : null}
    </div>
  );
}
