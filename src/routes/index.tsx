import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Hero, HeroSkeleton } from "@/components/anime/hero";
import { Row } from "@/components/anime/row";
import { ErrorState } from "@/components/anime/states";
import { fetchHome } from "@/lib/anime.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AniStream — Watch & Discover Anime" },
      {
        name: "description",
        content:
          "A premium anime discovery experience: trending, popular, top-rated and genre picks with cinematic artwork.",
      },
      { property: "og:title", content: "AniStream — Watch & Discover Anime" },
      {
        property: "og:description",
        content: "Trending, popular and top-rated anime with cinematic artwork and full metadata.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["home"],
    queryFn: () => fetchHome(),
    staleTime: 1000 * 60 * 5,
  });

  if (isError) {
    return (
      <div className="pt-24">
        <ErrorState onRetry={() => void refetch()} />
      </div>
    );
  }

  if (isPending || !data) {
    return (
      <>
        <HeroSkeleton />
        <div className="-mt-16 relative z-10">
          <Row title="Trending Now" items={[]} loading />
          <Row title="Popular Anime" items={[]} loading />
        </div>
      </>
    );
  }

  return (
    <>
      <Hero items={data.hero} />
      <div className="relative z-10 -mt-20 space-y-2 md:-mt-28">
        <Row
          title="Trending Now"
          items={data.trending}
          ranked
          action={
            <Link to="/trending" className="text-xs font-semibold text-primary hover:underline">
              See all
            </Link>
          }
        />
        <Row
          title="Popular Anime"
          items={data.popular}
          action={
            <Link to="/popular" className="text-xs font-semibold text-primary hover:underline">
              See all
            </Link>
          }
        />
        <Row title="Top Rated" items={data.topRated} />
        <Row title="Recently Added" items={data.latest} />
        <Row title="Recommended For You" items={data.recommended} />
        {data.genreRows.map((row) => (
          <Row
            key={row.slug}
            title={row.name}
            items={row.items}
            action={
              <Link
                to="/genres/$slug"
                params={{ slug: row.slug }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                See all
              </Link>
            }
          />
        ))}
      </div>
      <footer className="mt-12 border-t border-white/10 px-4 py-10 text-center text-xs text-muted-foreground md:px-8">
        Anime metadata provided by TMDB. AniStream is a discovery experience — streaming playback
        arrives in a future release.
      </footer>
    </>
  );
}
