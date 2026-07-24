// GET /api/research — LIVE trending/top research papers for the Lyrna app.
//
// Sources real papers from lib/papers.js (arXiv newest across cs.AI/LG/CL/CV +
// OpenAlex recent + OpenAlex most-cited "trending"), de-duplicated, mapped to the
// app's research schema. The canonical source remains the fallback; a reviewed
// paper may also carry metadata for a separate Lyrna-authored native lesson.
//
// Query params (optional):
//   category  filter by app category value (e.g. "AI / ML", "Neuroscience")
//   genre     filter by fine-grained genre (e.g. "Fitness", "Skincare",
//             "Finance", "Nutrition", "Mind & Psychology", "Space")
//   limit     max papers (default all)
//   sort      "trending" (default, by momentum) | "citations" | "recent"
//
// Response: { generated_at, count, papers: [
//   { id, title, org, category, genre, summary, citations, trend, url,
//     original_title, image, lesson_status, lesson_id, lesson_version } ] }
// `genre` is ADDITIVE; `category` maps every paper into the shared 23-category
// NewsCategory set.
// `title`/`summary` are the precomputed addictive headline + hook from
// papers-enriched.json (scripts/enrich.mjs) when available — falling back to
// the raw arXiv/OpenAlex title + abstract. `original_title` always carries the
// raw title; `image` is the absolute URL of the generated Flux cover (or null).
//
// CORS open. Edge-cached ~30m with stale-while-revalidate so it stays fresh + fast.

import { readFileSync } from "node:fs";
import { classifyArticle } from "../lib/categories.js";
import { collectPapers, collectTopicPapers } from "../lib/papers.js";
import { isRelevantRaw } from "../lib/research-shared.js";
import { TOPIC_NAMES, findTopic, rollingCutoff } from "../lib/topics.js";
import { lessonMetadataForResearchPaper } from "../lib/lessons.js";

// Precomputed per-paper enrichment (headline/hook/cover) from scripts/enrich.mjs.
// Same readFileSync-try/catch convention as the enriched.json article cache —
// a missing/corrupt file just means raw titles/abstracts (never a 500).
function loadPapersEnriched() {
  try {
    const j = JSON.parse(readFileSync(new URL("../papers-enriched.json", import.meta.url), "utf-8"));
    return j && j.papers && typeof j.papers === "object" ? j.papers : {};
  } catch { return {}; }
}

// Legacy force-tagged OpenAlex sections predate the exact-topic endpoint. Route
// them into the nearest member of the shared taxonomy; unlisted sections use
// the same classifier as the article feed.
const TAG_TO_APP = {
  "fitness exercise": "Fitness",
  "skincare dermatology": "Skincare",
  "nutrition diet": "Medicine & Health",
  "psychology mind": "Psychology",
  "longevity health": "Medicine & Health",
  "finance investing": "Economics",
};

// Fine-grained genre for the website/genre filters — ADDITIVE field, the iOS
// app ignores it (decoders are Optional). Force-tag first, then arXiv subject
// codes, then keyword fallback; defaults to the app category.
const TAG_TO_GENRE = {
  "fitness exercise": "Fitness",
  "skincare dermatology": "Skincare",
  "nutrition diet": "Nutrition",
  "psychology mind": "Mind & Psychology",
  "longevity health": "Longevity",
  "finance investing": "Finance",
  "robotics": "Robotics",
  "security cryptography": "Security",
  "software engineering": "Coding & Dev Tools",
  "science discovery": "Science",
};
function toGenre(p, appCategory) {
  if (TAG_TO_GENRE[p.section]) return TAG_TO_GENRE[p.section];
  const hay = `${p.section || ""} ${(p.categories || []).join(" ")} ${p.title || ""}`.toLowerCase();
  if (/q-fin|econ\.gn|\bfinance\b|investing|portfolio|asset pricing|household finance|stock market/.test(hay)) return "Finance";
  if (/q-bio\.nc|neurosci|cognit|\bsleep\b|psycholog|memory consolidation|\bbrain\b/.test(hay)) return "Mind & Psychology";
  if (/astro-ph|exoplanet|\bplanet\b|cosmolog|telescope|\bspace\b/.test(hay)) return "Space";
  if (/exercise|resistance training|muscle|endurance|athlet|\bvo2\b/.test(hay)) return "Fitness";
  if (/dermatolog|\bskin\b|sunscreen|cosmetic/.test(hay)) return "Skincare";
  if (/nutrition|\bdiet\b|dietary|protein intake|metabolism/.test(hay)) return "Nutrition";
  if (/longevity|aging|healthspan|lifespan/.test(hay)) return "Longevity";
  return appCategory;
}

function toAppCategory(p) {
  // Exact-topic responses are already validated against the canonical registry.
  // Preserve that topic instead of trying to infer it again from a short title.
  if (p.topic && findTopic(p.topic)) return p.topic;
  if (TAG_TO_APP[p.section]) return TAG_TO_APP[p.section];
  return classifyArticle(p);
}

// A 0…99 momentum score: most-cited "trending" papers scale by citations; fresh
// papers score by recency so the newest work still surfaces near the top.
function trendScore(p) {
  if (p.trending && p.citations) return Math.min(99, Math.max(20, Math.round(p.citations / 25)));
  if (p.published) {
    // Clamp days to >= 0 so future-dated items can't blow the score up.
    const days = Math.max(0, (Date.now() - new Date(p.published).getTime()) / 86_400_000);
    if (!Number.isNaN(days)) return Math.max(1, Math.min(70, Math.round(45 - days)));
  }
  return p.citations ? Math.min(60, Math.round(p.citations / 40)) : 5;
}

function idFor(title) {
  let h = 0;
  for (let i = 0; i < title.length; i++) { h = (h * 31 + title.charCodeAt(i)) >>> 0; }
  return `p_${h.toString(16)}`;
}

// `enr` is the precomputed papers-enriched.json entry for this paper (may be
// undefined); `base` is the absolute origin ("https://host") for cover URLs.
// Enriched papers ship the addictive headline as `title` and the hook as
// `summary` (raw title/abstract are the fallbacks); `original_title` always
// carries the raw title, `image` the generated Flux cover (or null).
function toResearch(p, enr, base) {
  const org = String(p.author || p.source || "Research").slice(0, 80);
  const rawTitle = String(p.title || "").trim();
  const rawSummary = (p.summary && p.summary.trim()) || `Recent ${p.source || "research"} paper.`;
  const headline = (enr && typeof enr.headline === "string" && enr.headline.trim()) || "";
  const hook = (enr && typeof enr.hook === "string" && enr.hook.trim()) || "";
  const cover = (enr && typeof enr.cover === "string" && enr.cover.startsWith("/paper-covers/")) ? enr.cover : null;
  const appCategory = toAppCategory(p);
  return {
    id: p.id || idFor(rawTitle),
    title: headline || rawTitle,
    org,
    category: appCategory,
    genre: toGenre(p, appCategory),
    summary: hook || rawSummary,
    citations: Number.isFinite(p.citations) ? p.citations : 0,
    trend: trendScore(p),
    url: String(p.link || "").trim(),
    original_title: rawTitle,
    image: cover ? `${base}${cover}` : null,
    published: p.published || null,
    topic: p.topic || null,
    source: p.source || "Research",
    source_id: p.source_id || "research",
    source_label: p.source_label || p.source || "Research",
    provider: p.provider || p.source || "Research",
    publisher: p.publisher || null,
    content_type: "paper",
    content_type_label: p.content_type_label || "Research paper",
    canonical_url: p.canonical_url || String(p.link || "").trim(),
    freshness_verified: p.freshness_verified === true,
    rights_status: p.rights_status || "unknown_or_restricted",
    full_text_status: p.full_text_status || "unknown",
    full_text_available: p.full_text_available === true,
    license_id: p.license_id || null,
    license_url: p.license_url || null,
    attribution: p.attribution || `Source: ${p.source_label || p.source || "Research"}`,
    body_source: p.body_source || null,
    body_source_url: p.body_source_url || null,
    rights_provenance_at: p.rights_provenance_at || null,
    content_endpoint: p.content_endpoint || null,
    pmcid: p.pmcid || null,
    pmid: p.pmid || null,
    ...lessonMetadataForResearchPaper(p),
  };
}

function str(v) { return (Array.isArray(v) ? v[0] : v || "").toString().trim(); }

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  const topicValue = str(req.query?.topic);
  const topic = topicValue ? findTopic(topicValue) : null;
  if (topicValue && !topic) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(400).json({ error: "Unknown topic", topics: TOPIC_NAMES });
  }
  const requestedLimit = parseInt(str(req.query?.limit), 10);
  const topicLimit = Number.isNaN(requestedLimit) ? 24 : Math.max(1, Math.min(50, requestedLimit));
  const now = new Date();

  const category = str(req.query?.category).toLowerCase();
  const genre = str(req.query?.genre).toLowerCase();
  // Default to FRESH (newest-first). The app requests sort=recent; "trending"
  // (most-cited) is opt-in only, since most-cited skews old + medical.
  const sort = str(req.query?.sort) || "recent";
  const limit = topic ? topicLimit : requestedLimit;

  // Absolute origin for cover-image URLs — built exactly like api/articles.js.
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  const base = host ? `${proto}://${host}` : "";

  let papers = [];
  let providerStatus = "ok";
  try {
    if (topic) {
      const result = await collectTopicPapers(topic.name, { now, limit: topicLimit });
      providerStatus = result.providerStatus;
      papers = result.papers.map((paper) => toResearch(paper, null, base));
    } else {
      const raw = await collectPapers();
      const enriched = loadPapersEnriched();
      papers = raw.filter(isRelevantRaw).map((paper) => toResearch(paper, enriched[paper.id], base));
    }
    papers = papers.filter((paper) => paper.title && paper.url);
  } catch (_) {
    if (topic) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(502).json({ error: "Research provider unavailable", topic: topic.name, topics: TOPIC_NAMES });
    }
    return res.status(200).json({ generated_at: new Date().toISOString(), count: 0, papers: [], error: "Research provider unavailable" });
  }

  if (category) papers = papers.filter((p) => p.category.toLowerCase() === category);
  if (genre) papers = papers.filter((p) => (p.genre || "").toLowerCase() === genre);
  papers.sort((a, b) => {
    if (sort === "citations") return b.citations - a.citations;
    if (sort === "trending") return b.trend - a.trend;
    return (b.published || "").localeCompare(a.published || "");
  });
  if (!Number.isNaN(limit)) papers = papers.slice(0, Math.max(0, limit));

  return res.status(200).json({
    generated_at: new Date().toISOString(),
    count: papers.length,
    papers,
    topic: topic?.name || null,
    topics: TOPIC_NAMES,
    cutoff: rollingCutoff(now).toISOString(),
    provider: topic ? "OpenAlex" : "arXiv and OpenAlex",
    provider_status: providerStatus,
  });
}
