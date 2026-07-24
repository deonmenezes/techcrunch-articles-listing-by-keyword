import { createHash } from "node:crypto";

const AI_TERMS_DISCOVERY_PATH =
  "/2026/05/29/artificial-intelligence-definition-glossary-hallucinations-guide-to-common-ai-terms/";
const LLM_SURVEY_DOI = "10.1007/s11704-026-60308-3";
const LLM_SURVEY_TITLE = "a survey of large language models";

const AUTHORITATIVE_ROLES = new Set(["primary_evidence", "authoritative_evidence"]);
const ALLOWED_RIGHTS_STATES = new Set([
  "fact_reference_only",
  "verified_open_license",
  "contract_permitted",
  "public_domain",
]);

function canonicalJSON(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJSON).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJSON(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function contentVersion(lesson) {
  const material = { ...lesson };
  delete material.lesson_version;
  return `sha256:${createHash("sha256").update(canonicalJSON(material)).digest("hex")}`;
}

const aiTermsLesson = {
  schema_version: 1,
  lesson_id: "lesson_ai_terms_foundations",
  status: "available",
  mode: "original_synthesis",
  label: "Lyrna Lesson",
  title: "A practical map of modern AI terms",
  subtitle: "How machine learning, generative AI, language models, and agents fit together",
  category: "AI / ML",
  objectives: [
    "Distinguish artificial intelligence, machine learning, and generative AI",
    "Explain at a high level how a large language model produces text",
    "Identify why fluent AI output still needs verification",
  ],
  reading_time_minutes: 6,
  discovery: {
    publisher: "TechCrunch",
    title: "So you’ve heard these AI terms and nodded along; let’s fix that",
    canonical_url:
      "https://techcrunch.com/2026/05/29/artificial-intelligence-definition-glossary-hallucinations-guide-to-common-ai-terms/",
    role: "topic_discovery_only",
  },
  sources: [
    {
      id: "s1",
      title: "Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile",
      organization: "National Institute of Standards and Technology",
      role: "authoritative_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence",
      published_at: "2024-07-26",
    },
    {
      id: "s2",
      title: "Machine Learning Glossary",
      organization: "Google for Developers",
      role: "corroborating_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://developers.google.com/machine-learning/glossary",
      published_at: null,
    },
    {
      id: "s3",
      title: "Attention Is All You Need",
      organization: "Vaswani et al.",
      role: "primary_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://arxiv.org/abs/1706.03762",
      published_at: "2017-06-12",
    },
  ],
  blocks: [
    {
      id: "b1",
      type: "heading",
      level: 2,
      text: "Start with the nesting dolls",
    },
    {
      id: "b2",
      type: "paragraph",
      text:
        "Artificial intelligence is the broad goal: building computer systems that perform tasks associated with human intelligence, such as recognizing patterns, making predictions, using language, or planning actions. Machine learning is one family of techniques for reaching that goal. Instead of writing every rule by hand, developers use data and an optimization process to adjust a model so it performs a task.",
      source_ids: ["s1", "s2"],
    },
    {
      id: "b3",
      type: "callout",
      title: "The useful hierarchy",
      text:
        "AI is the umbrella. Machine learning sits inside it. Deep learning is a machine-learning approach built from multi-layer neural networks. Generative AI describes systems designed to produce new outputs—such as text, images, audio, or code—rather than only assign a label or estimate a number.",
      source_ids: ["s1", "s2"],
    },
    {
      id: "b4",
      type: "heading",
      level: 2,
      text: "Training creates the model; inference uses it",
    },
    {
      id: "b5",
      type: "paragraph",
      text:
        "During training, an algorithm repeatedly compares a model’s output with a learning signal and adjusts many numeric parameters to reduce error. The result is a trained model: a compact set of learned relationships, not a database that simply stores one complete answer for every possible question. Inference is the later stage when an application gives that model an input and asks it to produce a prediction or generated output.",
      source_ids: ["s1", "s2"],
    },
    {
      id: "q1",
      type: "knowledge_check",
      prompt: "Which statement best separates training from inference?",
      options: [
        { id: "a", text: "Training adjusts model parameters; inference uses the trained model on an input." },
        { id: "b", text: "Training writes every possible answer; inference looks up the matching answer." },
        { id: "c", text: "Training happens only on phones; inference happens only in data centers." },
      ],
      correct_option_id: "a",
      explanation:
        "Training is the parameter-learning stage. Inference is the use of the resulting model to make a prediction or generate an output.",
      evidence_block_ids: ["b5"],
      source_ids: ["s1", "s2"],
      check_version: 1,
    },
    {
      id: "b6",
      type: "heading",
      level: 2,
      text: "Where large language models fit",
    },
    {
      id: "b7",
      type: "paragraph",
      text:
        "A language model estimates which token—or sequence of tokens—is likely in a context. Tokens are the chunks into which text is encoded; they can be whole words, word pieces, punctuation, or other units. A large language model, or LLM, combines this objective with a very large learned parameter set and broad training data. Many current LLMs generate text autoregressively: after each token is selected, it becomes part of the context used to predict the next one.",
      source_ids: ["s2"],
    },
    {
      id: "b8",
      type: "paragraph",
      text:
        "The Transformer architecture helped make this approach practical at scale. Its attention mechanism lets the model compute how parts of an input relate to one another, while its design permits more parallel training than the recurrent approaches that dominated earlier sequence systems. “Transformer” names an architecture; “LLM” describes a large language model. The terms overlap often, but they do not mean exactly the same thing.",
      source_ids: ["s2", "s3"],
    },
    {
      id: "q2",
      type: "knowledge_check",
      prompt: "What is an LLM doing at the most basic level while generating a response?",
      options: [
        { id: "a", text: "Retrieving a single stored paragraph that exactly matches the prompt" },
        { id: "b", text: "Predicting successive tokens from the available context" },
        { id: "c", text: "Proving every claim before it writes the next sentence" },
      ],
      correct_option_id: "b",
      explanation:
        "An autoregressive language model generates a sequence by repeatedly predicting a next token from the context produced so far.",
      evidence_block_ids: ["b7"],
      source_ids: ["s2"],
      check_version: 1,
    },
    {
      id: "b9",
      type: "heading",
      level: 2,
      text: "Fluency is not the same as reliability",
    },
    {
      id: "b10",
      type: "paragraph",
      text:
        "Because a generative model is optimized to produce a plausible continuation, it can produce a confident statement that is unsupported or false. This failure is commonly called a hallucination. The term does not describe intent or awareness; it is shorthand for output that appears meaningful but is not grounded in reliable evidence. A polished tone is therefore a presentation signal, not a truth guarantee.",
      source_ids: ["s1", "s2"],
    },
    {
      id: "b11",
      type: "bulleted_list",
      title: "A better way to use generated answers",
      items: [
        "Ask for sources, then open and inspect the sources rather than trusting the citation text alone.",
        "Use retrieval from a controlled knowledge base when answers must reflect current or organization-specific information.",
        "Test outputs against representative examples and track failure patterns instead of judging one impressive response.",
        "Keep a human decision-maker in the loop when an error could materially affect health, safety, rights, money, or access.",
      ],
      source_ids: ["s1", "s2"],
    },
    {
      id: "b12",
      type: "heading",
      level: 2,
      text: "Agents add a loop around a model",
    },
    {
      id: "b13",
      type: "paragraph",
      text:
        "An AI agent is better understood as a system pattern than as a magical new kind of model. An application gives a model a goal, context, and a set of permitted tools. The system can choose an action, observe the result, and continue until it reaches a stopping condition. The surrounding software—not the language model alone—must enforce permissions, validate tool inputs, limit retries and spending, preserve audit records, and decide when a person must approve an action.",
      source_ids: ["s1", "s2"],
    },
    {
      id: "b14",
      type: "recap",
      title: "Keep this map",
      items: [
        "AI is the broad field; machine learning and deep learning are approaches within it.",
        "Generative AI produces new outputs, and an LLM is a language-focused generative model.",
        "Training learns parameters; inference uses those parameters.",
        "Transformers use attention, while autoregressive LLMs generate tokens step by step.",
        "Fluent output can still be false, so evidence and system controls matter.",
      ],
      source_ids: ["s1", "s2", "s3"],
    },
  ],
  provenance: {
    lesson_authorship: "Lyrna original synthesis",
    discovery_body_used: false,
    evidence_source_count: 3,
    authoritative_source_count: 2,
    review_status: "assisted_pilot_checks_passed",
    generator_version: "assisted-pilot-1",
    validator_version: "lesson-contract-1",
    generated_at: "2026-07-23T00:00:00.000Z",
  },
};

aiTermsLesson.lesson_version = contentVersion(aiTermsLesson);

const llmSurveyLesson = {
  ...structuredClone(aiTermsLesson),
  lesson_id: "lesson_llm_foundations",
  title: "How large language models fit together",
  subtitle: "From training and tokens to attention, hallucinations, and agents",
  discovery: {
    publisher: "Frontiers of Computer Science",
    title: "A Survey of Large Language Models",
    canonical_url: `https://doi.org/${LLM_SURVEY_DOI}`,
    role: "topic_discovery_only",
  },
  provenance: {
    ...aiTermsLesson.provenance,
    generated_at: "2026-07-23T00:00:00.000Z",
  },
};
llmSurveyLesson.lesson_version = contentVersion(llmSurveyLesson);

const lessons = new Map([
  [aiTermsLesson.lesson_id, aiTermsLesson],
  [llmSurveyLesson.lesson_id, llmSurveyLesson],
]);
const feedItemToLesson = new Map([["q2kgd", aiTermsLesson.lesson_id]]);

function lessonMetadata(lessonID) {
  const lesson = lessonID ? lessons.get(lessonID) : null;
  if (!lesson) {
    return {
      lesson_status: "not_eligible",
      lesson_mode: null,
      lesson_id: null,
      lesson_version: null,
      reading_time_minutes: null,
      knowledge_check_count: 0,
    };
  }
  return {
    lesson_status: lesson.status,
    lesson_mode: lesson.mode,
    lesson_id: lesson.lesson_id,
    lesson_version: lesson.lesson_version,
    reading_time_minutes: lesson.reading_time_minutes,
    knowledge_check_count: lesson.blocks.filter((block) => block.type === "knowledge_check").length,
  };
}

function doiKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "")
    .replace(/^doi:\s*/, "")
    .replace(/\/$/, "");
}

export function lessonIDForArticle(article = {}) {
  const explicit = feedItemToLesson.get(String(article.id || ""));
  if (explicit) return explicit;

  try {
    const url = new URL(String(article.link || ""));
    if (url.hostname.endsWith("techcrunch.com") && url.pathname === AI_TERMS_DISCOVERY_PATH) {
      return aiTermsLesson.lesson_id;
    }
  } catch {
    // A malformed discovery URL is simply not lesson eligible.
  }

  const title = String(article.title || "").toLowerCase();
  if (title.includes("ai terms") && (title.includes("glossary") || title.includes("nodded along"))) {
    return aiTermsLesson.lesson_id;
  }
  return null;
}

export function lessonMetadataForArticle(article) {
  return lessonMetadata(lessonIDForArticle(article));
}

export function lessonIDForResearchPaper(paper = {}) {
  const identifiers = [
    paper.doi,
    paper.link,
    paper.url,
    paper.canonical_url,
  ];
  if (identifiers.some((value) => doiKey(value) === LLM_SURVEY_DOI)) {
    return llmSurveyLesson.lesson_id;
  }

  const titles = [paper.original_title, paper.title]
    .map((value) => String(value || "").trim().toLowerCase());
  return titles.includes(LLM_SURVEY_TITLE) ? llmSurveyLesson.lesson_id : null;
}

export function lessonMetadataForResearchPaper(paper) {
  return lessonMetadata(lessonIDForResearchPaper(paper));
}

export function lessonCatalog() {
  return [...lessons.values()]
    .filter((lesson) => lesson.status === "available")
    .map((lesson) => ({
      lesson_status: lesson.status,
      lesson_mode: lesson.mode,
      lesson_id: lesson.lesson_id,
      lesson_version: lesson.lesson_version,
      label: lesson.label,
      title: lesson.title,
      subtitle: lesson.subtitle || null,
      category: lesson.category,
      reading_time_minutes: lesson.reading_time_minutes,
      knowledge_check_count: lesson.blocks.filter((block) => block.type === "knowledge_check").length,
      discovery: structuredClone(lesson.discovery),
    }));
}

export function lessonForID(value) {
  const id = String(value || "").trim();
  const direct = lessons.get(id);
  if (direct) return structuredClone(direct);
  const mapped = feedItemToLesson.get(id);
  return mapped ? structuredClone(lessons.get(mapped)) : null;
}

export function validateLesson(lesson) {
  const errors = [];
  if (lesson?.mode !== "original_synthesis") errors.push("mode");
  if (!Array.isArray(lesson?.sources) || lesson.sources.length < 2) errors.push("source_count");
  if (!Array.isArray(lesson?.blocks) || lesson.blocks.length < 1 || lesson.blocks.length > 160) {
    errors.push("block_count");
  }

  const sourceIDs = new Set();
  let authoritative = 0;
  for (const source of lesson?.sources || []) {
    if (!source.id || sourceIDs.has(source.id)) errors.push("source_id");
    sourceIDs.add(source.id);
    if (AUTHORITATIVE_ROLES.has(source.role)) authoritative += 1;
    if (!ALLOWED_RIGHTS_STATES.has(source.rights_status)) errors.push(`source_rights:${source.id}`);
    try {
      const url = new URL(source.canonical_url);
      if (url.protocol !== "https:") errors.push(`source_url:${source.id}`);
    } catch {
      errors.push(`source_url:${source.id}`);
    }
  }
  if (authoritative < 1) errors.push("authoritative_source");

  const blockIDs = new Set();
  let characterCount = 0;
  for (const [index, block] of (lesson?.blocks || []).entries()) {
    if (!block.id || blockIDs.has(block.id)) errors.push("block_id");
    characterCount += [
      block.title,
      block.text,
      block.prompt,
      block.explanation,
      ...(block.items || []),
      ...(block.options || []).map((option) => option.text),
    ].reduce((sum, value) => sum + String(value || "").length, 0);
    for (const sourceID of block.source_ids || []) {
      if (!sourceIDs.has(sourceID)) errors.push(`block_source:${block.id}:${sourceID}`);
    }
    if (["paragraph", "callout", "bulleted_list", "numbered_list", "recap"].includes(block.type) &&
        !(block.source_ids || []).length) {
      errors.push(`uncited_block:${block.id}`);
    }
    if (block.type === "knowledge_check") {
      if (!Array.isArray(block.options) || block.options.length < 3 || block.options.length > 4) {
        errors.push(`check_options:${block.id}`);
      }
      if (!block.options?.some((option) => option.id === block.correct_option_id)) {
        errors.push(`check_answer:${block.id}`);
      }
      if (!(block.evidence_block_ids || []).length || !(block.source_ids || []).length) {
        errors.push(`check_grounding:${block.id}`);
      }
      for (const evidenceID of block.evidence_block_ids || []) {
        const evidenceIndex = lesson.blocks.findIndex((candidate) => candidate.id === evidenceID);
        if (evidenceIndex < 0 || evidenceIndex >= index) errors.push(`check_evidence:${block.id}:${evidenceID}`);
      }
    }
    blockIDs.add(block.id);
  }
  if (characterCount > 120_000) errors.push("character_count");

  if (!lesson?.provenance || lesson.provenance.discovery_body_used !== false) errors.push("discovery_body_policy");
  if (!String(lesson?.lesson_version || "").startsWith("sha256:")) errors.push("lesson_version");
  return { valid: errors.length === 0, errors };
}

for (const lesson of lessons.values()) {
  const validation = validateLesson(lesson);
  if (!validation.valid) {
    throw new Error(`Invalid built-in lesson ${lesson.lesson_id}: ${validation.errors.join(", ")}`);
  }
}
