// lib/scholar.js - Google Scholar research papers for Learnify, via Apify.
//
// WHY THIS EXISTS
// lib/papers.js says "Google Scholar has NO public API and blocks scraping, so
// OpenAlex is the reliable open stand-in". OpenAlex is an excellent index, but
// it is DOI/journal shaped: it under-represents conference proceedings (where
// most CS lands), preprints that later matter, and non-Anglophone venues, and
// its cited_by_count trails Scholar's by months. Google Scholar is the closest
// thing there is to a global census of scholarship WITH a live citation count.
// Apify's actor marketplace is what makes it reachable, so this module is the
// Scholar tier and Apify is the transport.
//
// WHAT IT IS NOT
// Not a body source. Scholar gives metadata plus a snippet; Learnify shows that
// metadata and links out to the publisher. Nothing here changes the rights
// pipeline in lib/content-rights.js.
//
// COST MODEL
// The actor bills a fixed amount per query (a start fee plus one results page)
// and a tiny per-row fee, so cost is exactly predictable before the call:
// terms * (per-run + per-page + maxPerSearch * per-row). Every entry point takes
// a USD budget and passes each run's share to Apify as a hard charge cap.

import { runActorSync, hasApifyToken, ApifyError } from "./apify.js";
import { looksLikeJunk } from "./research-shared.js";
import { rollingCutoff } from "./topics.js";

// johnvc/google-scholar-api. The batch actor this module was first built on,
// johnvc/google-scholar-lite-api, was retired in October 2026 and no longer
// returns rows. This one takes one query per run (mode "search", q, and num of
// up to 20 on a single results page). Free Apify accounts get a 5-paper
// preview per query; paid accounts get the full page.
export const SCHOLAR_ACTOR = "johnvc~google-scholar-api";
export const SCHOLAR_USD_PER_RUN = 0.00501; // "setup" event + Apify's actor-start event
export const SCHOLAR_USD_PER_PAGE = 0.015; // "query_executed" event, one results page
export const SCHOLAR_USD_PER_ROW = 0.00001; // per dataset item
export const SCHOLAR_MAX_PER_SEARCH = 20; // num is capped at 20 on one page

// A Scholar row is metadata only, so the run needs no big memory or long clock.
const DEFAULT_TIMEOUT_SECS = 180;

export function estimateScholarCostUsd(termCount, maxPerSearch) {
  const terms = Math.max(0, Math.round(termCount));
  const per = Math.max(1, Math.min(SCHOLAR_MAX_PER_SEARCH, Math.round(maxPerSearch)));
  const usd = terms * (SCHOLAR_USD_PER_RUN + SCHOLAR_USD_PER_PAGE + per * SCHOLAR_USD_PER_ROW);
  // Round UP so a per-run charge cap never lands below the real charge.
  return Math.ceil(Number((usd * 10000).toFixed(6))) / 10000;
}

function shortId(value) {
  let h = 5381;
  const s = String(value || "");
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function clean(raw, limit = 360) {
  let text = String(raw || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (text.length > limit) text = text.slice(0, limit).replace(/\s+\S*$/, "") + "…";
  return text;
}

const DOMAIN_RE = /^[a-z0-9.-]+\.[a-z]{2,}$/i;

/**
 * Scholar packs authors, venue, year and host domain into one display string:
 *   "F Xu, Q Hao, C Shao, Z Zong… - Patterns, 2025 - cell.com"
 *   "I Mutambik - Sensors, 2025 - mdpi.com"
 *   "books.google.com"
 * Splitting is lexical and therefore best-effort; every field is optional and a
 * miss degrades to null rather than to a guess.
 */
export function parsePublicationInfo(info) {
  const parts = String(info || "").split(" - ").map((part) => part.trim()).filter(Boolean);
  const out = { authors: null, venue: null, year: null, domain: null };
  if (!parts.length) return out;

  if (DOMAIN_RE.test(parts[parts.length - 1])) out.domain = parts.pop().toLowerCase();
  if (!parts.length) return out;

  // Whatever is left is "authors" or "authors, venue-and-year" or just a venue.
  const middle = parts.length > 1 ? parts[parts.length - 1] : "";
  if (middle) {
    out.authors = clean(parts.slice(0, -1).join(" - "), 160) || null;
    const yearMatch = middle.match(/(?:^|[\s,])((?:19|20)\d{2})\s*$/);
    if (yearMatch) out.year = Number(yearMatch[1]);
    const venue = middle.replace(/(?:^|[\s,])(?:19|20)\d{2}\s*$/, "").replace(/[\s,]+$/, "").replace(/^…\s*/, "").trim();
    out.venue = venue ? clean(venue, 120) : null;
  } else {
    const only = parts[0];
    const yearMatch = only.match(/(?:^|[\s,])((?:19|20)\d{2})\s*$/);
    if (yearMatch) {
      out.year = Number(yearMatch[1]);
      out.venue = clean(only.replace(/(?:^|[\s,])(?:19|20)\d{2}\s*$/, "").replace(/[\s,]+$/, ""), 120) || null;
    } else {
      out.authors = clean(only, 160) || null;
    }
  }
  return out;
}

function pdfResource(resources) {
  const list = Array.isArray(resources) ? resources : [];
  return list.find((item) => /pdf/i.test(String(item?.file_format || "")))?.link || null;
}

function safeHttpUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  let url;
  try { url = new URL(raw); } catch { return null; }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  // scholar.google.* links are Scholar's own interstitials (cluster/citation
  // views), not the paper. Learnify always links out to a real source.
  if (/(^|\.)scholar\.google\./i.test(url.hostname)) return null;
  return url.toString();
}

/**
 * Normalize one raw actor row into a Learnify raw paper.
 *
 * Accepts johnvc/google-scholar-api search rows (paper_title,
 * publication_info.summary, inline_links.cited_by_total, resources) as well as
 * rows in the older lite shape (title, publicationInfo, citedBy, pdfUrl).
 *
 * Fails closed: a row without a real title, a real off-Scholar link, or a
 * publication year inside the rolling freshness window is dropped rather than
 * repaired. `published` stays empty because Scholar reports a YEAR, not a date;
 * `date_precision: "year"` makes that explicit instead of inventing Jan 1.
 */
export function normalizeScholarPaper(row, { topic = null, now = new Date(), years = 2 } = {}) {
  if (!row || typeof row !== "object") return null;
  const title = clean(row.title ?? row.paper_title, 240);
  if (!title || looksLikeJunk(title)) return null;

  const link = safeHttpUrl(row.link);
  if (!link) return null;

  const anchor = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(anchor.getTime())) throw new TypeError("Invalid Scholar freshness anchor");

  const info = parsePublicationInfo(row.publicationInfo ?? row.publication_info?.summary);
  const rawYear = Number(row.year) || info.year;
  const year = Number.isInteger(rawYear) ? rawYear : null;
  if (!year) return null;
  // Year-precision freshness: accept a year only if EVERY day in it could fall
  // inside the window (year >= cutoff year) and it is not in the future.
  const cutoffYear = rollingCutoff(anchor, years).getUTCFullYear();
  if (year < cutoffYear || year > anchor.getUTCFullYear() + 1) return null;

  const citedBy = row.citedBy ?? row.inline_links?.cited_by_total;
  const citations = Number.isFinite(Number(citedBy)) ? Math.max(0, Math.round(Number(citedBy))) : 0;
  const venue = info.venue;
  const summary = clean(row.snippet, 360) || (venue ? `Published in ${venue}.` : "");
  const pdf = safeHttpUrl(row.pdfUrl ?? pdfResource(row.resources));

  return {
    id: "gs_" + shortId(link),
    title,
    link,
    canonical_url: link,
    source: "Google Scholar",
    source_id: "google_scholar",
    source_label: venue ? `${venue} · indexed by Google Scholar` : "Google Scholar",
    provider: "Google Scholar",
    provider_via: "Apify",
    publisher: venue || info.domain || null,
    region: "Research",
    focus: "Global scholarship (Google Scholar)",
    content_type: "paper",
    content_type_label: "Research paper",
    author: info.authors || venue || "Google Scholar",
    authors: info.authors || null,
    venue: venue || null,
    host_domain: info.domain || null,
    published: "",
    published_year: year,
    date_precision: "year",
    image: null,
    thumbnail: null,
    section: topic || "Research",
    categories: [...(topic ? [topic] : []), "Research"],
    summary,
    is_paper: true,
    citations,
    metrics: { citations },
    topic,
    scholar_id: typeof (row.id ?? row.result_id) === "string" ? (row.id ?? row.result_id) : null,
    scholar_query: typeof row.searchTerm === "string" ? row.searchTerm : null,
    open_access_pdf: pdf,
    // Scholar is a metadata index. Redistribution rights are unknown here and
    // are only ever granted by lib/content-rights.js on a verified license.
    freshness_verified: false,
    rights_status: "unknown_or_restricted",
    full_text_status: "unknown",
    full_text_available: false,
    license_id: null,
    license_url: null,
    attribution: `Source: ${venue || info.domain || "Google Scholar"}`,
  };
}

/**
 * Fetch Scholar papers for a set of search terms.
 *
 * `budgetUsd` is enforced twice: locally (terms are dropped before the call so
 * the projected spend fits) and remotely (Apify aborts the run at the charge
 * cap). Returns papers plus the real spend estimate so callers can log it.
 */
export async function fetchScholarPapers(searchTerms, options = {}) {
  const {
    maxPerSearch = 10,
    yearFrom,
    language = "en",
    budgetUsd = 0.5,
    now = new Date(),
    topicOf = () => null,
    timeoutSecs = DEFAULT_TIMEOUT_SECS,
    env = process.env,
    onProgress = null,
  } = options;

  const terms = [...new Set((Array.isArray(searchTerms) ? searchTerms : [searchTerms])
    .map((term) => String(term || "").trim())
    .filter((term) => term.length >= 3))];
  if (!terms.length) return { papers: [], termsRun: [], itemCount: 0, estimatedCostUsd: 0, skipped: [] };
  if (!hasApifyToken(env)) throw new ApifyError("Apify token is not configured", { actorId: SCHOLAR_ACTOR });

  const per = Math.max(1, Math.min(SCHOLAR_MAX_PER_SEARCH, Math.round(maxPerSearch)));
  const affordableTerms = Math.max(0, Math.floor(budgetUsd / estimateScholarCostUsd(1, per)));
  const runTerms = terms.slice(0, affordableTerms);
  const skipped = terms.slice(affordableTerms);

  const papers = [];
  const termsRun = [];
  let itemCount = 0;

  // One query per run: the actor takes a single q, so each term is its own run
  // with its own charge cap.
  for (const term of runTerms) {
    const input = { mode: "search", q: term, num: per, max_pages: 1, hl: language };
    if (Number.isInteger(yearFrom)) input.as_ylo = yearFrom;
    const rows = await runActorSync(SCHOLAR_ACTOR, input, {
      timeoutSecs,
      maxItems: per,
      maxTotalChargeUsd: estimateScholarCostUsd(1, per),
      env,
    });
    itemCount += rows.length;
    termsRun.push(term);
    for (const row of rows) {
      const paper = normalizeScholarPaper(row && { ...row, searchTerm: term }, { topic: topicOf(term), now });
      if (paper) papers.push(paper);
    }
    if (typeof onProgress === "function") onProgress({ batch: [term], rows: rows.length, kept: papers.length });
  }

  const spent = termsRun.length * (SCHOLAR_USD_PER_RUN + SCHOLAR_USD_PER_PAGE) + itemCount * SCHOLAR_USD_PER_ROW;
  return {
    papers,
    termsRun,
    itemCount,
    estimatedCostUsd: Number(spent.toFixed(4)),
    skipped,
  };
}
