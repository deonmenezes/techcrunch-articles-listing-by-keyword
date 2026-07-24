import { lessonCatalog, lessonForID } from "../lib/lessons.js";

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 60;
const rateBuckets = new Map();

function str(value) {
  return (Array.isArray(value) ? value[0] : value || "").toString().trim();
}

export function allowLessonRequest(key, now = Date.now()) {
  if (rateBuckets.size > 1000) {
    for (const [client, bucket] of rateBuckets) {
      if (now - bucket.startedAt >= RATE_WINDOW_MS) rateBuckets.delete(client);
    }
  }
  const existing = rateBuckets.get(key);
  if (!existing || now - existing.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  existing.count += 1;
  return existing.count <= RATE_LIMIT;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method && req.method !== "GET") {
    res.setHeader("Cache-Control", "no-store");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  if (["1", "true"].includes(str(req.query?.catalog).toLowerCase())) {
    const lessons = lessonCatalog();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    return res.status(200).json({
      generated_at: new Date().toISOString(),
      count: lessons.length,
      lessons,
    });
  }

  const id = str(req.query?.id);
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(400).json({ error: "invalid_identifier" });
  }

  const client = str(req.headers?.["x-forwarded-for"]).split(",")[0] || "anonymous";
  if (!allowLessonRequest(client)) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "rate_limited" });
  }

  const lesson = lessonForID(id);
  if (!lesson) {
    res.setHeader("Cache-Control", "public, s-maxage=300");
    return res.status(404).json({ error: "unavailable", status: "unavailable" });
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  return res.status(200).json(lesson);
}
