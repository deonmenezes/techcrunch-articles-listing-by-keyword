import test from "node:test";
import assert from "node:assert/strict";

import lessonHandler, { allowLessonRequest } from "../api/lesson-content.js";
import {
  lessonCatalog,
  lessonForID,
  lessonIDForArticle,
  lessonIDForResearchPaper,
  lessonMetadataForArticle,
  lessonMetadataForResearchPaper,
  validateLesson,
} from "../lib/lessons.js";

function response() {
  return {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    end() { this.ended = true; return this; },
  };
}

test("only reviewed discovery matches are lesson eligible", () => {
  const matched = {
    id: "q2kgd",
    title: "So you’ve heard these AI terms and nodded along; let’s fix that",
    link: "https://techcrunch.com/2026/05/29/artificial-intelligence-definition-glossary-hallucinations-guide-to-common-ai-terms/",
  };
  assert.equal(lessonIDForArticle(matched), "lesson_ai_terms_foundations");
  assert.equal(lessonMetadataForArticle(matched).lesson_status, "available");
  assert.equal(lessonMetadataForArticle(matched).knowledge_check_count, 2);

  const unrelated = lessonMetadataForArticle({
    id: "other",
    title: "A company announced a new product",
    link: "https://publisher.example/story",
  });
  assert.deepEqual(unrelated, {
    lesson_status: "not_eligible",
    lesson_mode: null,
    lesson_id: null,
    lesson_version: null,
    reading_time_minutes: null,
    knowledge_check_count: 0,
  });
});

test("built-in original lesson passes evidence and knowledge-check validation", () => {
  const lessonIDs = [
    "lesson_ai_terms_foundations",
    "lesson_llm_foundations",
    "lesson_cybersecurity_everyday_defense",
    "lesson_web_request_journey",
    "lesson_research_claims",
    "lesson_sleep_and_memory",
    "lesson_compounding_and_risk",
  ];
  for (const lessonID of lessonIDs) {
    const lesson = lessonForID(lessonID);
    const result = validateLesson(lesson);
    assert.deepEqual(result, { valid: true, errors: [] });
    assert.equal(lesson.mode, "original_synthesis");
    assert.equal(lesson.provenance.discovery_body_used, false);
    assert.ok(lesson.sources.length >= 2);
    assert.ok(lesson.reading_time_minutes <= 6);
    assert.equal(lesson.blocks.filter((block) => block.type === "knowledge_check").length, 2);
    assert.ok(lesson.sources.some((source) => source.role === "primary_evidence" || source.role === "authoritative_evidence"));
    assert.ok(lesson.blocks.filter((block) => block.type === "knowledge_check").every((check) =>
      check.evidence_block_ids.length > 0 && check.source_ids.length > 0
    ));
  }
});

test("reviewed research paper maps to its original multi-source lesson", () => {
  const paper = {
    title: "A Survey of Large Language Models",
    canonical_url: "https://doi.org/10.1007/s11704-026-60308-3",
  };
  assert.equal(lessonIDForResearchPaper(paper), "lesson_llm_foundations");
  assert.deepEqual(lessonMetadataForResearchPaper(paper), {
    lesson_status: "available",
    lesson_mode: "original_synthesis",
    lesson_id: "lesson_llm_foundations",
    lesson_version: lessonForID("lesson_llm_foundations").lesson_version,
    reading_time_minutes: 6,
    knowledge_check_count: 2,
  });
  assert.equal(lessonMetadataForResearchPaper({
    title: "An unrelated language-model paper",
    canonical_url: "https://doi.org/10.1000/unrelated",
  }).lesson_status, "not_eligible");
});

test("lesson endpoint accepts only stable IDs and returns bounded native blocks", async () => {
  const invalid = response();
  await lessonHandler({ method: "GET", query: { id: "https://publisher.example/body" }, headers: {} }, invalid);
  assert.equal(invalid.statusCode, 400);
  assert.equal(invalid.headers["Cache-Control"], "no-store");

  const missing = response();
  await lessonHandler({ method: "GET", query: { id: "unknown_item" }, headers: {} }, missing);
  assert.equal(missing.statusCode, 404);
  assert.equal(missing.body.status, "unavailable");

  const available = response();
  await lessonHandler({
    method: "GET",
    query: { id: "q2kgd" },
    headers: { "x-forwarded-for": "lesson-contract-test" },
  }, available);
  assert.equal(available.statusCode, 200);
  assert.equal(available.body.label, "Lyrna Lesson");
  assert.equal(available.body.lesson_id, "lesson_ai_terms_foundations");
  assert.match(available.body.lesson_version, /^sha256:[a-f0-9]{64}$/);
  assert.ok(available.body.blocks.length <= 160);
  assert.ok(available.body.blocks.every((block) => !("html" in block)));
  assert.equal(available.headers["X-Content-Type-Options"], "nosniff");

  const researchLesson = response();
  await lessonHandler({
    method: "GET",
    query: { id: "lesson_llm_foundations" },
    headers: { "x-forwarded-for": "research-lesson-contract-test" },
  }, researchLesson);
  assert.equal(researchLesson.statusCode, 200);
  assert.equal(researchLesson.body.lesson_id, "lesson_llm_foundations");
  assert.equal(researchLesson.body.discovery.canonical_url, "https://doi.org/10.1007/s11704-026-60308-3");
  assert.equal(researchLesson.body.provenance.discovery_body_used, false);
});

test("lesson endpoint rate limiter is isolated per client and resets", () => {
  const now = Date.now();
  const client = `lesson-rate-${now}`;
  for (let index = 0; index < 60; index += 1) assert.equal(allowLessonRequest(client, now), true);
  assert.equal(allowLessonRequest(client, now), false);
  assert.equal(allowLessonRequest(client, now + 60_000), true);
});

test("lesson catalog exposes every reviewed lesson without lesson body blocks", async () => {
  const catalog = lessonCatalog();
  assert.deepEqual(catalog.map((item) => item.lesson_id), [
    "lesson_ai_terms_foundations",
    "lesson_llm_foundations",
    "lesson_cybersecurity_everyday_defense",
    "lesson_web_request_journey",
    "lesson_research_claims",
    "lesson_sleep_and_memory",
    "lesson_compounding_and_risk",
  ]);
  assert.ok(catalog.every((item) =>
    item.lesson_status === "available" &&
    item.lesson_mode === "original_synthesis" &&
    !("blocks" in item) &&
    !("sources" in item)
  ));
  assert.deepEqual([...new Set(catalog.map((item) => item.category))], [
    "AI / ML",
    "Security",
    "Coding & Dev Tools",
    "Learning & Career",
    "Neuroscience",
    "Economics",
  ]);

  const res = response();
  await lessonHandler({ method: "GET", query: { catalog: "1" }, headers: {} }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.count, 7);
  assert.equal(res.body.lessons[0].label, "Lyrna Lesson");
  assert.equal(res.headers["X-Content-Type-Options"], "nosniff");
});
