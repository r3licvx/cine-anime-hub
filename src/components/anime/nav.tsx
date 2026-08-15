import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import {
  IconAnime,
  IconBookmark,
  IconGenres,
  IconHome,
  IconPopular,
  IconProfile,
  IconSearch,
  IconSettings,
  IconTrending,
} from "./icons";

export const LOGO_SRC = "https://imgh.in/host/gvq4wb";

const LINKS = [
  { to: "/", label: "Home", Icon: IconHome, exact: true },
  { to: "/browse", label: "Browse", Icon: IconAnime },
  { to: "/trending", label: "Trending", Icon: IconTrending },
  { to: "/popular", label: "Popular", Icon: IconPopular },
  { to: "/genres", label: "Genres", Icon: IconGenres },
  { to: "/watchlist", label: "Watchlist", Icon: IconBookmark },
] as const;

const MOBILE = [
  { to: "/", label: "Home", Icon: IconHome, exact: true },
  { to: "/browse", label: "Browse", Icon: IconAnime },
  { to: "/search", label: "Search", Icon: IconSearch },
  { to: "/genres", label: "Genres", Icon: IconGenres },
  { to: "/watchlist", label: "List", Icon: IconBookmark },
] as const;

export function Logo({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={cn("flex items-center gap-2", className)}>
      {failed ? (
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-glow text-sm font-black text-primary-foreground">
          A
        </span>
      ) : (
        <img
          src={LOGO_SRC}
          alt="AniStream logo"
          onError={() => setFailed(true)}
          className="h-8 w-auto object-contain md:h-9"
        />
      )}
    </span>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)]"
          : "bg-gradient-to-b from-black/70 to-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-4 md:px-8">
        <Link to="/" className="shrink-0 transition-transform hover:scale-105">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map(({ to, label, Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "text-foreground bg-white/10" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:text-foreground"
              >
                <Icon width={17} height={17} />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate({ to: "/search" })}
            aria-label="Search anime"
            className="glass flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-all hover:text-foreground md:px-4"
          >
            <IconSearch width={17} height={17} />
            <span className="hidden md:inline">Search anime</span>
          </button>
          <Link
            to="/watchlist"
            aria-label="Profile"
            className="hidden rounded-full bg-gradient-to-br from-brand to-brand-glow p-2 text-primary-foreground transition-transform hover:scale-110 sm:block"
          >
            <IconProfile width={18} height={18} />
          </Link>
          <Link
            to="/genres"
            aria-label="Settings"
            className="glass hidden rounded-full p-2 text-muted-foreground transition-all hover:rotate-45 hover:text-foreground lg:block"
          >
            <IconSettings width={18} height={18} />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function BottomNav() {
  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-50 lg:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {MOBILE.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-all duration-200 active:scale-90"
            >
              <Icon width={21} height={21} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}