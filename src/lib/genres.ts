export type GenreDef = {
  slug: string;
  name: string;
  genreId?: number;
  keyword?: string;
  tint: string;
};

export const GENRES: GenreDef[] = [
  { slug: "action", name: "Action", genreId: 10759, tint: "from-rose-500/40" },
  { slug: "adventure", name: "Adventure", keyword: "adventure", tint: "from-amber-500/40" },
  { slug: "comedy", name: "Comedy", genreId: 35, tint: "from-yellow-400/40" },
  { slug: "drama", name: "Drama", genreId: 18, tint: "from-sky-500/40" },
  { slug: "fantasy", name: "Fantasy", genreId: 10765, tint: "from-violet-500/40" },
  { slug: "romance", name: "Romance", keyword: "romance", tint: "from-pink-500/40" },
  { slug: "horror", name: "Horror", keyword: "horror", tint: "from-red-700/40" },
  { slug: "mystery", name: "Mystery", genreId: 9648, tint: "from-indigo-500/40" },
  { slug: "sci-fi", name: "Sci-Fi", keyword: "science fiction", tint: "from-cyan-500/40" },
  { slug: "sports", name: "Sports", keyword: "sport", tint: "from-emerald-500/40" },
  { slug: "supernatural", name: "Supernatural", keyword: "supernatural", tint: "from-fuchsia-500/40" },
  { slug: "isekai", name: "Isekai", keyword: "isekai", tint: "from-teal-500/40" },
  { slug: "mecha", name: "Mecha", keyword: "mecha", tint: "from-slate-400/40" },
  { slug: "school", name: "School", keyword: "school", tint: "from-orange-500/40" },
];

export function findGenre(slug: string) {
  return GENRES.find((g) => g.slug === slug);
}