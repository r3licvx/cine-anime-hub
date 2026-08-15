import { findGenre, GENRES } from "./genres";
import {
  type CardItem,
  details,
  discover,
  keywordId,
  rateLimit,
  searchAnime,
  season,
  trending,
  tmdb,
  toCard,
  type Show,
} from "./tmdb.server";

const today = () => new Date().toISOString().slice(0, 10);

export async function getTrending(page = 1) {
  rateLimit("trending", 120);
  return trending(page);
}

export async function getPopular(page = 1) {
  rateLimit("popular", 120);
  return discover({ sort_by: "popularity.desc" }, page);
}

export async function getTopRated(page = 1) {
  rateLimit("top", 120);
  return discover({ sort_by: "vote_average.desc", "vote_count.gte": 200 }, page);
}

export async function getLatest(page = 1) {
  rateLimit("latest", 120);
  return discover(
    { sort_by: "first_air_date.desc", "first_air_date.lte": today(), "vote_count.gte": 3 },
    page,
  );
}

export async function getSearch(q: string, page = 1) {
  rateLimit("search", 180);
  const query = q.trim();
  if (!query) return { page: 1, totalPages: 0, items: [] as CardItem[] };
  return searchAnime(query, page);
}

export async function getShow(id: number) {
  rateLimit("show", 180);
  return details(id);
}

export async function getSeason(id: number, seasonNumber: number) {
  rateLimit("season", 180);
  return season(id, seasonNumber);
}

async function genreParams(slug: string) {
  const g = findGenre(slug);
  if (!g) throw new Error("Unknown genre.");
  if (g.genreId) return { with_genres: `16,${g.genreId}` };
  const kw = g.keyword ? await keywordId(g.keyword) : null;
  if (!kw) return { sort_by: "popularity.desc" };
  return { with_keywords: String(kw) };
}

export async function getGenreList(slug: string, page = 1) {
  rateLimit("genre", 180);
  const g = findGenre(slug);
  const extra = await genreParams(slug);
  const res = await discover({ sort_by: "popularity.desc", ...extra }, page);
  return { ...res, name: g?.name ?? slug, slug };
}

export async function getGenreShowcase() {
  rateLimit("showcase", 60);
  const entries = await Promise.all(
    GENRES.map(async (g) => {
      try {
        const res = await getGenreList(g.slug, 1);
        return {
          slug: g.slug,
          name: g.name,
          tint: g.tint,
          backdrop: res.items[0]?.backdrop ?? res.items[0]?.poster ?? null,
          count: res.items.length,
        };
      } catch {
        return { slug: g.slug, name: g.name, tint: g.tint, backdrop: null, count: 0 };
      }
    }),
  );
  return entries;
}

export async function getWatchlistItems(ids: number[]) {
  rateLimit("watchlist", 120);
  const items = await Promise.all(
    ids.map(async (id) => {
      try {
        const s = await tmdb<Show>(`/tv/${id}`);
        return toCard(s);
      } catch {
        return null;
      }
    }),
  );
  return items.filter((i): i is CardItem => i !== null);
}

export async function getHome() {
  rateLimit("home", 120);
  const [trendingRes, popular, topRated, latest] = await Promise.all([
    getTrending(1),
    getPopular(1),
    getTopRated(1),
    getLatest(1),
  ]);

  const heroPool = trendingRes.items.filter((i) => i.backdrop && i.overview);
  const hero = heroPool.slice(0, 5);

  const genreRows = await Promise.all(
    ["action", "romance", "fantasy", "comedy", "isekai"].map(async (slug) => {
      try {
        const res = await getGenreList(slug, 1);
        return { slug, name: res.name, items: res.items };
      } catch {
        return { slug, name: slug, items: [] as CardItem[] };
      }
    }),
  );

  const recommended = [...popular.items]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 20);

  return {
    hero,
    trending: trendingRes.items,
    popular: popular.items,
    topRated: topRated.items,
    latest: latest.items,
    recommended,
    genreRows,
  };
}