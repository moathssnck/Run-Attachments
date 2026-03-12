import type { Express } from "express";

const ITHINK_BASE = "https://ithink-71db.onrender.com";
const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = { data: unknown; at: number };
const pageCache = new Map<string, CacheEntry>();

function pruneCache() {
  const now = Date.now();
  for (const [k, v] of pageCache.entries()) {
    if (now - v.at > CACHE_TTL_MS) pageCache.delete(k);
  }
}

export function registerPublicCardsRoute(app: Express) {
  app.get("/public/cards", async (req, res) => {
    const token = process.env.DEFAULT_API_TOKEN;
    if (!token) {
      return res.status(503).json({ error: "Public card browsing not available" });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 24));
    const cacheKey = `${page}:${pageSize}`;

    const cached = pageCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      res.setHeader("X-Cache", "HIT");
      return res.json(cached.data);
    }

    try {
      const url = `${ITHINK_BASE}/api/Card/paged?pageNumber=${page}&pageSize=${pageSize}`;
      const upstream = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Accept-Language": "ar",
          "Content-Type": "application/json",
        },
      });

      if (!upstream.ok) {
        const body = await upstream.text();
        return res.status(upstream.status).json({ error: body });
      }

      const data = await upstream.json();
      pageCache.set(cacheKey, { data, at: Date.now() });
      if (pageCache.size > 100) pruneCache();

      res.setHeader("X-Cache", "MISS");
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Upstream fetch failed" });
    }
  });
}
