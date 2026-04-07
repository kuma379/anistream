/**
 * Route handler untuk semua endpoint anime/film
 * Menggunakan fungsi scraper dari lib/scraper.ts
 */

import { Router } from "express";
import {
  scrapeHome,
  scrapeSearch,
  scrapeAnimeList,
  scrapeCatalog,
  scrapeGenres,
  scrapeByGenre,
  scrapeSchedule,
  scrapeAnimeDetail,
  scrapeEpisode,
  scrapeServer,
} from "../lib/scraper.js";

const router = Router();

/**
 * Helper untuk mengirim error response yang konsisten
 */
function sendError(res: any, err: unknown, statusCode = 500) {
  const message = err instanceof Error ? err.message : "Unknown error";
  res.status(statusCode).json({
    error: "ScrapingError",
    message,
  });
}

/**
 * GET /api/anime/home
 * Mengambil data halaman utama: featured, latest, popular, ongoing
 */
router.get("/home", async (req, res) => {
  try {
    const data = await scrapeHome();
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to scrape home");
    sendError(res, err);
  }
});

/**
 * GET /api/anime/search?q=keyword&page=1
 * Mencari anime berdasarkan keyword
 */
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q as string;
    const page = parseInt((req.query.page as string) || "1", 10);
    if (!q) {
      return res.status(400).json({ error: "BadRequest", message: "Query parameter 'q' is required" });
    }
    const data = await scrapeSearch(q, page);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to scrape search");
    sendError(res, err);
  }
});

/**
 * GET /api/anime/list?category=film&page=1
 * Mengambil daftar anime/film berdasarkan kategori
 * Kategori: animedonghua, film, series, tvshow, others, ongoing, completed, populer, latest, update, all-anime, all-anime-reverse
 */
router.get("/list", async (req, res) => {
  try {
    const category = req.query.category as string;
    const page = parseInt((req.query.page as string) || "1", 10);
    if (!category) {
      return res.status(400).json({ error: "BadRequest", message: "Query parameter 'category' is required" });
    }
    const data = await scrapeAnimeList(category, page);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to scrape list");
    sendError(res, err);
  }
});

/**
 * GET /api/anime/catalog?title=...&page=1&order=update&type=TV&status=...
 * Mengambil catalog dengan filter
 */
router.get("/catalog", async (req, res) => {
  try {
    const { title, page, order, type, status } = req.query as Record<string, string>;
    const data = await scrapeCatalog({
      title,
      page: page ? parseInt(page, 10) : 1,
      order,
      type,
      status,
    });
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to scrape catalog");
    sendError(res, err);
  }
});

/**
 * GET /api/anime/genres
 * Mengambil semua genre yang tersedia
 */
router.get("/genres", async (req, res) => {
  try {
    const data = await scrapeGenres();
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to scrape genres");
    sendError(res, err);
  }
});

/**
 * GET /api/anime/genre/:genreSlug?page=1
 * Mengambil anime berdasarkan genre tertentu
 */
router.get("/genre/:genreSlug", async (req, res) => {
  try {
    const { genreSlug } = req.params;
    const page = parseInt((req.query.page as string) || "1", 10);
    const data = await scrapeByGenre(genreSlug, page);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to scrape by genre");
    sendError(res, err);
  }
});

/**
 * GET /api/anime/schedule?day=senin
 * Mengambil jadwal tayang
 */
router.get("/schedule", async (req, res) => {
  try {
    const day = req.query.day as string | undefined;
    const data = await scrapeSchedule(day);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to scrape schedule");
    sendError(res, err);
  }
});

/**
 * GET /api/anime/detail/:slug?type=anime|series|film
 * Mengambil detail anime/series/film
 */
router.get("/detail/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const type = (req.query.type as "anime" | "series" | "film") || "anime";
    const data = await scrapeAnimeDetail(slug, type);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to scrape anime detail");
    sendError(res, err);
  }
});

/**
 * GET /api/anime/episode/:slug
 * Mengambil data episode dengan daftar server video
 */
router.get("/episode/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await scrapeEpisode(slug);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to scrape episode");
    sendError(res, err);
  }
});

/**
 * GET /api/anime/server?post=...&nume=...&type=...
 * Mengambil URL embed video dari server tertentu
 */
router.get("/server", async (req, res) => {
  try {
    const { post, nume, type } = req.query as Record<string, string>;
    if (!post || !nume || !type) {
      return res.status(400).json({ error: "BadRequest", message: "Parameters post, nume, type are required" });
    }
    const data = await scrapeServer(post, nume, type);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch server");
    sendError(res, err);
  }
});

export default router;
