import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { CardItem } from "@/lib/tmdb.server";
import { cn } from "@/lib/utils";

import { IconInfo, IconPlay, IconStar } from "./icons";
import { img } from "./media";

export function Hero({ items }: { items: CardItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 8000);
    return () => clearInterval(t);
  }, [items.length]);

  const item = items[index];
  if (!item) return <HeroSkeleton />;

  return (
    <section className="relative h-[76vh] min-h-[520px] w-full overflow-hidden md:h-[86vh]">
      {items.map((it, i) => (
        <img
          key={it.id}
          src={img(it.backdrop, "original") ?? ""}
          alt=""
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-[1400ms] ease-out",
            i === index ? "scale-100 opacity-100" : "scale-105 opacity-0",
          )}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] items-end px-4 pb-20 md:px-8 md:pb-28">
        <div key={item.id} className="fade-up max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-primary uppercase ring-1 ring-primary/30">
            Featured anime
          </span>
          <h1 className="mt-3 text-3xl leading-[1.05] font-extrabold tracking-tight md:text-6xl">
            {item.title}
          </h1>
          {item.originalTitle && item.originalTitle !== item.title && (
            <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
              {item.originalTitle}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            {item.rating > 0 && (
              <span className="flex items-center gap-1 font-semibold text-accent">
                <IconStar width={14} height={14} /> {item.rating.toFixed(1)}
              </span>
            )}
            {item.year && <span>{item.year}</span>}
            <span className="rounded border border-white/20 px-1.5 py-0.5 text-[11px]">
              {item.type}
            </span>
          </div>

          <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-foreground/85 md:line-clamp-4 md:text-base">
            {item.overview}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/anime/$id"
              params={{ id: String(item.id) }}
              search={{ play: true }}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_16px_40px_-16px] shadow-primary transition-all hover:scale-105 hover:brightness-110 active:scale-95"
            >
              <IconPlay width={16} height={16} /> Watch Now
            </Link>
            <Link
              to="/anime/$id"
              params={{ id: String(item.id) }}
              className="glass flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all hover:scale-105 active:scale-95"
            >
              <IconInfo width={16} height={16} /> More Info
            </Link>
          </div>

          <div className="mt-7 flex items-center gap-2">
            {items.map((it, i) => (
              <button
                key={it.id}
                onClick={() => setIndex(i)}
                aria-label={`Show ${it.title}`}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === index ? "w-8 bg-primary" : "w-3 bg-white/30 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative h-[76vh] min-h-[520px] w-full overflow-hidden md:h-[86vh]">
      <div className="shimmer absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end gap-3 px-4 pb-24 md:px-8">
        <div className="shimmer h-4 w-28 rounded-full" />
        <div className="shimmer h-10 w-3/4 max-w-xl rounded-lg" />
        <div className="shimmer h-3 w-40 rounded" />
        <div className="shimmer h-16 w-full max-w-lg rounded-lg" />
        <div className="flex gap-3">
          <div className="shimmer h-11 w-36 rounded-full" />
          <div className="shimmer h-11 w-32 rounded-full" />
        </div>
      </div>
    </section>
  );
}