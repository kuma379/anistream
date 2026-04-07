import express, { type Request, type Response } from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import type { IncomingMessage, ServerResponse } from "http";

const BASE = "https://www.sankavollerei.com/anime/winbu";
const WINBU_BASE = "https://winbu.net";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
  Referer: "https://winbu.net/",
};

const JSON_HEADERS = {
  ...HEADERS,
  Accept: "application/json, text/plain, */*",
};

const api = axios.create({ baseURL: BASE, timeout: 25000, headers: JSON_HEADERS });
const html = axios.create({ baseURL: WINBU_BASE, timeout: 25000, headers: HEADERS });

function cleanViews(v?: string): string {
  if (!v) return "";
  return v.split(/[\t\n]/)[0].trim();
}

function toContentType(t?: string): "anime" | "series" | "film" {
  if (t === "film") return "film";
  if (t === "series") return "series";
  return "anime";
}

function mapItem(item: Record<string, string>) {
  return {
    title: item.title ?? "",
    slug: item.id ?? item.slug ?? "",
    poster: item.image ?? item.poster ?? "",
    type: item.type ?? "",
    status: item.status ?? "",
    rating: item.rating ?? "",
    episode: item.episode ?? "",
    views: cleanViews(item.views ?? ""),
    time: item.time ?? "",
    contentType: toContentType(item.type),
  };
}

function extractList(res: Record<string, unknown>): Record<string, string>[] {
  const data = res.data;
  if (Array.isArray(data)) return data as Record<string, string>[];
  if (Array.isArray(res.results)) return res.results as Record<string, string>[];
  if (Array.isArray(res)) return res as Record<string, string>[];
  return [];
}

function extractPagination(res: Record<string, unknown>, page: number) {
  const p = (res.pagination ?? {}) as Record<string, number>;
  return {
    totalPages: p.total_pages ?? 1,
    currentPage: p.current_page ?? page,
  };
}

function extractSlugFromUrl(url: string): string {
  return url.replace(/\/$/, "").split("/").pop() || "";
}

async function scrapeHome() {
  const { data: res } = await api.get("/home");
  const d = (res.data ?? res) as Record<string, Record<string, string>[]>;
  return {
    featured: (d.top10_anime ?? []).map(mapItem),
    latest: (d.latest_anime ?? []).map(mapItem),
    popular: (d.top10_film ?? []).map(mapItem),
    ongoing: (d.latest_series ?? []).map(mapItem),
    latestFilm: (d.latest_film ?? []).map(mapItem),
    tvShow: (d.tv_show ?? []).map(mapItem),
  };
}

async function scrapeSearch(q: string, page = 1) {
  const { data: res } = await api.get("/search", { params: { q, page } });
  return {
    results: ((res.results ?? []) as Record<string, string>[]).map(mapItem),
    ...extractPagination(res, page),
  };
}

const CATEGORY_MAP: Record<string, string> = {
  animedonghua: "animedonghua",
  film: "film",
  series: "series",
  tvshow: "tvshow",
  others: "others",
  ongoing: "ongoing",
  completed: "completed",
  populer: "populer",
  latest: "latest",
  update: "update",
  "all-anime": "all-anime",
  "all-anime-reverse": "all-anime-reverse",
};

async function scrapeAnimeList(category: string, page = 1) {
  const endpoint = CATEGORY_MAP[category] ?? category;
  const { data: res } = await api.get(`/${endpoint}`, { params: { page } });
  return {
    results: extractList(res).map(mapItem),
    ...extractPagination(res, page),
  };
}

async function scrapeCatalog(params: {
  title?: string;
  page?: number;
  order?: string;
  type?: string;
  status?: string;
}) {
  const { data: res } = await api.get("/catalog", { params });
  return {
    results: extractList(res).map(mapItem),
    ...extractPagination(res, params.page ?? 1),
  };
}

async function scrapeGenres() {
  const { data: res } = await api.get("/genres");
  const genres = Array.isArray(res.data) ? res.data : (res.genres ?? []);
  return { genres };
}

async function scrapeByGenre(slug: string, page = 1) {
  const { data: res } = await api.get(`/genre/${slug}`, { params: { page } });
  return {
    results: extractList(res).map(mapItem),
    ...extractPagination(res, page),
    genre: (res as Record<string, unknown>).genre,
  };
}

async function scrapeSchedule(day?: string) {
  const { data: res } = await api.get("/schedule", { params: day ? { day } : {} });
  return res;
}

async function scrapeAnimeDetail(slug: string, type: "anime" | "series" | "film") {
  const endpoint = type === "film" ? "film" : type === "series" ? "series" : "anime";
  const { data: res } = await api.get(`/${endpoint}/${slug}`);
  return (res as Record<string, unknown>).data ?? res;
}

async function scrapeEpisode(slug: string) {
  // 1. Ambil data dari JSON API (judul + download)
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

  // 2. Scrape halaman winbu.net untuk ambil streaming server
  const servers: { name: string; post?: string; nume?: string; type?: string }[] = [];
  let prevEpisode: string | undefined;
  let nextEpisode: string | undefined;
  let animeSlug: string | undefined;

  try {
    const htmlRes = await html.get(`/${slug}/`);
    const $ = cheerio.load(htmlRes.data);

    // Cari tombol server streaming (data-post)
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

    // Fallback: cari link server alternatif
    if (servers.length === 0) {
      $(".mirror .mirrorlink, .server a, [class*='server']").each((_, el) => {
        const $el = $(el);
        const post = $el.attr("data-post") || "";
        const nume = $el.attr("data-nume") || "1";
        const serverType = $el.attr("data-type") || "schtml";
        const name = $el.text().trim() || serverType;
        if (post) servers.push({ name, post, nume, type: serverType });
      });
    }

    // Navigasi prev/next episode
    const prevHref = $(".nvs.nvsc a.prev, .nvsc a.prev, [rel=prev], a.prev").attr("href") || "";
    const nextHref = $(".nvs.nvsc a.next, .nvsc a.next, [rel=next], a.next").attr("href") || "";

    prevEpisode = extractSlugFromUrl(prevHref) || undefined;
    nextEpisode = extractSlugFromUrl(nextHref) || undefined;

    // Slug anime parent dari breadcrumb
    const animeHref =
      $(".breadcrumb a:nth-child(2), .series-breadcrumb a, .singleheader a").attr("href") || "";
    animeSlug = extractSlugFromUrl(animeHref) || undefined;
  } catch {
    // Jika scraping gagal, lanjutkan dengan data API saja
  }

  return {
    title,
    servers,
    downloads,
    prevEpisode,
    nextEpisode,
    animeSlug,
  };
}

async function scrapeServer(post: string, nume: string, type: string) {
  // Ambil embed URL dari JSON API
  const { data: res } = await api.get<{
    status: string;
    embed_url?: string;
    embedUrl?: string;
    html?: string;
  }>("/server", { params: { post, nume, type } });

  const embedUrl = res.embed_url || res.embedUrl || "";
  return { embedUrl };
}

const app = express();
app.use(cors());
app.use(express.json());

function sendError(res: Response, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  const status = (err as { response?: { status?: number } })?.response?.status ?? 500;
  res.status(status).json({ error: "Error", message: msg });
}

app.get("/api/healthz", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/api/anime/home", async (_req: Request, res: Response) => {
  try {
    res.json(await scrapeHome());
  } catch (err) {
    sendError(res, err);
  }
});

app.get("/api/anime/search", async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const page = Number(req.query.page ?? 1);
    if (!q) return res.status(400).json({ error: "BadRequest", message: "q is required" });
    res.json(await scrapeSearch(q, page));
  } catch (err) {
    sendError(res, err);
  }
});

app.get("/api/anime/list", async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as string) || "all-anime";
    const page = Number(req.query.page ?? 1);
    res.json(await scrapeAnimeList(category, page));
  } catch (err) {
    sendError(res, err);
  }
});

app.get("/api/anime/catalog", async (req: Request, res: Response) => {
  try {
    const { title, page, order, type, status } = req.query as Record<string, string>;
    res.json(await scrapeCatalog({ title, page: Number(page ?? 1), order, type, status }));
  } catch (err) {
    sendError(res, err);
  }
});

app.get("/api/anime/genres", async (_req: Request, res: Response) => {
  try {
    res.json(await scrapeGenres());
  } catch (err) {
    sendError(res, err);
  }
});

app.get("/api/anime/genre/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const page = Number(req.query.page ?? 1);
    res.json(await scrapeByGenre(slug, page));
  } catch (err) {
    sendError(res, err);
  }
});

app.get("/api/anime/schedule", async (req: Request, res: Response) => {
  try {
    const day = req.query.day as string | undefined;
    res.json(await scrapeSchedule(day));
  } catch (err) {
    sendError(res, err);
  }
});

app.get("/api/anime/detail/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const type = (req.query.type as "anime" | "series" | "film") || "anime";
    res.json(await scrapeAnimeDetail(slug, type));
  } catch (err) {
    sendError(res, err);
  }
});

app.get("/api/anime/episode/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    res.json(await scrapeEpisode(slug));
  } catch (err) {
    sendError(res, err);
  }
});

app.get("/api/anime/server", async (req: Request, res: Response) => {
  try {
    const { post, nume, type } = req.query as Record<string, string>;
    if (!post || !nume || !type) {
      return res
        .status(400)
        .json({ error: "BadRequest", message: "Parameters post, nume, type are required" });
    }
    res.json(await scrapeServer(post, nume, type));
  } catch (err) {
    sendError(res, err);
  }
});

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req as Request, res as Response);
}

