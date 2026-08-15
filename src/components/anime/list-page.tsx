import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import type { CardItem } from "@/lib/tmdb.server";

import { Grid } from "./row";
import { EmptyState, ErrorState, PageHeading } from "./states";

type Page = { items: CardItem[]; totalPages: number };

export function LoadMoreList({
  queryKey,
  fetchPage,
  eyebrow,
  title,
  description,
  ranked,
}: {
  queryKey: string;
  fetchPage: (page: number) => Promise<Page>;
  eyebrow?: string;
  title: string;
  description?: string;
  ranked?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<CardItem[]>([]);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [queryKey]);

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: [queryKey, page],
    queryFn: () => fetchPage(page),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!data) return;
    setItems((prev) => {
      const seen = new Set(prev.map((i) => i.id));
      const merged = page === 1 ? data.items : [...prev, ...data.items.filter((i) => !seen.has(i.id))];
      return merged;
    });
  }, [data, page]);

  const hasMore = data ? page < data.totalPages : false;

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-24 pb-16 md:px-8 md:pt-28">
      <PageHeading {...(eyebrow ? { eyebrow } : {})} title={title} {...(description ? { description } : {})} />

      {isError && items.length === 0 ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !isPending && items.length === 0 ? (
        <EmptyState title="Nothing here yet" hint="Try another category or search for a title." />
      ) : (
        <Grid items={items} loading={isPending || (isFetching && page > 1)} ranked={!!ranked} />
      )}

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            disabled={isFetching}
            onClick={() => setPage((p) => p + 1)}
            className="glass rounded-full px-7 py-3 text-sm font-semibold transition-all hover:scale-105 hover:text-primary disabled:opacity-50"
          >
            {isFetching ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}