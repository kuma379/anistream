/**
 * Scraper & API Client untuk AniStream
 *
 * Sumber data: https://www.sankavollerei.com/anime/winbu/...
 * Endpoint mengembalikan JSON langsung — tidak perlu Cheerio untuk listing/detail.
 * Cheerio hanya digunakan untuk halaman episode di winbu.net (ambil post ID streaming).
 *
 * Panduan penggunaan:
 *   import { scrapeHome, scrapeAnimeList, ... } from './scraper.js'
 */

import axios from "axios";
import * as cheerio from "cheerio";

// ─── HTTP Client ───────────────────────────────────────────────────────────────

/** Base URL API Sanka Vollerei */
const API_BASE = "https://www.sankavollerei.com/anime/winbu";

/** Base URL halaman episode winbu.net (untuk scraping streaming server) */
const WINBU_BASE = "https://winbu.net";

/** Header standar agar tidak diblokir */
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
};

/** Axios client untuk JSON API */
const api = axios.create({ baseURL: API_BASE, timeout: 20000, headers: HEADERS });

/** Axios client untuk scraping HTML winbu.net */
const html = axios.create({ baseURL: WINBU_BASE, timeout: 20000, headers: HEADERS });

// ─── Tipe Data ─────────────────────────────────────────────────────────────────

export interface AnimeCard {
  title: string;
  slug: string;
  poster: string;
  type?: string;
  status?: string;
  rating?: string;
  episode?: string;
  views?: string;
  time?: string;
  contentType: "anime" | "series" | "film";
}

export interface AnimeDetail {
  title: string;
  alternativeTitle?: string;
  poster: string;
  synopsis: string;
  genres: string[];
  status?: string;
  type?: string;
  rating?: string;
  episodes?: string;
  duration?: string;
  studio?: string;
  released?: string;
  episodeList: { title: string; slug: string; date?: string }[];
  recommendations?: AnimeCard[];
}

export interface EpisodeData {
  title: string;
  /** Server streaming yang bisa dipilih pengguna */
  servers: { name: string; post?: string; nume?: string; type?: string }[];
  /** URL embed dari server pertama (jika berhasil didapat) */
  embedUrl?: string;
  /** Download links per resolusi */
  downloads?: { resolution: string; links: { server: string; url: string }[] }[];
  prevEpisode?: string;
  nextEpisode?: string;
  animeSlug?: string;
}

// ─── Helper ────────────────────────────────────────────────────────────────────

/**
 * Deteksi contentType dari field "type" yang dikembalikan API.
 * API bisa mengembalikan "anime", "series", "film".
 */
function toContentType(apiType?: string): "anime" | "series" | "film" {
  if (apiType === "film") return "film";
  if (apiType === "series") return "series";
  return "anime";
}

/**
 * Bersihkan string views yang mengandung whitespace/tab dari HTML yang bocor.
 * Contoh: "3\t\t\n\t\t\t19" → "3"
 */
function cleanViews(v?: string): string {
  if (!v) return "";
  return v.split(/[\t\n]/)[0].trim();
}

/**
 * Map raw item dari listing API ke AnimeCard standar.
 * Field "id" dari API → slug kita
 */
function mapCard(item: Record<string, string>): AnimeCard {
  return {
    title: item.title || "",
    slug: item.id || "",
    poster: item.image || "",
    type: item.type || "",
    status: item.status || "",
    rating: item.rating || "",
    episode: item.episode || "",
    views: cleanViews(item.views),
    time: item.time || "",
    contentType: toContentType(item.type),
  };
}

// ─── Home ──────────────────────────────────────────────────────────────────────

/**
 * Ambil data halaman utama dari API /home.
 * Berisi: top10_anime, top10_film, latest_anime, latest_film, latest_series, tv_show
 */
export async function scrapeHome() {
  const { data } = await api.get<{
    status: string;
    data: {
      top10_anime?: Record<string, string>[];
      top10_film?: Record<string, string>[];
      latest_anime?: Record<string, string>[];
      latest_film?: Record<string, string>[];
      latest_series?: Record<string, string>[];
      tv_show?: Record<string, string>[];
    };
  }>("/home");

  const d = data.data;

  return {
    // Featured = gabungan top10 anime & film
    featured: [
      ...(d.top10_anime || []).map(mapCard),
      ...(d.top10_film || []).map(mapCard),
    ].slice(0, 12),
    // Latest = episode terbaru
    latest: (d.latest_anime || []).map(mapCard),
    // Popular = gabungkan top10 sebagai popular
    popular: [
      ...(d.top10_anime || []).map(mapCard),
    ].slice(0, 10),
    // Film terbaru
    latestFilm: (d.latest_film || []).map(mapCard),
    // Series terbaru
    latestSeries: (d.latest_series || []).map(mapCard),
    // TV Show
    tvShow: (d.tv_show || []).map(mapCard),
    // Ongoing = alias dari latest_anime
    ongoing: (d.latest_anime || []).slice(0, 12).map(mapCard),
  };
}

// ─── Search ────────────────────────────────────────────────────────────────────

/**
 * Cari anime/film berdasarkan keyword.
 * Endpoint: /search?q=QUERY
 */
export async function scrapeSearch(q: string, page = 1) {
  const { data } = await api.get<{
    status: string;
    query: string;
    results: Record<string, string>[];
    pagination?: {
      current_page: number;
      has_next_page: boolean;
      has_prev_page: boolean;
    };
  }>("/search", { params: { q } });

  return {
    data: (data.results || []).map(mapCard),
    pagination: {
      currentPage: data.pagination?.current_page || page,
      hasNext: data.pagination?.has_next_page || false,
      hasPrev: data.pagination?.has_prev_page || false,
    },
  };
}

// ─── Listing per Kategori ──────────────────────────────────────────────────────

/**
 * Ambil daftar konten berdasarkan kategori.
 *
 * Kategori yang didukung:
 *   animedonghua, film, series, tvshow, others,
 *   ongoing, completed, populer, latest, update,
 *   all-anime, all-anime-reverse
 *
 * Endpoint: /{category}?page=N
 */
export async function scrapeAnimeList(category: string, page = 1) {
  const { data } = await api.get<{
    status: string;
    data?: Record<string, string>[];
    pagination?: {
      current_page: number;
      has_next_page: boolean;
      has_prev_page: boolean;
    };
  }>(`/${category}`, { params: { page } });

  const items = (data.data || []).map(mapCard);

  return {
    data: items,
    pagination: {
      currentPage: data.pagination?.current_page || page,
      hasNext: data.pagination?.has_next_page || false,
      hasPrev: data.pagination?.has_prev_page || page > 1,
    },
  };
}

// ─── Catalog ───────────────────────────────────────────────────────────────────

/**
 * Ambil catalog dengan filter.
 * Endpoint: /catalog?title=...&page=1&order=update&type=TV&status=Currently+Airing
 */
export async function scrapeCatalog(params: {
  title?: string;
  page?: number;
  order?: string;
  type?: string;
  status?: string;
}) {
  const page = params.page || 1;
  const { data } = await api.get<{
    status: string;
    data?: Record<string, string>[];
    pagination?: {
      current_page: number;
      has_next_page: boolean;
      has_prev_page: boolean;
    };
  }>("/catalog", { params: { ...params, page } });

  return {
    data: (data.data || []).map(mapCard),
    pagination: {
      currentPage: data.pagination?.current_page || page,
      hasNext: data.pagination?.has_next_page || false,
      hasPrev: data.pagination?.has_prev_page || page > 1,
    },
  };
}

// ─── Genres ────────────────────────────────────────────────────────────────────

/**
 * Ambil semua genre yang tersedia.
 * Endpoint: /genres
 */
export async function scrapeGenres() {
  const { data } = await api.get<{
    status: string;
    total?: number;
    data: { name: string; slug: string; count: number; url?: string }[];
  }>("/genres");

  return {
    data: (data.data || []).map((g) => ({
      name: g.name,
      slug: g.slug,
      count: String(g.count || ""),
    })),
  };
}

/**
 * Ambil daftar anime berdasarkan genre.
 * Endpoint: /genre/{slug}?page=N
 */
export async function scrapeByGenre(genreSlug: string, page = 1) {
  const { data } = await api.get<{
    status: string;
    data?: Record<string, string>[];
    pagination?: {
      current_page: number;
      has_next_page: boolean;
      has_prev_page: boolean;
    };
  }>(`/genre/${genreSlug}`, { params: { page } });

  return {
    data: (data.data || []).map(mapCard),
    pagination: {
      currentPage: data.pagination?.current_page || page,
      hasNext: data.pagination?.has_next_page || false,
      hasPrev: data.pagination?.has_prev_page || page > 1,
    },
  };
}

// ─── Schedule ──────────────────────────────────────────────────────────────────

/**
 * Ambil jadwal tayang.
 * Endpoint: /schedule?day=senin
 * day: senin | selasa | rabu | kamis | jumat | sabtu | minggu
 */
export async function scrapeSchedule(day?: string) {
  const params = day ? { day } : {};
  const { data } = await api.get<{
    status: string;
    day?: string;
    available_days?: string[];
    data?: {
      title: string;
      id: string;
      type?: string;
      time?: string;
      image?: string | null;
      score?: string;
      url?: string;
    }[];
  }>("/schedule", { params });

  const animeList: AnimeCard[] = (data.data || []).map((item) => ({
    title: item.title,
    slug: item.id,
    poster: item.image || "",
    type: item.type || "",
    rating: item.score || "",
    contentType: "anime" as const,
    time: item.time,
  }));

  return {
    schedule: [
      {
        day: data.day || day || "senin",
        anime: animeList,
      },
    ],
    availableDays: data.available_days || [],
  };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

/**
 * Ambil detail anime/series/film.
 * Endpoint: /{type}/{slug}
 * type: anime | series | film
 */
export async function scrapeAnimeDetail(slug: string, type: "anime" | "series" | "film") {
  const { data } = await api.get<{
    status: string;
    type?: string;
    data: {
      title: string;
      image?: string;
      synopsis?: string;
      info?: {
        rating?: string;
        season?: string;
        genres?: { name: string; url?: string }[];
        status?: string;
        type?: string;
        episodes_count?: string;
        duration?: string;
        studio?: string;
        release_date?: string;
      };
      episodes?: { title: string; id: string; link?: string }[];
      recommendations?: Record<string, string>[];
    };
  }>(`/${type}/${slug}`);

  const d = data.data;
  const info = d.info || {};

  return {
    title: d.title || "",
    alternativeTitle: undefined as string | undefined,
    poster: d.image || "",
    synopsis: d.synopsis || "",
    genres: (info.genres || []).map((g) => g.name),
    status: info.status,
    type: info.type || type,
    rating: info.rating,
    episodes: info.episodes_count,
    duration: info.duration,
    studio: info.studio,
    released: info.release_date || info.season,
    episodeList: (d.episodes || []).map((ep) => ({
      title: ep.title,
      slug: ep.id,
    })),
    recommendations: (d.recommendations || [])
      .filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i) // deduplicate
      .slice(0, 8)
      .map(mapCard),
  };
}

// ─── Episode ──────────────────────────────────────────────────────────────────

/**
 * Ambil data episode: download links dari JSON API + streaming server dari HTML winbu.net.
 *
 * Endpoint JSON: /episode/{slug} → download links
 * Endpoint HTML: winbu.net/{slug}/ → streaming server post IDs
 */
export async function scrapeEpisode(slug: string) {
  // 1. Ambil download links dari JSON API
  const apiResult = await api
    .get<{
      status: string;
      data?: {
        title?: string;
        downloads?: { resolution: string; links: { server: string; url: string }[] }[];
      };
    }>(`/episode/${slug}`)
    .catch(() => null);

  const epData = apiResult?.data?.data;
  const title = epData?.title || slug;
  const downloads = epData?.downloads || [];

  // 2. Scrape halaman HTML winbu.net untuk ambil streaming server (data-post, data-type, data-nume)
  const servers: { name: string; post?: string; nume?: string; type?: string }[] = [];

  try {
    const htmlRes = await html.get(`/${slug}/`);
    const $ = cheerio.load(htmlRes.data);

    // Cari elemen dengan data-post (tombol pilih server streaming)
    $("[data-post]").each((_, el) => {
      const $el = $(el);
      const name = $el.text().trim() || $el.attr("data-type") || "Server";
      const post = $el.attr("data-post");
      const nume = $el.attr("data-nume");
      const serverType = $el.attr("data-type") || "schtml";
      if (post) {
        servers.push({ name, post, nume: nume || "1", type: serverType });
      }
    });

    // Alternatif: cari class mirror atau server link
    if (servers.length === 0) {
      $(".mirror .mirrorlink, .server a, [class*='server']").each((_, el) => {
        const $el = $(el);
        const post = $el.attr("data-post") || $el.data("post")?.toString();
        const nume = $el.attr("data-nume") || "1";
        const serverType = $el.attr("data-type") || "schtml";
        const name = $el.text().trim() || serverType;
        if (post) servers.push({ name, post, nume, type: serverType });
      });
    }

    // Prev/Next episode navigation
    const prevHref = $(".nvs.nvsc a.prev, .nvsc a.prev, [rel=prev]").attr("href") || "";
    const nextHref = $(".nvs.nvsc a.next, .nvsc a.next, [rel=next]").attr("href") || "";

    // Slug dari prev/next: ambil bagian path terakhir URL
    const extractSlugFromUrl = (url: string) =>
      url
        .replace(/\/$/, "")
        .split("/")
        .pop() || "";

    const prevEpisode = extractSlugFromUrl(prevHref);
    const nextEpisode = extractSlugFromUrl(nextHref);

    // Anime parent slug (dari breadcrumb atau link kembali)
    const animeHref =
      $(".breadcrumb a:nth-child(2), .series-breadcrumb a, .singleheader a").attr("href") || "";
    const animeSlug = extractSlugFromUrl(animeHref);

    return {
      title,
      servers,
      downloads,
      prevEpisode: prevEpisode || undefined,
      nextEpisode: nextEpisode || undefined,
      animeSlug: animeSlug || undefined,
    };
  } catch {
    // Jika scraping HTML gagal, kembalikan data API saja
    return { title, servers, downloads };
  }
}

// ─── Server / Embed ────────────────────────────────────────────────────────────

/**
 * Ambil URL embed video dari server.
 * Endpoint: /server?post=POST_ID&nume=1&type=schtml
 *
 * Response berisi embed_url yang bisa langsung dimasukkan ke iframe.
 */
export async function scrapeServer(post: string, nume: string, type: string) {
  const { data } = await api.get<{
    status: string;
    embed_url?: string;
    html?: string;
  }>("/server", { params: { post, nume, type } });

  // embed_url adalah URL langsung untuk iframe
  const embedUrl = data.embed_url || "";

  return { embedUrl };
}
