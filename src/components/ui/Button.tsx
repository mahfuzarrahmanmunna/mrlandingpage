import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "quiet";
type Size = "md" | "lg" | "sm";

const base =
  "group relative inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap font-sans font-bold transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-px focus-visible:outline-offset-4";

const variants: Record<Variant, string> = {
  primary:
    "bg-champagne text-white hover:bg-champagne-ink shadow-[0_10px_24px_-12px_rgba(22,163,74,0.7)] hover:shadow-[0_14px_30px_-12px_rgba(22,163,74,0.75)]",
  secondary: "border-2 border-champagne text-champagne-ink bg-white hover:bg-champagne-soft",
  ghost: "border border-rule bg-white text-ink hover:border-champagne hover:text-champagne-ink",
  quiet: "text-ink underline-offset-[6px] hover:underline",
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-6 text-[0.95rem]",
  lg: "min-h-14 px-8 text-lg",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} rounded-[var(--radius-sm)] ${extra}`;
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-4 animate-[spin-slow_0.9s_linear_infinite] rounded-full border-[1.5px] border-current border-r-transparent ${className}`}
    />
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  loadingLabel,
  icon,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
    >
      {loading ? <Spinner /> : icon}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
    </button>
  );
}

type LinkButtonProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  external?: boolean;
};

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  external,
  children,
  ...rest
}: LinkButtonProps) {
  const cls = buttonClass(variant, size, className);
  if (external || href.startsWith("tel:") || href.startsWith("http") || href.startsWith("#")) {
    return (
      <a
        href={href}
        className={cls}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {icon}
        <span>{children}</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {icon}
      <span>{children}</span>
    </Link>
  );
}
