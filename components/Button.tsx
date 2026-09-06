import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The button (PLAN §11.4). Both variants carry the same 1.5px border box so
 * they sit at one height side by side; hover deepens or washes, pressing
 * nudges down a pixel (taste pass, 6 Sep 2026). Colour and transform only —
 * 150ms ease-out, stilled by the reduced-motion block in globals.css.
 */
const base =
  "inline-flex items-center justify-center gap-2 rounded-btn border-[1.5px] px-5 py-2.5 font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-60";

const variants = {
  primary:
    "border-harbour bg-harbour text-chalk shadow-lift hover:border-harbour-deep hover:bg-harbour-deep active:shadow-none",
  secondary:
    "border-harbour bg-transparent text-harbour-deep hover:bg-foam active:bg-foam",
} as const;

type Variant = keyof typeof variants;

export function Button({
  href,
  variant = "primary",
  className,
  children,
  ...rest
}: {
  href?: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `${base} ${variants[variant]} ${className ?? ""}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
