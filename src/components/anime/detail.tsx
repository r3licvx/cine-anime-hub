import { useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { fetchSeason, fetchShow } from "@/lib/anime.functions";
import { useWatchlist } from "@/lib/watchlist";
import { cn } from "@/lib/utils";

import {
  IconBack,
  IconBookmark,
  IconCalendar,
  IconCheck,
  IconClock,
  IconClose,
  IconPlay,
  IconShare,
  IconStar,
} from "./icons";
import { Img, img } from "./media";
import { Row } from "./row";
import { ErrorState } from "./states";

export function AnimeDetail({ id, autoPlay }: { id: number; autoPlay?: boolean }) {
  const router = useRouter();
  const { has, toggle, ready } = useWatchlist();
  const [seasonNumber, setSeasonNumber] = useState<number | null>(null);
  const [player, setPlayer] = useState<string | null>(autoPlay ? "This title" : null);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["show", id],
    queryFn: () => fetchShow({ data: { id } }),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  useEffect(() => {
    setSeasonNumber(null);
  }, [id]);

  const seasons = (data?.seasons ?? []).filter((s) => s.episodeCount > 0);
  const activeSeason = seasonNumber ?? seasons[0]?.seasonNumber ?? null;

  const seasonQuery = useQuery({
    queryKey: ["season", id, activeSeason],
    queryFn: () => fetchSeason({ data: { id, seasonNumber: activeSeason as number } }),
    enabled: activeSeason !== null,
    staleTime: 1000 * 60 * 10,
  });

  if (isError) {
    return (
      <div className="pt-28">
        <ErrorState message={(error as Error)?.message} onRetry={() => void refetch()} />
      </div>
    );
  }

  if (isPending || !data) return <DetailSkeleton />;

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: data.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* dismissed */
    }
  };

  const saved = ready && has(data.id);

  return (
    <div className="pb-16">
      {/* Backdrop */}
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden md:h-[72vh]">
        <div className="zoom-in-soft absolute inset-0">
          <Img
            src={img(data.backdrop, "original")}
            alt={data.title}
            className="h-full w-full"
            rounded="rounded-none"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />

        <button
          onClick={() => router.history.back()}
          aria-label="Go back"
          className="glass fixed top-20 left-4 z-30 rounded-full p-2.5 transition-transform hover:-translate-x-0.5 md:left-8"
        >
          <IconBack width={18} height={18} />
        </button>
      </div>

      {/* Main info */}
      <div className="relative z-10 mx-auto -mt-40 max-w-[1600px] px-4 md:-mt-52 md:px-8">
        <div className="fade-up flex flex-col gap-6 md:flex-row md:items-end">
          <Img
            src={img(data.poster, "w500")}
            alt={data.title}
            className="w-32 shrink-0 shadow-2xl ring-1 ring-white/15 md:w-56"
            rounded="rounded-2xl"
          />

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl leading-tight font-extrabold tracking-tight md:text-5xl">
              {data.title}
            </h1>
            {data.originalTitle && data.originalTitle !== data.title && (
              <p className="mt-1 text-sm text-muted-foreground md:text-base">{data.originalTitle}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {data.rating > 0 && (
                <span className="flex items-center gap-1.5 font-semibold text-accent">
                  <IconStar width={14} height={14} />
                  {data.rating.toFixed(1)}
                  <span className="font-normal text-muted-foreground">
                    ({data.voteCount.toLocaleString()})
                  </span>
                </span>
              )}
              {data.firstAirDate && (
                <span className="flex items-center gap-1.5">
                  <IconCalendar width={14} height={14} />
                  {data.firstAirDate.slice(0, 4)}
                </span>
              )}
              {data.runtime && (
                <span className="flex items-center gap-1.5">
                  <IconClock width={14} height={14} />
                  {data.runtime} min
                </span>
              )}
              {data.status && (
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium">
                  {data.status}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {data.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-medium text-foreground/80"
                >
                  {g}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setPlayer(data.title)}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_16px_40px_-16px] shadow-primary transition-all hover:scale-105 active:scale-95"
              >
                <IconPlay width={16} height={16} /> Watch
              </button>
              <button
                onClick={() => {
                  toggle(data.id);
                  toast.success(saved ? "Removed from watchlist" : "Added to watchlist");
                }}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all hover:scale-105 active:scale-95",
                  saved ? "bg-white/15 text-primary" : "glass",
                )}
              >
                {saved ? <IconCheck width={16} height={16} /> : <IconBookmark width={16} height={16} />}
                {saved ? "In Watchlist" : "Add to Watchlist"}
              </button>
              <button
                onClick={() => void share()}
                className="glass flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all hover:scale-105 active:scale-95"
              >
                <IconShare width={16} height={16} /> Share
              </button>
            </div>
          </div>
        </div>

        <div className="fade-up mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            <h2 className="text-lg font-bold">Overview</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85 md:text-base">
              {data.overview || "No description available for this title yet."}
            </p>
          </div>

          <dl className="glass grid grid-cols-2 gap-4 rounded-2xl p-5 text-sm">
            <Info label="Seasons" value={String(data.numberOfSeasons || "—")} />
            <Info label="Episodes" value={String(data.numberOfEpisodes || "—")} />
            <Info label="First aired" value={data.firstAirDate || "—"} />
            <Info label="Last aired" value={data.lastAirDate || "—"} />
            <Info label="Popularity" value={String(data.popularity)} />
            <Info label="Language" value={data.language?.toUpperCase() || "—"} />
            <Info label="Country" value={data.countries.join(", ") || "—"} />
            <Info
              label="Studios"
              value={data.companies.map((c) => c.name).join(", ") || "—"}
            />
          </dl>
        </div>
      </div>

      {/* Seasons */}
      {seasons.length > 0 && activeSeason !== null && (
        <section className="mx-auto mt-12 max-w-[1600px] px-4 md:px-8">
          <h2 className="text-lg font-bold md:text-xl">Seasons</h2>
          <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1">
            {seasons.map((s) => (
              <button
                key={s.id}
                onClick={() => setSeasonNumber(s.seasonNumber)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-300",
                  s.seasonNumber === activeSeason
                    ? "bg-primary text-primary-foreground shadow-[0_10px_30px_-12px] shadow-primary"
                    : "glass text-muted-foreground hover:text-foreground",
                )}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div key={activeSeason} className="fade-up mt-5">
            {seasonQuery.isPending ? (
              <SeasonSkeleton />
            ) : seasonQuery.isError ? (
              <ErrorState
                message="This season's details couldn't be loaded."
                onRetry={() => void seasonQuery.refetch()}
              />
            ) : (
              seasonQuery.data && (
                <div className="flex flex-col gap-6 md:flex-row">
                  <Img
                    src={img(seasonQuery.data.poster, "w342")}
                    alt={seasonQuery.data.name}
                    className="w-28 shrink-0 md:w-44"
                    rounded="rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold md:text-lg">{seasonQuery.data.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {seasonQuery.data.episodes.length} episodes
                      {seasonQuery.data.airDate ? ` · ${seasonQuery.data.airDate}` : ""}
                    </p>
                    {seasonQuery.data.overview && (
                      <p className="mt-2 line-clamp-4 text-sm text-foreground/80">
                        {seasonQuery.data.overview}
                      </p>
                    )}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {seasonQuery.data.episodes.map((ep) => (
                        <button
                          key={ep.id}
                          onClick={() => setPlayer(`${ep.name || `Episode ${ep.episodeNumber}`}`)}
                          className="group glass flex gap-3 rounded-xl p-2 text-left transition-all hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/50"
                        >
                          <Img
                            src={img(ep.still, "w300")}
                            alt={ep.name || `Episode ${ep.episodeNumber}`}
                            className="aspect-video w-28 shrink-0"
                            rounded="rounded-lg"
                          />
                          <div className="min-w-0 flex-1 py-0.5">
                            <p className="text-[11px] font-semibold text-primary">
                              EP {ep.episodeNumber}
                            </p>
                            <p className="line-clamp-1 text-sm font-semibold">
                              {ep.name || "Untitled"}
                            </p>
                            <p className="line-clamp-2 text-[11px] text-muted-foreground">
                              {ep.overview || "No synopsis available."}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* Cast */}
      {data.cast.length > 0 && (
        <PeopleRow title="Cast" people={data.cast.map((c) => ({ ...c, sub: c.character ?? "" }))} />
      )}
      {data.crew.length > 0 && (
        <PeopleRow
          title="Crew"
          people={data.crew.map((c) => ({
            ...c,
            sub: [c.job, c.department].filter(Boolean).join(" · "),
          }))}
        />
      )}

      {data.recommendations.length > 0 && (
        <div className="mt-6">
          <Row title="More Like This" items={data.recommendations} />
        </div>
      )}

      {player && <PlayerModal title={player} onClose={() => setPlayer(null)} />}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium">{value}</dd>
    </div>
  );
}

function PeopleRow({
  title,
  people,
}: {
  title: string;
  people: { id: number; name: string; sub: string; profile: string | null }[];
}) {
  return (
    <section className="mx-auto mt-12 max-w-[1600px]">
      <h2 className="px-4 text-lg font-bold md:px-8 md:text-xl">{title}</h2>
      <div className="scrollbar-none mt-3 flex gap-4 overflow-x-auto px-4 pb-2 md:px-8">
        {people.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="w-24 shrink-0 text-center transition-transform duration-300 hover:-translate-y-1 md:w-28"
          >
            <Img
              src={img(p.profile, "w185")}
              alt={p.name}
              className="aspect-square w-full ring-1 ring-white/10"
              rounded="rounded-full"
            />
            <p className="mt-2 line-clamp-2 text-xs font-semibold">{p.name}</p>
            <p className="line-clamp-2 text-[11px] text-muted-foreground">{p.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlayerModal({ title, onClose }: { title: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass fade-up relative w-full max-w-lg rounded-2xl p-8 text-center"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 rounded-full p-2 text-muted-foreground transition hover:text-foreground"
        >
          <IconClose width={18} height={18} />
        </button>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary">
          <IconPlay width={22} height={22} />
        </span>
        <h3 className="mt-4 text-lg font-bold">Player coming soon</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Streaming for “{title}” isn't available yet. AniStream is currently a discovery
          experience — the player arrives in a future release.
        </p>
        <Link
          to="/browse"
          onClick={onClose}
          className="mt-5 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition hover:scale-105"
        >
          Keep browsing
        </Link>
      </div>
    </div>
  );
}

function SeasonSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="shimmer aspect-[2/3] w-28 rounded-xl md:w-44" />
      <div className="flex-1 space-y-3">
        <div className="shimmer h-5 w-40 rounded" />
        <div className="shimmer h-3 w-28 rounded" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shimmer h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div>
      <div className="shimmer h-[60vh] min-h-[420px] w-full md:h-[72vh]" />
      <div className="mx-auto -mt-40 max-w-[1600px] px-4 md:-mt-52 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end">
          <div className="shimmer aspect-[2/3] w-32 rounded-2xl md:w-56" />
          <div className="flex-1 space-y-3">
            <div className="shimmer h-9 w-3/4 max-w-md rounded-lg" />
            <div className="shimmer h-3 w-48 rounded" />
            <div className="shimmer h-11 w-64 rounded-full" />
          </div>
        </div>
        <div className="shimmer mt-8 h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}