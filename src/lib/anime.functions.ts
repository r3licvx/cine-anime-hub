import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  getGenreList,
  getGenreShowcase,
  getHome,
  getPopular,
  getSearch,
  getShow,
  getSeason,
  getTopRated,
  getTrending,
  getWatchlistItems,
} from "./anime.server";

export const fetchHome = createServerFn({ method: "GET" }).handler(async () => getHome());

export const fetchTrending = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ page: z.number().min(1).max(500) }).parse(d))
  .handler(async ({ data }) => getTrending(data.page));

export const fetchPopular = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ page: z.number().min(1).max(500) }).parse(d))
  .handler(async ({ data }) => getPopular(data.page));

export const fetchTopRated = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ page: z.number().min(1).max(500) }).parse(d))
  .handler(async ({ data }) => getTopRated(data.page));

export const fetchSearch = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ q: z.string().max(80), page: z.number().min(1).max(500).default(1) }).parse(d),
  )
  .handler(async ({ data }) => getSearch(data.q, data.page));

export const fetchShow = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.number().int().positive() }).parse(d))
  .handler(async ({ data }) => getShow(data.id));

export const fetchSeason = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ id: z.number().int().positive(), seasonNumber: z.number().int().min(0) }).parse(d),
  )
  .handler(async ({ data }) => getSeason(data.id, data.seasonNumber));

export const fetchGenre = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ slug: z.string().max(40), page: z.number().min(1).max(500).default(1) }).parse(d),
  )
  .handler(async ({ data }) => getGenreList(data.slug, data.page));

export const fetchGenreShowcase = createServerFn({ method: "GET" }).handler(async () =>
  getGenreShowcase(),
);

export const fetchWatchlistItems = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ ids: z.array(z.number().int().positive()).max(60) }).parse(d),
  )
  .handler(async ({ data }) => getWatchlistItems(data.ids));