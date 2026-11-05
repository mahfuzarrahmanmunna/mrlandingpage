import type { ComponentProps, ReactNode } from "react";

type Common = {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
};

const inputCls = (error?: string) =>
  `peer block w-full rounded-[var(--radius-sm)] border bg-porcelain px-4 text-[0.95rem] text-ink placeholder:text-steel transition-[border-color,box-shadow] duration-200 outline-none focus:border-ink focus:shadow-[0_0_0_3px_rgba(23,20,15,0.08)] ${
    error ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(156,58,43,0.12)]" : "border-rule hover:border-steel"
  }`;

function Meta({ name, error, hint }: { name: string; error?: string; hint?: ReactNode }) {
  return (
    <>
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 flex items-start gap-1.5 text-[0.8rem] text-danger">
          <svg aria-hidden viewBox="0 0 16 16" className="mt-0.5 size-3.5 shrink-0" fill="currentColor">
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm.75 9.75h-1.5v-1.5h1.5v1.5Zm0-3h-1.5v-4h1.5v4Z" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="mt-1.5 text-[0.8rem] text-mist">
          {hint}
        </p>
      ) : null}
    </>
  );
}

function Label({ htmlFor, label, optional }: { htmlFor: string; label: string; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between text-[0.8rem] font-semibold text-graphite">
      <span>{label}</span>
      {optional ? <span className="text-[0.72rem] font-normal text-mist">Optional</span> : null}
    </label>
  );
}

export function TextField({ label, name, error, hint, optional, ...rest }: Common & ComponentProps<"input">) {
  const id = `f-${name}`;
  return (
    <div>
      <Label htmlFor={id} label={label} optional={optional} />
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        aria-required={optional ? undefined : true}
        className={`${inputCls(error)} h-12`}
        {...rest}
      />
      <Meta name={name} error={error} hint={hint} />
    </div>
  );
}

export function TextArea({ label, name, error, hint, optional, ...rest }: Common & ComponentProps<"textarea">) {
  const id = `f-${name}`;
  return (
    <div>
      <Label htmlFor={id} label={label} optional={optional} />
      <textarea
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        aria-required={optional ? undefined : true}
        className={`${inputCls(error)} min-h-24 resize-y py-3 leading-relaxed`}
        {...rest}
      />
      <Meta name={name} error={error} hint={hint} />
    </div>
  );
}
