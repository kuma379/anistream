import express, { type Request, type Response } from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import type { IncomingMessage, ServerResponse } from "http";

const API_BASE = "https://www.sankavollerei.com/anime/winbu";
const WINBU_BASE = "https://winbu.net";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
};

const apiClient = axios.create({ baseURL: API_BASE, timeout: 25000, headers: HEADERS });
const htmlClient = axios.create({ baseURL: WINBU_BASE, timeout: 25000, headers: HEADERS });

function toContentType(apiType?: string): "anime" | "series" | "film" {
  if (apiType === "film") return "film";
  if (apiType === "series") return "series";
  return "anime";
}

function cleanViews(v?: string): string {
  if (!v) return "";
  return v.split(/[\t\n]/)[0].trim();
}

function mapCard(item: Record<string, string>) {
  return {
    title: item.title ?? "",
    slug: item.slug ?? "",
    poster: item.poster ?? "",
    type: item.type,
    status: item.status,
    rating: item.rating,
    episode: item.episode,
    views: cleanViews(item.views),
    time: item.time,
    contentType: toContentType(item.type),
  };
}

async function scrapeHome() {
  const { data } = await apiClient.get("/");
  return {
    featured: (data.featured ?? []).map(mapCard),
    latest: (data.latest ?? []).map(mapCard),
    popular: (data.popular ?? []).map(mapCard),
    ongoing: (data.ongoing ?? []).map(mapCard),
  };
}

async function scrapeSearch(q: string, page = 1) {
  const { data } = await apiClient.get("/search", { params: { q, page } });
  return {
    results: (data.results ?? data.data ?? []).map(mapCard),
    totalPages: data.totalPages ?? data.total_pages ?? 1,
    currentPage: page,
  };
}

async function scrapeAnimeList(category: string, page = 1) {
  const { data } = await apiClient.get(`/list/${category}`, { params: { page } });
  return {
    results: (data.results ?? data.data ?? []).map(mapCard),
    totalPages: data.totalPages ?? data.total_pages ?? 1,
    currentPage: page,
  };
}

async function scrapeCatalog(params: {
  title?: string;
  page?: number;
  order?: string;
  type?: string;
  status?: string;
}) {
  const { data } = await apiClient.get("/catalog", { params });
  return {
    results: (data.results ?? data.data ?? []).map(mapCard),
    totalPages: data.totalPages ?? data.total_pages ?? 1,
    currentPage: params.page ?? 1,
  };
}

async function scrapeGenres() {
  const { data } = await apiClient.get("/genres");
  return { genres: data.genres ?? data.data ?? data };
}

async function scrapeByGenre(genreSlug: string, page = 1) {
  const { data } = await apiClient.get(`/genre/${genreSlug}`, { params: { page } });
  return {
    results: (data.results ?? data.data ?? []).map(mapCard),
    totalPages: data.totalPages ?? data.total_pages ?? 1,
    currentPage: page,
    genre: data.genre,
  };
}

async function scrapeSchedule(day?: string) {
  const { data } = await apiClient.get("/schedule", { params: day ? { day } : {} });
  return data;
}

async function scrapeAnimeDetail(slug: string, type: "anime" | "series" | "film") {
  const { data } = await apiClient.get(`/detail/${slug}`, { params: { type } });
  return data;
}

async function scrapeEpisode(slug: string) {
  const { data: pageHtml } = await htmlClient.get(`/${slug}`);
  const $ = cheerio.load(pageHtml);

  const title = $("h1.episodetitle, h1.epstitle, .entry-title, h1").first().text().trim();
  const postId = $("[data-post]").first().attr("data-post") ?? "";

  const servers: { name: string; post?: string; nume?: string; type?: string }[] = [];
  $(".server-item, [data-id]").each((_i: number, el: cheerio.Element) => {
    const name = $(el).text().trim() || $(el).attr("data-server") || "Server";
    const post = postId || $(el).attr("data-post");
    const nume = $(el).attr("data-id") ?? $(el).attr("data-nume");
    const type = $(el).attr("data-type") ?? "iframe";
    if (name) servers.push({ name, post, nume, type });
  });

  const prevEpisode = $(".prev-episode a, .previouspostslink").attr("href")?.split("/").pop();
  const nextEpisode = $(".next-episode a, .nextpostslink").attr("href")?.split("/").pop();

  return { title, servers, prevEpisode, nextEpisode };
}

async function scrapeServer(post: string, nume: string, type: string) {
  const { data } = await apiClient.get("/server", { params: { post, nume, type } });
  return data;
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function sendError(res: Response, err: unknown, statusCode = 500) {
  const message = err instanceof Error ? err.message : "Unknown error";
  res.status(statusCode).json({ error: "Error", message });
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
    const page = parseInt((req.query.page as string) || "1", 10);
    if (!q) {
      return res.status(400).json({ error: "BadRequest", message: "Query 'q' is required" });
    }
    res.json(await scrapeSearch(q, page));
  } catch (err) {
    sendError(res, err);
  }
});

app.get("/api/anime/list", async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const page = parseInt((req.query.page as string) || "1", 10);
    if (!category) {
      return res.status(400).json({ error: "BadRequest", message: "Query 'category' is required" });
    }
    res.json(await scrapeAnimeList(category, page));
  } catch (err) {
    sendError(res, err);
  }
});

app.get("/api/anime/catalog", async (req: Request, res: Response) => {
  try {
    const { title, page, order, type, status } = req.query as Record<string, string>;
    res.json(await scrapeCatalog({ title, page: page ? parseInt(page, 10) : 1, order, type, status }));
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

app.get("/api/anime/genre/:genreSlug", async (req: Request, res: Response) => {
  try {
    const { genreSlug } = req.params;
    const page = parseInt((req.query.page as string) || "1", 10);
    res.json(await scrapeByGenre(genreSlug, page));
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
