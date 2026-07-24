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

function reviewedLesson({
  lesson_id,
  title,
  subtitle,
  category,
  objectives,
  reading_time_minutes,
  discovery,
  sources,
  blocks,
}) {
  const lesson = {
    schema_version: 1,
    lesson_id,
    status: "available",
    mode: "original_synthesis",
    label: "Lyrna Lesson",
    title,
    subtitle,
    category,
    objectives,
    reading_time_minutes,
    discovery,
    sources,
    blocks,
    provenance: {
      lesson_authorship: "Lyrna original synthesis",
      discovery_body_used: false,
      evidence_source_count: sources.length,
      authoritative_source_count: sources.filter((source) => AUTHORITATIVE_ROLES.has(source.role)).length,
      review_status: "assisted_pilot_checks_passed",
      generator_version: "assisted-pilot-1",
      validator_version: "lesson-contract-1",
      generated_at: "2026-07-23T00:00:00.000Z",
    },
  };
  lesson.lesson_version = contentVersion(lesson);
  return lesson;
}

const cybersecurityLesson = reviewedLesson({
  lesson_id: "lesson_cybersecurity_everyday_defense",
  title: "A practical system for protecting your accounts",
  subtitle: "Passwords, multifactor authentication, detection, and recovery without the jargon",
  category: "Security",
  objectives: [
    "Treat cybersecurity as risk management rather than perfect prevention",
    "Explain why independent authentication factors improve account security",
    "Build a simple plan to protect, detect, respond, and recover",
  ],
  reading_time_minutes: 5,
  discovery: {
    publisher: "National Institute of Standards and Technology",
    title: "The NIST Cybersecurity Framework (CSF) 2.0",
    canonical_url: "https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20",
    role: "topic_discovery_only",
  },
  sources: [
    {
      id: "s1",
      title: "The NIST Cybersecurity Framework (CSF) 2.0",
      organization: "National Institute of Standards and Technology",
      role: "authoritative_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20",
      published_at: "2024-02-26",
    },
    {
      id: "s2",
      title: "Digital Identity Guidelines: Authentication and Authenticator Management",
      organization: "National Institute of Standards and Technology",
      role: "authoritative_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://www.nist.gov/publications/nist-sp-800-63b-4digital-identity-guidelines-authentication-and-authenticator",
      published_at: "2025-08-01",
    },
  ],
  blocks: [
    {
      id: "b1",
      type: "heading",
      level: 2,
      text: "Security is a loop, not a wall",
    },
    {
      id: "b2",
      type: "paragraph",
      text:
        "No single setting can remove every cyber risk. A more useful model is a loop: understand what matters, protect it, notice suspicious activity, respond, and recover. The NIST Cybersecurity Framework organizes this work into six connected functions: Govern, Identify, Protect, Detect, Respond, and Recover. Prevention matters, but a plan that stops at prevention is incomplete.",
      source_ids: ["s1"],
    },
    {
      id: "b3",
      type: "callout",
      title: "Start with the accounts that unlock other accounts",
      text:
        "Protect your primary email, password manager, phone account, and financial accounts first. An attacker who controls your email may be able to reset passwords elsewhere, so the importance of an account depends partly on what other access it can grant.",
      source_ids: ["s1", "s2"],
    },
    {
      id: "b4",
      type: "heading",
      level: 2,
      text: "Authentication is evidence that you are you",
    },
    {
      id: "b5",
      type: "paragraph",
      text:
        "A password is one kind of authenticator. Multifactor authentication asks for evidence from different factor types, such as something you know and something you possess. Stealing one factor is then not enough. Phishing-resistant authenticators, including properly implemented passkeys and security keys, are designed so a fake site cannot simply relay a reusable secret to sign in as you.",
      source_ids: ["s2"],
    },
    {
      id: "q1",
      type: "knowledge_check",
      prompt: "Why does multifactor authentication usually protect an account better than a password alone?",
      options: [
        { id: "a", text: "It requires independent evidence, so stealing one factor may not be enough." },
        { id: "b", text: "It makes every password impossible to guess." },
        { id: "c", text: "It prevents the service itself from ever having a security incident." },
      ],
      correct_option_id: "a",
      explanation:
        "Independent factors reduce reliance on a single secret. MFA reduces risk, but it does not make an account or service invulnerable.",
      evidence_block_ids: ["b5"],
      source_ids: ["s2"],
      check_version: 1,
    },
    {
      id: "b6",
      type: "heading",
      level: 2,
      text: "Build a small defense system",
    },
    {
      id: "b7",
      type: "numbered_list",
      title: "Five actions with compounding value",
      items: [
        "Use a password manager to create a unique password for every account.",
        "Turn on strong MFA or a passkey, beginning with your primary email.",
        "Install security updates promptly on devices, browsers, and apps.",
        "Enable sign-in alerts and review unexpected sessions or recovery changes.",
        "Store recovery codes safely and keep a tested backup of information you cannot replace.",
      ],
      source_ids: ["s1", "s2"],
    },
    {
      id: "b8",
      type: "paragraph",
      text:
        "If an account may be compromised, use a trusted device to change its credentials, end other sessions, inspect recovery methods, and check connected accounts. Preserve useful evidence such as alert messages, but do not keep interacting with a suspicious link. Recovery is part of security because even strong protection can fail.",
      source_ids: ["s1", "s2"],
    },
    {
      id: "q2",
      type: "knowledge_check",
      prompt: "Which plan best follows a complete cybersecurity risk loop?",
      options: [
        { id: "a", text: "Choose one long password and assume prevention will always work." },
        { id: "b", text: "Protect key accounts, monitor alerts, prepare recovery methods, and know how to respond." },
        { id: "c", text: "Wait for an incident before deciding which accounts matter." },
      ],
      correct_option_id: "b",
      explanation:
        "A resilient plan combines protection with detection, response, and recovery instead of relying on one preventive control.",
      evidence_block_ids: ["b2", "b7", "b8"],
      source_ids: ["s1", "s2"],
      check_version: 1,
    },
    {
      id: "b9",
      type: "recap",
      title: "Keep this model",
      items: [
        "Prioritize accounts by the access they can unlock.",
        "Use unique credentials and independent authentication factors.",
        "Phishing-resistant authenticators reduce the value of a stolen reusable secret.",
        "Detection and recovery are security work, not signs that prevention failed.",
      ],
      source_ids: ["s1", "s2"],
    },
  ],
});

const webRequestLesson = reviewedLesson({
  lesson_id: "lesson_web_request_journey",
  title: "What happens when you open a web page",
  subtitle: "A five-minute journey through URLs, DNS, TLS, and HTTP",
  category: "Coding & Dev Tools",
  objectives: [
    "Explain how a domain name helps a browser find a server",
    "Distinguish the jobs of TLS and HTTP",
    "Read a web request as a sequence of separate layers",
  ],
  reading_time_minutes: 5,
  discovery: {
    publisher: "RFC Editor",
    title: "RFC 9110: HTTP Semantics",
    canonical_url: "https://www.rfc-editor.org/info/rfc9110/",
    role: "topic_discovery_only",
  },
  sources: [
    {
      id: "s1",
      title: "Domain Names: Concepts and Facilities",
      organization: "Internet Engineering Task Force",
      role: "primary_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://www.rfc-editor.org/info/rfc1034/",
      published_at: "1987-11-01",
    },
    {
      id: "s2",
      title: "HTTP Semantics",
      organization: "Internet Engineering Task Force",
      role: "primary_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://www.rfc-editor.org/info/rfc9110/",
      published_at: "2022-06-01",
    },
    {
      id: "s3",
      title: "The Transport Layer Security (TLS) Protocol Version 1.3",
      organization: "Internet Engineering Task Force",
      role: "primary_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://www.rfc-editor.org/info/rfc9846/",
      published_at: "2026-07-01",
    },
  ],
  blocks: [
    {
      id: "b1",
      type: "heading",
      level: 2,
      text: "A URL is an address with instructions",
    },
    {
      id: "b2",
      type: "paragraph",
      text:
        "When you open an HTTPS URL, the browser separates it into parts. The scheme says to use secured HTTP, the host names the intended server, the port may identify a network service, and the path plus query identify the target resource. The browser still needs a network address before it can contact that host.",
      source_ids: ["s2"],
    },
    {
      id: "b3",
      type: "paragraph",
      text:
        "The Domain Name System, or DNS, is a distributed naming system. A resolver looks for records associated with the host name and may answer from a cache or query other name servers. The result can help the browser locate a server, but DNS and HTTP have different jobs: one resolves names, while the other defines requests and responses.",
      source_ids: ["s1", "s2"],
    },
    {
      id: "q1",
      type: "knowledge_check",
      prompt: "What is DNS doing in a typical page load?",
      options: [
        { id: "a", text: "Rendering the page layout and choosing its fonts" },
        { id: "b", text: "Resolving a host name to information that helps locate a server" },
        { id: "c", text: "Deciding whether an HTTP response should use status 200 or 404" },
      ],
      correct_option_id: "b",
      explanation:
        "DNS connects names with resource records used to locate services. Rendering and HTTP status semantics happen at other layers.",
      evidence_block_ids: ["b3"],
      source_ids: ["s1"],
      check_version: 1,
    },
    {
      id: "b4",
      type: "heading",
      level: 2,
      text: "TLS establishes a protected channel",
    },
    {
      id: "b5",
      type: "paragraph",
      text:
        "Before secured HTTP data flows, TLS performs a handshake. It negotiates cryptographic parameters, establishes shared key material, and authenticates the server. The resulting channel is designed to provide confidentiality and integrity, so network observers cannot simply read the content or alter it without detection.",
      source_ids: ["s3"],
    },
    {
      id: "b6",
      type: "callout",
      title: "The padlock has a precise meaning",
      text:
        "HTTPS indicates a protected connection to the host identified by the certificate. It does not promise that every claim on the site is true, that a purchase is wise, or that the organization behind the site is trustworthy. Transport security and content credibility are separate questions.",
      source_ids: ["s2", "s3"],
    },
    {
      id: "b7",
      type: "heading",
      level: 2,
      text: "HTTP carries the request and response",
    },
    {
      id: "b8",
      type: "paragraph",
      text:
        "HTTP is a stateless request-response protocol. A request communicates a method and target, along with fields and sometimes content. The server returns a response with a status code, fields, and possibly content. A 200-class status generally reports success, a 300-class status redirects, a 400-class status reports a client-side problem, and a 500-class status reports a server-side failure.",
      source_ids: ["s2"],
    },
    {
      id: "q2",
      type: "knowledge_check",
      prompt: "Which layer defines request methods and response status codes?",
      options: [
        { id: "a", text: "DNS" },
        { id: "b", text: "TLS" },
        { id: "c", text: "HTTP" },
      ],
      correct_option_id: "c",
      explanation:
        "HTTP defines request and response semantics. DNS resolves names, while TLS protects the communication channel.",
      evidence_block_ids: ["b8"],
      source_ids: ["s2"],
      check_version: 1,
    },
    {
      id: "b9",
      type: "recap",
      title: "Follow the layers",
      items: [
        "The URL identifies how and where the browser should request a resource.",
        "DNS helps turn the host name into a reachable destination.",
        "TLS authenticates the server and protects data in transit.",
        "HTTP defines the meaning of the request and response.",
      ],
      source_ids: ["s1", "s2", "s3"],
    },
  ],
});

const researchLiteracyLesson = reviewedLesson({
  lesson_id: "lesson_research_claims",
  title: "How to read a research claim without getting fooled",
  subtitle: "Study design, comparison groups, uncertainty, and the difference between association and cause",
  category: "Learning & Career",
  objectives: [
    "Separate an association from a causal conclusion",
    "Identify how randomization and comparison groups strengthen a study",
    "Use a repeatable checklist to judge a research headline",
  ],
  reading_time_minutes: 5,
  discovery: {
    publisher: "National Institutes of Health",
    title: "Understanding Clinical Studies",
    canonical_url: "https://www.nih.gov/about-nih/science-health-public-trust/tools/understanding-clinical-studies",
    role: "topic_discovery_only",
  },
  sources: [
    {
      id: "s1",
      title: "Understanding Clinical Studies",
      organization: "National Institutes of Health",
      role: "authoritative_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://www.nih.gov/about-nih/science-health-public-trust/tools/understanding-clinical-studies",
      published_at: "2025-06-26",
    },
    {
      id: "s2",
      title: "Cochrane Handbook, Chapter 8: Assessing Risk of Bias in a Randomized Trial",
      organization: "Cochrane",
      role: "authoritative_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-08",
      published_at: "2024-01-01",
    },
    {
      id: "s3",
      title: "Cochrane Handbook, Chapter 25: Assessing Risk of Bias in a Non-randomized Study",
      organization: "Cochrane",
      role: "authoritative_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-25",
      published_at: null,
    },
  ],
  blocks: [
    {
      id: "b1",
      type: "heading",
      level: 2,
      text: "Begin with the question, not the headline",
    },
    {
      id: "b2",
      type: "paragraph",
      text:
        "A study can ask whether two things occur together, whether an intervention changes an outcome, how common something is, or how an experience is understood. The design should match the question. Before judging the result, identify the population, the exposure or intervention, the comparison, the measured outcome, and the time period.",
      source_ids: ["s1"],
    },
    {
      id: "b3",
      type: "callout",
      title: "Association is a clue, not automatically a cause",
      text:
        "In an observational study, people who receive an exposure may differ from people who do not. A third factor can influence both the exposure and the outcome; this is confounding. Observational evidence can reveal important patterns and generate hypotheses, but the pattern alone does not prove that changing the exposure will change the outcome.",
      source_ids: ["s1", "s3"],
    },
    {
      id: "q1",
      type: "knowledge_check",
      prompt: "A study finds that people who do activity X also report outcome Y. What can you conclude from that fact alone?",
      options: [
        { id: "a", text: "Activity X definitely caused outcome Y." },
        { id: "b", text: "X and Y were associated in the studied group, but other explanations remain." },
        { id: "c", text: "Outcome Y must have caused activity X." },
      ],
      correct_option_id: "b",
      explanation:
        "An observed association is real evidence of a pattern, but direction, confounding, selection, and measurement can all affect its causal meaning.",
      evidence_block_ids: ["b3"],
      source_ids: ["s1", "s3"],
      check_version: 1,
    },
    {
      id: "b4",
      type: "heading",
      level: 2,
      text: "Why randomization helps",
    },
    {
      id: "b5",
      type: "paragraph",
      text:
        "In a randomized controlled trial, chance assigns participants to comparison groups. When randomization and allocation are implemented well, the groups should be similar on average before the intervention, including on factors researchers did not measure. Differences that appear afterward can then be attributed more confidently to the assigned intervention.",
      source_ids: ["s1", "s2"],
    },
    {
      id: "b6",
      type: "paragraph",
      text:
        "Randomization is powerful, not magical. Missing outcomes, deviations from the assigned intervention, selective reporting, weak measurement, or an unrepresentative sample can still distort a result. Some questions also cannot be randomized for ethical or practical reasons, so strong observational research remains essential.",
      source_ids: ["s1", "s2", "s3"],
    },
    {
      id: "b7",
      type: "numbered_list",
      title: "A six-question headline check",
      items: [
        "What exact question did the study ask?",
        "Who was studied, and who was left out?",
        "Was there a useful comparison group?",
        "Was the exposure assigned randomly or only observed?",
        "How large and uncertain was the reported effect?",
        "Do the conclusion and headline stay within what the design can support?",
      ],
      source_ids: ["s1", "s2", "s3"],
    },
    {
      id: "q2",
      type: "knowledge_check",
      prompt: "Which result deserves the most confidence as evidence that an intervention caused an outcome?",
      options: [
        { id: "a", text: "A large randomized comparison with low missing data and a pre-specified outcome" },
        { id: "b", text: "A viral before-and-after story from one person" },
        { id: "c", text: "A survey where participants choose their own exposure groups" },
      ],
      correct_option_id: "a",
      explanation:
        "Good randomization, an appropriate comparison, complete follow-up, and planned outcomes reduce several major sources of bias.",
      evidence_block_ids: ["b5", "b6"],
      source_ids: ["s1", "s2"],
      check_version: 1,
    },
    {
      id: "b8",
      type: "recap",
      title: "Let evidence update you in proportion",
      items: [
        "Match the claim to the study design.",
        "Treat association as evidence of a pattern, not automatic proof of cause.",
        "Randomization reduces confounding when it is implemented well.",
        "Effect size, uncertainty, bias, and applicability matter alongside statistical significance.",
        "One study should usually update a belief rather than end the conversation.",
      ],
      source_ids: ["s1", "s2", "s3"],
    },
  ],
});

const sleepMemoryLesson = reviewedLesson({
  lesson_id: "lesson_sleep_and_memory",
  title: "Why sleep helps learning stick",
  subtitle: "Encoding, consolidation, memory replay, and what the evidence does not yet prove",
  category: "Neuroscience",
  objectives: [
    "Distinguish memory encoding from later consolidation",
    "Explain how sleep is linked to memory reactivation",
    "Avoid common overclaims about sleep stages and learning",
  ],
  reading_time_minutes: 5,
  discovery: {
    publisher: "National Institute of Mental Health",
    title: "How the Brain Creates New Memories While Maintaining Old Ones",
    canonical_url: "https://www.nimh.nih.gov/news/science-updates/2025/how-the-brain-creates-new-memories-while-maintaining-old-ones",
    role: "topic_discovery_only",
  },
  sources: [
    {
      id: "s1",
      title: "What Happens During Sleep?",
      organization: "Eunice Kennedy Shriver National Institute of Child Health and Human Development",
      role: "authoritative_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://www.nichd.nih.gov/health/topics/sleep/conditioninfo/Pages/what-happens.aspx",
      published_at: null,
    },
    {
      id: "s2",
      title: "Brain Neural Patterns and the Memory Function of Sleep",
      organization: "Girardeau and Lopes-dos-Santos",
      role: "primary_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7611961/",
      published_at: "2021-10-28",
    },
    {
      id: "s3",
      title: "Sleep Microstructure Organizes Memory Replay",
      organization: "Chang et al.",
      role: "primary_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://www.nature.com/articles/s41586-024-08340-w",
      published_at: "2025-01-01",
    },
  ],
  blocks: [
    {
      id: "b1",
      type: "heading",
      level: 2,
      text: "Learning continues after practice stops",
    },
    {
      id: "b2",
      type: "paragraph",
      text:
        "Encoding is the initial formation of a memory during an experience or practice session. Consolidation refers to later processes that stabilize and reorganize that memory. Sleep is not empty downtime between the two. Across a night, the brain cycles through non-REM and REM sleep, and insufficient sleep can interfere with learning, memory, and performance.",
      source_ids: ["s1", "s2"],
    },
    {
      id: "b3",
      type: "callout",
      title: "Sleep supports memory; it does not upload knowledge",
      text:
        "Sleep can help preserve and reorganize information that was encoded while awake. It cannot replace attention, comprehension, practice, or feedback. A useful learning plan pairs effective study with enough opportunity for sleep.",
      source_ids: ["s1", "s2"],
    },
    {
      id: "q1",
      type: "knowledge_check",
      prompt: "Which statement best distinguishes encoding from consolidation?",
      options: [
        { id: "a", text: "Encoding begins a memory during learning; consolidation helps stabilize it afterward." },
        { id: "b", text: "Encoding happens only in REM sleep; consolidation happens only while awake." },
        { id: "c", text: "Encoding and consolidation are two names for reading the same sentence twice." },
      ],
      correct_option_id: "a",
      explanation:
        "Encoding starts a memory representation during experience. Consolidation describes later stabilization and reorganization processes.",
      evidence_block_ids: ["b2"],
      source_ids: ["s1", "s2"],
      check_version: 1,
    },
    {
      id: "b4",
      type: "heading",
      level: 2,
      text: "Replay is one window into consolidation",
    },
    {
      id: "b5",
      type: "paragraph",
      text:
        "During non-REM sleep, researchers observe coordinated neural patterns including hippocampal sharp-wave ripples, cortical slow oscillations, and sleep spindles. Memory-related activity can be reactivated during these patterns. The timing and coordination of this activity are leading clues to how hippocampal and cortical networks support memory consolidation.",
      source_ids: ["s2"],
    },
    {
      id: "b6",
      type: "paragraph",
      text:
        "A 2025 mouse study found that finer non-REM substates separated replay associated with newer and older memories. Disrupting activity during one substate impaired retention of newly learned information without the same effect on older memories. This is evidence about a mechanism in mice, not proof that a specific consumer sleep trick will produce the same effect in people.",
      source_ids: ["s3"],
    },
    {
      id: "b7",
      type: "bulleted_list",
      title: "Translate the science carefully",
      items: [
        "Human and animal evidence both connect sleep with memory, but a mechanism shown in mice may not transfer directly to a human routine.",
        "REM and non-REM sleep both contain multiple processes; one stage is not a universal memory switch.",
        "A laboratory memory task is narrower than long-term understanding in school or work.",
        "Claims about a precise hack should be judged separately from the broader evidence that sleep supports cognition.",
      ],
      source_ids: ["s1", "s2", "s3"],
    },
    {
      id: "q2",
      type: "knowledge_check",
      prompt: "What is the most accurate interpretation of memory replay research in sleeping mice?",
      options: [
        { id: "a", text: "It reveals candidate mechanisms that need careful translation before making human recommendations." },
        { id: "b", text: "It proves any fact heard during sleep will be remembered permanently." },
        { id: "c", text: "It shows that practice while awake no longer matters." },
      ],
      correct_option_id: "a",
      explanation:
        "Animal experiments can isolate mechanisms, but species, tasks, and laboratory conditions limit direct claims about human learning routines.",
      evidence_block_ids: ["b6", "b7"],
      source_ids: ["s2", "s3"],
      check_version: 1,
    },
    {
      id: "b8",
      type: "recap",
      title: "The durable takeaway",
      items: [
        "Learning begins with encoding while awake.",
        "Sleep supports later stabilization and reorganization of memory.",
        "Coordinated replay is one candidate mechanism.",
        "Mechanistic animal evidence should not be stretched into guaranteed human hacks.",
        "Study quality and sleep opportunity work together; neither replaces the other.",
      ],
      source_ids: ["s1", "s2", "s3"],
    },
  ],
});

const compoundingRiskLesson = reviewedLesson({
  lesson_id: "lesson_compounding_and_risk",
  title: "How compounding and diversification actually work",
  subtitle: "Time, returns, risk, and why a plan is more than picking a winner",
  category: "Economics",
  objectives: [
    "Explain compound growth without assuming a guaranteed return",
    "Distinguish asset allocation from diversification",
    "Connect time horizon and risk tolerance to a financial goal",
  ],
  reading_time_minutes: 5,
  discovery: {
    publisher: "Investor.gov",
    title: "Introduction to Investing",
    canonical_url: "https://www.investor.gov/introduction-investing",
    role: "topic_discovery_only",
  },
  sources: [
    {
      id: "s1",
      title: "Introduction to Investing",
      organization: "U.S. Securities and Exchange Commission, Investor.gov",
      role: "authoritative_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://www.investor.gov/introduction-investing",
      published_at: null,
    },
    {
      id: "s2",
      title: "What Is Compound Interest?",
      organization: "U.S. Securities and Exchange Commission, Investor.gov",
      role: "authoritative_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://www.investor.gov/additional-resources/information/youth/teachers-classroom-resources/what-compound-interest",
      published_at: null,
    },
    {
      id: "s3",
      title: "Asset Allocation and Diversification",
      organization: "U.S. Securities and Exchange Commission, Investor.gov",
      role: "authoritative_evidence",
      rights_status: "fact_reference_only",
      canonical_url: "https://www.investor.gov/introduction-investing/getting-started/asset-allocation",
      published_at: null,
    },
  ],
  blocks: [
    {
      id: "b1",
      type: "heading",
      level: 2,
      text: "Compounding means returns can earn returns",
    },
    {
      id: "b2",
      type: "paragraph",
      text:
        "Suppose $100 earns 5 percent in one period. It becomes $105. If the next period also earns 5 percent and the gain stays invested, the return applies to $105, producing $110.25. The extra $0.25 is growth on the earlier gain. Repeating this process is compounding.",
      source_ids: ["s1", "s2"],
    },
    {
      id: "b3",
      type: "callout",
      title: "The curve is not a promise",
      text:
        "A compound-growth illustration usually assumes a steady rate. Real investment returns vary and losses compound too. Fees, taxes, inflation, withdrawals, and the order of gains and losses can change an outcome. Use an illustration to understand the mechanism, not as a guaranteed forecast.",
      source_ids: ["s1", "s2"],
    },
    {
      id: "q1",
      type: "knowledge_check",
      prompt: "What creates compound growth?",
      options: [
        { id: "a", text: "Earning a return only on the original contribution" },
        { id: "b", text: "Keeping prior gains invested so they may also earn returns" },
        { id: "c", text: "Receiving the same guaranteed market return every year" },
      ],
      correct_option_id: "b",
      explanation:
        "Compounding occurs when returns remain in the base that can earn future returns. Investing does not guarantee a steady rate.",
      evidence_block_ids: ["b2", "b3"],
      source_ids: ["s1", "s2"],
      check_version: 1,
    },
    {
      id: "b4",
      type: "heading",
      level: 2,
      text: "A goal gives risk a context",
    },
    {
      id: "b5",
      type: "paragraph",
      text:
        "Asset allocation is the division of money among broad asset classes such as stocks, bonds, and cash. The appropriate mix depends partly on time horizon and risk tolerance. Money needed soon has less time to recover from a large decline than money intended for a distant goal.",
      source_ids: ["s1", "s3"],
    },
    {
      id: "b6",
      type: "paragraph",
      text:
        "Diversification spreads exposure across investments within or across asset classes so one failure has less control over the whole result. Owning several funds does not automatically create diversification if they hold the same concentrated assets. Diversification can reduce specific risks, but it cannot guarantee against loss when a broad market falls.",
      source_ids: ["s1", "s3"],
    },
    {
      id: "b7",
      type: "numbered_list",
      title: "Build the decision in this order",
      items: [
        "Name the goal and when the money may be needed.",
        "Separate emergency savings and near-term needs from long-term investing.",
        "Choose an asset mix whose possible losses you can tolerate.",
        "Diversify across genuinely different holdings rather than labels alone.",
        "Review costs and rebalance when the mix drifts away from the plan.",
      ],
      source_ids: ["s1", "s3"],
    },
    {
      id: "q2",
      type: "knowledge_check",
      prompt: "Which statement best describes diversification?",
      options: [
        { id: "a", text: "It guarantees that a portfolio cannot lose money." },
        { id: "b", text: "It spreads exposure so one holding has less power over the total result." },
        { id: "c", text: "It means buying several funds even when all hold the same few assets." },
      ],
      correct_option_id: "b",
      explanation:
        "Diversification reduces concentration risk by spreading exposure. It does not eliminate broad market risk or guarantee a profit.",
      evidence_block_ids: ["b6"],
      source_ids: ["s1", "s3"],
      check_version: 1,
    },
    {
      id: "b8",
      type: "recap",
      title: "Keep the mechanism separate from the decision",
      items: [
        "Compounding is growth on prior contributions and retained returns.",
        "An assumed return is an illustration, not a guarantee.",
        "Asset allocation divides money among broad asset classes.",
        "Diversification reduces concentration but cannot remove all loss.",
        "Goals, time horizon, risk tolerance, and costs belong in the plan.",
      ],
      source_ids: ["s1", "s2", "s3"],
    },
  ],
});

const lessons = new Map([
  [aiTermsLesson.lesson_id, aiTermsLesson],
  [llmSurveyLesson.lesson_id, llmSurveyLesson],
  [cybersecurityLesson.lesson_id, cybersecurityLesson],
  [webRequestLesson.lesson_id, webRequestLesson],
  [researchLiteracyLesson.lesson_id, researchLiteracyLesson],
  [sleepMemoryLesson.lesson_id, sleepMemoryLesson],
  [compoundingRiskLesson.lesson_id, compoundingRiskLesson],
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
