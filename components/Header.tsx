import Link from "next/link";
import { Gull } from "./Gull";
import { MobileNav } from "./MobileNav";
import { NAV_LINKS } from "./nav";

export function Header() {
  return (
    <header className="relative border-b border-gull/60 bg-chalk">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Gull className="h-7 w-14 shrink-0 text-harbour" />
          <span className="flex flex-col">
            <span className="font-display text-[1.4rem] font-semibold leading-none text-channel">
              Arun
            </span>
            <span className="mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-flint">
              Language Training &amp; Recruitment
            </span>
          </span>
        </Link>
        <nav aria-label="Site" className="hidden md:block">
          <ul className="flex items-center gap-7 text-[0.95rem]">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-channel transition-colors duration-150 hover:text-harbour-deep"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
