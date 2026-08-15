import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { LoadMoreList } from "@/components/anime/list-page";
import { fetchPopular, fetchTopRated, fetchTrending } from "@/lib/anime.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse All Anime — AniStream" },
      { name: "description", content: "Browse anime by popularity, rating or weekly trend." },
      { property: "og:title", content: "Browse All Anime — AniStream" },
      { property: "og:description", content: "Browse anime by popularity, rating or weekly trend." },
    ],
  }),
  component: BrowsePage,
});

const TABS = [
  { key: "popular", label: "Popular" },
  { key: "top", label: "Top Rated" },
  { key: "trending", label: "Trending" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function BrowsePage() {
  const [tab, setTab] = useState<TabKey>("popular");

  const fetchPage = (page: number) => {
    if (tab === "top") return fetchTopRated({ data: { page } });
    if (tab === "trending") return fetchTrending({ data: { page } });
    return fetchPopular({ data: { page } });
  };

  return (
    <div>
      <div className="mx-auto max-w-[1600px] px-4 pt-24 md:px-8 md:pt-28">
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200",
                tab === t.key
                  ? "bg-primary text-primary-foreground shadow-[0_10px_30px_-12px] shadow-primary"
                  : "glass text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="-mt-16">
        <LoadMoreList
          queryKey={`browse-${tab}`}
          fetchPage={fetchPage}
          eyebrow="Browse"
          title="All Anime"
          description="Every series in the catalogue, sorted the way you like it."
        />
      </div>
    </div>
  );
}