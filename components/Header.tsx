import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { NavLink } from "./NavLink";
import { NAV_LINKS } from "./nav";

export function Header() {
  return (
    <header className="relative border-b border-gull/60 bg-chalk">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        {/* The lockup: brand mark + wordmark, one line at every width
            (taste pass, 6 Sep 2026 — the strapline used to wrap on phones
            and the mark read as a smudge at h-10). */}
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 rounded-btn sm:gap-3.5"
        >
          {/* The brand mark — three gulls, from brand/Logo.png */}
          <Image
            src="/images/logo.png"
            alt=""
            width={720}
            height={366}
            priority
            className="h-9 w-auto shrink-0 sm:h-12"
          />
          <span className="flex min-w-0 flex-col">
            <span className="font-display text-[1.35rem] font-semibold leading-none text-channel sm:text-[1.5rem]">
              Arun
            </span>
            <span className="mt-1 whitespace-nowrap text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-flint sm:text-[0.625rem] sm:tracking-[0.14em]">
              Language Training &amp; Recruitment
            </span>
          </span>
        </Link>
        <nav aria-label="Site" className="hidden md:block">
          <ul className="flex items-center gap-1 text-[0.95rem]">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <NavLink
                  href={link.href}
                  className="relative inline-block rounded-btn px-3 py-2 text-channel transition-colors duration-150 ease-out hover:text-harbour-deep after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-harbour after:opacity-0 after:transition-opacity after:duration-150 after:ease-out"
                  currentClassName="font-medium text-harbour-deep after:opacity-100"
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
