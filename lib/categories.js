// Canonical Lyrna taxonomy. Keep raw and short labels in lockstep with
// TechScroll/Models/NewsCategory.swift so the API and iOS client agree.
export const APP_CATEGORIES = Object.freeze([
  Object.freeze({ raw: "AI / ML", short: "AI" }),
  Object.freeze({ raw: "Robotics", short: "Robotics" }),
  Object.freeze({ raw: "Coding & Dev Tools", short: "Coding" }),
  Object.freeze({ raw: "Hardware & Gadgets", short: "Hardware" }),
  Object.freeze({ raw: "Security", short: "Security" }),
  Object.freeze({ raw: "Crypto / Web3", short: "Crypto" }),
  Object.freeze({ raw: "Big Tech", short: "Big Tech" }),
  Object.freeze({ raw: "Physics & Space", short: "Physics" }),
  Object.freeze({ raw: "Biology & Life Sciences", short: "Biology" }),
  Object.freeze({ raw: "Chemistry & Materials", short: "Chemistry" }),
  Object.freeze({ raw: "Neuroscience", short: "Neuroscience" }),
  Object.freeze({ raw: "Medicine & Health", short: "Medicine" }),
  Object.freeze({ raw: "Climate & Environment", short: "Climate" }),
  Object.freeze({ raw: "Earth Sciences", short: "Earth" }),
  Object.freeze({ raw: "Mathematics", short: "Math" }),
  Object.freeze({ raw: "Psychology", short: "Psychology" }),
  Object.freeze({ raw: "Economics", short: "Economics" }),
  Object.freeze({ raw: "Social Sciences", short: "Social Sciences" }),
  Object.freeze({ raw: "Energy", short: "Energy" }),
  Object.freeze({ raw: "Startups & Funding", short: "Startups" }),
  Object.freeze({ raw: "Learning & Career", short: "Learning" }),
  Object.freeze({ raw: "Fitness", short: "Fitness" }),
  Object.freeze({ raw: "Skincare", short: "Skincare" }),
]);

export const APP_CATEGORY_VALUES = Object.freeze(APP_CATEGORIES.map((category) => category.raw));
export const LEGACY_SCIENCE_CATEGORIES = Object.freeze([
  "Physics & Space",
  "Biology & Life Sciences",
  "Chemistry & Materials",
  "Neuroscience",
  "Medicine & Health",
  "Climate & Environment",
  "Earth Sciences",
  "Mathematics",
  "Energy",
]);

const normalize = (value) => (value || "")
  .toString()
  .normalize("NFKC")
  .trim()
  .toLowerCase()
  .replace(/\s+/g, " ");

const queryLabels = new Map();
const rawLabels = new Set(APP_CATEGORY_VALUES);
for (const category of APP_CATEGORIES) {
  queryLabels.set(normalize(category.raw), [category.raw]);
  queryLabels.set(normalize(category.short), [category.raw]);
}
// Older app builds persisted and queried one broad Science interest. Treat it
// as an OR across the science branches so those users keep receiving content.
queryLabels.set("science", LEGACY_SCIENCE_CATEGORIES);

/**
 * Parse a comma-separated category query into canonical NewsCategory raw
 * values. Raw labels and their short iOS chip labels are accepted
 * case-insensitively; unknown labels are ignored.
 */
export function parseCategoryQuery(value) {
  const values = Array.isArray(value) ? value : [value];
  const resolved = values
    .flatMap((item) => (item || "").toString().split(","))
    .flatMap((item) => queryLabels.get(normalize(item)) || [])
    .filter(Boolean);
  return [...new Set(resolved)];
}

/** Mirrors APIFeedService.classify so server-side filtering and iOS agree. */
export function classifyArticle(article = {}) {
  const categories = Array.isArray(article.categories) ? article.categories : [];

  // Backend source hints use an exact canonical raw value. Short query labels
  // are deliberately not hints: matching them here would diverge from iOS.
  for (const category of categories) {
    if (rawLabels.has(category)) return category;
  }

  const section = normalize(article.section);
  const hay = normalize([
    article.section,
    ...categories,
    article.title,
    article.summary,
  ].filter(Boolean).join(" "));
  const matches = (pattern) => pattern.test(hay);
  const isResearch = normalize(article.region) === "research";

  switch (section) {
    case "artificial intelligence": return "AI / ML";
    case "security": return "Security";
    case "startups":
    case "fundraising":
    case "venture": return "Startups & Funding";
    case "space": return "Physics & Space";
    case "climate": return "Climate & Environment";
    case "biotech health": return "Medicine & Health";
    case "biology": return "Biology & Life Sciences";
    case "chemistry": return "Chemistry & Materials";
    case "neuroscience": return "Neuroscience";
    case "medicine":
    case "health": return "Medicine & Health";
    case "earth science": return "Earth Sciences";
    case "mathematics": return "Mathematics";
    case "psychology": return "Psychology";
    case "economics":
    case "finance":
    case "fintech": return "Economics";
    case "social science": return "Social Sciences";
    case "energy": return "Energy";
    case "hardware":
    case "gadgets":
    case "gear":
    case "computex": return "Hardware & Gadgets";
    case "transportation":
    case "cars": return "Robotics";
    default: break;
  }

  if (matches(/\bskincare\b|skin care|dermatolog|sunscreen|retinoid|cosmetic|beauty science|\bacne\b/)) return "Skincare";
  if (matches(/\bfitness\b|\bworkout\b|\bexercise\b|sports science|\bmuscle\b|strength training|\bcardio\b|\bendurance\b|physical activity|athlet|\bvo2\b/)) return "Fitness";
  if (matches(/\brobot|\bdrones?\b|autonomous vehicle|locomotion|manipulation|\bcs\.ro\b/)) return "Robotics";
  if (matches(/\bcrypto(?:currency|currencies)?\b|blockchain|\bbitcoin\b|\bweb3\b|\bethereum\b|decentralized finance|\bdefi\b/)) return "Crypto / Web3";
  if (matches(/cybersecurity|\bsecurity\b|\bhacker\b|\bbreach\b|\bprivacy\b|ransomware|malware|cryptograph|vulnerab|\bcs\.cr\b/)) return "Security";
  if (matches(/neurosci|\bneuron|\bbrain\b|neural circuit|cognitive neuroscience|q-bio\.nc/)) return "Neuroscience";
  if (matches(/\bmedicine\b|\bmedical\b|\bhealth\b|clinical|\bpatient\b|\bdisease\b|\bcancer\b|tumou?r|oncolog|epidemiolog|diagnos|therap|\bvaccine\b|public health|healthspan|longevity/)) return "Medicine & Health";
  if (matches(/\bbiology\b|life science|genom|genetic|\bprotein\b|\bcell\b|biomarker|microbiom|ecology|evolution|q-bio/)) return "Biology & Life Sciences";
  if (matches(/\bchemistry\b|\bchemical\b|materials science|\bmaterial\b|polymer|cataly|molecul|cond-mat\.mtrl-sci/)) return "Chemistry & Materials";
  if (matches(/\bclimate\b|global warming|greenhouse gas|\bemission\b|biodiversity|conservation|\bpollution\b|environment/)) return "Climate & Environment";
  if (matches(/earth science|\bgeology\b|\bgeologic\b|\bgeophys|\bseism|\bearthquake\b|\bvolcano|\boceanograph|\bmeteorolog|\bpaleontolog/)) return "Earth Sciences";
  if (matches(/\bphysics\b|\bquantum\b|astro|cosmolog|exoplanet|\btelescope\b|\bspace\b|\bspacex\b|particle physics|relativity/)) return "Physics & Space";
  if (matches(/\bmathematics\b|\bmathematical\b|\btheorem\b|\bgeometry\b|\balgebra\b|number theory|combinator|\btopology\b|\bprobability\b/)) return "Mathematics";
  if (matches(/\bpsycholog|\bbehavioral science\b|\bmental health\b|\bmemory\b|\bpersonality\b|\bmotivation\b|\bemotion\b/)) return "Psychology";
  if (matches(/\beconomic|\beconomics\b|\bfinance\b|\binvesting\b|monetary|\binflation\b|labor market|asset pricing|stock market|q-fin|econ\.gn/)) return "Economics";
  if (matches(/\bsociolog|\banthropolog|\bdemograph|political science|social science|\binequality\b|public policy|\bgovernance\b/)) return "Social Sciences";
  if (matches(/\benergy\b|fusion power|nuclear power|solar power|wind power|power grid|renewable|\bbattery storage\b|hydrogen fuel/)) return "Energy";
  if (matches(/\bhardware\b|\bgadget\b|\bwearable\b|\blaptop\b|\bsmartphone\b|semiconduct|\bchip\b|\bgpu\b|\bfpga\b|\bcircuit\b|photonics|\bcs\.ar\b/)) return "Hardware & Gadgets";
  if (matches(/\bstartup\b|\bventure\b|fundrais|\bseed round\b|\bseries [a-z]\b|\bipo\b|\bacquisition\b/)) return "Startups & Funding";
  if (matches(/\bevergreen\b|\bglossary\b|\bexplainer\b|\btutorial\b|how-to|how to|\bcareer\b|\broadmap\b|\bcourse\b|\blearning resource\b/)) return "Learning & Career";
  if (matches(/artificial intelligence|machine learning|\bopenai\b|\banthropic\b|\bllm\b|\bchatbot\b|\bgenai\b|ai agents|\bxai\b|\bgemini\b|neural network|\bcs\.ai\b|\bcs\.lg\b/)) return "AI / ML";
  if (matches(/open source|\bdeveloper\b|\bprogramming\b|\bdevops\b|\bkubernetes\b|\bgithub\b|software engineering|\bapi\b|\bsdk\b|\bframework\b|\bcompiler\b|\bdebug/)) return "Coding & Dev Tools";
  if (matches(/\bbig tech\b|\bapple\b|\bgoogle\b|\bmicrosoft\b|\bamazon\b|\bmeta\b|\btiktok\b|\bplatform\b|\bapps?\b/)) return "Big Tech";
  if (matches(/\bscience\b/) || isResearch) return "Biology & Life Sciences";
  return "Big Tech";
}

export function withAppCategory(article) {
  return { ...article, app_category: classifyArticle(article) };
}

/** Apply the API's comma-OR category contract without changing absent queries. */
export function filterByCategoryQuery(articles, value) {
  const values = Array.isArray(value) ? value : [value];
  const hasQuery = values.some((item) => (item || "").toString().trim());
  if (!hasQuery) return articles;

  const requested = new Set(parseCategoryQuery(value));
  return articles.filter((article) => requested.has(article.app_category || classifyArticle(article)));
}

/**
 * Round-robin category queues inside strict freshness cohorts while preserving
 * input order within every category. A niche day-old item can therefore add
 * diversity among other day-old items, but can never jump ahead of an item
 * published in the last six hours merely to fill a category slot.
 */
export function balanceByCategory(articles, now = new Date()) {
  const nowMs = new Date(now).getTime();
  const freshnessCohort = (article) => {
    const publishedMs = new Date(article.published || "").getTime();
    if (!Number.isFinite(publishedMs) || !Number.isFinite(nowMs)) return 4;
    const age = Math.max(0, nowMs - publishedMs);
    if (age < 6 * 60 * 60 * 1000) return 0;
    if (age < 24 * 60 * 60 * 1000) return 1;
    if (age < 72 * 60 * 60 * 1000) return 2;
    if (age < 7 * 24 * 60 * 60 * 1000) return 3;
    return 4;
  };

  const cohorts = [[], [], [], [], []];
  for (const article of articles) cohorts[freshnessCohort(article)].push(article);

  const balanceCohort = (cohort) => {
  const groups = new Map();
    cohort.forEach((article, index) => {
    const category = article.app_category || classifyArticle(article);
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push({ article, index });
  });

  const output = [];
  let active = [...groups.values()];
  while (active.length) {
    active.sort((left, right) => left[0].index - right[0].index);
    for (const queue of active) output.push(queue.shift().article);
    active = active.filter((queue) => queue.length);
  }
  return output;
  };

  return cohorts.flatMap(balanceCohort);
}
