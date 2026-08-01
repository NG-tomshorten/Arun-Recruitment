import Link from "next/link";
import type { ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-btn px-5 py-2.5 font-medium transition-colors duration-150 ease-out";

const variants = {
  primary: "bg-harbour text-chalk hover:bg-harbour-deep active:bg-harbour-deep",
  secondary:
    "border-[1.5px] border-harbour text-harbour-deep hover:bg-foam active:bg-foam",
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
