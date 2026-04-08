import type { IncomingMessage, ServerResponse } from "http";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE = "https://www.sankavollerei.com/anime/winbu";
const WINBU = "https://winbu.net";

const HDRS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
  "Referer": "https://winbu.net/",
};

const api = axios.create({ baseURL: BASE, timeout: 25000, headers: { ...HDRS, Accept: "application/json" } });
const web = axios.create({ baseURL: WINBU, timeout: 25000, headers: { ...HDRS, Accept: "text/html" } });

// ── helpers ──────────────────────────────────────────────────────────────────
type Dict = Record<string, unknown>;

function mapCard(item: Dict) {
  const t = String(item.type ?? "");
  return {
    title: String(item.title ?? ""),
    slug: String(item.id ?? item.slug ?? ""),
    poster: String(item.image ?? item.poster ?? ""),
    type: t,
    status: String(item.status ?? ""),
    rating: String(item.rating ?? ""),
    episode: String(item.episode ?? ""),
    contentType: t === "film" ? "film" : t === "series" ? "series" : "anime",
  };
}

function extractList(r: Dict): Dict[] {
  if (Array.isArray(r.data)) return r.data as Dict[];
  if (Array.isArray(r.results)) return r.results as Dict[];
  if (Array.isArray(r)) return r as Dict[];
  return [];
}

function makePagination(r: Dict, page: number) {
  const p = (r.pagination ?? {}) as Dict;
  const total = Number(p.total_pages ?? 0);
  return {
    currentPage: Number(p.current_page ?? page),
    hasNext: p.has_next_page === true || (total > 0 && page < total),
    hasPrev: page > 1,
  };
}

function slugFromUrl(url: string) {
  return url.replace(/\/$/, "").split("/").pop() ?? "";
}

// ── scrapers ─────────────────────────────────────────────────────────────────
async function getHome() {
  const { data: r } = await api.get("/home");
  const d = (r.data ?? r) as Record<string, Dict[]>;
  return {
    featured: [...(d.top10_anime ?? []), ...(d.top10_film ?? [])].slice(0, 12).map(mapCard),
    latest: (d.latest_anime ?? []).map(mapCard),
    popular: (d.top10_anime ?? []).slice(0, 10).map(mapCard),
    ongoing: (d.latest_anime ?? []).slice(0, 12).map(mapCard),
  };
}

async function getSearch(q: string, page = 1) {
  const { data: r } = await api.get("/search", { params: { q, page } });
  return { data: ((r.results ?? []) as Dict[]).map(mapCard), pagination: makePagination(r, page) };
}

async function getList(category: string, page = 1) {
  const { data: r } = await api.get(`/${category}`, { params: { page } });
  return { data: extractList(r).map(mapCard), pagination: makePagination(r, page) };
}

async function getCatalog(params: Dict) {
  const page = Number(params.page ?? 1);
  const { data: r } = await api.get("/catalog", { params });
  return { data: extractList(r).map(mapCard), pagination: makePagination(r, page) };
}

async function getGenres() {
  const { data: r } = await api.get("/genres");
  const list = (Array.isArray(r.data) ? r.data : Array.isArray(r.genres) ? r.genres : []) as Dict[];
  return { data: list.map(g => ({ name: String(g.name ?? ""), slug: String(g.slug ?? ""), count: String(g.count ?? "") })) };
}

async function getByGenre(slug: string, page = 1) {
  const { data: r } = await api.get(`/genre/${slug}`, { params: { page } });
  return { data: extractList(r).map(mapCard), pagination: makePagination(r, page) };
}

async function getSchedule(day?: string) {
  const { data: r } = await api.get("/schedule", { params: day ? { day } : {} });
  const list = (Array.isArray(r.data) ? r.data : []) as Dict[];
  return {
    schedule: [{
      day: String(r.day ?? day ?? "senin"),
      anime: list.map(x => ({ title: String(x.title ?? ""), slug: String(x.id ?? ""), poster: String(x.image ?? ""), type: String(x.type ?? ""), rating: String(x.score ?? ""), contentType: "anime" })),
    }],
    availableDays: r.available_days ?? [],
  };
}

async function getDetail(slug: string, type: string) {
  const ep = type === "film" ? "film" : type === "series" ? "series" : "anime";
  const { data: r } = await api.get(`/${ep}/${slug}`);
  const d = (r.data ?? r) as Dict;
  const info = (d.info ?? {}) as Dict;
  return {
    title: String(d.title ?? ""),
    poster: String(d.image ?? ""),
    synopsis: String(d.synopsis ?? ""),
    genres: Array.isArray(info.genres) ? (info.genres as Dict[]).map(g => String(g.name ?? "")) : [],
    status: info.status, type: String(info.type ?? type), rating: info.rating,
    episodes: info.episodes_count, duration: info.duration, studio: info.studio,
    released: (info.release_date ?? info.season) as string | undefined,
    episodeList: Array.isArray(d.episodes) ? (d.episodes as Dict[]).map(ep => ({ title: String(ep.title ?? ""), slug: String(ep.id ?? "") })) : [],
    recommendations: Array.isArray(d.recommendations) ? (d.recommendations as Dict[]).slice(0, 8).map(mapCard) : [],
  };
}

async function getEpisode(slug: string) {
  const [apiRes, htmlRes] = await Promise.allSettled([
    api.get(`/episode/${slug}`),
    web.get(`/${slug}/`),
  ]);

  const epData = apiRes.status === "fulfilled" ? ((apiRes.value.data?.data ?? {}) as Dict) : {};
  const title = String(epData.title ?? slug);
  const downloads = Array.isArray(epData.downloads) ? epData.downloads : [];
  const servers: { name: string; post?: string; nume?: string; type?: string }[] = [];
  let prevEpisode: string | undefined, nextEpisode: string | undefined;
  let animeSlug: string | undefined, animeTitle: string | undefined;

  // Primary: use streams data from API response (most reliable)
  if (Array.isArray(epData.streams) && (epData.streams as Dict[]).length > 0) {
    (epData.streams as Dict[]).forEach(s => {
      const d = (s.data ?? {}) as Dict;
      const post = String(d.post ?? "");
      if (post) {
        const serverName = String(s.server ?? "Server");
        const resolution = String(s.resolution ?? "");
        servers.push({
          name: resolution ? `${serverName} (${resolution})` : serverName,
          post,
          nume: String(d.nume ?? "1"),
          type: String(d.type ?? "schtml"),
        });
      }
    });
  }

  if (htmlRes.status === "fulfilled") {
    const $ = cheerio.load(htmlRes.value.data as string);

    // Anime title from page heading
    animeTitle = $("h1.titless, h1.headpost, .animetitle-episode").first().text().trim() || undefined;

    // Fallback: scrape servers from HTML if API streams were empty
    if (servers.length === 0) {
      $(".east_player_option[data-post], [data-post]").each((_, el) => {
        const $el = $(el);
        const post = $el.attr("data-post");
        if (post) {
          const name = $el.find("span").text().trim() || $el.text().trim() || "Server";
          servers.push({
            name,
            post,
            nume: $el.attr("data-nume") ?? "1",
            type: $el.attr("data-type") ?? "schtml",
          });
        }
      });
    }

    // Prev/next episode navigation
    prevEpisode = slugFromUrl($(".naveps .nvs:not(.rght):not(.nvsc) a").first().attr("href") ?? "") || undefined;
    nextEpisode = slugFromUrl($(".naveps .nvs.rght a").first().attr("href") ?? "") || undefined;

    // Anime slug from "All Episode" link in navigation
    animeSlug = slugFromUrl($(".nvs.nvsc a").first().attr("href") ?? "") || undefined;
  }

  return { title, animeTitle, servers, downloads, prevEpisode, nextEpisode, animeSlug };
}

async function getServer(post: string, nume: string, type: string) {
  const { data: r } = await api.get("/server", { params: { post, nume, type } });
  return { embedUrl: String(r.embed_url ?? r.embedUrl ?? "") };
}


// ── ad-free proxy ─────────────────────────────────────────────────────────────
async function proxyEmbed(embedUrl: string): Promise<string> {
  const origin = new URL(embedUrl).origin;
  const { data: html } = await axios.get(embedUrl, {
    timeout: 15000,
    responseType: "text",
    headers: {
      ...HDRS,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      Referer: origin + "/",
    },
  });

  // Inject <base> so relative asset URLs resolve to original host
  let out: string = (html as string).replace(/(<head[^>]*>)/i, `$1<base href="${origin}/">`);

  // Neutralise window.open / popunder patterns
  out = out
    .replace(/window\.open\s*\(/g, "void(0||window.open(")
    .replace(/window\.top\s*\.\s*location\s*=/g, "void(0)//=")
    .replace(/top\s*\.\s*location\s*=/g, "void(0)//=")
    .replace(/parent\s*\.\s*location\s*=/g, "void(0)//=")
    .replace(/document\.location\s*=/g, "void(0)//=")
    .replace(
      /<script[^>]*src=["'][^"']*(?:popads|popunder|popad|pop-under|pop-ad|clickunder|trafficjunky|mgid|exoclick|adsterra|hilltopads|moonads)[^"']*["'][^>]*>(\s*<\/script>)?/gi,
      "<!-- ad-script removed -->",
    )
    .replace(/onclick\s*=\s*["']window\.open[^"']*["']/gi, 'onclick="void(0)"');

  return out;
}

// ── request body reader ───────────────────────────────────────────────────────
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise(resolve => {
    const chunks: Buffer[] = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
  });
}

// ── main handler ─────────────────────────────────────────────────────────────
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") { res.statusCode = 200; res.end(); return; }

  const url = new URL(req.url ?? "/", "https://localhost");
  const path = url.pathname.replace(/^\/api/, "");
  const q = (k: string) => url.searchParams.get(k) ?? "";
  const qi = (k: string, def = 1) => Number(url.searchParams.get(k) ?? def);

  const send = (code: number, data: unknown) => {
    res.statusCode = code;
    res.end(JSON.stringify(data));
  };

  try {
    if (path === "/healthz") return send(200, { status: "ok" });
    if (path === "/anime/home") return send(200, await getHome());

    if (path === "/anime/search") {
      const qs = q("q");
      if (!qs) return send(400, { error: "BadRequest", message: "q required" });
      return send(200, await getSearch(qs, qi("page")));
    }

    if (path === "/anime/list") return send(200, await getList(q("category") || "all-anime", qi("page")));

    if (path === "/anime/catalog") {
      const params: Dict = { page: qi("page") };
      ["title","order","type","status"].forEach(k => { const v = q(k); if (v) params[k] = v; });
      return send(200, await getCatalog(params));
    }

    if (path === "/anime/genres") return send(200, await getGenres());

    const genre = path.match(/^\/anime\/genre\/(.+)$/);
    if (genre) return send(200, await getByGenre(genre[1], qi("page")));

    if (path === "/anime/schedule") return send(200, await getSchedule(q("day") || undefined));

    const detail = path.match(/^\/anime\/detail\/(.+)$/);
    if (detail) return send(200, await getDetail(detail[1], q("type") || "anime"));

    const episode = path.match(/^\/anime\/episode\/(.+)$/);
    if (episode) return send(200, await getEpisode(episode[1]));

    if (path === "/anime/server") {
      const post = q("post"), nume = q("nume"), type = q("type");
      if (!post || !nume || !type) return send(400, { error: "BadRequest", message: "post, nume, type required" });
      return send(200, await getServer(post, nume, type));
    }

    if (path === "/anime/proxy") {
      const rawUrl = q("url");
      if (!rawUrl) return send(400, { error: "BadRequest", message: "url required" });
      let parsedUrl: URL;
      try { parsedUrl = new URL(rawUrl); } catch { return send(400, { error: "BadRequest", message: "invalid url" }); }
      if (!["http:", "https:"].includes(parsedUrl.protocol)) return send(400, { error: "BadRequest", message: "only http/https allowed" });

      const proxiedHtml = await proxyEmbed(rawUrl);
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      // Permissive CSP without sandbox directive — allows video players to work correctly
      res.setHeader(
        "Content-Security-Policy",
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; media-src * data: blob:; frame-src *; connect-src *;"
      );
      // Allow embedding from same origin (the app proxies on same domain)
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.removeHeader("Access-Control-Allow-Origin");
      res.end(proxiedHtml);
      return;
    }

    return send(404, { error: "NotFound", message: `Route ${path} not found` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = (err as { response?: { status?: number } })?.response?.status ?? 500;
    return send(status, { error: "Error", message: msg });
  }
}
