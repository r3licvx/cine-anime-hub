/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE = "https://api.themoviedb.org/3";

type Params = Record<string, string | number | undefined>;

const cache = new Map<string, { at: number; data: unknown }>();
const TTL = 1000 * 60 * 10;

const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (list.length > limit) throw new Error("Too many requests. Please slow down.");
}

export async function tmdb<T>(path: string, params: Params = {}): Promise<T> {
  const key = process.env["TMDB_API_KEY"];
  if (!key) throw new Error("TMDB is not configured on the server.");

  const url = new URL(BASE + path);
  url.searchParams.set("api_key", key);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }

  const cacheKey = url.toString().replace(key, "");
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < TTL) return cached.data as T;

  let res: Response;
  try {
    res = await fetch(url.toString());
  } catch {
    throw new Error("Could not reach the anime database. Check your connection and retry.");
  }
  if (res.status === 404) throw new Error("This title could not be found.");
  if (!res.ok) throw new Error("The anime database is unavailable right now. Please retry.");

  const data = (await res.json()) as T;
  cache.set(cacheKey, { at: Date.now(), data });
  return data;
}

export type Show = {
  id: number;
  name: string;
  original_name?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average?: number;
  vote_count?: number;
  first_air_date?: string;
  genre_ids?: number[];
  original_language?: string;
  media_type?: string;
};

export type CardItem = {
  id: number;
  title: string;
  originalTitle: string;
  poster: string | null;
  backdrop: string | null;
  rating: number;
  year: string;
  overview: string;
  type: string;
};

export const ANIMATION_GENRE = 16;

export function isAnime(s: Show) {
  const animated = (s.genre_ids ?? []).includes(ANIMATION_GENRE);
  const japanese = s.original_language === "ja";
  return animated && japanese;
}

export function toCard(s: Show): CardItem {
  return {
    id: s.id,
    title: s.name ?? "Untitled",
    originalTitle: s.original_name ?? "",
    poster: s.poster_path ?? null,
    backdrop: s.backdrop_path ?? null,
    rating: Math.round((s.vote_average ?? 0) * 10) / 10,
    year: s.first_air_date ? s.first_air_date.slice(0, 4) : "",
    overview: s.overview ?? "",
    type: s.media_type === "movie" ? "Movie" : "Series",
  };
}

const DISCOVER_BASE: Params = {
  with_genres: String(ANIMATION_GENRE),
  with_original_language: "ja",
  include_adult: "false",
  "vote_count.gte": 20,
};

export async function discover(extra: Params, page = 1) {
  const data = await tmdb<{ results: Show[]; total_pages: number; page: number }>(
    "/discover/tv",
    { ...DISCOVER_BASE, ...extra, page },
  );
  return {
    page: data.page,
    totalPages: Math.min(data.total_pages ?? 1, 500),
    items: (data.results ?? []).map(toCard),
  };
}

export async function trending(page = 1) {
  const data = await tmdb<{ results: Show[] }>("/trending/tv/week", { page });
  const filtered = (data.results ?? []).filter(isAnime);
  if (filtered.length >= 8) return { page, totalPages: 10, items: filtered.map(toCard) };
  const fallback = await discover({ sort_by: "popularity.desc" }, page);
  return fallback;
}

export async function searchAnime(query: string, page = 1) {
  const data = await tmdb<{ results: Show[]; total_pages: number }>("/search/tv", {
    query,
    page,
    include_adult: "false",
  });
  const results = (data.results ?? []).filter(
    (s) => s.original_language === "ja" && (s.genre_ids ?? []).includes(ANIMATION_GENRE),
  );
  return {
    page,
    totalPages: Math.min(data.total_pages ?? 1, 500),
    items: results.map(toCard),
  };
}

export async function keywordId(name: string): Promise<number | null> {
  const data = await tmdb<{ results: { id: number; name: string }[] }>("/search/keyword", {
    query: name,
  });
  const exact = data.results?.find((r) => r.name.toLowerCase() === name.toLowerCase());
  return (exact ?? data.results?.[0])?.id ?? null;
}

export type Person = {
  id: number;
  name: string;
  character?: string;
  job?: string;
  department?: string;
  profile: string | null;
};

export async function details(id: number) {
  const d = await tmdb<any>(`/tv/${id}`, {
    append_to_response: "aggregate_credits,recommendations,similar,content_ratings",
  });

  const cast: Person[] = (d.aggregate_credits?.cast ?? []).slice(0, 24).map((c: any) => ({
    id: c.id,
    name: c.name,
    character: c.roles?.[0]?.character ?? "",
    profile: c.profile_path ?? null,
  }));

  const crew: Person[] = (d.aggregate_credits?.crew ?? []).slice(0, 24).map((c: any) => ({
    id: c.id,
    name: c.name,
    job: c.jobs?.[0]?.job ?? c.job ?? "",
    department: c.known_for_department ?? c.department ?? "",
    profile: c.profile_path ?? null,
  }));

  const recs: Show[] = [
    ...((d.recommendations?.results ?? []) as Show[]),
    ...((d.similar?.results ?? []) as Show[]),
  ];
  const seen = new Set<number>();
  const recommendations = recs
    .filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)))
    .slice(0, 20)
    .map(toCard);

  return {
    id: d.id as number,
    title: (d.name ?? "") as string,
    originalTitle: (d.original_name ?? "") as string,
    overview: (d.overview ?? "") as string,
    poster: (d.poster_path ?? null) as string | null,
    backdrop: (d.backdrop_path ?? null) as string | null,
    rating: Math.round((d.vote_average ?? 0) * 10) / 10,
    voteCount: (d.vote_count ?? 0) as number,
    firstAirDate: (d.first_air_date ?? "") as string,
    lastAirDate: (d.last_air_date ?? "") as string,
    status: (d.status ?? "") as string,
    popularity: Math.round(d.popularity ?? 0),
    runtime: (d.episode_run_time?.[0] ?? null) as number | null,
    genres: ((d.genres ?? []) as any[]).map((g: any) => g.name as string),
    companies: ((d.production_companies ?? []) as any[]).map((c: any) => ({
      id: c.id as number,
      name: c.name as string,
      logo: (c.logo_path ?? null) as string | null,
    })),
    countries: (d.origin_country ?? []) as string[],
    language: (d.original_language ?? "") as string,
    numberOfSeasons: (d.number_of_seasons ?? 0) as number,
    numberOfEpisodes: (d.number_of_episodes ?? 0) as number,
    seasons: ((d.seasons ?? []) as any[]).map((s: any) => ({
      id: s.id as number,
      seasonNumber: s.season_number as number,
      name: s.name as string,
      overview: (s.overview ?? "") as string,
      poster: (s.poster_path ?? null) as string | null,
      episodeCount: (s.episode_count ?? 0) as number,
      airDate: (s.air_date ?? "") as string,
    })),
    cast,
    crew,
    recommendations,
  };
}

export async function season(id: number, seasonNumber: number) {
  const s = await tmdb<any>(`/tv/${id}/season/${seasonNumber}`);
  return {
    id: s.id as number,
    name: (s.name ?? "") as string,
    overview: (s.overview ?? "") as string,
    poster: (s.poster_path ?? null) as string | null,
    airDate: (s.air_date ?? "") as string,
    seasonNumber: (s.season_number ?? seasonNumber) as number,
    episodes: ((s.episodes ?? []) as any[]).map((e: any) => ({
      id: e.id as number,
      episodeNumber: e.episode_number as number,
      name: (e.name ?? "") as string,
      overview: (e.overview ?? "") as string,
      still: (e.still_path ?? null) as string | null,
      airDate: (e.air_date ?? "") as string,
      runtime: (e.runtime ?? null) as number | null,
      rating: Math.round((e.vote_average ?? 0) * 10) / 10,
    })),
  };
}